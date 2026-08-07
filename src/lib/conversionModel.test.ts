/**
 * Plain assertions for the conversion model. No test framework — run with:
 *   npm run test:model
 */

import assert from "node:assert/strict";
import {
  buildConversionModel,
  MODEL_DEFAULTS,
  type ConversionModel,
} from "./conversionModel";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/** Every string anywhere in the model, for forbidden-word scanning. */
function collectStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectStrings(n, out));
  else if (node && typeof node === "object") {
    Object.values(node).forEach((n) => collectStrings(n, out));
  }
  return out;
}

const BASE = {
  monthlyVisitors: 800,
  currentInquiryRate: 0.02,
  avgPatientValue: 3000,
  closeRate: 0.4,
  gapCaptureRate: 0.25,
};

const build = (over: Partial<typeof BASE> & { lcpSeconds: number | null }) =>
  buildConversionModel({ ...BASE, ...over }) as ConversionModel;

console.log("\nconversionModel\n");

/* ---------- fast site ---------- */

check("0.9s site → band 'fast'", () => {
  const m = build({ lcpSeconds: 0.9 });
  assert.ok(m, "expected a model");
  assert.equal(m.band, "fast");
  assert.deepEqual(m.multiplierRange, [1, 1]);
});

check("0.9s site → zero gap and zero revenue", () => {
  const m = build({ lcpSeconds: 0.9 });
  assert.deepEqual(m.gapRange, [0, 0]);
  assert.deepEqual(m.attributableGapRange, [0, 0]);
  assert.deepEqual(m.revenueRange, [0, 0]);
});

check("0.9s site → positive headline, no manufactured problem", () => {
  const m = build({ lcpSeconds: 0.9 });
  assert.match(m.headline, /not costing you inquiries/i);
  assert.doesNotMatch(m.headline, /missing|losing|lost/i);
});

/* ---------- slow site ---------- */

check("6.2s site → band 'slow' with multiplierRange [3, 5]", () => {
  const m = build({ lcpSeconds: 6.2 });
  assert.equal(m.band, "slow");
  assert.deepEqual(m.multiplierRange, [3, 5]);
});

check("6.2s site → arithmetic chain is correct", () => {
  const m = build({ lcpSeconds: 6.2 });
  // 800 visitors x 2% = 16 inquiries; x3 and x5 = 48 and 80.
  assert.equal(m.currentInquiries, 16);
  assert.deepEqual(m.comparableInquiriesRange, [48, 80]);
  assert.deepEqual(m.gapRange, [32, 64]);
  // 25% of the gap is attributed to speed, before closeRate and value.
  assert.deepEqual(m.attributableGapRange, [8, 16]);
  // 8 x 0.4 x 3000, 16 x 0.4 x 3000.
  assert.deepEqual(m.revenueRange, [9_600, 19_200]);
});

check("6.2s site → every output is a range, rendered as a range", () => {
  const m = build({ lcpSeconds: 6.2 });
  assert.equal(m.gapRange.length, 2);
  assert.equal(m.attributableGapRange.length, 2);
  assert.equal(m.revenueRange.length, 2);
  const rangeSteps = m.steps.filter((s) =>
    [
      "Inquiries at comparable fast sites",
      "The gap",
      "Gap attributed to speed",
      "Patient value per month",
    ].includes(s.label)
  );
  assert.equal(rangeSteps.length, 4);
  for (const step of rangeSteps) {
    assert.match(step.value, /–/, `expected a range in "${step.label}": ${step.value}`);
  }
  assert.match(m.headline, /–/);
});

check("6.2s site → no annual figure anywhere in the strings", () => {
  const m = build({ lcpSeconds: 6.2 });
  for (const s of collectStrings(m)) {
    assert.doesNotMatch(s, /\byear\b|\byearly\b|\bannual\b|\bannually\b/i, `annualized: "${s}"`);
  }
});

/* ---------- gap framing ---------- */

check("the delta is framed as a gap, never as recovered or additional", () => {
  const m = build({ lcpSeconds: 6.2 });
  const labels = m.steps.map((s) => s.label);
  assert.ok(labels.includes("The gap"), "expected a step labelled 'The gap'");
  for (const s of collectStrings(m)) {
    assert.doesNotMatch(
      s,
      /\badditional inquir|\brecover|\bregain|\bwin back\b|\byou would gain\b/i,
      `implies a causal recovery: "${s}"`
    );
  }
  assert.match(m.headline, /the gap between your site and comparable fast sites/i);
});

check("caveat states the correlation limit and is attached to the model", () => {
  const m = build({ lcpSeconds: 6.2 });
  assert.match(m.caveat, /compared different sites to each other/i);
  assert.match(m.caveat, /one contributing factor rather than the sole cause/i);
  assert.match(m.caveat, /only a portion of the gap is attributable to speed/i);
});

/* ---------- gapCaptureRate ---------- */

check("gapCaptureRate appears as its own visible, editable step", () => {
  const m = build({ lcpSeconds: 6.2 });
  const step = m.steps.find((s) => s.inputKey === "gapCaptureRate");
  assert.ok(step, "expected a gapCaptureRate step");
  assert.equal(step.label, "How much of the gap is speed?");
  assert.equal(step.value, "25%");
  assert.equal(step.provenance, "estimate");
  assert.equal(step.editable, true);
  // It must be applied before closeRate and value in the visible chain.
  const idx = (label: string) => m.steps.findIndex((s) => s.label === label);
  assert.ok(idx("How much of the gap is speed?") < idx("Of inquiries that become patients"));
  assert.ok(idx("How much of the gap is speed?") < idx("Value per patient"));
});

check("gapCaptureRate scales the revenue range linearly", () => {
  const quarter = build({ lcpSeconds: 6.2, gapCaptureRate: 0.25 });
  const half = build({ lcpSeconds: 6.2, gapCaptureRate: 0.5 });
  const full = build({ lcpSeconds: 6.2, gapCaptureRate: 1 });
  assert.deepEqual(half.revenueRange, [
    quarter.revenueRange[0] * 2,
    quarter.revenueRange[1] * 2,
  ]);
  assert.deepEqual(full.revenueRange, [
    quarter.revenueRange[0] * 4,
    quarter.revenueRange[1] * 4,
  ]);
});

check("gapCaptureRate of 0 attributes nothing to speed", () => {
  const m = build({ lcpSeconds: 6.2, gapCaptureRate: 0 });
  assert.deepEqual(m.attributableGapRange, [0, 0]);
  assert.deepEqual(m.revenueRange, [0, 0]);
  // The gap itself is unchanged — only the attribution is zero.
  assert.deepEqual(m.gapRange, [32, 64]);
});

check("gapCaptureRate is applied before closeRate and avgPatientValue", () => {
  const m = build({ lcpSeconds: 6.2, gapCaptureRate: 0.5 });
  const [low, high] = m.attributableGapRange;
  assert.deepEqual(m.revenueRange, [
    Math.round((low * BASE.closeRate * BASE.avgPatientValue) / 100) * 100,
    Math.round((high * BASE.closeRate * BASE.avgPatientValue) / 100) * 100,
  ]);
});

check("out-of-range gapCaptureRate falls back to the default", () => {
  const fallback = build({ lcpSeconds: 6.2 });
  for (const bad of [1.5, -0.2, NaN]) {
    const m = build({ lcpSeconds: 6.2, gapCaptureRate: bad });
    assert.deepEqual(m.revenueRange, fallback.revenueRange, `not defaulted for ${bad}`);
  }
});

/* ---------- other pass-throughs ---------- */

check("revenue passes through closeRate", () => {
  const half = build({ lcpSeconds: 6.2, closeRate: 0.2 });
  const full = build({ lcpSeconds: 6.2, closeRate: 0.4 });
  assert.equal(half.revenueRange[0] * 2, full.revenueRange[0]);
  assert.equal(half.revenueRange[1] * 2, full.revenueRange[1]);
});

check("revenue is rounded to the nearest $100", () => {
  const m = build({ lcpSeconds: 6.2, avgPatientValue: 2777 });
  for (const value of m.revenueRange) {
    assert.equal(value % 100, 0, `not rounded to $100: ${value}`);
  }
});

/* ---------- provenance ---------- */

check("provenance tags are present and correctly assigned", () => {
  const m = build({ lcpSeconds: 6.2 });
  const measured = m.steps.find((s) => s.provenance === "measured");
  const cited = m.steps.find((s) => s.provenance === "cited");
  assert.ok(measured, "expected a measured step");
  assert.match(measured.source ?? "", /PageSpeed/);
  assert.ok(cited, "expected a cited step");
  assert.match(cited.source ?? "", /Portent/);
  assert.match(cited.sourceUrl ?? "", /^https:\/\/portent\.com/);
  assert.ok(
    m.steps.some((s) => s.editable && s.inputKey),
    "expected editable steps to carry an inputKey"
  );
});

/* ---------- other bands ---------- */

check("band boundaries are assigned, not interpolated", () => {
  const at = (lcp: number) => build({ lcpSeconds: lcp });
  assert.equal(at(1.9).band, "fast");
  assert.equal(at(2).band, "moderate");
  assert.deepEqual(at(4.9).multiplierRange, [1, 3]);
  assert.equal(at(5).band, "slow");
  assert.deepEqual(at(9.9).multiplierRange, [3, 5]);
  assert.equal(at(10).band, "critical");
  assert.deepEqual(at(12).multiplierRange, [5, 5]);
});

/* ---------- missing measurement ---------- */

check("null LCP → returns null, no substituted default", () => {
  assert.equal(buildConversionModel({ ...BASE, lcpSeconds: null }), null);
});

check("non-finite or absent visitors → returns null", () => {
  assert.equal(buildConversionModel({ ...BASE, lcpSeconds: 6.2, monthlyVisitors: NaN }), null);
  assert.equal(buildConversionModel({ ...BASE, lcpSeconds: 6.2, monthlyVisitors: 0 }), null);
});

check("defaults apply when optional inputs are omitted", () => {
  const m = buildConversionModel({
    lcpSeconds: 6.2,
    monthlyVisitors: 800,
  }) as ConversionModel;
  assert.equal(m.currentInquiries, Math.round(800 * MODEL_DEFAULTS.currentInquiryRate));
  assert.equal(MODEL_DEFAULTS.gapCaptureRate, 0.25);
  assert.deepEqual(m.attributableGapRange, [8, 16]);
  assert.deepEqual(m.revenueRange, [9_600, 19_200]);
});

/* ---------- supporting stat ---------- */

check("supporting stat is attributed and dated", () => {
  const m = build({ lcpSeconds: 6.2 });
  assert.match(m.supportingStat, /53%/);
  assert.match(m.supportingStat, /Google \/ SOASTA, 2016/);
});

check("no band produces an annualized string", () => {
  for (const lcp of [0.9, 3.1, 6.2, 12]) {
    const m = build({ lcpSeconds: lcp });
    for (const s of collectStrings(m)) {
      assert.doesNotMatch(
        s,
        /\byear\b|\byearly\b|\bannual\b|\bannually\b/i,
        `annualized at ${lcp}s: "${s}"`
      );
    }
  }
});

console.log(`\n${passed} checks passed\n`);
