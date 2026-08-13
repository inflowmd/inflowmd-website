import type { AuditResult } from "@/types/audit";

/**
 * Sanity bounds for the pre-warm batch.
 *
 * PSI occasionally returns garbage — a bot-challenge page measuring 100/0.77s,
 * a cold-path 66 on a site that is really a 90, or nothing at all when it times
 * out. An outlier must never silently ship to the booth, and a measurement we
 * already had must never be silently replaced by nothing.
 *
 * These live in lib/ rather than in scripts/prewarm.ts so they can be imported
 * and tested on their own: the script runs main() on import, so a test that
 * pulled them from there would kick off a real 58-site pre-warm.
 */

/** The slice of a result we keep in prewarm-history.json for comparison. */
export interface HistoryEntry {
  practiceName?: string;
  url: string;
  score: number | null;
  lcp: number | null;
  fetchedAt: string;
}

export function toHistoryEntry(r: AuditResult): HistoryEntry {
  return {
    ...(r.practiceName ? { practiceName: r.practiceName } : {}),
    url: r.url,
    score: r.scores.performance,
    lcp: r.performance.lcp,
    fetchedAt: r.fetchedAt,
  };
}

/** How far performance may move between runs before we distrust it. */
export const MAX_SWING = 25;

/**
 * Returns the reason a fresh result looks anomalous against the prior one,
 * or null when it looks sane.
 */
export function anomalyReason(fresh: AuditResult, prior: HistoryEntry | undefined): string | null {
  // Our fetcher was served a bot challenge — PSI likely saw the same page.
  if (fresh.htmlFetch.blocked) {
    return "fetcher hit a bot-challenge page";
  }
  if (!prior) return null;

  const newLcp = fresh.performance.lcp;
  const oldLcp = prior.lcp;
  if (newLcp !== null && oldLcp !== null && newLcp < 1.5 && oldLcp > 5) {
    return `LCP ${newLcp}s on a site whose prior LCP was ${oldLcp}s (challenge-page signature)`;
  }

  const newScore = fresh.scores.performance;
  const oldScore = prior.score;

  // A measurement we HAD and no longer have is a regression, not an update.
  // PSI times out on slow sites often enough that a full re-warm would
  // otherwise trade good data for nothing — silently, since a null trips no
  // other rule here. Treating it as anomalous routes it through the same
  // retry-then-keep-prior path as a wild value, so the booth never loses a
  // number it already had. (This is what cost 11 entries their speed data on
  // the 2026-08-13 re-warm.)
  if (newScore === null && oldScore !== null) {
    return `PageSpeed returned no score for a site previously measured at ${oldScore}`;
  }

  if (newScore !== null && oldScore !== null && Math.abs(newScore - oldScore) > MAX_SWING) {
    return `performance swung ${oldScore} → ${newScore} (more than ${MAX_SWING} points)`;
  }
  return null;
}

/**
 * What to cache when a measurement has been rejected twice.
 *
 * With a prior result we keep it, marked stale, carrying both the kept values
 * and the rejected ones on the record. Without one there is nothing to fall
 * back to, so the fresh result ships — loudly, never quietly.
 */
export function resolveRejected(
  displayName: string,
  rejected: AuditResult,
  reason: string,
  prior: AuditResult | undefined
): { result: AuditResult; anomaly: string } {
  if (!prior) {
    return {
      result: rejected,
      anomaly:
        `${displayName}: measurement looks anomalous (${reason}) ` +
        `and there is NO prior result to keep. Shipped as measured — verify by hand.`,
    };
  }

  return {
    result: {
      ...prior,
      stale: true,
      staleNote:
        `Kept prior measurement of ${prior.fetchedAt} (perf ${prior.scores.performance}, ` +
        `LCP ${prior.performance.lcp}s). Fresh run rejected twice: ${reason}; ` +
        `rejected values perf ${rejected.scores.performance}, LCP ${rejected.performance.lcp}s.`,
    },
    anomaly:
      `${displayName}: fresh measurement rejected twice (${reason}). ` +
      `Cache keeps the prior result (perf ${prior.scores.performance}, LCP ${prior.performance.lcp}s); ` +
      `rejected: perf ${rejected.scores.performance}, LCP ${rejected.performance.lcp}s.`,
  };
}
