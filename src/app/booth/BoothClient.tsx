"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuditResult, Check } from "@/types/audit";
import {
  buildConversionModel,
  MODEL_DEFAULTS,
  type Provenance,
} from "@/lib/conversionModel";

/* ============================================================
   Booth audit UI.

   Two paths in: a type-ahead picker over the pre-warmed practices, which
   renders instantly, and a URL field for walk-ups, which runs live with a
   progressive reveal. Escape returns to input; R re-runs live.
   ============================================================ */

const BG = "#081C34";
const ACCENT = "#84B83B";

type Phase = "input" | "running" | "result";

/** Matches the route's maxDuration so the client never gives up first. */
const CLIENT_TIMEOUT_MS = 150_000;

/**
 * Each stage names its source. A line only ever resolves to its `done` label
 * after the response has actually arrived — never on a timer.
 */
const SCAN_STAGES = [
  {
    running: "Connecting to Google PageSpeed Insights…",
    done: "Google measurement received",
    featured: true,
  },
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
];

/* ---------- formatting ---------- */

const usd = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (r: number) => `${Math.round(r * 100)}%`;
const domainOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
    "An emerging standard: a short guide telling AI assistants what the site is about and which pages matter most. Few practices have one yet.",
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

/* ---------- circular gauge, Google PageSpeed color conventions ---------- */

/** 0–49 red, 50–89 amber, 90–100 green — exactly the bands PSI uses. */
function gaugeColor(score: number | null): string {
  if (score === null) return "rgba(255,255,255,0.3)";
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function Gauge({
  score,
  label,
  verified,
  total,
  size = 110,
  valueClass = "text-3xl",
}: {
  score: number | null;
  label?: string;
  verified?: number;
  total?: number;
  size?: number;
  valueClass?: string;
}) {
  const color = gaugeColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = score === null ? circumference : circumference * (1 - score / 100);
  return (
    <div className="flex flex-col items-center min-w-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="8"
            stroke={score === null ? "rgba(255,255,255,0.12)" : `${color}29`}
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="8"
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-extrabold tabular-nums ${valueClass}`}
            style={{ color: score === null ? "rgba(255,255,255,0.4)" : color }}
          >
            {score === null ? "—" : score}
          </span>
        </div>
      </div>
      {label && (
        <div className="text-[11px] uppercase tracking-wider text-white/55 mt-2 text-center leading-snug">
          {label}
        </div>
      )}
      {typeof verified === "number" && typeof total === "number" && (
        <div className="text-[11px] text-white/35 mt-0.5 tabular-nums">
          {verified} of {total} verified
        </div>
      )}
    </div>
  );
}

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

/* ============================================================ */

export default function BoothClient({ practices }: { practices: AuditResult[] }) {
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanStage, setScanStage] = useState(0);
  /** The run finished without a result — stages must show "not completed". */
  const [runFailed, setRunFailed] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  /** How many model beats are visible; large number = all (cached path). */
  const [revealed, setRevealed] = useState(999);
  /** Per-stage outcomes, set only once the response has actually arrived. */
  const [stageOutcomes, setStageOutcomes] = useState<boolean[] | null>(null);
  /** The full chain and secondary sliders live behind this. */
  const [showMath, setShowMath] = useState(false);
  /** Booth CTA card flips to the in-person instruction when tapped. */
  const [ctaFlipped, setCtaFlipped] = useState(false);

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

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return practices;
    return practices.filter((p) => {
      const name = (p.practiceName ?? "").toLowerCase();
      return name.includes(q) || domainOf(p.url).toLowerCase().includes(q);
    });
  }, [query, practices]);

  const clearTimers = useCallback(() => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (scanTimer.current) clearInterval(scanTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    revealTimer.current = null;
    scanTimer.current = null;
    holdTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("input");
    setResult(null);
    setError(null);
    setQuery("");
    setUrlInput("");
    setRevealed(999);
    setRunFailed(false);
    setPendingUrl("");
    setStageOutcomes(null);
    setShowMath(false);
    setCtaFlipped(false);
  }, [clearTimers]);

  /** Cached path — no network, no reveal sequence. */
  const selectPractice = useCallback(
    (p: AuditResult) => {
      clearTimers();
      setError(null);
      setResult(p);
      setRevealed(999);
      setShowMath(false);
      setCtaFlipped(false);
      setPhase("result");
    },
    [clearTimers]
  );

  /** Live path — progressive reveal of RESOLVED results only. */
  const runLive = useCallback(
    async (rawUrl: string, force = false) => {
      const target = rawUrl.trim();
      if (!target) return;
      clearTimers();
      setError(null);
      setResult(null);
      setRunFailed(false);
      setStageOutcomes(null);
      setShowMath(false);
      setCtaFlipped(false);
      setPhase("running");
      setScanStage(0);
      setPendingUrl(target);

      // The stage list is a narrative of what the server is doing. It never
      // marks anything complete — we have no progress events, so a green tick
      // here would be a claim we cannot support.
      scanTimer.current = setInterval(() => {
        setScanStage((s) => Math.min(s + 1, SCAN_STAGES.length - 1));
      }, 1600);

      // Matches the route's 150s ceiling so the client never gives up first.
      const controller = new AbortController();
      abortRef.current = controller;
      const clientTimeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

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
        clearTimers();
        // The response is here — each line may now resolve, and only from what
        // the data actually says. A stage whose work did not complete stays
        // neutral rather than ticking green.
        setStageOutcomes([
          data.performance.available,
          data.htmlFetch.ok,
          data.scores.seo !== null,
          data.scores.aiReadiness !== null,
          data.scores.schema !== null,
        ]);
        setScanStage(SCAN_STAGES.length - 1);
        // Brief hold so the resolutions are visible before the report opens.
        holdTimer.current = setTimeout(() => {
          setResult(data);
          setPhase("result");
          // Stagger paces the display of results that have ALREADY arrived.
          setRevealed(0);
          revealTimer.current = setInterval(() => {
            setRevealed((n) => n + 1);
          }, 380);
        }, 1100);
      } catch (err) {
        clearTimers();
        const aborted = err instanceof Error && err.name === "AbortError";
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
    [clearTimers]
  );

  // Stop the reveal timer once every beat is showing.
  useEffect(() => {
    const steps = model?.steps.length ?? 0;
    if (revealTimer.current && revealed > steps) {
      clearInterval(revealTimer.current);
      revealTimer.current = null;
    }
  }, [revealed, model]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Escape returns to input; R re-runs live with force.
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
        void runLive(result.url, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset, runLive, result]);

  useEffect(() => {
    if (phase === "input") searchRef.current?.focus();
  }, [phase]);

  /* ---------- input screen ---------- */

  if (phase === "input" || phase === "running") {
    return (
      <main className="relative min-h-screen text-white overflow-hidden" style={{ background: BG }}>
        {/* Animated mesh, tuned dark with lime accents — subtle enough that
            practice names stay high-contrast. */}
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
              <ul className="space-y-4">
                {SCAN_STAGES.map((stage, i) => {
                  // While the response is in flight nothing resolves — a tick
                  // would assert a result we do not have. Once stageOutcomes
                  // arrives, each line resolves from what the data says.
                  const outcome = stageOutcomes ? stageOutcomes[i] : null;
                  const resolvedOk = outcome === true;
                  const unresolvedFail = runFailed || outcome === false;
                  const active = !runFailed && !stageOutcomes && i === scanStage;
                  const reached = !runFailed && (stageOutcomes !== null || i <= scanStage);
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
                </div>
              )}

              {runFailed && (
                <div className="mt-8">
                  <p className="text-amber-300 text-base sm:text-lg">{error}</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => void runLive(pendingUrl, true)}
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
                Built on Google PageSpeed Insights — the same test Google runs on every
                site.
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
                  matches.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => selectPractice(p)}
                      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#84B83B]/50 transition-colors px-5 flex flex-col justify-center"
                      style={{ minHeight: 72 }}
                    >
                      <span className="text-lg sm:text-xl font-bold leading-tight">
                        {p.practiceName ?? domainOf(p.url)}
                      </span>
                      <span className="text-sm text-white/45 mt-0.5">{domainOf(p.url)}</span>
                    </button>
                  ))
                )}
              </div>

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
  const s = result.scores;
  const allChecks = [...result.seo, ...result.schema, ...result.aiReadiness];

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

        {/* HERO — the Lighthouse performance score, PSI-style */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <ProvenanceTag provenance="measured" />
          </div>
          <Gauge
            score={s.performance}
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
          {s.performance === null && (
            <p className="text-white/45 mt-2 max-w-xl text-center text-sm">
              {result.performance.error ??
                "The performance test did not return a result."}
            </p>
          )}
        </div>

        {/* the four category gauges, verified counts kept */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Gauge label="Performance" score={s.performance} />
          <Gauge label="Search basics" score={s.seo} verified={s.seoVerified} total={s.seoTotal} />
          <Gauge
            label="Structured data"
            score={s.schema}
            verified={s.schemaVerified}
            total={s.schemaTotal}
          />
          <Gauge
            label="AI readiness"
            score={s.aiReadiness}
            verified={s.aiReadinessVerified}
            total={s.aiReadinessTotal}
          />
        </div>

        {/* WHAT WE'D FIX — direction, not proposal. <70 qualifies, worst first. */}
        {(() => {
          const fixes = [
            {
              key: "performance",
              score: s.performance,
              text: "Rebuild on a modern stack — target under 3 seconds on mobile",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
            },
            {
              key: "schema",
              score: s.schema,
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
              key: "aiReadiness",
              score: s.aiReadiness,
              text: "Open the site to AI assistants and add machine-readable practice info",
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
              key: "seo",
              score: s.seo,
              text: "Fix titles, descriptions, and heading structure for search",
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

        {/* check detail — could_not_verify styled neutrally, never as failure */}
        <div className="mt-10">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
            What we checked
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {allChecks.map((c) => (
              <FindingRow key={c.id} check={c} />
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
                We rebuild medical practice sites to pass this exact audit — most in
                under 30 days.
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
          Esc — new audit · R — re-run live
        </div>
      </div>
    </main>
  );
}
