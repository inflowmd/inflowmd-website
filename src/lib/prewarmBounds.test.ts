/**
 * Plain assertions for the pre-warm sanity bounds.
 * Run with: npm run test:prewarm-bounds
 *
 * These exist because the rules used to live inside scripts/prewarm.ts, which
 * runs main() on import — so nothing could test them without kicking off a
 * real 58-site pre-warm. The null-score case below is the one that went
 * unnoticed in production and cost 11 cache entries their speed data.
 */

import assert from "node:assert/strict";
import type { AuditResult } from "@/types/audit";
import {
  MAX_SWING,
  anomalyReason,
  resolveRejected,
  toHistoryEntry,
  type HistoryEntry,
} from "./prewarmBounds";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/** A minimal, valid result — override only what a case is about. */
function result(over: {
  score?: number | null;
  lcp?: number | null;
  blocked?: boolean;
  fetchedAt?: string;
}): AuditResult {
  const score = over.score === undefined ? 70 : over.score;
  return {
    url: "https://example-vein.com",
    practiceName: "Example Vein Care",
    fetchedAt: over.fetchedAt ?? "2026-08-13T00:00:00.000Z",
    fromCache: false,
    performance: {
      available: score !== null,
      lighthouseScore: score,
      lcp: over.lcp === undefined ? 3.2 : over.lcp,
      fcp: null,
      cls: null,
      tbt: null,
      speedIndex: null,
      fieldDataAvailable: false,
      fieldLcp: null,
    },
    htmlFetch: { ok: true, statusCode: 200, blocked: over.blocked ?? false },
    platform: { platform: "WordPress", version: null, vendor: null, builders: [], evidence: [] },
    seo: [],
    schema: [],
    aiReadiness: [],
    scores: {
      performance: score,
      ai: 60,
      aiVerified: 11,
      aiTotal: 11,
      patientsFind: 80,
      patientsFindVerified: 9,
      patientsFindTotal: 9,
    },
  };
}

const prior = (over: { score?: number | null; lcp?: number | null }): HistoryEntry => ({
  url: "https://example-vein.com",
  score: over.score === undefined ? 70 : over.score,
  lcp: over.lcp === undefined ? 3.2 : over.lcp,
  fetchedAt: "2026-08-11T00:00:00.000Z",
});

/* ---------- the regression: a measurement lost is not a measurement changed ---------- */

check("FRESH NULL + PRIOR SCORE → anomaly fires", () => {
  const reason = anomalyReason(result({ score: null, lcp: null }), prior({ score: 44 }));
  assert.ok(reason, "a null score against a prior measurement must be anomalous");
  assert.match(reason, /no score/i);
  assert.match(reason, /44/, "the reason should name the measurement we are about to lose");
});

check("fresh null + prior null → NOT anomalous", () => {
  // Never measured, still not measured. Nothing was lost, so nothing to flag.
  assert.equal(anomalyReason(result({ score: null, lcp: null }), prior({ score: null })), null);
});

check("fresh null with no prior at all → NOT anomalous", () => {
  assert.equal(anomalyReason(result({ score: null, lcp: null }), undefined), null);
});

check("a rejected null keeps the prior result, stale-marked", () => {
  const kept = result({ score: 44, lcp: 9.1, fetchedAt: "2026-08-11T18:29:00.000Z" });
  const rejected = result({ score: null, lcp: null });
  const { result: out, anomaly } = resolveRejected(
    "Vein911",
    rejected,
    "PageSpeed returned no score for a site previously measured at 44",
    kept
  );

  assert.equal(out.stale, true, "the kept entry must be marked stale");
  assert.equal(out.scores.performance, 44, "the prior score must survive");
  assert.equal(out.performance.lcp, 9.1);
  assert.equal(out.fetchedAt, "2026-08-11T18:29:00.000Z", "and carry its original timestamp");
  // Both values on the record — what we kept and what we threw away.
  assert.match(out.staleNote ?? "", /Kept prior measurement of 2026-08-11T18:29/);
  assert.match(out.staleNote ?? "", /rejected twice/);
  assert.match(anomaly, /Vein911/);
  assert.match(anomaly, /keeps the prior result \(perf 44/);
});

check("with NO prior to keep, the fresh result ships but says so loudly", () => {
  const rejected = result({ score: null, lcp: null });
  const { result: out, anomaly } = resolveRejected("New Practice", rejected, "some reason", undefined);
  assert.equal(out.stale, undefined, "nothing was kept, so nothing is stale");
  assert.match(anomaly, /NO prior result to keep/);
  assert.match(anomaly, /verify by hand/);
});

/* ---------- the swing rule ---------- */

check("fresh score WITHIN ±25 of prior → no anomaly", () => {
  for (const [oldScore, newScore] of [
    [70, 70],
    [70, 90],
    [70, 45],
    [40, 65],
    [90, 70],
  ] as const) {
    assert.equal(
      anomalyReason(result({ score: newScore }), prior({ score: oldScore })),
      null,
      `${oldScore} → ${newScore} should be accepted`
    );
  }
});

check("exactly ±25 is still within bounds", () => {
  assert.equal(anomalyReason(result({ score: 95 }), prior({ score: 70 })), null);
  assert.equal(anomalyReason(result({ score: 45 }), prior({ score: 70 })), null);
  assert.equal(MAX_SWING, 25);
});

check("fresh score BEYOND ±25 → anomaly fires, in both directions", () => {
  const up = anomalyReason(result({ score: 96 }), prior({ score: 70 }));
  assert.ok(up, "a 26-point jump must be flagged");
  assert.match(up, /70 → 96/);
  assert.match(up, /more than 25 points/);

  const down = anomalyReason(result({ score: 44 }), prior({ score: 70 }));
  assert.ok(down, "a 26-point drop must be flagged");
  assert.match(down, /70 → 44/);
});

check("a rejected outlier keeps the prior result too", () => {
  const kept = result({ score: 90, lcp: 2.1 });
  const rejected = result({ score: 30, lcp: 12.4 });
  const { result: out, anomaly } = resolveRejected("Example", rejected, "performance swung 90 → 30", kept);
  assert.equal(out.scores.performance, 90);
  assert.equal(out.stale, true);
  assert.match(out.staleNote ?? "", /rejected values perf 30/);
  assert.match(anomaly, /rejected: perf 30, LCP 12.4s/);
});

/* ---------- the other bounds still hold ---------- */

check("a bot-challenge fetch is anomalous even with no prior", () => {
  const reason = anomalyReason(result({ blocked: true }), undefined);
  assert.match(reason ?? "", /bot-challenge/);
});

check("a suspiciously fast LCP on a previously slow site is anomalous", () => {
  // The challenge-page signature: 0.8s today, 8s last time.
  const reason = anomalyReason(result({ score: 99, lcp: 0.8 }), prior({ score: 99, lcp: 8 }));
  assert.match(reason ?? "", /challenge-page signature/);
});

check("no prior and a sane fresh result → no anomaly", () => {
  assert.equal(anomalyReason(result({ score: 55 }), undefined), null);
});

/* ---------- history entries ---------- */

check("a history entry carries what the comparison needs", () => {
  const e = toHistoryEntry(result({ score: 62, lcp: 4.4 }));
  assert.equal(e.score, 62);
  assert.equal(e.lcp, 4.4);
  assert.equal(e.url, "https://example-vein.com");
  assert.equal(e.practiceName, "Example Vein Care");
  assert.equal(e.fetchedAt, "2026-08-13T00:00:00.000Z");
});

check("a nameless result yields no practiceName key at all", () => {
  const r = result({});
  delete r.practiceName;
  assert.ok(!("practiceName" in toHistoryEntry(r)));
});

/* ---------- the round trip that actually protects the booth ---------- */

check("END TO END: a PSI timeout cannot erase a cached measurement", () => {
  const cached = result({ score: 44, lcp: 9.1, fetchedAt: "2026-08-11T18:29:00.000Z" });
  const history = toHistoryEntry(cached);

  // The re-warm comes back empty, twice.
  const fresh = result({ score: null, lcp: null });
  const reason = anomalyReason(fresh, history);
  assert.ok(reason, "step 1: the empty measurement must be flagged");

  const retryReason = anomalyReason(result({ score: null, lcp: null }), history);
  assert.ok(retryReason, "step 2: still flagged on retry");

  const { result: cacheEntry } = resolveRejected("Vein911", fresh, retryReason, cached);
  assert.equal(cacheEntry.scores.performance, 44, "step 3: the booth still has a speed number");
  assert.equal(cacheEntry.stale, true, "and the doctor is not told it was measured just now");
});

console.log(`\n${passed} prewarm bound checks passed.`);
