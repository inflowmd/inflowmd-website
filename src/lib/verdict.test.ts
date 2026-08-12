/**
 * Plain assertions for the verdict matrix.
 * No test framework — run with: npm run test:verdict
 */

import assert from "node:assert/strict";
import { CATEGORY_NOUN, bandFor, buildVerdict } from "./verdict";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/** Representative scores per band. */
const C = 20; // critical  (< 50)
const W = 60; // weak      (50–74)
const F = 90; // fine      (75+)

const v = (ai: number | null, patientsFind: number | null, speed: number | null) =>
  buildVerdict({ ai, patientsFind, speed });

/* ---------- band boundaries ---------- */

check("band boundaries: <50 critical, 50–74 weak, 75+ fine", () => {
  assert.equal(bandFor(0), "critical");
  assert.equal(bandFor(49), "critical");
  assert.equal(bandFor(50), "weak");
  assert.equal(bandFor(74), "weak");
  assert.equal(bandFor(75), "fine");
  assert.equal(bandFor(100), "fine");
  assert.equal(bandFor(null), null);
});

/* ---------- every combination of the three bands (27 cases) ---------- */

check("ALL THREE CRITICAL", () => {
  const r = v(C, C, C)!;
  assert.equal(r.rule, "all-critical");
  assert.equal(r.headline, "This site is working against you at every stage.");
  assert.match(r.subline, /wait too long for it to load/);
  assert.equal(r.tone, "critical");
});

check("AI + SEARCH CRITICAL, SPEED FINE", () => {
  const r = v(C, C, F)!;
  assert.equal(r.rule, "ai+search-critical");
  assert.equal(r.headline, "A fast site that nobody can find.");
  assert.match(r.subline, /The site loads quickly/);
});

check("AI + SPEED CRITICAL, SEARCH FINE", () => {
  const r = v(C, F, C)!;
  assert.equal(r.rule, "ai+speed-critical");
  assert.equal(r.headline, "Found by search, invisible to AI, and slow to load.");
  assert.match(r.subline, /Traditional search basics are in place/);
});

check("SEARCH + SPEED CRITICAL, AI FINE", () => {
  const r = v(F, C, C)!;
  assert.equal(r.rule, "search+speed-critical");
  assert.equal(r.headline, "AI understands this site. Patients may never reach it.");
  assert.match(r.subline, /The structured data is there/);
});

check("AI CRITICAL ALONE", () => {
  for (const others of [
    [F, F],
    [W, F],
    [F, W],
    [W, W],
  ] as const) {
    const r = v(C, others[0], others[1])!;
    assert.equal(r.rule, "ai-critical", `others ${others.join(",")}`);
    assert.equal(r.headline, "AI cannot identify this as a vein practice.");
    assert.match(r.subline, /No medical schema found/);
  }
});

check("SEARCH CRITICAL ALONE", () => {
  const r = v(F, C, F)!;
  assert.equal(r.rule, "search-critical");
  assert.equal(r.headline, "Patients searching for you may not find you.");
  assert.match(r.subline, /titles, descriptions, page structure/);
});

check("SPEED CRITICAL ALONE", () => {
  const r = v(F, F, C)!;
  assert.equal(r.rule, "speed-critical");
  assert.equal(r.headline, "Patients can find you. Then they leave.");
  assert.match(r.subline, /never see it finish loading/);
});

check("AI WEAK, OTHERS FINE", () => {
  const r = v(W, F, F)!;
  assert.equal(r.rule, "ai-weak");
  assert.equal(r.headline, "Close, but AI is still guessing.");
  assert.equal(r.tone, "weak");
});

check("SEARCH WEAK, OTHERS FINE", () => {
  const r = v(F, W, F)!;
  assert.equal(r.rule, "search-weak");
  assert.equal(r.headline, "Solid foundation, incomplete search basics.");
});

check("SPEED WEAK, OTHERS FINE", () => {
  const r = v(F, F, W)!;
  assert.equal(r.rule, "speed-weak");
  assert.equal(r.headline, "Discoverable, but slower than patients expect.");
});

check("ALL WEAK", () => {
  const r = v(W, W, W)!;
  assert.equal(r.rule, "all-weak");
  assert.equal(r.headline, "Nothing here is broken. Nothing here is working hard either.");
  assert.equal(r.tone, "weak");
});

check("ALL FINE", () => {
  const r = v(F, F, F)!;
  assert.equal(r.rule, "all-fine");
  assert.equal(r.headline, "This site is in good shape.");
  assert.equal(r.tone, "fine");
});

/* ---------- two weak: the substituted names ---------- */

check("TWO WEAK substitutes the correct category names, in category order", () => {
  const aiSearch = v(W, W, F)!;
  assert.equal(aiSearch.rule, "two-weak");
  assert.equal(aiSearch.headline, "The pieces are in place. The execution isn't.");
  assert.equal(
    aiSearch.subline,
    "Improvements to AI optimization and search visibility would meaningfully change how many patients this site converts."
  );

  const aiSpeed = v(W, F, W)!;
  assert.equal(
    aiSpeed.subline,
    "Improvements to AI optimization and speed would meaningfully change how many patients this site converts."
  );

  const searchSpeed = v(F, W, W)!;
  assert.equal(
    searchSpeed.subline,
    "Improvements to search visibility and speed would meaningfully change how many patients this site converts."
  );
});

check("two-weak never names a category that is not weak", () => {
  const r = v(W, F, W)!;
  assert.ok(!r.subline.includes(CATEGORY_NOUN.patientsFind), r.subline);
});

/* ---------- null scores are excluded from the logic ---------- */

check("a null category is excluded — the verdict is chosen from the rest", () => {
  // AI unverified, both others weak → two-weak over the measured pair. Its
  // copy names only the two weak categories, so it is safe with AI unknown.
  const twoWeak = v(null, W, W)!;
  assert.equal(twoWeak.rule, "two-weak");
  assert.equal(
    twoWeak.subline,
    "Improvements to search visibility and speed would meaningfully change how many patients this site converts."
  );

  // AI unverified, search critical → the search line claims nothing about AI.
  assert.equal(v(null, C, F)!.rule, "search-critical");
});

check("a whole-site verdict is withheld when a category was never measured", () => {
  // "This site is in good shape / The fundamentals are solid" speaks for the
  // whole site. With AI unverified we have not earned that claim, so there is
  // no banner rather than a flattering one.
  assert.equal(v(null, F, F), null);
  assert.equal(v(F, null, F), null);
  assert.equal(v(F, F, null), null);
});

check("lines that call a site 'discoverable' need AI and search measured", () => {
  // Speed critical, AI and search unverified — the real shape of a practice
  // whose page could not be fetched. "Patients can find you. Then they leave."
  // would assert discoverability we never established.
  assert.equal(v(null, null, C), null);
  assert.equal(v(null, null, W), null, "the same claim sits in the speed-weak line");
  // With both measured and fine, the same line is earned.
  assert.equal(v(F, F, C)!.rule, "speed-critical");
  assert.equal(v(F, F, W)!.rule, "speed-weak");
});

check("a null category is never named in the verdict", () => {
  const r = v(null, W, W)!;
  assert.ok(!r.subline.includes(CATEGORY_NOUN.ai), `named the unverified category: ${r.subline}`);
});

check("nothing verified at all → no verdict, not a guess", () => {
  assert.equal(v(null, null, null), null);
});

check("a single measured category produces a verdict only when the copy allows", () => {
  // The AI and search critical lines describe their own category and claim
  // nothing about the others, so they stand alone.
  assert.equal(v(C, null, null)!.rule, "ai-critical");
  assert.equal(v(null, C, null)!.rule, "search-critical");
  // The speed lines do not — see above.
  assert.equal(v(null, null, C), null);
});

/* ---------- pair lines only fire when the praised category earned it ---------- */

check("a pair line is NOT used when the category it praises is only weak", () => {
  // AI + search critical, speed WEAK. "A fast site that nobody can find" would
  // assert the site is fast, which a 60 does not support.
  const r = v(C, C, W)!;
  assert.notEqual(r.rule, "ai+search-critical");
  assert.ok(!r.subline.includes("loads quickly"), r.subline);
  assert.equal(r.rule, "ai-critical", "falls back to a line that claims nothing about speed");
});

check("a pair line is NOT used when the category it praises is unverified", () => {
  // Search + speed critical, AI null. "The structured data is there" would
  // assert quality for a category we could not read.
  const r = v(null, C, C)!;
  assert.notEqual(r.rule, "search+speed-critical");
  assert.ok(!r.subline.includes("structured data is there"), r.subline);
  assert.equal(r.rule, "search-critical");
});

check("no verdict ever names or praises an unmeasured category", () => {
  const combos: Array<[number | null, number | null, number | null]> = [];
  for (const ai of [C, W, F, null]) {
    for (const search of [C, W, F, null]) {
      for (const speed of [C, W, F, null]) combos.push([ai, search, speed]);
    }
  }
  for (const [ai, search, speed] of combos) {
    const r = v(ai, search, speed);
    if (!r) continue;
    const text = `${r.headline} ${r.subline}`;
    if (ai === null) {
      assert.ok(!/\bAI\b|structured data|schema/i.test(text), `AI unmeasured but: ${text}`);
    }
    if (search === null) {
      assert.ok(!/search|discoverable|find you/i.test(text), `search unmeasured but: ${text}`);
    }
    if (speed === null) {
      assert.ok(
        !/loads quickly|slow|speed|loading/i.test(text),
        `speed unmeasured but: ${text}`
      );
    }
  }
});

/* ---------- tone ---------- */

check("tone: any critical is red, weak-without-critical is amber, all fine is lime", () => {
  assert.equal(v(C, F, F)!.tone, "critical");
  assert.equal(v(C, C, C)!.tone, "critical");
  assert.equal(v(C, W, W)!.tone, "critical", "a critical outranks weaks for styling too");
  assert.equal(v(W, F, F)!.tone, "weak");
  assert.equal(v(W, W, W)!.tone, "weak");
  assert.equal(v(F, F, F)!.tone, "fine");
});

/* ---------- exhaustive: every one of the 27 band combinations resolves ---------- */

check("all 27 band combinations resolve to a verdict with non-empty copy", () => {
  const bands = [C, W, F];
  let seen = 0;
  for (const ai of bands) {
    for (const search of bands) {
      for (const speed of bands) {
        const r = v(ai, search, speed);
        assert.ok(r, `no verdict for ${ai}/${search}/${speed}`);
        assert.ok(r.headline.length > 10, "headline must be real copy");
        assert.ok(r.subline.length > 20, "subline must be real copy");
        seen++;
      }
    }
  }
  assert.equal(seen, 27);
});

console.log(`\n${passed} verdict checks passed.`);
