import type { AuditResult, AuditScores, Check, PerformanceResult } from "@/types/audit";
import { MIN_VERIFIED_CHECKS, type CategoryScore } from "@/lib/scoring";

/**
 * Audit categories — grouped by the QUESTION each one answers, not by the
 * technical family the check happens to belong to.
 *
 * WEIGHTING DOES THE WORK. An earlier version capped a category at 40 when a
 * gate check failed, which produced a near-binary distribution: across the 58
 * attending practices, 30 sat at exactly 40 and nothing landed between 50 and
 * 69. Weighting the decisive checks heavily achieves the same separation with
 * a real gradient — medical identification at 30 of 100 points means a
 * practice that fails it lands in the 20s-60s depending on what else it has,
 * rather than every one of them stacking on the same number.
 *
 * This module is pure (no Node imports) so the server (runAudit, the pre-warm
 * script) and the client (the booth UI) score identically from the same table.
 * The UI derives categories from the raw checks rather than trusting a stored
 * `scores` object, so a result measured before a scoring change still renders
 * under the current rules.
 */

export type CategoryKey = "ai" | "patientsFind" | "speed";

/** Who measured it — drives the attribution label under each gauge. */
export type CategorySource = "google" | "inflowmd";

/**
 * How little verified data is too little to report a score.
 *
 * `checks` counts heads. `weight` asks whether the checks we could verify
 * represent enough of what the category actually measures — the distinction
 * matters when weights are lopsided: a practice can verify 8 of 11 checks and
 * still have said nothing about the 30-point one that dominates the score.
 */
export type CategoryFloor =
  | { kind: "checks"; min: number }
  | { kind: "weight"; minFraction: number };

export interface CategoryDefinition {
  key: CategoryKey;
  label: string;
  source: CategorySource;
  /** True when weights differ, which turns on per-check point costs in the UI. */
  weighted: boolean;
  /**
   * Check id → weight. Also defines membership: a check absent from every
   * category's table would never be scored or shown, which the test suite
   * asserts can't happen.
   */
  weights: Record<string, number>;
  floor: CategoryFloor;
}

/** Credit earned per weight unit. could_not_verify never reaches here. */
const STATUS_CREDIT: Record<Exclude<Check["status"], "could_not_verify">, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

/** Display order is the order of this array. */
export const CATEGORIES: readonly CategoryDefinition[] = [
  {
    key: "ai",
    label: "Is your website optimized for AI?",
    source: "inflowmd",
    weighted: true,
    // Out of 100. Medical identification and machine-readable details together
    // carry nearly half the score: they are what decides whether an assistant
    // can say what this practice IS, which is the whole question.
    weights: {
      "schema.medical": 30,
      "schema.present": 18,
      "ai.content-depth": 10,
      "ai.semantic-structure": 10,
      "schema.local-business": 8,
      "schema.organization": 6,
      "seo.heading-order": 6,
      "ai.crawler-access": 4,
      "schema.faq": 4,
      "ai.robots-file": 2,
      "ai.llms-txt": 2,
    },
    // Weight-based, not head-count: verifying nine light checks while the
    // 30-point one went unread is not enough to publish a number. This is the
    // rule that stops a practice scoring 100 with medical identification
    // could_not_verify.
    floor: { kind: "weight", minFraction: 0.7 },
  },
  {
    key: "patientsFind",
    label: "Can patients find you?",
    source: "inflowmd",
    weighted: false,
    weights: {
      "seo.title": 1,
      "seo.meta-description": 1,
      "seo.h1": 1,
      "seo.viewport": 1,
      "seo.canonical": 1,
      "seo.open-graph": 1,
      "seo.image-alt": 1,
      "seo.https": 1,
      // Redirects are a patient-facing wait, not an AI-comprehension signal.
      "seo.redirect-chain": 1,
    },
    floor: { kind: "checks", min: MIN_VERIFIED_CHECKS },
  },
  {
    key: "speed",
    label: "How fast is it?",
    source: "google",
    weighted: false,
    // Not check-derived: this category IS Google's Lighthouse score.
    weights: {},
    floor: { kind: "checks", min: 0 },
  },
] as const;

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryDefinition> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryKey, CategoryDefinition>;

/** Every check id this engine knows how to place, in display order. */
export function allMappedCheckIds(): string[] {
  return CATEGORIES.flatMap((c) => Object.keys(c.weights));
}

/** All raw checks from a result, regardless of which module produced them. */
export function allChecks(result: {
  seo?: Check[];
  schema?: Check[];
  aiReadiness?: Check[];
}): Check[] {
  return [...(result.seo ?? []), ...(result.schema ?? []), ...(result.aiReadiness ?? [])];
}

/** One check inside a category, with what it cost or earned. */
export interface CategoryItem {
  check: Check;
  weight: number;
  /** weight × (1 − credit). Zero for a pass and for anything unverified. */
  pointsLost: number;
  pointsEarned: number;
  /** False for could_not_verify — excluded from both sides of the score. */
  counted: boolean;
}

/**
 * Orders checks by what they actually cost: biggest point losses first, then
 * unverified (nothing to fix yet, but nothing confirmed either), then passes.
 * A failing 30-point check has to appear above a failing 4-point one.
 */
function orderByImpact(items: CategoryItem[]): CategoryItem[] {
  const rank = (i: CategoryItem) => (i.pointsLost > 0 ? 0 : !i.counted ? 1 : 2);
  return [...items].sort(
    (a, b) => rank(a) - rank(b) || b.pointsLost - a.pointsLost || b.weight - a.weight
  );
}

function buildItems(checks: Check[], definition: CategoryDefinition): CategoryItem[] {
  const byId = new Map(checks.map((c) => [c.id, c]));
  const items: CategoryItem[] = [];
  for (const [id, weight] of Object.entries(definition.weights)) {
    const check = byId.get(id);
    if (!check) continue;
    const counted = check.status !== "could_not_verify";
    const credit = counted ? STATUS_CREDIT[check.status as keyof typeof STATUS_CREDIT] : 0;
    items.push({
      check,
      weight,
      counted,
      pointsEarned: counted ? weight * credit : 0,
      pointsLost: counted ? weight * (1 - credit) : 0,
    });
  }
  return orderByImpact(items);
}

/**
 * Weighted score for one check-derived category.
 *
 * `could_not_verify` is excluded from the denominator entirely — neither
 * credit nor penalty, with the remaining weights rescaling — and the
 * category's floor decides whether enough was verified to report anything.
 */
export function scoreCategoryWeighted(
  checks: Check[],
  definition: CategoryDefinition
): CategoryScore {
  const items = buildItems(checks, definition);
  const counted = items.filter((i) => i.counted);
  const verified = counted.length;
  const total = items.length;

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const verifiedWeight = counted.reduce((sum, i) => sum + i.weight, 0);

  const belowFloor =
    definition.floor.kind === "checks"
      ? verified < definition.floor.min
      : totalWeight === 0 || verifiedWeight / totalWeight < definition.floor.minFraction;
  if (belowFloor || verifiedWeight === 0) {
    return { score: null, verified, total };
  }

  const earned = counted.reduce((sum, i) => sum + i.pointsEarned, 0);
  return { score: Math.round((earned / verifiedWeight) * 100), verified, total };
}

export interface ResolvedCategory extends CategoryScore {
  key: CategoryKey;
  label: string;
  source: CategorySource;
  weighted: boolean;
  /** Member checks with their point impact, ordered worst-cost first. */
  items: CategoryItem[];
}

/**
 * The three categories, resolved and display-ready, in spec order.
 *
 * Derived from the raw checks, so this returns the same answer for a result
 * measured live and one served from a cache written before a scoring change.
 */
export function buildCategories(result: {
  seo?: Check[];
  schema?: Check[];
  aiReadiness?: Check[];
  performance?: PerformanceResult;
  scores?: Partial<AuditScores>;
}): ResolvedCategory[] {
  const checks = allChecks(result);

  return CATEGORIES.map((definition) => {
    if (definition.key === "speed") {
      const perf = result.performance;
      const score = perf?.available ? (perf.lighthouseScore ?? null) : null;
      return {
        key: definition.key,
        label: definition.label,
        source: definition.source,
        weighted: definition.weighted,
        score,
        verified: score === null ? 0 : 1,
        total: 1,
        items: [],
      };
    }
    return {
      key: definition.key,
      label: definition.label,
      source: definition.source,
      weighted: definition.weighted,
      ...scoreCategoryWeighted(checks, definition),
      items: buildItems(checks, definition),
    };
  });
}

/** The stored score object, derived from a result's checks and performance. */
export function deriveScores(result: {
  seo?: Check[];
  schema?: Check[];
  aiReadiness?: Check[];
  performance?: PerformanceResult;
}): AuditScores {
  const checks = allChecks(result);
  const ai = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.ai);
  const patientsFind = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.patientsFind);
  const perf = result.performance;

  return {
    performance: perf?.available ? (perf.lighthouseScore ?? null) : null,
    ai: ai.score,
    aiVerified: ai.verified,
    aiTotal: ai.total,
    patientsFind: patientsFind.score,
    patientsFindVerified: patientsFind.verified,
    patientsFindTotal: patientsFind.total,
  };
}

/** Normalizes a stored result so its `scores` match the current category table. */
export function withDerivedScores(result: AuditResult): AuditResult {
  return { ...result, scores: deriveScores(result) };
}
