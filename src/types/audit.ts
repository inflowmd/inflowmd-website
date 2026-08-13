/**
 * Shared types for the website audit engine.
 *
 * THE NON-NEGOTIABLE RULE
 * -----------------------
 * If we could not read a page, we say so. We never report a check as `fail`
 * when the real situation is "we couldn't look." A false accusation destroys
 * credibility with a practice owner faster than any missing feature.
 *
 * Concretely: when `htmlFetch.ok` is false, every HTML-derived check must be
 * `could_not_verify`. The only checks allowed to render a verdict without a
 * successful HTML fetch are those derived from the URL itself (e.g. HTTPS) or
 * from an independent request that did succeed (e.g. robots.txt).
 */

/**
 * `could_not_verify` and `not_applicable` are both excluded from scoring, but
 * they mean different things and are NOT interchangeable:
 *
 *   could_not_verify — we tried and failed to read it. It still counts against
 *     the category's verification floor, because a site we could barely read
 *     should not receive a confident score.
 *   not_applicable — the check does not apply to this business at all. It
 *     leaves the universe entirely: out of the score, and out of the floor's
 *     denominator too, since there is nothing here we failed to establish.
 */
export type CheckStatus = "pass" | "fail" | "warn" | "could_not_verify" | "not_applicable";

export interface Check {
  /** Stable machine id, e.g. "seo.title-length". */
  id: string;
  /** Human-readable, physician-friendly. Not developer jargon. */
  label: string;
  status: CheckStatus;
  /** One sentence explaining the result, in plain language. */
  detail: string;
  /** The actual value found, if any — quoted so the reader can verify it. */
  evidence?: string;
}

export interface PerformanceResult {
  available: boolean;
  /** 0–100, mobile strategy. */
  lighthouseScore: number | null;
  /** Largest Contentful Paint, in seconds. */
  lcp: number | null;
  /**
   * First Contentful Paint, in seconds. Added after the original cache was
   * written, so results measured before that carry null — render it only when
   * present rather than showing a hole.
   */
  fcp: number | null;
  /** Cumulative Layout Shift, unitless. */
  cls: number | null;
  /** Total Blocking Time, in milliseconds. */
  tbt: number | null;
  /** Speed Index, in seconds. */
  speedIndex: number | null;
  /**
   * Whether Chrome UX Report field data was present. Absence is normal and
   * expected for smaller sites — it is NOT an error condition.
   */
  fieldDataAvailable: boolean;
  /** Real-world LCP from field data, in seconds. */
  fieldLcp: number | null;
  error?: string;
}

export interface HtmlFetchResult {
  ok: boolean;
  statusCode: number | null;
  /** 403/429 or a bot-challenge interstitial was detected. */
  blocked: boolean;
  error?: string;
}

/**
 * Category scores. Categories are grouped by the QUESTION each answers — see
 * src/lib/categories.ts for the check membership, weights, and hard ceilings.
 *
 * Every non-performance score is null when too few checks in the category could
 * actually be verified. Scoring 100 off a single check is a false compliment,
 * which damages credibility just as surely as a false accusation.
 */
export interface AuditScores {
  /** Google Lighthouse — the only Google-sourced number in the set. */
  performance: number | null;
  ai: number | null;
  aiVerified: number;
  aiTotal: number;
  patientsFind: number | null;
  patientsFindVerified: number;
  patientsFindTotal: number;
}

/** Informational only — never scored, never pass/fail. */
export interface PlatformInfo {
  /** e.g. "WordPress", "Wix", "Squarespace", "Duda", "Joomla". */
  platform: string | null;
  version: string | null;
  /** Medical-web vendor, e.g. "Officite", "PatientPop". */
  vendor: string | null;
  /** Active page builders, e.g. ["Elementor"]. */
  builders: string[];
  /** What we actually matched on, so a claim can be traced. */
  evidence: string[];
}

export interface AuditResult {
  /** Final measured URL, after following any redirect chain. */
  url: string;
  /** The URL as typed/requested, present only when it redirected elsewhere. */
  requestedUrl?: string;
  /**
   * Practice name, carried from the attendee list. Present on pre-warmed
   * results so the booth picker can search on it; absent for walk-up audits.
   */
  practiceName?: string;
  /** ISO-8601 timestamp. Preserved verbatim when served from cache. */
  fetchedAt: string;
  /** True when this result came from the pre-warmed cache. */
  fromCache: boolean;
  performance: PerformanceResult;
  htmlFetch: HtmlFetchResult;
  platform: PlatformInfo;
  /**
   * Raw check output, keyed by the MODULE that produced it — not by display
   * category. Categories regroup these by the question each answers; see
   * src/lib/categories.ts. Consumers should read categories through
   * `buildCategories()` rather than assuming these arrays are user-facing
   * groupings, which is also what lets a result measured before the category
   * restructure render correctly under the new categories.
   */
  seo: Check[];
  schema: Check[];
  aiReadiness: Check[];
  scores: AuditScores;
  /** Set only when the audit itself threw (used by the pre-warm batch). */
  error?: string;
  /**
   * Pre-warm only: this entry is a KEPT PRIOR result because the fresh
   * measurement looked anomalous twice. staleNote records both values.
   */
  stale?: boolean;
  staleNote?: string;
}
