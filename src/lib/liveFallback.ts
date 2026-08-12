import type { AuditResult } from "@/types/audit";

/**
 * When a COMPLETED live run should be replaced by the pre-warmed result.
 *
 * The booth's live-first flow already falls back when a run fails outright —
 * a non-2xx response, a network error, or the client-side timeout. That misses
 * the case that actually bites at a conference: PageSpeed's daily quota runs
 * out, and the audit *succeeds*. The request returns fast, HTTP 200, a
 * perfectly well-formed AuditResult — carrying `performance.available: false`
 * and a quota message where the speed score should be. Nothing "failed", so
 * the old fallback never fired and the visitor got a report with a blank
 * speed gauge while a measured one sat in the cache.
 *
 * The rule is about the DATA, not the transport: if the live run produced no
 * usable speed number and we hold a cached result that has one, show the
 * cached result. Same test for a quota rejection, a Lighthouse 500 that
 * survived its retries, or any future failure mode that yields a partial.
 *
 * Kept as a pure function so the rule is unit-testable on its own, rather
 * than only reachable by driving a browser.
 */

/** Just the shape this decision needs — keeps tests free of full fixtures. */
type SpeedBearing = Pick<AuditResult, "performance">;

/**
 * Returns the reason to log when the cached result should replace the live
 * one, or null when the live result should stand.
 *
 * Null (keep the live result) when:
 *  - the live run DID return speed data — nothing to rescue;
 *  - there is no cached entry for this URL — a walk-up, so the honest
 *    partial is the only truthful thing to show;
 *  - the cached entry has no speed data either — swapping one blank gauge
 *    for another, older blank gauge helps nobody.
 */
export function missingSpeedFallbackReason(
  live: SpeedBearing,
  cached: SpeedBearing | undefined
): string | null {
  if (live.performance.available) return null;
  if (!cached || !cached.performance.available) return null;
  const detail = live.performance.error?.trim();
  return detail && detail.length > 0
    ? detail
    : "the live run returned no speed measurement";
}
