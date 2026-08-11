import type { AuditResult, AuditScores, Check, PerformanceResult } from "@/types/audit";
import { MIN_VERIFIED_CHECKS, type CategoryScore } from "@/lib/scoring";

/**
 * Audit categories — grouped by the QUESTION each one answers, not by the
 * technical family the check happens to belong to.
 *
 * The old grouping (search basics / structured data / AI readiness) produced a
 * contradiction the booth could not defend out loud: "Medical practice
 * identification" could FAIL — meaning an AI assistant cannot tell this is a
 * vein practice — while "AI readiness" still scored 90, because the single most
 * important AI signal lived in a different category. Regrouping fixes that at
 * the root: the check that decides whether AI understands the practice is now
 * inside the category that claims to answer it.
 *
 * WEIGHTING. Within a category, checks carry different weights — a missing
 * llms.txt and a blocked crawler are not the same size of problem. On top of
 * that, two checks act as HARD CEILINGS: if AI cannot reach the site, or cannot
 * tell what the practice is, no number of passing minor checks should let that
 * category read as healthy.
 *
 * This module is pure (no Node imports) so the server (runAudit, the pre-warm
 * script) and the client (the booth UI) score identically from the same table.
 * The UI derives categories from the raw checks rather than trusting a stored
 * `scores` object, so a result measured before this restructure still renders
 * under the new categories with the correct new numbers.
 */

export type CategoryKey = "aiFind" | "aiUnderstand" | "patientsFind" | "speed";

/** Who measured it — drives the attribution label under each gauge. */
export type CategorySource = "google" | "inflowmd";

export interface CategoryDefinition {
  key: CategoryKey;
  label: string;
  source: CategorySource;
  /**
   * Check id → weight. Also defines membership and display order: a check
   * absent from every category's table would never be scored or shown, which
   * the test suite asserts can't happen.
   */
  weights: Record<string, number>;
  /**
   * When this check's status is exactly `fail`, the category score is capped
   * at `max` no matter what else passes.
   */
  ceiling?: { checkId: string; max: number };
}

/** Credit earned per weight unit. could_not_verify never reaches here. */
const STATUS_CREDIT: Record<Exclude<Check["status"], "could_not_verify">, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

/** Display order is the order of this array, and of keys within each table. */
export const CATEGORIES: readonly CategoryDefinition[] = [
  {
    key: "aiFind",
    label: "Can AI find you?",
    source: "inflowmd",
    weights: {
      "ai.crawler-access": 3,
      "ai.robots-file": 2,
      "ai.llms-txt": 2,
      "seo.redirect-chain": 1,
    },
    // Blocked crawlers mean the site is invisible to AI assistants outright.
    ceiling: { checkId: "ai.crawler-access", max: 40 },
  },
  {
    key: "aiUnderstand",
    label: "Can AI understand you?",
    source: "inflowmd",
    weights: {
      "schema.medical": 3,
      "schema.present": 3,
      "schema.local-business": 1,
      "schema.organization": 1,
      "ai.semantic-structure": 1,
      "ai.content-depth": 1,
      "seo.heading-order": 1,
      "schema.faq": 1,
    },
    // If AI can't tell this is a medical practice, the rest is detail.
    ceiling: { checkId: "schema.medical", max: 40 },
  },
  {
    key: "patientsFind",
    label: "Can patients find you?",
    source: "inflowmd",
    weights: {
      "seo.title": 1,
      "seo.meta-description": 1,
      "seo.h1": 1,
      "seo.viewport": 1,
      "seo.canonical": 1,
      "seo.open-graph": 1,
      "seo.image-alt": 1,
      "seo.https": 1,
    },
  },
  {
    key: "speed",
    label: "How fast is it?",
    source: "google",
    // Not check-derived: this category IS Google's Lighthouse score.
    weights: {},
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

/**
 * Weighted score for one check-derived category.
 *
 * `could_not_verify` is excluded from the denominator entirely — neither credit
 * nor penalty — and the minimum-verified floor still applies, so a category we
 * could barely read reports no score rather than a hollow one.
 */
export function scoreCategoryWeighted(
  checks: Check[],
  definition: CategoryDefinition
): CategoryScore {
  const members = checks.filter((c) => definition.weights[c.id] !== undefined);
  const scorable = members.filter((c) => c.status !== "could_not_verify");
  const verified = scorable.length;
  const total = members.length;

  if (verified < MIN_VERIFIED_CHECKS) {
    return { score: null, verified, total };
  }

  let earned = 0;
  let possible = 0;
  for (const check of scorable) {
    const weight = definition.weights[check.id];
    possible += weight;
    earned += weight * STATUS_CREDIT[check.status as keyof typeof STATUS_CREDIT];
  }
  if (possible === 0) return { score: null, verified, total };

  let score = Math.round((earned / possible) * 100);

  // Hard ceiling: only a definite `fail` triggers it. A gate check we could not
  // verify must not be treated as if it had failed.
  const ceiling = definition.ceiling;
  if (ceiling) {
    const gate = members.find((c) => c.id === ceiling.checkId);
    if (gate?.status === "fail") score = Math.min(score, ceiling.max);
  }

  return { score, verified, total };
}

export interface ResolvedCategory extends CategoryScore {
  key: CategoryKey;
  label: string;
  source: CategorySource;
  /** Member checks, in the category's declared order. Empty for speed. */
  checks: Check[];
}

/**
 * The four categories, resolved and display-ready, in spec order.
 *
 * Derived from the raw checks, so this returns the same answer for a result
 * measured live and one served from a cache written before the restructure.
 */
export function buildCategories(result: {
  seo?: Check[];
  schema?: Check[];
  aiReadiness?: Check[];
  performance?: PerformanceResult;
  scores?: Partial<AuditScores>;
}): ResolvedCategory[] {
  const checks = allChecks(result);
  const byId = new Map(checks.map((c) => [c.id, c]));

  return CATEGORIES.map((definition) => {
    if (definition.key === "speed") {
      const perf = result.performance;
      const score = perf?.available ? (perf.lighthouseScore ?? null) : null;
      return {
        key: definition.key,
        label: definition.label,
        source: definition.source,
        score,
        verified: score === null ? 0 : 1,
        total: 1,
        checks: [],
      };
    }
    const ordered = Object.keys(definition.weights)
      .map((id) => byId.get(id))
      .filter((c): c is Check => c !== undefined);
    return {
      key: definition.key,
      label: definition.label,
      source: definition.source,
      ...scoreCategoryWeighted(checks, definition),
      checks: ordered,
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
  const aiFind = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.aiFind);
  const aiUnderstand = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.aiUnderstand);
  const patientsFind = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.patientsFind);
  const perf = result.performance;

  return {
    performance: perf?.available ? (perf.lighthouseScore ?? null) : null,
    aiFind: aiFind.score,
    aiFindVerified: aiFind.verified,
    aiFindTotal: aiFind.total,
    aiUnderstand: aiUnderstand.score,
    aiUnderstandVerified: aiUnderstand.verified,
    aiUnderstandTotal: aiUnderstand.total,
    patientsFind: patientsFind.score,
    patientsFindVerified: patientsFind.verified,
    patientsFindTotal: patientsFind.total,
  };
}

/** Normalizes a stored result so its `scores` match the current category table. */
export function withDerivedScores(result: AuditResult): AuditResult {
  return { ...result, scores: deriveScores(result) };
}
