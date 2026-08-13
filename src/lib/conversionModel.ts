/**
 * Speed → conversion model.
 *
 * Turns a measured LCP into a defensible range of missed inquiries and patient
 * value, with every step labelled by where its number came from.
 *
 * DESIGN CONSTRAINTS, all deliberate:
 * - Bands are assigned, never interpolated. Portent published three anchors
 *   (1s, 5s, 10s); inventing the curve between them would be our arithmetic
 *   wearing their credibility.
 * - The delta is called "the gap", never "additional" or "recovered"
 *   inquiries. Portent measured a correlation BETWEEN sites, not a causal lift
 *   WITHIN one. Faster sites also tend to be better built overall, so the gap
 *   is not a pot of inquiries that fixing speed hands you.
 * - Only a portion of the gap is attributed to speed, via gapCaptureRate, and
 *   that portion is applied as its own visible step — never silently.
 * - Every figure is a range in the data. When both ends format identically
 *   (the 'critical' band is pinned at [5, 5]) the display collapses to one
 *   hedged value — "5x – 5x" would read as a bug, not a range.
 * - Nothing is ever annualized. Monthly only — a twelve-month figure is how a
 *   credible model starts sounding like a pitch.
 * - Revenue routes through closeRate. Inquiries are not patients, and hiding
 *   that step would overstate the result.
 * - A missing LCP returns null. We do not substitute a default and present it
 *   as measurement.
 */

export type Provenance = "measured" | "cited" | "estimate";

export type Band = "fast" | "moderate" | "slow" | "critical";

export interface ModelStep {
  label: string;
  value: string;
  provenance: Provenance;
  /** Attribution, shown for measured and cited steps. */
  source?: string;
  sourceUrl?: string;
  /** True when the UI should expose this as an adjustable input. */
  editable?: boolean;
  /** Which model input this step maps to, for wiring the control. */
  inputKey?: keyof ConversionModelInput;
}

export interface ConversionModelInput {
  /** Measured Lighthouse LCP in seconds. Null when PageSpeed was unavailable. */
  lcpSeconds: number | null;
  monthlyVisitors: number;
  currentInquiryRate?: number;
  avgPatientValue?: number;
  closeRate?: number;
  /**
   * What share of the between-site gap we attribute to page speed, 0–1.
   * Deliberately conservative by default: speed is one contributing factor
   * among many, not the sole cause of the difference.
   */
  gapCaptureRate?: number;
}

export interface ConversionModel {
  band: Band;
  bandLabel: string;
  /** The two Portent anchors bounding this band. */
  multiplierRange: [number, number];
  steps: ModelStep[];
  currentInquiries: number;
  /** What comparable fast sites see, per the Portent anchors. */
  comparableInquiriesRange: [number, number];
  /** The raw between-site gap. Not a recoverable quantity. */
  gapRange: [number, number];
  /** The portion of the gap attributed to speed. */
  attributableGapRange: [number, number];
  revenueRange: [number, number];
  headline: string;
  /** Rendered near the revenue figure — the correlation-not-causation note. */
  caveat: string;
  supportingStat: string;
  /**
   * The one-line claim the booth screen leads with.
   *
   * Band-aware on purpose. "Likely costing thousands per month" is true of a
   * slow site and FALSE of a fast one, and the fast band exists precisely to
   * say page load is not the problem here. It also names the computed range
   * instead of saying "thousands" when the modelled value does not reach
   * $1,000 — the word has to be earned by the arithmetic.
   */
  valueStatement: string;
}

export const MODEL_DEFAULTS = {
  currentInquiryRate: 0.02,
  avgPatientValue: 3000,
  closeRate: 0.4,
  gapCaptureRate: 0.25,
} as const;

const PORTENT_SOURCE =
  "Portent, 2022 — 100M+ pageviews, 14 B2B lead-generation sites";
const PORTENT_URL =
  "https://portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm";
const PAGESPEED_SOURCE = "Google PageSpeed Insights, Lighthouse LCP (mobile)";

export const SUPPORTING_STAT =
  "53% of mobile visitors abandon a page that takes longer than 3 seconds to load — Google / SOASTA, 2016";

export const MODEL_CAVEAT =
  "Portent compared different sites to each other. Faster sites also tend to be better designed and better optimized overall, so speed is one contributing factor rather than the sole cause. This estimate assumes only a portion of the gap is attributable to speed.";

/**
 * Portent's three published anchors. A measured LCP is placed between the two
 * that bound it; we never interpolate a value inside a band.
 */
function assignBand(lcp: number): {
  band: Band;
  bandLabel: string;
  multiplierRange: [number, number];
  gapLabel: string;
} {
  if (lcp < 2) {
    return {
      band: "fast",
      bandLabel: "Fast",
      multiplierRange: [1, 1],
      gapLabel: "No measurable gap",
    };
  }
  if (lcp < 5) {
    return {
      band: "moderate",
      bandLabel: "Moderate",
      multiplierRange: [1, 3],
      gapLabel: "Between the 1-second and 5-second anchors",
    };
  }
  if (lcp < 10) {
    return {
      band: "slow",
      bandLabel: "Slow",
      multiplierRange: [3, 5],
      gapLabel: "Between the 5-second and 10-second anchors",
    };
  }
  return {
    band: "critical",
    bandLabel: "Critical",
    multiplierRange: [5, 5],
    gapLabel: "At or beyond the 10-second anchor",
  };
}

/* ---------- formatting ---------- */

function formatSeconds(value: number): string {
  return `${Math.round(value * 10) / 10}s`;
}

function formatPercent(rate: number): string {
  const pct = rate * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatCount(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? rounded.toLocaleString("en-US")
    : rounded.toFixed(1);
}

/**
 * A collapsed range (both ends format identically — guaranteed in the
 * 'critical' band, whose multiplierRange is [5, 5]) renders as a single
 * hedged value: "8 – 8" reads as a rendering mistake, not a range.
 * True ranges are untouched.
 */
function formatCountRange([low, high]: [number, number]): string {
  const l = formatCount(low);
  const h = formatCount(high);
  return l === h ? `about ${l}` : `${l} – ${h}`;
}

function formatCurrencyRange([low, high]: [number, number]): string {
  const l = formatCurrency(low);
  const h = formatCurrency(high);
  return l === h ? `about ${l}` : `${l} – ${h}`;
}

function formatMultiplierRange([low, high]: [number, number]): string {
  return low === high ? `${low}x` : `${low}x – ${high}x`;
}

/** Revenue is rounded to the nearest $100 — finer precision is false confidence. */
function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** gapCaptureRate may legitimately be 0, so it needs its own guard. */
function isRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

/**
 * @returns The labelled model, or null when there is no measured LCP to build
 *   it from. Callers should render the "we could not measure this" state.
 */
export function buildConversionModel(
  input: ConversionModelInput
): ConversionModel | null {
  const { lcpSeconds, monthlyVisitors } = input;

  // No measurement, no model. We never substitute a default LCP.
  if (lcpSeconds === null || !Number.isFinite(lcpSeconds) || lcpSeconds < 0) {
    return null;
  }
  // Without a visitor figure there is nothing to apply the gap to.
  if (!isPositiveFinite(monthlyVisitors)) return null;

  const currentInquiryRate = isPositiveFinite(input.currentInquiryRate)
    ? input.currentInquiryRate
    : MODEL_DEFAULTS.currentInquiryRate;
  const avgPatientValue = isPositiveFinite(input.avgPatientValue)
    ? input.avgPatientValue
    : MODEL_DEFAULTS.avgPatientValue;
  const closeRate = isPositiveFinite(input.closeRate)
    ? input.closeRate
    : MODEL_DEFAULTS.closeRate;
  const gapCaptureRate = isRate(input.gapCaptureRate)
    ? input.gapCaptureRate
    : MODEL_DEFAULTS.gapCaptureRate;

  const { band, bandLabel, multiplierRange, gapLabel } = assignBand(lcpSeconds);
  const [lowMultiplier, highMultiplier] = multiplierRange;

  // Inquiry counts are whole numbers so the displayed chain reconciles: a
  // reader checking the arithmetic should be able to follow it end to end.
  const currentInquiries = Math.round(monthlyVisitors * currentInquiryRate);
  const comparableInquiriesRange: [number, number] = [
    Math.round(currentInquiries * lowMultiplier),
    Math.round(currentInquiries * highMultiplier),
  ];
  const gapRange: [number, number] = [
    Math.max(0, comparableInquiriesRange[0] - currentInquiries),
    Math.max(0, comparableInquiriesRange[1] - currentInquiries),
  ];

  // Only the share of the gap we attribute to speed carries into revenue.
  // Kept unrounded here so the capture rate scales the result linearly.
  const attributableGapRange: [number, number] = [
    gapRange[0] * gapCaptureRate,
    gapRange[1] * gapCaptureRate,
  ];

  // Revenue passes through closeRate — inquiries are not patients.
  const revenueRange: [number, number] = [
    roundToHundred(attributableGapRange[0] * closeRate * avgPatientValue),
    roundToHundred(attributableGapRange[1] * closeRate * avgPatientValue),
  ];

  const measuredStep: ModelStep = {
    label: "Main content appears in",
    value: formatSeconds(lcpSeconds),
    provenance: "measured",
    source: PAGESPEED_SOURCE,
  };

  const visitorsStep: ModelStep = {
    label: "Monthly visitors",
    value: monthlyVisitors.toLocaleString("en-US"),
    provenance: "estimate",
    editable: true,
    inputKey: "monthlyVisitors",
  };

  const inquiryRateStep: ModelStep = {
    label: "Currently inquire",
    value: formatPercent(currentInquiryRate),
    provenance: "estimate",
    editable: true,
    inputKey: "currentInquiryRate",
  };

  const currentInquiriesStep: ModelStep = {
    label: "Inquiries now",
    value: `${currentInquiries.toLocaleString("en-US")} per month`,
    provenance: "estimate",
  };

  // A fast site gets a genuinely positive read-out, not a manufactured problem.
  if (band === "fast") {
    return {
      band,
      bandLabel,
      multiplierRange,
      steps: [
        measuredStep,
        {
          label: "Conversion gap at this speed",
          value: gapLabel,
          provenance: "cited",
          source: PORTENT_SOURCE,
          sourceUrl: PORTENT_URL,
        },
        visitorsStep,
        inquiryRateStep,
        currentInquiriesStep,
      ],
      currentInquiries,
      comparableInquiriesRange,
      gapRange,
      attributableGapRange,
      revenueRange,
      headline: `Your site loads in ${formatSeconds(
        lcpSeconds
      )}. At this speed, page load is not costing you inquiries.`,
      valueStatement: `At ${formatSeconds(
        lcpSeconds
      )}, page load is not costing this practice patient value.`,
      caveat: MODEL_CAVEAT,
      supportingStat: SUPPORTING_STAT,
    };
  }

  return {
    band,
    bandLabel,
    multiplierRange,
    steps: [
      measuredStep,
      {
        label: "Conversion gap at this speed",
        value: formatMultiplierRange(multiplierRange),
        provenance: "cited",
        source: PORTENT_SOURCE,
        sourceUrl: PORTENT_URL,
      },
      visitorsStep,
      inquiryRateStep,
      currentInquiriesStep,
      {
        label: "Inquiries at comparable fast sites",
        value: formatCountRange(comparableInquiriesRange),
        provenance: "estimate",
      },
      {
        label: "The gap",
        value: formatCountRange(gapRange),
        provenance: "estimate",
      },
      {
        label: "How much of the gap is speed?",
        value: formatPercent(gapCaptureRate),
        provenance: "estimate",
        editable: true,
        inputKey: "gapCaptureRate",
      },
      {
        label: "Gap attributed to speed",
        value: formatCountRange(attributableGapRange),
        provenance: "estimate",
      },
      {
        label: "Of inquiries that become patients",
        value: formatPercent(closeRate),
        provenance: "estimate",
        editable: true,
        inputKey: "closeRate",
      },
      {
        label: "Value per patient",
        value: formatCurrency(avgPatientValue),
        provenance: "estimate",
        editable: true,
        inputKey: "avgPatientValue",
      },
      {
        label: "Patient value per month",
        value: formatCurrencyRange(revenueRange),
        provenance: "estimate",
      },
    ],
    currentInquiries,
    comparableInquiriesRange,
    gapRange,
    attributableGapRange,
    revenueRange,
    headline: `At ${formatSeconds(
      lcpSeconds
    )}, the gap between your site and comparable fast sites is ${formatCountRange(
      gapRange
    )} inquiries per month. Attributing ${formatPercent(
      gapCaptureRate
    )} of that gap to speed, that is ${formatCurrencyRange(
      revenueRange
    )} in patient value.`,
    valueStatement:
      revenueRange[0] >= 1_000
        ? `At ${formatSeconds(
            lcpSeconds
          )}, this site is likely costing thousands per month in patient value.`
        : `At ${formatSeconds(
            lcpSeconds
          )}, this site is likely costing ${formatCurrencyRange(
            revenueRange
          )} per month in patient value.`,
    caveat: MODEL_CAVEAT,
    supportingStat: SUPPORTING_STAT,
  };
}
