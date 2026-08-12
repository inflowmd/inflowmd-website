import type { PerformanceResult } from "@/types/audit";

/**
 * The Lighthouse lab metrics behind the performance score, with Google's own
 * good / needs-improvement / poor thresholds.
 *
 * These are not our checks and carry no weight — the speed score is Google's
 * number. This module exists so the booth can show WHAT the score is made of
 * instead of a single opaque gauge, using Google's published mobile
 * thresholds rather than any judgement of ours.
 *
 * Thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
 * and the Lighthouse scoring calculator (mobile).
 */

export type SpeedBand = "good" | "needs-improvement" | "poor";

export interface SpeedMetric {
  id: string;
  label: string;
  /** Formatted for display, e.g. "2.1s" or "210ms". */
  display: string;
  band: SpeedBand;
  /** Google's cutoffs, phrased for a reader who has never seen Lighthouse. */
  thresholdNote: string;
  /** One line on what the metric actually means to a patient. */
  meaning: string;
}

interface Definition {
  id: string;
  label: string;
  pick: (p: PerformanceResult) => number | null;
  good: number;
  poor: number;
  format: (v: number) => string;
  thresholdNote: string;
  meaning: string;
}

const seconds = (v: number) => `${v}s`;
const ms = (v: number) => `${Math.round(v)}ms`;
const unitless = (v: number) => v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");

const DEFINITIONS: Definition[] = [
  {
    id: "lcp",
    label: "Largest Contentful Paint",
    pick: (p) => p.lcp,
    good: 2.5,
    poor: 4,
    format: seconds,
    thresholdNote: "Google: good under 2.5s · poor over 4s",
    meaning: "How long until the main thing on the page actually appears.",
  },
  {
    id: "fcp",
    label: "First Contentful Paint",
    pick: (p) => p.fcp,
    good: 1.8,
    poor: 3,
    format: seconds,
    thresholdNote: "Google: good under 1.8s · poor over 3s",
    meaning: "How long the patient stares at a blank screen before anything shows.",
  },
  {
    id: "tbt",
    label: "Total Blocking Time",
    pick: (p) => p.tbt,
    good: 200,
    poor: 600,
    format: ms,
    thresholdNote: "Google: good under 200ms · poor over 600ms",
    meaning: "How long the page ignores taps because it is still busy loading.",
  },
  {
    id: "cls",
    label: "Cumulative Layout Shift",
    pick: (p) => p.cls,
    good: 0.1,
    poor: 0.25,
    format: unitless,
    thresholdNote: "Google: good under 0.1 · poor over 0.25",
    meaning: "How much the page jumps around while loading, moving what you meant to tap.",
  },
  {
    id: "speed-index",
    label: "Speed Index",
    pick: (p) => p.speedIndex,
    good: 3.4,
    poor: 5.8,
    format: seconds,
    thresholdNote: "Google: good under 3.4s · poor over 5.8s",
    meaning: "How quickly the page fills in overall, not just the first pixel.",
  },
];

function bandFor(value: number, good: number, poor: number): SpeedBand {
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

/**
 * Metrics we actually have a value for, in Google's own reporting order.
 *
 * A metric absent from the result is omitted rather than rendered as a hole —
 * results measured before a metric was added simply show fewer rows.
 */
export function speedMetrics(performance: PerformanceResult): SpeedMetric[] {
  if (!performance.available) return [];
  const rows: SpeedMetric[] = [];
  for (const def of DEFINITIONS) {
    const value = def.pick(performance);
    if (value === null || !Number.isFinite(value)) continue;
    rows.push({
      id: def.id,
      label: def.label,
      display: def.format(value),
      band: bandFor(value, def.good, def.poor),
      thresholdNote: def.thresholdNote,
      meaning: def.meaning,
    });
  }
  return rows;
}
