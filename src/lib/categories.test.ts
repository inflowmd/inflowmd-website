/**
 * Plain assertions for the category table, weighting, and hard ceilings.
 * No test framework — run with: npm run test:categories
 */

import assert from "node:assert/strict";
import type { Check, PerformanceResult } from "../types/audit";
import {
  CATEGORIES,
  CATEGORY_BY_KEY,
  allMappedCheckIds,
  buildCategories,
  deriveScores,
  scoreCategoryWeighted,
} from "./categories";
import { MIN_VERIFIED_CHECKS } from "./scoring";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/** Every check id the engine actually produces, per the check modules. */
const ALL_ENGINE_CHECK_IDS = [
  // seo.ts
  "seo.https",
  "seo.redirect-chain",
  "seo.title",
  "seo.meta-description",
  "seo.h1",
  "seo.heading-order",
  "seo.viewport",
  "seo.canonical",
  "seo.open-graph",
  "seo.image-alt",
  // schema.ts
  "schema.present",
  "schema.medical",
  "schema.local-business",
  "schema.faq",
  "schema.organization",
  // aiReadiness.ts
  "ai.robots-file",
  "ai.crawler-access",
  "ai.llms-txt",
  "ai.semantic-structure",
  "ai.content-depth",
];

function mk(id: string, status: Check["status"]): Check {
  return { id, label: id, status, detail: "" };
}

/** All members of a category at one status, so weighting can be isolated. */
function allAt(categoryKey: keyof typeof CATEGORY_BY_KEY, status: Check["status"]): Check[] {
  return Object.keys(CATEGORY_BY_KEY[categoryKey].weights).map((id) => mk(id, status));
}

const PERF_OK: PerformanceResult = {
  available: true,
  lighthouseScore: 73,
  lcp: 2.1,
  cls: 0.01,
  tbt: 30,
  speedIndex: 1.9,
  fieldDataAvailable: false,
  fieldLcp: null,
};

/* ---------- membership: every check placed exactly once ---------- */

check("every engine check id is assigned to exactly one category", () => {
  const mapped = allMappedCheckIds();
  const seen = new Set<string>();
  for (const id of mapped) {
    assert.ok(!seen.has(id), `${id} appears in more than one category`);
    seen.add(id);
  }
  for (const id of ALL_ENGINE_CHECK_IDS) {
    assert.ok(seen.has(id), `${id} is produced by the engine but never categorized`);
  }
  for (const id of mapped) {
    assert.ok(
      ALL_ENGINE_CHECK_IDS.includes(id),
      `${id} is categorized but no check module produces it`
    );
  }
  assert.equal(mapped.length, ALL_ENGINE_CHECK_IDS.length);
});

check("categories are in spec order with the specified labels", () => {
  assert.deepEqual(
    CATEGORIES.map((c) => c.label),
    ["Can AI find you?", "Can AI understand you?", "Can patients find you?", "How fast is it?"]
  );
});

check("only the speed category is attributed to Google", () => {
  const google = CATEGORIES.filter((c) => c.source === "google").map((c) => c.key);
  assert.deepEqual(google, ["speed"]);
});

check("the specified weights are in place", () => {
  assert.equal(CATEGORY_BY_KEY.aiFind.weights["ai.crawler-access"], 3);
  assert.equal(CATEGORY_BY_KEY.aiFind.weights["ai.robots-file"], 2);
  assert.equal(CATEGORY_BY_KEY.aiFind.weights["ai.llms-txt"], 2);
  assert.equal(CATEGORY_BY_KEY.aiFind.weights["seo.redirect-chain"], 1);
  assert.equal(CATEGORY_BY_KEY.aiUnderstand.weights["schema.medical"], 3);
  assert.equal(CATEGORY_BY_KEY.aiUnderstand.weights["schema.present"], 3);
  for (const [id, w] of Object.entries(CATEGORY_BY_KEY.aiUnderstand.weights)) {
    if (id !== "schema.medical" && id !== "schema.present") assert.equal(w, 1, `${id} weight`);
  }
  for (const w of Object.values(CATEGORY_BY_KEY.patientsFind.weights)) assert.equal(w, 1);
});

/* ---------- weighted scoring ---------- */

check("all passing scores 100; all failing scores 0", () => {
  assert.equal(scoreCategoryWeighted(allAt("aiFind", "pass"), CATEGORY_BY_KEY.aiFind).score, 100);
  assert.equal(scoreCategoryWeighted(allAt("aiFind", "fail"), CATEGORY_BY_KEY.aiFind).score, 0);
});

check("warn earns half credit, scaled by weight", () => {
  // aiFind weights: crawler-access 3, robots 2, llms 2, redirect 1 = 8 total.
  // All warn => 4/8 = 50.
  assert.equal(scoreCategoryWeighted(allAt("aiFind", "warn"), CATEGORY_BY_KEY.aiFind).score, 50);
});

check("weight actually changes the result — a heavy fail costs more than a light one", () => {
  // Heavy check fails (weight 3 of 8): earned 5/8 = 63.
  const heavyFails = [
    mk("ai.crawler-access", "fail"),
    mk("ai.robots-file", "pass"),
    mk("ai.llms-txt", "pass"),
    mk("seo.redirect-chain", "pass"),
  ];
  // Light check fails (weight 1 of 8): earned 7/8 = 88.
  const lightFails = [
    mk("ai.crawler-access", "pass"),
    mk("ai.robots-file", "pass"),
    mk("ai.llms-txt", "pass"),
    mk("seo.redirect-chain", "fail"),
  ];
  const heavy = scoreCategoryWeighted(heavyFails, CATEGORY_BY_KEY.aiFind).score!;
  const light = scoreCategoryWeighted(lightFails, CATEGORY_BY_KEY.aiFind).score!;
  assert.equal(light, 88);
  assert.ok(heavy < light, `heavy fail ${heavy} should score below light fail ${light}`);
  // Under the old flat scoring both would have been 75 — the point of weighting.
  assert.notEqual(heavy, light);
});

check("could_not_verify is excluded from the denominator, not counted as failure", () => {
  const checks = [
    mk("seo.title", "pass"),
    mk("seo.meta-description", "pass"),
    mk("seo.h1", "pass"),
    mk("seo.viewport", "could_not_verify"),
    mk("seo.canonical", "could_not_verify"),
  ];
  const result = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.patientsFind);
  assert.equal(result.score, 100, "unverifiable checks must not drag the score down");
  assert.equal(result.verified, 3);
  assert.equal(result.total, 5);
});

check("below the minimum-verified floor the score is withheld entirely", () => {
  const checks = [
    mk("seo.title", "pass"),
    mk("seo.meta-description", "pass"),
    mk("seo.h1", "could_not_verify"),
  ];
  const result = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.patientsFind);
  assert.equal(result.verified, 2);
  assert.ok(result.verified < MIN_VERIFIED_CHECKS);
  assert.equal(result.score, null);
});

/* ---------- hard ceilings ---------- */

check("medical practice identification FAIL caps 'Can AI understand you?' at 40", () => {
  // Everything else passes — without the ceiling this would score ~79.
  const checks = allAt("aiUnderstand", "pass").map((c) =>
    c.id === "schema.medical" ? mk(c.id, "fail") : c
  );
  const uncapped = (() => {
    let earned = 0;
    let possible = 0;
    for (const c of checks) {
      const w = CATEGORY_BY_KEY.aiUnderstand.weights[c.id];
      possible += w;
      earned += c.status === "pass" ? w : 0;
    }
    return Math.round((earned / possible) * 100);
  })();
  assert.ok(uncapped > 40, `precondition: uncapped score ${uncapped} should exceed the ceiling`);

  const result = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.aiUnderstand);
  assert.ok(
    result.score !== null && result.score <= 40,
    `expected <= 40, got ${result.score}`
  );
});

check("AI assistant access FAIL caps 'Can AI find you?' at 40", () => {
  const checks = allAt("aiFind", "pass").map((c) =>
    c.id === "ai.crawler-access" ? mk(c.id, "fail") : c
  );
  const result = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.aiFind);
  assert.ok(
    result.score !== null && result.score <= 40,
    `expected <= 40, got ${result.score}`
  );
});

check("a ceiling never RAISES a score that is already below it", () => {
  const checks = allAt("aiFind", "fail");
  assert.equal(scoreCategoryWeighted(checks, CATEGORY_BY_KEY.aiFind).score, 0);
});

check("an unverifiable gate check does NOT trigger the ceiling", () => {
  // could_not_verify is not a failure — capping on it would be the exact
  // false accusation the engine refuses to make.
  const checks = allAt("aiUnderstand", "pass").map((c) =>
    c.id === "schema.medical" ? mk(c.id, "could_not_verify") : c
  );
  const result = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.aiUnderstand);
  assert.equal(result.score, 100);
});

/* ---------- the contradiction this restructure exists to fix ---------- */

check("a failed medical identification can no longer coexist with a high AI score", () => {
  // The old shape: schema.medical FAIL sat in "structured data" while the
  // "AI readiness" category scored off unrelated checks and read ~90.
  const result = buildCategories({
    seo: [mk("seo.heading-order", "pass"), mk("seo.redirect-chain", "pass")],
    schema: [
      mk("schema.medical", "fail"),
      mk("schema.present", "pass"),
      mk("schema.local-business", "pass"),
      mk("schema.organization", "pass"),
      mk("schema.faq", "pass"),
    ],
    aiReadiness: [
      mk("ai.crawler-access", "pass"),
      mk("ai.robots-file", "pass"),
      mk("ai.llms-txt", "pass"),
      mk("ai.semantic-structure", "pass"),
      mk("ai.content-depth", "pass"),
    ],
    performance: PERF_OK,
  });
  const understand = result.find((c) => c.key === "aiUnderstand")!;
  assert.ok(
    understand.score !== null && understand.score <= 40,
    `AI-understanding must reflect the failed identification, got ${understand.score}`
  );
});

/* ---------- assembly ---------- */

check("buildCategories returns four categories in spec order, speed from Lighthouse", () => {
  const cats = buildCategories({
    seo: [],
    schema: [],
    aiReadiness: [],
    performance: PERF_OK,
  });
  assert.deepEqual(cats.map((c) => c.key), ["aiFind", "aiUnderstand", "patientsFind", "speed"]);
  const speed = cats[3];
  assert.equal(speed.score, 73);
  assert.equal(speed.source, "google");
  assert.deepEqual(speed.checks, []);
});

check("speed is null (not zero) when PageSpeed did not return a result", () => {
  const cats = buildCategories({
    seo: [],
    schema: [],
    aiReadiness: [],
    performance: { ...PERF_OK, available: false, lighthouseScore: null },
  });
  assert.equal(cats.find((c) => c.key === "speed")!.score, null);
});

check("category checks are returned in the category's declared order", () => {
  const cats = buildCategories({
    seo: [mk("seo.redirect-chain", "pass")],
    schema: [],
    aiReadiness: [
      mk("ai.llms-txt", "pass"),
      mk("ai.crawler-access", "pass"),
      mk("ai.robots-file", "pass"),
    ],
    performance: PERF_OK,
  });
  assert.deepEqual(
    cats.find((c) => c.key === "aiFind")!.checks.map((c) => c.id),
    ["ai.crawler-access", "ai.robots-file", "ai.llms-txt", "seo.redirect-chain"]
  );
});

check("deriveScores agrees with buildCategories", () => {
  const input = {
    seo: ALL_ENGINE_CHECK_IDS.filter((id) => id.startsWith("seo.")).map((id) => mk(id, "pass")),
    schema: ALL_ENGINE_CHECK_IDS.filter((id) => id.startsWith("schema.")).map((id) =>
      mk(id, id === "schema.medical" ? "fail" : "pass")
    ),
    aiReadiness: ALL_ENGINE_CHECK_IDS.filter((id) => id.startsWith("ai.")).map((id) =>
      mk(id, "pass")
    ),
    performance: PERF_OK,
  };
  const scores = deriveScores(input);
  const cats = buildCategories(input);
  for (const cat of cats) {
    const field = cat.key === "speed" ? "performance" : cat.key;
    assert.equal(
      scores[field as keyof typeof scores],
      cat.score,
      `${cat.key} disagrees between deriveScores and buildCategories`
    );
  }
  assert.ok(scores.aiUnderstand !== null && scores.aiUnderstand <= 40);
});

console.log(`\n${passed} category checks passed.`);
