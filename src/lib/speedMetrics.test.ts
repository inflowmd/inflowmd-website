/**
 * Plain assertions for the Lighthouse metric rows shown under the speed
 * category. Run with: npm run test:speedmetrics
 */

import assert from "node:assert/strict";
import type { PerformanceResult } from "../types/audit";
import { speedMetrics } from "./speedMetrics";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

function perf(overrides: Partial<PerformanceResult> = {}): PerformanceResult {
  return {
    available: true,
    lighthouseScore: 60,
    lcp: 2.0,
    fcp: 1.5,
    cls: 0.05,
    tbt: 100,
    speedIndex: 3.0,
    fieldDataAvailable: false,
    fieldLcp: null,
    ...overrides,
  };
}

check("returns the five Lighthouse metrics in Google's reporting order", () => {
  const rows = speedMetrics(perf());
  assert.deepEqual(rows.map((r) => r.id), ["lcp", "fcp", "tbt", "cls", "speed-index"]);
});

check("bands follow Google's published mobile thresholds", () => {
  const good = speedMetrics(perf());
  assert.ok(good.every((r) => r.band === "good"), JSON.stringify(good.map((r) => [r.id, r.band])));

  const poor = speedMetrics(perf({ lcp: 5, fcp: 4, tbt: 900, cls: 0.4, speedIndex: 7 }));
  assert.ok(poor.every((r) => r.band === "poor"), JSON.stringify(poor.map((r) => [r.id, r.band])));

  const middle = speedMetrics(perf({ lcp: 3, fcp: 2.5, tbt: 400, cls: 0.2, speedIndex: 4.5 }));
  assert.ok(
    middle.every((r) => r.band === "needs-improvement"),
    JSON.stringify(middle.map((r) => [r.id, r.band]))
  );
});

check("threshold boundaries count as the better band", () => {
  // Google's cutoffs are inclusive at the good end.
  assert.equal(speedMetrics(perf({ lcp: 2.5 }))[0].band, "good");
  assert.equal(speedMetrics(perf({ lcp: 4 }))[0].band, "needs-improvement");
  assert.equal(speedMetrics(perf({ tbt: 200 })).find((r) => r.id === "tbt")!.band, "good");
  assert.equal(speedMetrics(perf({ cls: 0.1 })).find((r) => r.id === "cls")!.band, "good");
});

check("a metric with no value is omitted, not rendered as a hole", () => {
  // Results cached before FCP was parsed carry null — they show four rows.
  const rows = speedMetrics(perf({ fcp: null }));
  assert.deepEqual(rows.map((r) => r.id), ["lcp", "tbt", "cls", "speed-index"]);
  assert.equal(rows.length, 4);
});

check("no metrics at all when PageSpeed returned nothing", () => {
  assert.deepEqual(speedMetrics(perf({ available: false })), []);
});

check("values are formatted with their units", () => {
  const rows = speedMetrics(perf({ lcp: 2.1, tbt: 210, cls: 0.05, speedIndex: 3.4 }));
  const byId = new Map(rows.map((r) => [r.id, r]));
  assert.equal(byId.get("lcp")!.display, "2.1s");
  assert.equal(byId.get("tbt")!.display, "210ms");
  assert.equal(byId.get("cls")!.display, "0.05");
  assert.equal(byId.get("speed-index")!.display, "3.4s");
});

check("every row carries Google's threshold and a plain-language meaning", () => {
  for (const row of speedMetrics(perf())) {
    assert.match(row.thresholdNote, /Google:/, `${row.id} must credit the source`);
    assert.ok(row.meaning.length > 20, `${row.id} needs a real explanation`);
  }
});

console.log(`\n${passed} speed metric checks passed.`);
