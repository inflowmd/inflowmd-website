/**
 * Plain assertions for the category table, weighting, floors, and findings
 * ordering. No test framework — run with: npm run test:categories
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

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/** Every check id the engine actually produces, per the check modules. */
const ALL_ENGINE_CHECK_IDS = [
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
  "schema.present",
  "schema.medical",
  "schema.local-business",
  "schema.faq",
  "schema.organization",
  "ai.robots-file",
  "ai.crawler-access",
  "ai.llms-txt",
  "ai.semantic-structure",
  "ai.content-depth",
];

function mk(id: string, status: Check["status"]): Check {
  return { id, label: id, status, detail: "" };
}

function allAt(categoryKey: "ai" | "patientsFind", status: Check["status"]): Check[] {
  return Object.keys(CATEGORY_BY_KEY[categoryKey].weights).map((id) => mk(id, status));
}

const PERF_OK: PerformanceResult = {
  available: true,
  lighthouseScore: 73,
  lcp: 2.1,
  fcp: 1.4,
  cls: 0.01,
  tbt: 30,
  speedIndex: 1.9,
  fieldDataAvailable: false,
  fieldLcp: null,
};

/* ---------- membership + shape ---------- */

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
    assert.ok(ALL_ENGINE_CHECK_IDS.includes(id), `${id} is categorized but never produced`);
  }
  assert.equal(mapped.length, ALL_ENGINE_CHECK_IDS.length);
});

check("three categories, AI first, in spec order", () => {
  assert.deepEqual(
    CATEGORIES.map((c) => c.label),
    ["Is your website optimized for AI?", "Can patients find you?", "How fast is it?"]
  );
  assert.equal(CATEGORIES[0].key, "ai");
});

check("only the speed category is attributed to Google", () => {
  assert.deepEqual(
    CATEGORIES.filter((c) => c.source === "google").map((c) => c.key),
    ["speed"]
  );
});

check("AI weights are the specified values and total 100", () => {
  const w = CATEGORY_BY_KEY.ai.weights;
  assert.equal(w["schema.medical"], 30);
  assert.equal(w["schema.present"], 18);
  assert.equal(w["ai.content-depth"], 10);
  assert.equal(w["ai.semantic-structure"], 10);
  assert.equal(w["schema.local-business"], 8);
  assert.equal(w["schema.organization"], 6);
  assert.equal(w["seo.heading-order"], 6);
  assert.equal(w["ai.crawler-access"], 4);
  assert.equal(w["schema.faq"], 4);
  assert.equal(w["ai.robots-file"], 2);
  assert.equal(w["ai.llms-txt"], 2);
  assert.equal(Object.values(w).reduce((a, b) => a + b, 0), 100);
  assert.equal(Object.keys(w).length, 11);
});

check("redirect chain lives ONLY in 'Can patients find you?'", () => {
  assert.equal(CATEGORY_BY_KEY.ai.weights["seo.redirect-chain"], undefined);
  assert.equal(CATEGORY_BY_KEY.patientsFind.weights["seo.redirect-chain"], 1);
});

check("no category carries a hard ceiling any more", () => {
  for (const c of CATEGORIES) {
    assert.equal(
      (c as unknown as { ceiling?: unknown }).ceiling,
      undefined,
      `${c.key} still declares a ceiling`
    );
  }
});

/* ---------- weighted scoring ---------- */

check("all passing scores 100; all failing scores 0", () => {
  assert.equal(scoreCategoryWeighted(allAt("ai", "pass"), CATEGORY_BY_KEY.ai).score, 100);
  assert.equal(scoreCategoryWeighted(allAt("ai", "fail"), CATEGORY_BY_KEY.ai).score, 0);
});

check("needs-work earns half credit, scaled by weight", () => {
  assert.equal(scoreCategoryWeighted(allAt("ai", "warn"), CATEGORY_BY_KEY.ai).score, 50);
});

check("a failing 30-point check costs far more than a failing 2-point one", () => {
  const heavy = allAt("ai", "pass").map((c) =>
    c.id === "schema.medical" ? mk(c.id, "fail") : c
  );
  const light = allAt("ai", "pass").map((c) =>
    c.id === "ai.llms-txt" ? mk(c.id, "fail") : c
  );
  assert.equal(scoreCategoryWeighted(heavy, CATEGORY_BY_KEY.ai).score, 70);
  assert.equal(scoreCategoryWeighted(light, CATEGORY_BY_KEY.ai).score, 98);
});

check("could_not_verify leaves the denominator — remaining weights rescale", () => {
  // Everything unverified except two passes; the score reflects only what
  // was actually read, not a penalty for what wasn't.
  const checks = allAt("ai", "could_not_verify").map((c) =>
    c.id === "schema.medical" || c.id === "schema.present" ? mk(c.id, "pass") : c
  );
  const result = scoreCategoryWeighted(checks, CATEGORY_BY_KEY.ai);
  // 48 of 100 weight verified — below the 70% floor, so no score is reported.
  assert.equal(result.score, null);
  assert.equal(result.verified, 2);
});

/* ---------- the weight-based floor ---------- */

check("WEIGHT FLOOR: verified weight below 70% of the category returns null", () => {
  // Verify everything EXCEPT medical identification (30 of 100 points).
  // 70 of 100 weight is exactly at the boundary and must pass; dropping one
  // more point must fail.
  const at70 = allAt("ai", "pass").map((c) =>
    c.id === "schema.medical" ? mk(c.id, "could_not_verify") : c
  );
  assert.equal(
    scoreCategoryWeighted(at70, CATEGORY_BY_KEY.ai).score,
    100,
    "exactly 70% verified weight is enough"
  );

  const below70 = at70.map((c) => (c.id === "ai.llms-txt" ? mk(c.id, "could_not_verify") : c));
  assert.equal(
    scoreCategoryWeighted(below70, CATEGORY_BY_KEY.ai).score,
    null,
    "68% verified weight must withhold the score"
  );
});

check("WEIGHT FLOOR fixes the 100-with-unverified-medical-identification bug", () => {
  // The exact shape found in the cache: everything light passes, the decisive
  // 30-point check was never read. The old head-count floor published 100.
  const checks = allAt("ai", "pass").map((c) =>
    c.id === "schema.medical" ? mk(c.id, "could_not_verify") : c
  );
  const withOneMoreGap = checks.map((c) =>
    c.id === "schema.present" ? mk(c.id, "could_not_verify") : c
  );
  const result = scoreCategoryWeighted(withOneMoreGap, CATEGORY_BY_KEY.ai);
  assert.equal(result.verified, 9, "nine of eleven checks did return a verdict");
  assert.equal(
    result.score,
    null,
    "but they are only 52 of 100 points — not enough to publish a number"
  );
});

check("the 3-check floor still governs 'Can patients find you?'", () => {
  assert.deepEqual(CATEGORY_BY_KEY.patientsFind.floor, { kind: "checks", min: 3 });
  const two = [mk("seo.title", "pass"), mk("seo.h1", "pass")];
  assert.equal(scoreCategoryWeighted(two, CATEGORY_BY_KEY.patientsFind).score, null);
  const three = [...two, mk("seo.viewport", "pass")];
  assert.equal(scoreCategoryWeighted(three, CATEGORY_BY_KEY.patientsFind).score, 100);
});

/* ---------- no ceilings: failing medical id lands on a gradient ---------- */

check("a practice failing medical identification can never exceed 70", () => {
  // The weighting alone caps it: medical identification is 30 of 100 points,
  // so a practice that fails it tops out at exactly 70 even when every other
  // check passes perfectly. That is the bound the removed ceiling used to
  // enforce by fiat — no real practice reaches it (the highest among the 30
  // failing practices in the cache is 69).
  const best = allAt("ai", "pass").map((c) =>
    c.id === "schema.medical" ? mk(c.id, "fail") : c
  );
  const score = scoreCategoryWeighted(best, CATEGORY_BY_KEY.ai).score;
  assert.equal(score, 70, "the theoretical best case for a failing practice");
  assert.ok(score !== null && score <= 70, "and nothing can go above it");

  // And a realistic failing practice lands well below that.
  const typical = allAt("ai", "pass").map((c) => {
    if (c.id === "schema.medical") return mk(c.id, "fail");
    if (c.id === "schema.local-business") return mk(c.id, "fail");
    if (c.id === "schema.faq") return mk(c.id, "warn");
    return c;
  });
  // 30 (medical) + 8 (local listing) + 2 (half of FAQ) = 40 points lost.
  const typicalScore = scoreCategoryWeighted(typical, CATEGORY_BY_KEY.ai).score;
  assert.equal(typicalScore, 60, "arithmetic pinned");
  assert.ok(typicalScore < 70, "and comfortably under the failing-practice bound");
});

check("failing practices spread out instead of stacking on one number", () => {
  const variants = [
    ["schema.local-business"],
    ["schema.local-business", "schema.organization"],
    ["schema.local-business", "schema.organization", "ai.content-depth"],
  ].map((extraFails) =>
    scoreCategoryWeighted(
      allAt("ai", "pass").map((c) =>
        c.id === "schema.medical" || extraFails.includes(c.id) ? mk(c.id, "fail") : c
      ),
      CATEGORY_BY_KEY.ai
    ).score
  );
  const distinct = new Set(variants);
  assert.equal(distinct.size, variants.length, `scores collapsed: ${JSON.stringify(variants)}`);
  for (let i = 1; i < variants.length; i++) {
    assert.ok(variants[i]! < variants[i - 1]!, "more failures must score strictly lower");
  }
});

/* ---------- findings ordering by weight impact ---------- */

check("ORDERING: checks sort by points lost, heaviest first", () => {
  const checks = allAt("ai", "pass").map((c) => {
    if (c.id === "ai.llms-txt") return mk(c.id, "fail"); // 2 points lost
    if (c.id === "schema.medical") return mk(c.id, "fail"); // 30 points lost
    if (c.id === "ai.content-depth") return mk(c.id, "warn"); // 5 points lost
    return c;
  });
  const ai = buildCategories({ seo: [], schema: checks, aiReadiness: [], performance: PERF_OK })
    .find((c) => c.key === "ai")!;
  const order = ai.items.map((i) => i.check.id);
  assert.deepEqual(
    order.slice(0, 3),
    ["schema.medical", "ai.content-depth", "ai.llms-txt"],
    `expected 30 → 5 → 2 points lost, got ${JSON.stringify(order.slice(0, 3))}`
  );
});

check("ORDERING: passing checks sort to the bottom of their section", () => {
  const checks = allAt("ai", "pass").map((c) =>
    c.id === "ai.llms-txt" ? mk(c.id, "fail") : c
  );
  const ai = buildCategories({ seo: [], schema: checks, aiReadiness: [], performance: PERF_OK })
    .find((c) => c.key === "ai")!;
  assert.equal(ai.items[0].check.id, "ai.llms-txt", "the only failure leads");
  assert.ok(
    ai.items.slice(1).every((i) => i.check.status === "pass"),
    "everything after it passes"
  );
});

check("ORDERING: unverified checks sit below the point-losers, above passes", () => {
  const checks = allAt("ai", "pass").map((c) => {
    if (c.id === "schema.organization") return mk(c.id, "fail");
    if (c.id === "schema.faq") return mk(c.id, "could_not_verify");
    return c;
  });
  const ai = buildCategories({ seo: [], schema: checks, aiReadiness: [], performance: PERF_OK })
    .find((c) => c.key === "ai")!;
  const ids = ai.items.map((i) => i.check.id);
  assert.equal(ids[0], "schema.organization");
  assert.equal(ids[1], "schema.faq");
});

check("point impact is computed per check for the UI to render", () => {
  const checks = allAt("ai", "pass").map((c) => {
    if (c.id === "schema.medical") return mk(c.id, "fail");
    if (c.id === "ai.content-depth") return mk(c.id, "warn");
    return c;
  });
  const ai = buildCategories({ seo: [], schema: checks, aiReadiness: [], performance: PERF_OK })
    .find((c) => c.key === "ai")!;
  const byId = new Map(ai.items.map((i) => [i.check.id, i]));
  assert.deepEqual(
    { w: byId.get("schema.medical")!.weight, lost: byId.get("schema.medical")!.pointsLost },
    { w: 30, lost: 30 }
  );
  assert.deepEqual(
    { w: byId.get("ai.content-depth")!.weight, lost: byId.get("ai.content-depth")!.pointsLost },
    { w: 10, lost: 5 }
  );
  const crawler = byId.get("ai.crawler-access")!;
  assert.equal(crawler.pointsLost, 0);
  assert.equal(crawler.pointsEarned, 4);
});

/* ---------- assembly ---------- */

check("buildCategories returns three categories, speed from Lighthouse", () => {
  const cats = buildCategories({ seo: [], schema: [], aiReadiness: [], performance: PERF_OK });
  assert.deepEqual(cats.map((c) => c.key), ["ai", "patientsFind", "speed"]);
  const speed = cats[2];
  assert.equal(speed.score, 73);
  assert.equal(speed.source, "google");
  assert.deepEqual(speed.items, []);
});

check("speed is null (not zero) when PageSpeed returned nothing", () => {
  const cats = buildCategories({
    seo: [],
    schema: [],
    aiReadiness: [],
    performance: { ...PERF_OK, available: false, lighthouseScore: null },
  });
  assert.equal(cats.find((c) => c.key === "speed")!.score, null);
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
    assert.equal(scores[field as keyof typeof scores], cat.score, `${cat.key} disagrees`);
  }
  assert.equal(scores.ai, 70, "failing medical id caps AI at its 70-point bound");
});

console.log(`\n${passed} category checks passed.`);
