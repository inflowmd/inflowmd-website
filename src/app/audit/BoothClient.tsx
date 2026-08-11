"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuditResult, Check } from "@/types/audit";
import { Gauge, gaugeColor } from "./Gauge";
import {
  buildConversionModel,
  MODEL_DEFAULTS,
  type Provenance,
} from "@/lib/conversionModel";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { cacheKey } from "@/lib/cache";
import { attendeeMatches, hasNoWebsite, letterOf, type Attendee } from "@/lib/attendees";
import { buildCategories, type ResolvedCategory } from "@/lib/categories";

/* ============================================================
   Booth audit UI.

   Live-first, cache as a silent fallback. Picking a practice from the
   type-ahead picker or the browse grid runs a REAL live audit — the full
   scan sequence, a real PSI call — under the attendee's own name. If that
   live attempt fails (timeout, blocked, network error, or drags past
   FALLBACK_TIMEOUT_MS) it falls back to the pre-warmed cache SILENTLY: no
   error state, just the report with a small "pre-run audit" note. The
   walk-up URL field is unchanged — it runs live via the same runLive path
   without fallback, keeping its existing honest failure/retry screen.

   Escape returns to input. R re-runs live (no fallback — a deliberate
   re-run should show the truth if it fails). C is the mid-demo escape
   hatch: force-load the pre-warmed version immediately, from either the
   running or result screen.

   Total network death (offline, or the API unreachable at page load) flips
   the picker itself to cache-first automatically — selections render the
   pre-warmed result with no live attempt at all — flagged only by a small
   dot in the corner, subtle enough that only the presenter would notice.
   ============================================================ */

const BG = "#081C34";
const ACCENT = "#84B83B";

type Phase = "input" | "running" | "result" | "no-website" | "browse";

/** Matches the route's maxDuration so the client never gives up first. */
const CLIENT_TIMEOUT_MS = 150_000;

/**
 * Live-first picker selections get a shorter budget than a deliberate
 * re-run: if PSI is still dragging past 75s, the pre-warmed result is a
 * better answer for a doctor standing at the booth than a longer wait.
 * Only paths that pass `attemptFallback: true` use this ceiling.
 */
const FALLBACK_TIMEOUT_MS = 75_000;

/** The site the comparison button audits, live. Swappable in one line.
 *  Canonical final URL — auditing the apex would eat a ~780ms redirect penalty. */
const COMPARISON_SITE = "https://www.inflowmd.com";
const COMPARISON_HOST = COMPARISON_SITE.replace(/^https?:\/\//, "").replace(/^www\./, "");

/**
 * Each stage names its source. A line only ever resolves to its `done` label
 * after the response has actually arrived — never on a timer.
 *
 * Order: the four HTML-derived checks on top, resolving top-to-bottom; the
 * Google measurement — the longest-running task, kicked off visibly the
 * moment the scan starts — sits at the bottom and resolves last, the
 * featured beat right before the report opens.
 */
const SCAN_STAGES = [
  { running: "Reading the site's code…", done: "Site code read", featured: false },
  {
    running: "Checking how search engines see this practice…",
    done: "Search visibility checked",
    featured: false,
  },
  {
    running: "Checking whether AI assistants (ChatGPT, Perplexity) can read this site…",
    done: "AI assistant access checked",
    featured: false,
  },
  {
    running: "Checking medical practice identification (structured data)…",
    done: "Practice identification checked",
    featured: false,
  },
  {
    running: "Connecting to Google PageSpeed Insights…",
    done: "Google measurement received",
    featured: true,
  },
];

/** Index of the featured Google line — always active in flight, resolves last. */
const PSI_STAGE = SCAN_STAGES.length - 1;

/** Minimum gap between one dot resolving and the next. */
const RESOLVE_STAGGER_MS = 600;
/** Minimum hold after the last dot resolves, before the report opens. */
const RESOLVE_HOLD_MS = 1_500;

/* ---------- formatting ---------- */

const usd = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (r: number) => `${Math.round(r * 100)}%`;
const domainOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Attribution shown under each category gauge. Only the Lighthouse score is
 *  Google's — the other three are our own analysis and must say so. */
const SOURCE_LABEL: Record<string, string> = {
  google: "Google PageSpeed Insights",
  inflowmd: "InflowMD analysis",
};

/* ---------- provenance + status styling ---------- */

const PROVENANCE_STYLE: Record<Provenance, { label: string; className: string }> = {
  measured: {
    label: "Measured",
    className: "border-[#84B83B]/60 bg-[#84B83B]/10 text-[#84B83B]",
  },
  cited: {
    label: "Cited",
    className: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  },
  estimate: {
    // Dashed, muted — an assumption must never look like a measurement.
    label: "Estimate",
    className: "border-dashed border-white/30 bg-white/[0.04] text-white/60",
  },
};

/** could_not_verify is deliberately neutral — never styled like a failure. */
const STATUS_STYLE: Record<Check["status"], { dot: string; text: string; label: string }> = {
  pass: { dot: "bg-[#84B83B]", text: "text-[#84B83B]", label: "Pass" },
  warn: { dot: "bg-amber-400", text: "text-amber-300", label: "Needs work" },
  fail: { dot: "bg-red-500", text: "text-red-400", label: "Fail" },
  could_not_verify: {
    dot: "bg-white/25 ring-1 ring-white/40",
    text: "text-white/45",
    label: "Not checked",
  },
};

function ProvenanceTag({ provenance }: { provenance: Provenance }) {
  const s = PROVENANCE_STYLE[provenance];
  return (
    <span
      className={`inline-flex items-center shrink-0 text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-1 rounded border ${s.className}`}
    >
      {s.label}
    </span>
  );
}

/**
 * Plain-language explanations for every check, in patient/practice terms.
 * Shown when a findings row is expanded — what was checked, and why a
 * physician should care. Factual register, no scare copy.
 */
const CHECK_EXPLANATIONS: Record<string, string> = {
  "seo.redirect-chain":
    "How many hops a patient's browser takes before your page starts loading. Each redirect adds waiting time before anything appears on screen.",
  "seo.https":
    "Whether the connection between a patient's browser and this site is encrypted. Browsers mark unencrypted sites “Not secure,” and Google ranks them lower.",
  "seo.title":
    "The headline Google shows in search results — often the first thing a prospective patient reads about the practice.",
  "seo.meta-description":
    "The sentence under the headline in Google results. When it's missing, Google improvises one from page text — often the wrong text.",
  "seo.h1":
    "The page's main heading, the digital equivalent of the name at the top of a chart. Search engines use it to work out what the page is about.",
  "seo.heading-order":
    "Whether headings follow a clean outline. Search engines and screen readers navigate the page by that outline.",
  "seo.viewport":
    "The setting that makes the site resize properly on phones. Without it, patients pinch and zoom — and most leave instead.",
  "seo.canonical":
    "The page's declared official address. It stops search engines treating copies of the same page as competing pages.",
  "seo.open-graph":
    "The preview shown when the site is shared in a text or on social media. Without it, shared links appear bare — no image, no title.",
  "seo.image-alt":
    "Text alternatives for images. Search engines and screen readers can't see photos — they read these instead.",
  "schema.present":
    "Machine-readable code summarizing the practice for search engines and AI assistants. Without any, they work from guesswork.",
  "schema.medical":
    "Structured code that tells Google and AI assistants this is a medical practice — who you are, what you treat, where you are. Without it, search engines guess.",
  "schema.local-business":
    "The address, phone number, and hours in a form search engines read directly — it's how a practice earns its place in local map results.",
  "schema.faq":
    "Patient questions marked up so they can appear as expandable answers directly in Google results — visibility a competitor claims otherwise.",
  "schema.organization":
    "The practice described as an organization, connecting its name, logo, and profiles so search engines treat it as one entity.",
  "ai.robots-file":
    "The file that tells crawlers what they may read — it's how a site controls what search engines and AI tools can see.",
  "ai.crawler-access":
    "Whether ChatGPT, Perplexity, and other AI tools are allowed to read this site. Blocked means invisible when patients ask an AI for a doctor.",
  "ai.llms-txt":
    "An emerging standard that tells AI assistants how to read and summarize your site. Few practices have one yet — which is exactly the opportunity.",
  "ai.semantic-structure":
    "Whether the page's structure lets an AI assistant find the passage that answers a patient's question. Clean outlines get quoted; jumbles get skipped.",
  "ai.content-depth":
    "How much readable text the page carries. AI assistants and search engines need enough substance to draw an answer from.",
};

/** One findings row — collapsed exactly as before, expandable for the why. */
function FindingRow({ check }: { check: Check }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_STYLE[check.status];
  const explanation = CHECK_EXPLANATIONS[check.id];
  return (
    <div
      className={`rounded-lg border bg-white/[0.02] ${
        check.status === "could_not_verify"
          ? "border-dashed border-white/15"
          : "border-white/10"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
        style={{ minHeight: 44 }}
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
        <span className="text-sm text-white/80 flex-1 min-w-0 truncate">{check.label}</span>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${st.text}`}>
          {st.label}
        </span>
        {/* Inline SVG rather than a text glyph — immune to escaping bugs,
            and the rotation animates cleaner. */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 shrink-0 text-white/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-3.5 pl-[38px]">
          {explanation && (
            <p className="text-sm text-white/60 leading-snug">{explanation}</p>
          )}
          <p className="text-xs text-white/40 mt-1.5 leading-snug">{check.detail}</p>
        </div>
      )}
    </div>
  );
}

/* Gauge lives in ./Gauge — shared with the /pitch deck. */

/* ---------- slider ---------- */

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3 mb-1">
        <label className="text-sm sm:text-base font-semibold text-white/85 leading-snug">
          {label}
        </label>
        <span
          className="text-xl sm:text-2xl font-extrabold tabular-nums whitespace-nowrap"
          style={{ color: ACCENT }}
        >
          {display}
        </span>
      </div>
      <div className="mb-2">
        <ProvenanceTag provenance="estimate" />
      </div>
      <input
        type="range"
        className="booth-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/**
 * The staged scan list, shared by the main run and the comparison run.
 * Honesty invariant lives here: a line only ever resolves after the response
 * has arrived, paced by resolvedCount.
 */
function StageList({
  scanStage,
  stageOutcomes,
  resolvedCount,
  runFailed,
}: {
  scanStage: number;
  stageOutcomes: boolean[] | null;
  resolvedCount: number;
  runFailed: boolean;
}) {
  return (
    <ul className="space-y-4">
                {SCAN_STAGES.map((stage, i) => {
                  // While the response is in flight nothing resolves — a tick
                  // would assert a result we do not have. Once the response
                  // arrives, lines flip to their final state one at a time
                  // (resolvedCount walks top to bottom, Google last).
                  const resolved = stageOutcomes !== null && i < resolvedCount;
                  const outcome = resolved && stageOutcomes ? stageOutcomes[i] : null;
                  const resolvedOk = outcome === true;
                  const unresolvedFail = runFailed || outcome === false;
                  // Google runs the whole time, so its line pulses from the
                  // first frame until its own flip at the end.
                  const active =
                    !runFailed &&
                    !resolved &&
                    (i === PSI_STAGE || (!stageOutcomes && i === scanStage));
                  const reached =
                    !runFailed &&
                    (stageOutcomes !== null || i <= scanStage || i === PSI_STAGE);
                  const featured = stage.featured && resolvedOk;
                  return (
                    <li
                      key={stage.running}
                      className={`flex items-center gap-4 font-bold ${
                        featured ? "text-xl sm:text-3xl" : "text-lg sm:text-2xl"
                      }`}
                    >
                      {resolvedOk ? (
                        <span
                          className="booth-pop inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                          style={{ background: ACCENT }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3 h-3"
                            aria-hidden
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                      ) : active ? (
                        <span className="inline-block w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white/60 animate-pulse" />
                      ) : (
                        <span
                          className="inline-block w-3 h-3 rounded-full shrink-0"
                          style={{
                            background: unresolvedFail
                              ? "rgba(255,255,255,0.18)"
                              : "rgba(255,255,255,0.22)",
                          }}
                        />
                      )}
                      <span
                        className={
                          unresolvedFail
                            ? "text-white/35"
                            : reached
                              ? "text-white"
                              : "text-white/35"
                        }
                        style={featured ? { color: ACCENT } : undefined}
                      >
                        {resolvedOk ? stage.done : stage.running}
                      </span>
                      {unresolvedFail && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                          not completed
                        </span>
                      )}
                    </li>
                  );
                })}
    </ul>
  );
}

/**
 * The comparison flex: a REAL live audit of COMPARISON_SITE, run on demand,
 * never cached — the point is watching it happen. Self-contained state so a
 * failure here can never corrupt the main report.
 */
function ComparisonBlock({ their, onRan }: { their: AuditResult; onRan: () => void }) {
  const [state, setState] = useState<"prompt" | "running" | "done" | "failed">("prompt");
  const [scanStage, setScanStage] = useState(0);
  const [outcomes, setOutcomes] = useState<boolean[] | null>(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [comparison, setComparison] = useState<AuditResult | null>(null);
  const timers = useRef<{
    scan: ReturnType<typeof setInterval> | null;
    resolve: ReturnType<typeof setInterval> | null;
    hold: ReturnType<typeof setTimeout> | null;
    abort: AbortController | null;
  }>({ scan: null, resolve: null, hold: null, abort: null });

  const clearAll = useCallback(() => {
    const t = timers.current;
    if (t.scan) clearInterval(t.scan);
    if (t.resolve) clearInterval(t.resolve);
    if (t.hold) clearTimeout(t.hold);
    t.abort?.abort();
    timers.current = { scan: null, resolve: null, hold: null, abort: null };
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  const run = useCallback(async () => {
    clearAll();
    setState("running");
    setScanStage(0);
    setOutcomes(null);
    setResolvedCount(0);

    timers.current.scan = setInterval(() => {
      setScanStage((v) => Math.min(v + 1, PSI_STAGE - 1));
    }, 1600);

    const controller = new AbortController();
    timers.current.abort = controller;
    const clientTimeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // force: the comparison is always live. Serving it from a cache would
        // make "watch it happen" a lie.
        body: JSON.stringify({ url: COMPARISON_SITE, force: true }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`comparison audit returned ${res.status}`);
      const data = (await res.json()) as AuditResult;

      if (timers.current.scan) clearInterval(timers.current.scan);
      timers.current.scan = null;
      setOutcomes([
        data.htmlFetch.ok,
        data.scores.patientsFind !== null,
        data.scores.aiFind !== null,
        data.scores.aiUnderstand !== null,
        data.performance.available,
      ]);
      let flipped = 0;
      timers.current.resolve = setInterval(() => {
        flipped++;
        setResolvedCount(flipped);
        if (flipped >= SCAN_STAGES.length) {
          if (timers.current.resolve) clearInterval(timers.current.resolve);
          timers.current.resolve = null;
          timers.current.hold = setTimeout(() => {
            // If our own site is having a bad day, render it honestly — the
            // tool does not lie about us either — but flag it loudly.
            const ours = data.scores.performance;
            if (ours === null || ours < 90) {
              console.warn(
                `BOOTH ALERT: comparison site ${domainOf(COMPARISON_SITE)} scored ${ours ?? "null"} ` +
                  "(below 90). Investigate before the next demo."
              );
            }
            setComparison(data);
            setState("done");
            onRan();
          }, RESOLVE_HOLD_MS);
        }
      }, RESOLVE_STAGGER_MS);
    } catch {
      clearAll();
      // A failed flex must never corrupt the main result — neutral, quiet.
      setState("failed");
    } finally {
      clearTimeout(clientTimeout);
      timers.current.abort = null;
    }
  }, [clearAll, onRan]);

  /* ---------- render ---------- */

  if (state === "prompt") {
    return (
      <div
        className="mb-10 rounded-2xl border-2 p-6 sm:p-8 text-center"
        style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.2)" }}
      >
        <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
          Want to see what a passing score looks like?
        </h2>
        <button
          type="button"
          onClick={() => void run()}
          className="mt-5 rounded-xl px-8 py-4 font-extrabold text-base sm:text-lg text-[#081C34] transition-opacity hover:opacity-90"
          style={{ background: ACCENT, minHeight: 44 }}
        >
          Run this same test on a site we built
        </button>
      </div>
    );
  }

  if (state === "running") {
    return (
      <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-6">
          Auditing {domainOf(COMPARISON_SITE)} — live, not cached
        </div>
        <StageList
          scanStage={scanStage}
          stageOutcomes={outcomes}
          resolvedCount={resolvedCount}
          runFailed={false}
        />
        {!outcomes && (
          <div className="mt-6 max-w-xl">
            <p className="text-white/45 text-sm sm:text-base leading-snug">
              Same test, same rules — Google is measuring our site right now.
            </p>
            <div className="booth-sweep-track mt-3" aria-hidden>
              <div className="booth-sweep-bar" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="mb-10 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center">
        <p className="text-white/55 font-semibold">Comparison unavailable</p>
        <button
          type="button"
          onClick={() => void run()}
          className="mt-3 rounded-lg border border-white/15 px-5 text-sm font-bold text-white/60 hover:text-white transition-colors"
          style={{ minHeight: 44 }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!comparison) return null;
  const theirPerf = their.performance.available ? their.performance.lighthouseScore : null;
  const ourPerf = comparison.performance.available
    ? comparison.performance.lighthouseScore
    : null;
  const theirLcp = their.performance.lcp;
  const ourLcp = comparison.performance.lcp;
  const seconds = (v: number) => {
    const n = Math.max(1, Math.round(v));
    return `${n} second${n === 1 ? "" : "s"}`;
  };

  return (
    <div className="mb-10 rounded-2xl border-2 p-6 sm:p-8" style={{ borderColor: `${ACCENT}55` }}>
      <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-6 text-center">
        Same test · measured just now
      </div>

      {/* the two performance gauges */}
      <div className="flex items-start justify-center gap-10 sm:gap-20">
        <Gauge score={theirPerf} label="Their practice site" size={150} valueClass="text-4xl" />
        <Gauge score={ourPerf} label="Built by InflowMD" size={150} valueClass="text-4xl" />
      </div>

      {/* the patient-wait line — the centerpiece */}
      {theirLcp !== null && ourLcp !== null && (
        <p className="mt-8 text-center text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug max-w-3xl mx-auto">
          A patient waits{" "}
          <span style={{ color: gaugeColor(theirPerf) }}>{seconds(theirLcp)}</span> for
          this site —{" "}
          <span style={{ color: gaugeColor(ourPerf) }}>{seconds(ourLcp)}</span> for ours.
        </p>
      )}

      {/* four category scores, two compact columns */}
      <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {[
          { title: "Their practice site", r: their },
          { title: "Built by InflowMD", r: comparison },
        ].map(({ title, r }) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-bold tracking-wider uppercase text-white/45 mb-3">
              {title}
            </div>
            <ul className="space-y-2.5">
              {[
                ...buildCategories(r).map((c) => ({
                  label: c.label,
                  score: c.score,
                  v: c.key === "speed" ? null : c.verified,
                  t: c.key === "speed" ? null : c.total,
                })),
              ].map((row) => (
                <li key={row.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-white/70 min-w-0">{row.label}</span>
                  <span className="text-right shrink-0">
                    <span
                      className="text-lg font-extrabold tabular-nums"
                      style={{ color: gaugeColor(row.score) }}
                    >
                      {row.score === null ? "—" : row.score}
                    </span>
                    {row.v !== null && row.t !== null && (
                      <span className="block text-[10px] text-white/30 tabular-nums">
                        {row.v} of {row.t} verified
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ */

/** Ambient dark mesh with lime accents, shared by every full-screen phase
 *  (picker, browse grid, no-website state) so the design language matches. */
function MeshBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="mesh-blob-1 absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(132,184,59,0.25), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="mesh-blob-2 absolute -bottom-32 -right-24 w-[560px] h-[560px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(18,54,94,0.9), transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="mesh-blob-3 absolute top-1/3 left-1/2 w-[420px] h-[420px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(132,184,59,0.18), transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

export default function BoothClient({
  practices,
  attendees,
}: {
  practices: AuditResult[];
  attendees: Attendee[];
}) {
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  /** Set when the picker selects an attendee with no website on file. */
  const [noWebsiteAttendee, setNoWebsiteAttendee] = useState<Attendee | null>(null);
  const [scanStage, setScanStage] = useState(0);
  /** The run finished without a result — stages must show "not completed". */
  const [runFailed, setRunFailed] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  /** How many model beats are visible; large number = all (cached path). */
  const [revealed, setRevealed] = useState(999);
  /** Per-stage outcomes, set only once the response has actually arrived. */
  const [stageOutcomes, setStageOutcomes] = useState<boolean[] | null>(null);
  /** How many stage lines (top-down) have flipped to their final state. */
  const [resolvedCount, setResolvedCount] = useState(0);
  /** The full chain and secondary sliders live behind this. */
  const [showMath, setShowMath] = useState(false);
  /** Booth CTA card flips to the in-person instruction when tapped. */
  const [ctaFlipped, setCtaFlipped] = useState(false);
  /** True once a comparison has completed — the CTA sub-line references it. */
  const [comparisonRan, setComparisonRan] = useState(false);
  /** ISO fetchedAt of a cached result currently on screen in place of a live
   *  one — drives the "Showing our pre-run audit from ..." line. Null means
   *  either a genuinely live result, or a cache render that doesn't need
   *  explaining (total-network-death mode, already flagged by the corner dot). */
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  /** "live" tries a real audit first; "cache-first" — set automatically when
   *  the booth's network looks dead — skips straight to the pre-warmed
   *  result. Never surfaced to the visitor, only via the corner dot. */
  const [networkMode, setNetworkMode] = useState<"live" | "cache-first">(() =>
    typeof navigator !== "undefined" && navigator.onLine === false ? "cache-first" : "live"
  );

  // Conversion-model inputs — all default, none blank.
  const [monthlyVisitors, setMonthlyVisitors] = useState(800);
  const [gapCaptureRate, setGapCaptureRate] = useState<number>(MODEL_DEFAULTS.gapCaptureRate);
  const [closeRate, setCloseRate] = useState<number>(MODEL_DEFAULTS.closeRate);
  const [avgPatientValue, setAvgPatientValue] = useState<number>(
    MODEL_DEFAULTS.avgPatientValue
  );

  const searchRef = useRef<HTMLInputElement>(null);
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const model = useMemo(() => {
    if (!result) return null;
    return buildConversionModel({
      lcpSeconds: result.performance.lcp,
      monthlyVisitors,
      gapCaptureRate,
      closeRate,
      avgPatientValue,
    });
  }, [result, monthlyVisitors, gapCaptureRate, closeRate, avgPatientValue]);

  /** Pre-warmed results keyed the same way the cache module keys them, so
   *  an attendee's raw URL — pre-redirect, possibly missing www — still
   *  finds the result the audit engine filed under its final URL. Two
   *  attendee names sharing one domain (e.g. Salcedo) resolve to the SAME
   *  map entry, so the site was only ever audited once. */
  const cacheByUrl = useMemo(() => {
    const map = new Map<string, AuditResult>();
    for (const p of practices) if (p.url) map.set(cacheKey(p.url), p);
    return map;
  }, [practices]);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return attendees;
    return attendees.filter((a) => attendeeMatches(a, q));
  }, [query, attendees]);

  /** The pending display name for the NEXT runLive call — set right before
   *  it fires from a picker selection, consumed (and cleared) at the top of
   *  runLive so a later manual entry never inherits a stale attendee name. */
  const pendingDisplayNameRef = useRef<string | null>(null);
  /** The display name for the CURRENTLY active run, held for its whole
   *  lifetime (unlike pendingDisplayNameRef, which is consumed at the
   *  start) — so a mid-run cache override (the C key) still shows the
   *  right attendee name, not the pre-warmed cache's own stored name. */
  const activeDisplayNameRef = useRef<string | null>(null);
  /** The URL of the run currently in flight — the C key's cache lookup key
   *  while phase is "running", before there's a `result` to read it from. */
  const activeTargetRef = useRef<string>("");
  /** True for exactly one abort: set right before we deliberately cancel an
   *  in-flight fetch (Escape, the C key) so that run's own catch block
   *  doesn't ALSO try to handle the abort — otherwise a user-initiated
   *  cancel could race a stale fallback render on top of the fresh one. */
  const intentionalAbortRef = useRef(false);
  /** The options the current/last run started with, so "Try again" retries
   *  with the same force/fallback intent rather than silently downgrading. */
  const lastRunOptionsRef = useRef<{ force: boolean; attemptFallback: boolean }>({
    force: false,
    attemptFallback: false,
  });

  const clearTimers = useCallback(() => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (scanTimer.current) clearInterval(scanTimer.current);
    if (resolveTimer.current) clearInterval(resolveTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    revealTimer.current = null;
    scanTimer.current = null;
    resolveTimer.current = null;
    holdTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    intentionalAbortRef.current = true;
    clearTimers();
    abortRef.current?.abort();
    abortRef.current = null;
    pendingDisplayNameRef.current = null;
    activeDisplayNameRef.current = null;
    activeTargetRef.current = "";
    setPhase("input");
    setResult(null);
    setError(null);
    setQuery("");
    setUrlInput("");
    setRevealed(999);
    setRunFailed(false);
    setPendingUrl("");
    setStageOutcomes(null);
    setResolvedCount(0);
    setShowMath(false);
    setCtaFlipped(false);
    setComparisonRan(false);
    setNoWebsiteAttendee(null);
    setFallbackNote(null);
  }, [clearTimers]);

  /** Renders a pre-warmed result as the current report — no network, no
   *  reveal sequence. Shared by the live-run fallback, the C-key escape
   *  hatch, and total-network-death cache-first mode. Callers that are
   *  interrupting an ACTIVE fetch (not this one, which handles its own
   *  cleanup) are responsible for the abort dance themselves. */
  const renderCachedResult = useCallback(
    (cached: AuditResult, displayName: string | null, showNote: boolean) => {
      clearTimers();
      setError(null);
      setRunFailed(false);
      setResult({ ...cached, practiceName: displayName ?? cached.practiceName });
      setRevealed(999);
      setShowMath(false);
      setCtaFlipped(false);
      setComparisonRan(false);
      setPhase("result");
      setFallbackNote(showNote ? cached.fetchedAt : null);
    },
    [clearTimers]
  );

  /**
   * Live path — progressive reveal of RESOLVED results only.
   *
   * `attemptFallback: true` (picker/grid selections) makes this fail
   * SILENTLY into the pre-warmed cache — no error state, just the report,
   * with a small note explaining it's a pre-run number. Manual walk-ups
   * and deliberate re-runs (R, "Try again") pass it as false and keep the
   * honest failure/retry screen, matching their existing behavior exactly.
   */
  const runLive = useCallback(
    async (rawUrl: string, options: { force?: boolean; attemptFallback?: boolean } = {}) => {
      const target = rawUrl.trim();
      if (!target) return;
      const force = options.force ?? false;
      const attemptFallback = options.attemptFallback ?? false;
      lastRunOptionsRef.current = { force, attemptFallback };

      // Consumed immediately so a later manual URL entry never inherits a
      // stale attendee name from a prior picker selection — but kept alive
      // in activeDisplayNameRef for this run's whole lifetime, so a mid-run
      // cache override (the C key) still shows the right attendee name.
      const displayNameOverride = pendingDisplayNameRef.current;
      pendingDisplayNameRef.current = null;
      activeDisplayNameRef.current = displayNameOverride;
      activeTargetRef.current = target;

      clearTimers();
      setError(null);
      setResult(null);
      setRunFailed(false);
      setStageOutcomes(null);
      setResolvedCount(0);
      setShowMath(false);
      setCtaFlipped(false);
      setComparisonRan(false);
      setFallbackNote(null);
      setPhase("running");
      setScanStage(0);
      setPendingUrl(target);

      // The stage list is a narrative of what the server is doing. It never
      // marks anything complete — we have no progress events, so a green tick
      // here would be a claim we cannot support.
      scanTimer.current = setInterval(() => {
        setScanStage((s) => Math.min(s + 1, PSI_STAGE - 1));
      }, 1600);

      // Fallback-eligible runs get a shorter budget than the route's own
      // 150s ceiling — see FALLBACK_TIMEOUT_MS.
      const timeoutMs = attemptFallback ? FALLBACK_TIMEOUT_MS : CLIENT_TIMEOUT_MS;
      const controller = new AbortController();
      abortRef.current = controller;
      const clientTimeout = setTimeout(() => controller.abort(), timeoutMs);

      /** Silently substitutes the pre-warmed result for this run's target,
       *  if one exists. Returns false (does nothing) when there is none to
       *  fall back to — the caller then shows the normal failure screen. */
      const fallBackToCache = (reason: string): boolean => {
        const cached = cacheByUrl.get(cacheKey(target));
        if (!cached) return false;
        console.warn(
          `[BOOTH] Live audit for ${domainOf(target)} ${reason} — showing the pre-run ` +
            `result from ${cached.fetchedAt} instead. The visitor never saw a failure.`
        );
        renderCachedResult(cached, displayNameOverride, true);
        return true;
      };

      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target, force }),
          signal: controller.signal,
        });

        // Check the status BEFORE parsing: a gateway timeout returns an HTML
        // error page, and blindly calling .json() on it turned every distinct
        // failure into the same useless "could not reach" message.
        if (!res.ok) {
          if (attemptFallback && fallBackToCache(`returned ${res.status}`)) return;
          let message = `The audit service returned ${res.status}.`;
          try {
            const body = await res.json();
            if (typeof body?.error === "string") message = body.error;
          } catch {
            if (res.status === 504 || res.status === 502) {
              message = "The audit took too long to finish. Try again.";
            }
          }
          clearTimers();
          setError(message);
          setRunFailed(true);
          return;
        }

        const data = (await res.json()) as AuditResult;
        if (displayNameOverride) data.practiceName = displayNameOverride;
        clearTimers();

        // Sanity check: a live score wildly different from what we measured
        // before is worth a loud flag before anyone quotes it out loud. The
        // live result is still what renders — this is a log, not a gate.
        const cachedForCompare =
          cacheByUrl.get(cacheKey(data.url)) ?? cacheByUrl.get(cacheKey(target));
        if (cachedForCompare) {
          const live = data.scores.performance;
          const wasCached = cachedForCompare.scores.performance;
          if (live !== null && wasCached !== null && Math.abs(live - wasCached) >= 25) {
            console.warn(
              `BOOTH ALERT: performance discrepancy for ${domainOf(data.url)} — cached ` +
                `${wasCached}, live ${live} (Δ${live - wasCached}). Verify before quoting this number.`
            );
          }
        }

        // The response is here — each line may now resolve, and only from what
        // the data actually says. A stage whose work did not complete stays
        // neutral rather than ticking green. Everything below merely PACES the
        // display of results that have already arrived: the dots flip one at a
        // time, top to bottom, Google last, so each completion is visible.
        setStageOutcomes([
          data.htmlFetch.ok,
          data.scores.patientsFind !== null,
          data.scores.aiFind !== null,
          data.scores.aiUnderstand !== null,
          data.performance.available,
        ]);
        setResolvedCount(0);
        let flipped = 0;
        resolveTimer.current = setInterval(() => {
          flipped++;
          setResolvedCount(flipped);
          if (flipped >= SCAN_STAGES.length) {
            if (resolveTimer.current) clearInterval(resolveTimer.current);
            resolveTimer.current = null;
            // Hold on the fully-resolved list before the report replaces it.
            holdTimer.current = setTimeout(() => {
              setResult(data);
              setPhase("result");
              setRevealed(0);
              revealTimer.current = setInterval(() => {
                setRevealed((n) => n + 1);
              }, 380);
            }, RESOLVE_HOLD_MS);
          }
        }, RESOLVE_STAGGER_MS);
      } catch (err) {
        // A deliberate cancel (Escape, the C key) lands here too — it must
        // not fight whatever that cancel already did (reset, or its own
        // cache render) with a second, stale state update.
        if (intentionalAbortRef.current) {
          intentionalAbortRef.current = false;
          return;
        }
        const aborted = err instanceof Error && err.name === "AbortError";
        if (attemptFallback && fallBackToCache(aborted ? "timed out" : "hit a network error")) {
          return;
        }
        clearTimers();
        setError(
          aborted
            ? "The audit took too long to finish. Try again."
            : "Could not reach the audit service."
        );
        setRunFailed(true);
      } finally {
        clearTimeout(clientTimeout);
        abortRef.current = null;
      }
    },
    [clearTimers, cacheByUrl, renderCachedResult]
  );

  /** Picker/browse-grid selection: the single entry point for both layers.
   *  A no-website attendee routes to a dedicated opportunity screen — never
   *  an error. Otherwise this is LIVE-FIRST: a real audit runs, watched in
   *  the full scan sequence — the pre-warmed cache is only a silent safety
   *  net inside runLive if that live attempt fails. The one exception is
   *  total network death (networkMode === "cache-first"), where there is no
   *  point pretending to try: it renders the cache immediately, same as the
   *  booth's original behavior, so the demo is never visibly broken. */
  const selectAttendee = useCallback(
    (a: Attendee) => {
      clearTimers();
      setError(null);
      if (hasNoWebsite(a)) {
        setNoWebsiteAttendee(a);
        setPhase("no-website");
        return;
      }
      const normalized = normalizeUrl(a.url);
      if (!normalized) {
        setError(`Could not use the website address on file for ${a.name}.`);
        return;
      }

      if (networkMode === "cache-first") {
        const cached = cacheByUrl.get(cacheKey(normalized));
        if (cached) {
          renderCachedResult(cached, a.name, false);
          return;
        }
        setError(`No pre-warmed result for ${a.name}, and the network looks unreachable.`);
        return;
      }

      pendingDisplayNameRef.current = a.name;
      void runLive(normalized, { force: true, attemptFallback: true });
    },
    [clearTimers, cacheByUrl, renderCachedResult, runLive, networkMode]
  );

  /** C — the mid-demo escape hatch: bail out of a dragging live run (or
   *  swap a landed live result) for the pre-warmed version, instantly.
   *  Active on the running and result screens only. */
  const forceLoadCache = useCallback(() => {
    const url =
      phase === "running" ? activeTargetRef.current : result?.requestedUrl ?? result?.url ?? "";
    if (!url) return;
    const cached = cacheByUrl.get(cacheKey(url));
    if (!cached) {
      console.log(`[BOOTH] C pressed — no cached result available for ${domainOf(url)}.`);
      return;
    }
    intentionalAbortRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    console.log(`[BOOTH] C pressed — force-loaded the cached result for ${domainOf(url)}.`);
    renderCachedResult(cached, activeDisplayNameRef.current, true);
  }, [phase, result, cacheByUrl, renderCachedResult]);

  // Stop the reveal timer once every beat is showing.
  useEffect(() => {
    const steps = model?.steps.length ?? 0;
    if (revealTimer.current && revealed > steps) {
      clearInterval(revealTimer.current);
      revealTimer.current = null;
    }
  }, [revealed, model]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Escape returns to input; R re-runs live with force; C force-loads cache.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "Escape") {
        e.preventDefault();
        reset();
        return;
      }
      if (!typing && (e.key === "r" || e.key === "R") && result) {
        e.preventDefault();
        void runLive(result.url, { force: true });
        return;
      }
      if (!typing && (e.key === "c" || e.key === "C") && (phase === "running" || phase === "result")) {
        e.preventDefault();
        forceLoadCache();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset, runLive, result, phase, forceLoadCache]);

  useEffect(() => {
    if (phase === "input") searchRef.current?.focus();
  }, [phase]);

  /**
   * Booth-mode network safety. navigator.onLine catches the obvious case
   * (airplane mode, wifi off) instantly; the page-load probe catches dead
   * venue wifi that LOOKS connected but can't actually reach our API — a
   * lightweight same-origin request (any response, even a 405, proves the
   * network path works; a thrown error means it doesn't). This can't detect
   * a wifi that reaches us but not Google/PSI specifically — that failure
   * mode is instead caught per-run by the fallback logic in runLive.
   */
  useEffect(() => {
    let cancelled = false;

    async function probe() {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        await fetch("/api/audit", { method: "GET", signal: controller.signal, cache: "no-store" });
        clearTimeout(t);
        if (!cancelled && navigator.onLine !== false) setNetworkMode("live");
      } catch {
        if (!cancelled) setNetworkMode("cache-first");
      }
    }
    void probe();

    const goLive = () => {
      if (navigator.onLine) setNetworkMode("live");
    };
    const goCacheFirst = () => setNetworkMode("cache-first");
    window.addEventListener("online", goLive);
    window.addEventListener("offline", goCacheFirst);
    return () => {
      cancelled = true;
      window.removeEventListener("online", goLive);
      window.removeEventListener("offline", goCacheFirst);
    };
  }, []);

  /* ---------- no-website screen ---------- */
  // Not an error — the opportunity framing carries the same weight as a
  // failing score. The design language matches the result screen's CTA.

  if (phase === "no-website" && noWebsiteAttendee) {
    const name = noWebsiteAttendee.name;
    return (
      <main className="relative min-h-screen text-white overflow-hidden" style={{ background: BG }}>
        <MeshBg />
        {networkMode === "cache-first" && (
          <div
            className="fixed top-3 right-3 z-50 w-2 h-2 rounded-full bg-amber-400/60"
            title="Network unreachable — showing pre-run results only"
            aria-hidden
          />
        )}
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/inflowmd-final.png" alt="InflowMD" className="h-8 sm:h-9 w-auto" />
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40">
              Site Audit
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="text-white/45 hover:text-white text-sm font-semibold mb-6"
          >
            &larr; Back
          </button>

          <div
            className="rounded-2xl border-2 p-6 sm:p-10 text-center"
            style={{ borderColor: `${ACCENT}66`, background: "rgba(0,0,0,0.25)" }}
          >
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
              Finding
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              We couldn&rsquo;t find a website for {name}.
            </h1>
            <p className="text-white/70 text-base sm:text-xl mt-4 max-w-xl mx-auto leading-snug">
              That&rsquo;s actually the most important finding on this page — patients
              searching for you are finding nothing, or finding someone else.
            </p>
            <button
              type="button"
              onClick={() => setCtaFlipped(true)}
              className="mt-8 rounded-xl px-8 py-4 font-extrabold text-lg text-[#081C34] transition-opacity hover:opacity-90"
              style={{ background: ACCENT, minHeight: 44 }}
            >
              {ctaFlipped ? "Ask for Clayton — we\u2019ll find you" : "Talk to us at the booth"}
            </button>
          </div>

          <div className="mt-8 text-white/25 text-xs">Esc — new search</div>
        </div>
      </main>
    );
  }

  /* ---------- browse grid: all attendees, alphabetical, sticky letters ---------- */

  if (phase === "browse") {
    const sorted = [...attendees].sort((a, b) => a.name.localeCompare(b.name));
    const groups = new Map<string, Attendee[]>();
    for (const a of sorted) {
      const letter = letterOf(a);
      const list = groups.get(letter) ?? [];
      list.push(a);
      groups.set(letter, list);
    }

    return (
      <main className="relative min-h-screen text-white overflow-hidden" style={{ background: BG }}>
        <MeshBg />
        {networkMode === "cache-first" && (
          <div
            className="fixed top-3 right-3 z-50 w-2 h-2 rounded-full bg-amber-400/60"
            title="Network unreachable — showing pre-run results only"
            aria-hidden
          />
        )}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                All attending practices
              </h1>
              <p className="text-white/45 text-sm mt-1">{attendees.length} practices &middot; tap any to view</p>
            </div>
            <button
              type="button"
              onClick={() => setPhase("input")}
              className="shrink-0 rounded-xl border border-white/15 px-5 text-white/70 hover:text-white hover:border-white/30 font-semibold transition-colors"
              style={{ minHeight: 64 }}
            >
              &larr; Back
            </button>
          </div>

          <div className="space-y-8 pb-10">
            {[...groups.entries()].map(([letter, list]) => (
              <div key={letter}>
                <div
                  className="sticky top-0 z-10 -mx-1 px-1 py-2 mb-3 text-lg font-extrabold"
                  style={{ color: ACCENT, background: BG }}
                >
                  {letter}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {list.map((a) => (
                    <button
                      key={`${a.name}-${a.city}`}
                      type="button"
                      onClick={() => selectAttendee(a)}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#84B83B]/50 transition-colors px-4 flex items-center gap-2 justify-between"
                      style={{ minHeight: 64 }}
                    >
                      <span className="min-w-0 flex flex-col justify-center">
                        <span className="text-sm sm:text-base font-bold leading-tight truncate">
                          {a.name}
                        </span>
                        <span className="text-xs text-white/45 truncate">
                          {a.city}, {a.state}
                        </span>
                      </span>
                      {hasNoWebsite(a) && (
                        <span
                          className="shrink-0 w-2 h-2 rounded-full bg-white/30"
                          title="No site found"
                          aria-label="No site found"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-white/25 text-xs pb-6">Esc — new search</div>
        </div>
      </main>
    );
  }

  /* ---------- input screen ---------- */

  if (phase === "input" || phase === "running") {
    return (
      <main className="relative min-h-screen text-white overflow-hidden" style={{ background: BG }}>
        <MeshBg />
        {networkMode === "cache-first" && (
          <div
            className="fixed top-3 right-3 z-50 w-2 h-2 rounded-full bg-amber-400/60"
            title="Network unreachable — showing pre-run results only"
            aria-hidden
          />
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/inflowmd-final.png"
              alt="InflowMD"
              className="h-8 sm:h-9 w-auto"
            />
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40">
              Site Audit
            </div>
          </div>

          {phase === "running" ? (
            <div className="py-16">
              <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-6">
                {runFailed ? "Audit did not complete" : `Auditing ${domainOf(pendingUrl)}`}
              </div>
<StageList
                scanStage={scanStage}
                stageOutcomes={stageOutcomes}
                resolvedCount={resolvedCount}
                runFailed={runFailed}
              />

              {!runFailed && !stageOutcomes && (
                <div className="mt-8 max-w-xl">
                  <p className="text-white/80 text-base sm:text-xl font-semibold leading-snug">
                    Google is loading this site on a simulated phone and timing every
                    element.
                  </p>
                  <p className="text-white/45 text-sm sm:text-base mt-1.5 leading-snug">
                    A complete test takes about a minute — this is Google&rsquo;s full
                    audit, not a quick scan.
                  </p>
                  <div className="booth-sweep-track mt-4" aria-hidden>
                    <div className="booth-sweep-bar" />
                  </div>
                  {cacheByUrl.has(cacheKey(pendingUrl)) && (
                    <p className="text-white/25 text-xs mt-4">C — show our pre-run version now</p>
                  )}
                </div>
              )}

              {runFailed && (
                <div className="mt-8">
                  <p className="text-amber-300 text-base sm:text-lg">{error}</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => void runLive(pendingUrl, lastRunOptionsRef.current)}
                      className="rounded-lg px-6 font-bold text-[#081C34]"
                      style={{ background: ACCENT, minHeight: 44 }}
                    >
                      Try again
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="rounded-lg border border-white/15 px-6 font-bold text-white/70 hover:text-white"
                      style={{ minHeight: 44 }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* PRIMARY — practice picker */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                Find your practice
              </h1>
              <p className="text-white/50 text-sm sm:text-base mb-5">
                Speed measured by Google PageSpeed Insights — the same test Google runs on
                every site. Search and AI readiness analyzed by InflowMD.
              </p>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a practice name or website…"
                aria-label="Search practices"
                className="w-full rounded-xl bg-white/[0.06] border border-white/15 px-5 py-5 text-xl sm:text-2xl text-white placeholder:text-white/30 outline-none focus:border-[#84B83B]/70"
              />

              <div className="mt-4 space-y-2 max-h-[46vh] overflow-y-auto">
                {matches.length === 0 ? (
                  <div className="text-white/40 py-6 text-lg">
                    No match. Use the field below to audit any site.
                  </div>
                ) : (
                  matches.map((a) => (
                    <button
                      key={`${a.name}-${a.city}`}
                      type="button"
                      onClick={() => selectAttendee(a)}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#84B83B]/50 transition-colors px-5 flex items-center gap-3 justify-between"
                      style={{ minHeight: 72 }}
                    >
                      <span className="min-w-0 flex flex-col justify-center">
                        <span className="text-lg sm:text-xl font-bold leading-tight truncate">
                          {a.name}
                        </span>
                        <span className="text-sm text-white/45 mt-0.5">
                          {a.city}, {a.state}
                        </span>
                      </span>
                      {hasNoWebsite(a) && (
                        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs text-white/35">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                          no site found
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setPhase("browse")}
                className="mt-4 w-full rounded-xl border border-dashed border-white/15 px-5 py-4 text-center text-white/55 hover:text-white hover:border-white/30 transition-colors font-semibold"
                style={{ minHeight: 64 }}
              >
                Browse all attending practices
              </button>

              {/* SECONDARY — walk-up URL, visually subordinate */}
              <div className="mt-10 pt-6 border-t border-white/10">
                <label
                  htmlFor="booth-url"
                  className="block text-[11px] font-bold tracking-[0.22em] uppercase text-white/35 mb-3"
                >
                  Audit a different site
                </label>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runLive(urlInput);
                  }}
                >
                  <input
                    id="booth-url"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="example.com"
                    className="flex-1 rounded-lg bg-white/[0.04] border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/25 outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="rounded-lg px-6 py-3 font-bold text-[#081C34] transition-opacity hover:opacity-90"
                    style={{ background: ACCENT, minHeight: 44 }}
                  >
                    Audit
                  </button>
                </form>
                {error && <p className="mt-3 text-amber-300 text-sm">{error}</p>}
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  /* ---------- result screen ---------- */

  if (!result) return null;
  // Categories are derived from the raw checks, not read from the stored
  // `scores` — so a result cached before the category restructure renders
  // under the new categories with the correct new numbers.
  const categories = buildCategories(result);
  const byKey = Object.fromEntries(categories.map((c) => [c.key, c])) as Record<
    ResolvedCategory["key"],
    ResolvedCategory
  >;
  const perfScore = byKey.speed.score;

  return (
    <main className="min-h-screen text-white" style={{ background: BG }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40">
              {result.fromCache ? "Pre-measured" : "Measured just now"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              {result.practiceName ?? domainOf(result.url)}
            </h1>
            <div className="text-white/45 text-sm">{domainOf(result.url)}</div>
            {fallbackNote && (
              <div className="text-white/35 text-xs mt-1">
                Showing our pre-run audit from{" "}
                {new Date(fallbackNote).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-lg border border-white/15 px-4 text-sm font-bold text-white/70 hover:text-white hover:border-white/40 transition-colors"
            style={{ minHeight: 44 }}
          >
            Esc — New
          </button>
        </div>
        {networkMode === "cache-first" && (
          <div
            className="fixed top-3 right-3 z-50 w-2 h-2 rounded-full bg-amber-400/60"
            title="Network unreachable — showing pre-run results only"
            aria-hidden
          />
        )}

        {/* HERO — the Lighthouse performance score, PSI-style */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <ProvenanceTag provenance="measured" />
          </div>
          <Gauge
            score={perfScore}
            size={240}
            valueClass="text-7xl sm:text-8xl"
          />
          <div className="text-sm text-white/40 mt-4">
            Google PageSpeed Insights · measured{" "}
            {new Date(result.fetchedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          {perfScore === null && (
            <p className="text-white/45 mt-2 max-w-xl text-center text-sm">
              {result.performance.error ??
                "The performance test did not return a result."}
            </p>
          )}
        </div>

        {/* The four categories, each answering its own question. Attribution is
            per-gauge: only the Lighthouse score is Google's. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((c) => (
            <Gauge
              key={c.key}
              label={c.label}
              score={c.score}
              {...(c.key === "speed" ? {} : { verified: c.verified, total: c.total })}
              source={SOURCE_LABEL[c.source]}
            />
          ))}
        </div>

        {/* WHAT WE'D FIX — direction, not proposal. <70 qualifies, worst first. */}
        {(() => {
          const fixes = [
            {
              key: "speed",
              score: byKey.speed.score,
              text: "Rebuild on a modern stack — target under 3 seconds on mobile",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
            },
            {
              key: "aiUnderstand",
              score: byKey.aiUnderstand.score,
              text: "Add medical practice schema so Google and AI know exactly who you are",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                  <path d="M7 8 3 12l4 4" />
                  <path d="m17 8 4 4-4 4" />
                  <path d="m14 4-4 16" />
                </svg>
              ),
            },
            {
              key: "aiFind",
              score: byKey.aiFind.score,
              text: "Open the site to AI assistants and publish a guide they can read",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                  <path d="M12 3v3" />
                  <rect x="5" y="6" width="14" height="12" rx="2" />
                  <path d="M9 12h.01M15 12h.01" />
                  <path d="M9 16h6" />
                </svg>
              ),
            },
            {
              key: "patientsFind",
              score: byKey.patientsFind.score,
              text: "Fix titles, descriptions, and headings so patients find you in search",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              ),
            },
          ]
            .filter((f) => f.score !== null && f.score < 70)
            .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
            .slice(0, 4);
          if (fixes.length === 0) return null;
          return (
            <div className="mb-8">
              <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
                What we&rsquo;d fix
              </div>
              <div className={`grid gap-3 sm:grid-cols-2 ${fixes.length > 2 ? "lg:grid-cols-" + fixes.length : ""}`}>
                {fixes.map((f) => (
                  <div
                    key={f.key}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3"
                  >
                    <span className="shrink-0 mt-0.5">{f.icon}</span>
                    <span className="text-sm sm:text-base text-white/85 leading-snug">
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* LCP — demoted to a labeled, defined metric row */}
        {result.performance.lcp !== null ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white/60 text-sm sm:text-base">
                  Largest Contentful Paint
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-0.5">
                  {result.performance.lcp}s{" "}
                  <span className="text-white/50 text-base sm:text-lg font-semibold">
                    on a simulated mobile connection
                  </span>
                </div>
                <p className="text-white/45 text-sm mt-2 max-w-2xl leading-snug">
                  This is how long the main content takes to appear for a patient on a
                  typical phone network — not on office wifi.
                </p>
              </div>
              <ProvenanceTag provenance="measured" />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/25 bg-white/[0.03] p-5 mb-10">
            <div className="text-lg font-extrabold text-white/70">Speed not measured</div>
            <p className="text-white/45 mt-1 max-w-2xl text-sm">
              {result.performance.error ??
                "The performance test did not return a result, so the speed model is unavailable."}
            </p>
          </div>
        )}

        {/* conversion model */}
        {model ? (
          <>
            <div
              className="rounded-2xl border-2 p-6 sm:p-8 mb-8"
              style={{ borderColor: `${ACCENT}66`, background: `${ACCENT}14` }}
            >
              <div className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                {model.bandLabel}
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
                {model.headline}
              </p>
            </div>

            {/* Default view: the number, one lever, the caveat. */}
            <div className="max-w-xl">
              <Slider
                label="Monthly visitors"
                value={monthlyVisitors}
                min={100}
                max={5000}
                step={100}
                display={monthlyVisitors.toLocaleString("en-US")}
                onChange={setMonthlyVisitors}
              />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-5">
              <p className="text-white/50 text-sm leading-relaxed">{model.caveat}</p>
            </div>

            {/* The full chain and remaining levers, behind an invitation to check us. */}
            <button
              type="button"
              onClick={() => setShowMath((v) => !v)}
              aria-expanded={showMath}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 text-sm sm:text-base font-bold text-white/80 hover:text-white hover:border-white/40 transition-colors"
              style={{ minHeight: 44 }}
            >
              {showMath ? "Hide the math" : "Show the math"}
              <span
                aria-hidden
                className={`transition-transform ${showMath ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {showMath && (
              <div className="mt-5">
                <div className="grid lg:grid-cols-[1fr_360px] gap-6">
                  {/* the chain, provenance intact */}
                  <ol className="space-y-2">
                    {model.steps.map((step, i) => (
                      <li
                        key={step.label}
                        className={`rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-500 ${
                          i < revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-white/60 text-sm sm:text-base">{step.label}</div>
                            <div className="text-xl sm:text-2xl font-extrabold mt-0.5">
                              {step.value}
                            </div>
                          </div>
                          <ProvenanceTag provenance={step.provenance} />
                        </div>
                        {step.source && (
                          <div className="text-[11px] text-white/35 mt-2">
                            {step.sourceUrl ? (
                              <a
                                href={step.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-white/20 hover:decoration-white/60"
                              >
                                {step.source}
                              </a>
                            ) : (
                              step.source
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>

                  {/* the remaining levers */}
                  <div className="space-y-3">
                    <Slider
                      label="How much of the gap is speed?"
                      value={gapCaptureRate}
                      min={0}
                      max={1}
                      step={0.05}
                      display={pct(gapCaptureRate)}
                      onChange={setGapCaptureRate}
                    />
                    <Slider
                      label="Inquiries that become patients"
                      value={closeRate}
                      min={0.05}
                      max={1}
                      step={0.05}
                      display={pct(closeRate)}
                      onChange={setCloseRate}
                    />
                    <Slider
                      label="Value per patient"
                      value={avgPatientValue}
                      min={500}
                      max={10000}
                      step={250}
                      display={usd(avgPatientValue)}
                      onChange={setAvgPatientValue}
                    />
                  </div>
                </div>
                <p className="mt-4 text-white/35 text-xs">{model.supportingStat}</p>
              </div>
            )}
          </>
        ) : null}

        {/* COMPARISON — only against a failing score, never against ourselves */}
        {perfScore !== null &&
          perfScore < 90 &&
          domainOf(result.url).replace(/^www\./, "") !== COMPARISON_HOST && (
            <ComparisonBlock
              key={`${result.url}-${result.fetchedAt}`}
              their={result}
              onRan={() => setComparisonRan(true)}
            />
          )}

        {/* check detail, grouped under the question each category answers —
            could_not_verify styled neutrally, never as failure */}
        <div className="mt-10">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
            What we checked
          </div>
          <div className="space-y-6">
            {categories
              .filter((c) => c.checks.length > 0)
              .map((c) => (
                <div key={c.key}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-white/90">
                      {c.label}
                    </h3>
                    <span
                      className="text-sm font-extrabold tabular-nums shrink-0"
                      style={{ color: gaugeColor(c.score) }}
                    >
                      {c.score === null ? "—" : c.score}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {c.checks.map((check) => (
                      <FindingRow key={check.id} check={check} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* CLOSING CTA — the conversation, not a form */}
        <div
          className="mt-10 rounded-2xl border-2 p-6 sm:p-10 text-center"
          style={{ borderColor: `${ACCENT}66`, background: "rgba(0,0,0,0.25)" }}
        >
          {ctaFlipped ? (
            <p className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Ask for Clayton — or leave the site up and we&rsquo;ll find you.
            </p>
          ) : (
            <>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                Every one of these is fixable.
              </h2>
              <p className="text-white/55 text-base sm:text-lg mt-2 max-w-2xl mx-auto">
                {comparisonRan
                  ? "You just watched the difference. We rebuild medical practice sites to pass this exact audit — most in under 30 days."
                  : "We rebuild medical practice sites to pass this exact audit — most in under 30 days."}
              </p>
              <button
                type="button"
                onClick={() => setCtaFlipped(true)}
                className="mt-6 rounded-xl px-8 py-4 font-extrabold text-lg text-[#081C34] transition-opacity hover:opacity-90"
                style={{ background: ACCENT, minHeight: 44 }}
              >
                Talk to us at the booth
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-white/25 text-xs">
          Esc — new audit · R — re-run live · C — pre-run version
        </div>
      </div>
    </main>
  );
}
