import type { Check } from "@/types/audit";

/**
 * Turns a set of checks into a 0–100 score.
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

const WEIGHTS: Record<Exclude<Check["status"], "could_not_verify">, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

export interface CategoryScore {
  score: number | null;
  verified: number;
  total: number;
}

export function scoreCategory(checks: Check[]): CategoryScore {
  const scorable = checks.filter((c) => c.status !== "could_not_verify");
  const verified = scorable.length;
  const total = checks.length;

  if (verified < MIN_VERIFIED_CHECKS) {
    return { score: null, verified, total };
  }

  const earned = scorable.reduce(
    (sum, c) => sum + WEIGHTS[c.status as keyof typeof WEIGHTS],
    0
  );
  return { score: Math.round((earned / verified) * 100), verified, total };
}

/** Convenience wrapper when only the number is needed. */
export function scoreChecks(checks: Check[]): number | null {
  return scoreCategory(checks).score;
}
