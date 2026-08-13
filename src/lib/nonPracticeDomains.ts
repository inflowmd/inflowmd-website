/**
 * Domains that are NOT medical practices.
 *
 * THE RULE: this is an explicit allow-list, checked by exact host match. It is
 * never inferred at runtime — no "looks like an agency" heuristic, no keyword
 * sniffing of the page copy. A prospect's site must never be able to talk its
 * way out of the medical-schema check, because that check is the single
 * heaviest finding in the audit and excusing it would hand a practice a
 * flattering score it has not earned.
 *
 * Adding an entry here is a deliberate act with a paper trail: a code change,
 * a review, and a deploy. That is the point.
 */

/** Hosts audited as non-practices. Bare registrable domains, lowercase. */
const NON_PRACTICE_DOMAINS: readonly string[] = ["inflowmd.com"];

/** Why the exclusion applies, shown verbatim to the reader. */
export const NON_PRACTICE_EXPLANATIONS: Readonly<Record<string, string>> = {
  "inflowmd.com": "Not applicable — InflowMD is a marketing agency, not a medical practice.",
};

/**
 * Strips a leading "www." only. Other subdomains are deliberately NOT folded
 * into the parent: booking.example.com is a different site from example.com
 * and must be judged on its own markup.
 */
function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

/** The matching config entry for a URL, or null when the check applies. */
export function nonPracticeEntry(url: string): { domain: string; explanation: string } | null {
  let host: string;
  try {
    host = normalizeHost(new URL(url).hostname);
  } catch {
    return null;
  }
  const domain = NON_PRACTICE_DOMAINS.find((d) => normalizeHost(d) === host);
  if (!domain) return null;
  return {
    domain,
    explanation:
      NON_PRACTICE_EXPLANATIONS[domain] ??
      "Not applicable — this site is not a medical practice.",
  };
}

/** True when the audited URL is a configured non-practice domain. */
export function isNonPracticeDomain(url: string): boolean {
  return nonPracticeEntry(url) !== null;
}
