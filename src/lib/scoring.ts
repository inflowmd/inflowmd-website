/**
 * Shared scoring invariants.
 *
 * The scoring itself is WEIGHTED and lives in src/lib/categories.ts, alongside
 * the category table it depends on — a check's weight is a property of the
 * category it sits in, so the two cannot sensibly live apart. What remains here
 * is the rule both sides must agree on regardless of weighting.
 *
 * `could_not_verify` entries are excluded from the denominator entirely — they
 * are neither credit nor penalty. Scoring an unread page as a failure is the
 * one thing this engine must never do.
 *
 * A score is also withheld when too little was verifiable. An unreachable site
 * whose only readable signal is HTTPS would otherwise score 100/100 — a false
 * compliment, which costs credibility exactly as fast as a false accusation.
 */

/** Below this many verified checks, we report no score rather than a hollow one. */
export const MIN_VERIFIED_CHECKS = 3;

export interface CategoryScore {
  score: number | null;
  /** Checks in this category that returned a definite verdict. */
  verified: number;
  /** Checks in this category overall, verified or not. */
  total: number;
}
