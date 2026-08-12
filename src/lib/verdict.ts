/**
 * The verdict — one headline and one sub-line, chosen from the three category
 * scores, that says what is actually wrong with this site.
 *
 * The rule is "address whatever sits in the worst band": a critical category
 * outranks a weak one, and the number of categories in that band decides how
 * broad the statement is.
 *
 * A null score means we could not verify that category. Those are excluded
 * from the logic entirely and the verdict never asserts anything about them —
 * the same rule the scoring follows. That has a consequence worth knowing:
 * several lines here make a positive claim about a category ("The site loads
 * quickly", "The structured data is there"), so a rule is only usable when the
 * category it praises was actually measured AND landed in the top band. Where
 * that is not true, selection falls back to a line that claims nothing about
 * the categories it does not name.
 */

export type VerdictBand = "critical" | "weak" | "fine";

/** Drives the banner accent: red-amber, amber, or lime. */
export type VerdictTone = "critical" | "weak" | "fine";

export type VerdictCategory = "ai" | "patientsFind" | "speed";

export interface Verdict {
  headline: string;
  subline: string;
  tone: VerdictTone;
  /** Which rule fired — surfaced for tests and debugging, never displayed. */
  rule: string;
  /**
   * Categories this copy makes a claim ABOUT beyond the ones it is reporting
   * on. A rule is only usable when all of these were measured — otherwise it
   * would assert quality for a category we could not read.
   */
  claims?: VerdictCategory[];
}

export interface VerdictScores {
  ai: number | null;
  patientsFind: number | null;
  speed: number | null;
}

/** Critical under 50, weak 50–74, fine 75+. Null stays null. */
export function bandFor(score: number | null): VerdictBand | null {
  if (score === null) return null;
  if (score < 50) return "critical";
  if (score < 75) return "weak";
  return "fine";
}

/**
 * Short, sentence-safe names for the two-weak line. The category labels
 * themselves are questions ("Is your website optimized for AI?") and cannot be
 * dropped into prose.
 */
export const CATEGORY_NOUN: Record<VerdictCategory, string> = {
  ai: "AI optimization",
  patientsFind: "search visibility",
  speed: "speed",
};

/** Category order, also the fallback priority when a rule cannot be used. */
const ORDER: VerdictCategory[] = ["ai", "patientsFind", "speed"];

const ALL_CRITICAL: Verdict = {
  rule: "all-critical",
  tone: "critical",
  headline: "This site is working against you at every stage.",
  subline:
    "AI can't identify the practice, patients struggle to find it, and the ones who do wait too long for it to load.",
  claims: ["ai", "patientsFind", "speed"],
};

/** Two critical, the third measured and FINE — each praises that third one. */
const PAIR: Record<string, Verdict> = {
  "ai+patientsFind": {
    rule: "ai+search-critical",
    tone: "critical",
    headline: "A fast site that nobody can find.",
    subline:
      "The site loads quickly — but AI can't tell what kind of practice this is, and the basics search engines rely on are incomplete.",
  },
  "ai+speed": {
    rule: "ai+speed-critical",
    tone: "critical",
    headline: "Found by search, invisible to AI, and slow to load.",
    subline:
      "Traditional search basics are in place. But AI assistants can't identify this practice, and patients who do arrive wait too long.",
  },
  "patientsFind+speed": {
    rule: "search+speed-critical",
    tone: "critical",
    headline: "AI understands this site. Patients may never reach it.",
    subline:
      "The structured data is there — but search fundamentals are incomplete and the site loads too slowly to hold a patient.",
  },
};

/** One critical. These claim little or nothing about the other categories. */
const SINGLE_CRITICAL: Record<VerdictCategory, Verdict> = {
  ai: {
    rule: "ai-critical",
    tone: "critical",
    headline: "AI cannot identify this as a vein practice.",
    subline:
      "No medical schema found. When a patient asks ChatGPT for a vein specialist, this site gives AI nothing to work with.",
  },
  patientsFind: {
    rule: "search-critical",
    tone: "critical",
    headline: "Patients searching for you may not find you.",
    subline:
      "The fundamentals search engines rely on — titles, descriptions, page structure — are incomplete.",
  },
  speed: {
    rule: "speed-critical",
    tone: "critical",
    headline: "Patients can find you. Then they leave.",
    // "discoverable" speaks for AI and search, so both must have been measured.
    subline:
      "This site is discoverable — but on a phone connection, most patients never see it finish loading.",
    claims: ["ai", "patientsFind"],
  },
};

/** One weak, nothing critical. */
const SINGLE_WEAK: Record<VerdictCategory, Verdict> = {
  ai: {
    rule: "ai-weak",
    tone: "weak",
    headline: "Close, but AI is still guessing.",
    subline:
      "Most of the signals are here. The gaps are the ones that tell AI exactly what this practice does.",
  },
  patientsFind: {
    rule: "search-weak",
    tone: "weak",
    headline: "Solid foundation, incomplete search basics.",
    subline:
      "A few missing fundamentals are making this site harder for patients to find than it should be.",
  },
  speed: {
    rule: "speed-weak",
    tone: "weak",
    headline: "Discoverable, but slower than patients expect.",
    // "well-structured" speaks for AI and search.
    subline: "The site is well-structured. Speed is the piece costing conversions.",
    claims: ["ai", "patientsFind"],
  },
};

const ALL_WEAK: Verdict = {
  rule: "all-weak",
  tone: "weak",
  headline: "Nothing here is broken. Nothing here is working hard either.",
  subline: "Every area has room to improve — and they compound.",
  claims: ["ai", "patientsFind", "speed"],
};

const ALL_FINE: Verdict = {
  rule: "all-fine",
  tone: "fine",
  headline: "This site is in good shape.",
  // A whole-site verdict: every category has to have been measured to earn it.
  subline: "The fundamentals are solid. Here's what would sharpen it further.",
  claims: ["ai", "patientsFind", "speed"],
};

/** True when every category this copy speaks for was actually measured. */
function usable(verdict: Verdict, bands: Record<VerdictCategory, VerdictBand | null>): boolean {
  return (verdict.claims ?? []).every((k) => bands[k] !== null);
}

function twoWeak(weaks: VerdictCategory[]): Verdict {
  const [first, second] = ORDER.filter((k) => weaks.includes(k));
  return {
    rule: "two-weak",
    tone: "weak",
    headline: "The pieces are in place. The execution isn't.",
    subline: `Improvements to ${CATEGORY_NOUN[first]} and ${CATEGORY_NOUN[second]} would meaningfully change how many patients this site converts.`,
  };
}

/**
 * Picks the verdict for a set of category scores.
 *
 * Returns null when nothing could be verified — with no measured category
 * there is no honest statement to make.
 */
export function buildVerdict(scores: VerdictScores): Verdict | null {
  const bands: Record<VerdictCategory, VerdictBand | null> = {
    ai: bandFor(scores.ai),
    patientsFind: bandFor(scores.patientsFind),
    speed: bandFor(scores.speed),
  };

  const present = ORDER.filter((k) => bands[k] !== null);
  if (present.length === 0) return null;

  const criticals = present.filter((k) => bands[k] === "critical");
  const weaks = present.filter((k) => bands[k] === "weak");

  if (criticals.length > 0) {
    if (criticals.length === 3) return ALL_CRITICAL;

    if (criticals.length === 2) {
      const third = ORDER.find((k) => !criticals.includes(k))!;
      // The pair lines each praise the third category by name. Only safe when
      // that category was measured and actually landed in the top band —
      // otherwise we would be asserting quality we did not establish.
      if (bands[third] === "fine") {
        const key = ORDER.filter((k) => criticals.includes(k)).join("+");
        return PAIR[key];
      }
      // Fall back to the single-critical line for the most consequential of
      // the two: it names one real problem and claims nothing about the rest.
      const primary = SINGLE_CRITICAL[ORDER.find((k) => criticals.includes(k))!];
      return usable(primary, bands) ? primary : null;
    }

    const single = SINGLE_CRITICAL[criticals[0]];
    return usable(single, bands) ? single : null;
  }

  if (weaks.length > 0) {
    if (weaks.length === 3) return ALL_WEAK;
    if (weaks.length === 2) return twoWeak(weaks);
    const single = SINGLE_WEAK[weaks[0]];
    return usable(single, bands) ? single : null;
  }

  return usable(ALL_FINE, bands) ? ALL_FINE : null;
}
