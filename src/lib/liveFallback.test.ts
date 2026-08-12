/**
 * Plain assertions for the live-run → cache fallback rule.
 * No test framework — run with: npm run test:livefallback
 *
 * The case that motivated this file: PageSpeed's daily quota runs out, the
 * audit SUCCEEDS with no speed number, and the booth used to render a blank
 * speed gauge while a measured result sat in the cache.
 */

import assert from "node:assert/strict";
import type { PerformanceResult } from "../types/audit";
import { missingSpeedFallbackReason } from "./liveFallback";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const MEASURED: PerformanceResult = {
  available: true,
  lighthouseScore: 47,
  lcp: 5.4,
  cls: 0.02,
  tbt: 210,
  speedIndex: 4.1,
  fieldDataAvailable: false,
  fieldLcp: null,
};

function unmeasured(error?: string): PerformanceResult {
  return {
    available: false,
    lighthouseScore: null,
    lcp: null,
    cls: null,
    tbt: null,
    speedIndex: null,
    fieldDataAvailable: false,
    fieldLcp: null,
    ...(error ? { error } : {}),
  };
}

/** The exact message the API returns when the daily quota is gone. */
const QUOTA_ERROR =
  "Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service " +
  "'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.";

check("QUOTA EXHAUSTED: live run has no speed, cache does → fall back", () => {
  const reason = missingSpeedFallbackReason(
    { performance: unmeasured(QUOTA_ERROR) },
    { performance: MEASURED }
  );
  assert.ok(reason !== null, "must fall back — a measured cached result beats a blank gauge");
  assert.match(reason, /Quota exceeded/, "the logged reason should carry the real cause");
});

check("a Lighthouse 500 that survived its retries falls back the same way", () => {
  const reason = missingSpeedFallbackReason(
    { performance: unmeasured("PageSpeed returned a server error (500).") },
    { performance: MEASURED }
  );
  assert.ok(reason !== null);
  assert.match(reason, /server error \(500\)/);
});

check("a PageSpeed timeout with a measured cache also falls back", () => {
  const reason = missingSpeedFallbackReason(
    { performance: unmeasured("PageSpeed did not finish measuring this page in time.") },
    { performance: MEASURED }
  );
  assert.ok(reason !== null);
});

check("a live run WITH speed data is never replaced", () => {
  assert.equal(
    missingSpeedFallbackReason({ performance: MEASURED }, { performance: MEASURED }),
    null
  );
});

check("a live run with speed is kept even when the cached score differs wildly", () => {
  // Divergence is the discrepancy warning's job, not the fallback's — the
  // live number is what the visitor watched being measured.
  const staleCache: PerformanceResult = { ...MEASURED, lighthouseScore: 95 };
  assert.equal(
    missingSpeedFallbackReason({ performance: MEASURED }, { performance: staleCache }),
    null
  );
});

check("WALK-UP: no cached entry → keep the honest partial", () => {
  assert.equal(
    missingSpeedFallbackReason({ performance: unmeasured(QUOTA_ERROR) }, undefined),
    null,
    "with nothing cached, the partial report is the only truthful thing to show"
  );
});

check("a cached entry that ALSO lacks speed is not worth swapping to", () => {
  assert.equal(
    missingSpeedFallbackReason(
      { performance: unmeasured(QUOTA_ERROR) },
      { performance: unmeasured("PageSpeed did not finish measuring this page in time.") }
    ),
    null,
    "trading a blank gauge for an older blank gauge helps nobody"
  );
});

check("a missing error string still produces a usable reason", () => {
  const reason = missingSpeedFallbackReason(
    { performance: unmeasured() },
    { performance: MEASURED }
  );
  assert.ok(reason !== null);
  assert.match(reason, /no speed measurement/);
});

check("an empty/whitespace error string does not produce an empty reason", () => {
  const reason = missingSpeedFallbackReason(
    { performance: unmeasured("   ") },
    { performance: MEASURED }
  );
  assert.ok(reason !== null);
  assert.ok(reason.trim().length > 0, "a blank log line would explain nothing");
});

console.log(`\n${passed} live-fallback checks passed.`);
