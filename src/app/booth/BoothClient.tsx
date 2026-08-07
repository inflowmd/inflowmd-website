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

const SCAN_STAGES = [
  "Measuring load speed",
  "Reading the page",
  "Checking structured data",
  "Checking AI crawler access",
  "Building the model",
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

/* ---------- score tile ---------- */

function ScoreTile({
  label,
  score,
  verified,
  total,
}: {
  label: string;
  score: number | null;
  verified?: number;
  total?: number;
}) {
  const tone =
    score === null
      ? "text-white/40"
      : score >= 90
        ? "text-[#84B83B]"
        : score >= 50
          ? "text-amber-300"
          : "text-red-400";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 min-w-0">
      <div className={`text-4xl sm:text-5xl font-extrabold tabular-nums leading-none ${tone}`}>
        {score === null ? "—" : score}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-white/55 mt-2 leading-snug">
        {label}
      </div>
      {typeof verified === "number" && typeof total === "number" && (
        <div className="text-[11px] text-white/35 mt-1 tabular-nums">
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
  /** True once the run has been going long enough to reassure the visitor. */
  const [slowRun, setSlowRun] = useState(false);
  /** The run finished without a result — stages must show "not completed". */
  const [runFailed, setRunFailed] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  /** How many model beats are visible; large number = all (cached path). */
  const [revealed, setRevealed] = useState(999);

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
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (slowTimer.current) clearTimeout(slowTimer.current);
    revealTimer.current = null;
    scanTimer.current = null;
    slowTimer.current = null;
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
    setSlowRun(false);
    setRunFailed(false);
    setPendingUrl("");
  }, [clearTimers]);

  /** Cached path — no network, no reveal sequence. */
  const selectPractice = useCallback(
    (p: AuditResult) => {
      clearTimers();
      setError(null);
      setResult(p);
      setRevealed(999);
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
      setSlowRun(false);
      setPhase("running");
      setScanStage(0);
      setPendingUrl(target);

      // The stage list is a narrative of what the server is doing. It never
      // marks anything complete — we have no progress events, so a green tick
      // here would be a claim we cannot support.
      scanTimer.current = setInterval(() => {
        setScanStage((s) => Math.min(s + 1, SCAN_STAGES.length - 1));
      }, 1600);
      // Google's measurement can genuinely take a minute; say so rather than
      // letting a booth visitor conclude it has hung.
      slowTimer.current = setTimeout(() => setSlowRun(true), 15_000);

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
        setResult(data);
        setPhase("result");
        // Stagger paces the display of results that have ALREADY arrived.
        setRevealed(0);
        revealTimer.current = setInterval(() => {
          setRevealed((n) => n + 1);
        }, 380);
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
      <main className="min-h-screen text-white" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="font-extrabold text-xl tracking-tight">
              Inflow<span style={{ color: ACCENT }}>MD</span>
            </div>
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
                  // Nothing here is ever marked complete. We receive no
                  // progress events, so a green tick would assert a result we
                  // do not have. Only the active line is emphasised.
                  const active = !runFailed && i === scanStage;
                  const reached = !runFailed && i <= scanStage;
                  return (
                    <li
                      key={stage}
                      className="flex items-center gap-4 text-lg sm:text-2xl font-bold"
                    >
                      <span
                        className={`inline-block w-3 h-3 rounded-full shrink-0 ${
                          active ? "animate-pulse" : ""
                        }`}
                        style={{
                          background: runFailed
                            ? "rgba(255,255,255,0.18)"
                            : active
                              ? "rgba(255,255,255,0.75)"
                              : "rgba(255,255,255,0.22)",
                        }}
                      />
                      <span
                        className={
                          runFailed ? "text-white/35" : reached ? "text-white" : "text-white/35"
                        }
                      >
                        {stage}
                        {active ? "…" : ""}
                      </span>
                      {runFailed && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                          not completed
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {slowRun && !runFailed && (
                <p className="mt-8 text-white/55 text-base sm:text-lg max-w-xl leading-snug">
                  Still working — Google is measuring the site, this can take a minute.
                </p>
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
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5">
                Find your practice
              </h1>
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

        {/* HERO — the one measured number everything flows from */}
        {result.performance.lcp !== null ? (
          <div className="mb-8">
            <div className="mb-3">
              <ProvenanceTag provenance="measured" />
            </div>
            <div className="text-lg sm:text-xl md:text-2xl text-white/70 leading-snug max-w-3xl">
              On a typical phone connection, Google measures your main content at
            </div>
            <div
              className="font-extrabold tabular-nums leading-[0.85] mt-1"
              style={{ fontSize: "clamp(180px, 26vw, 240px)", color: ACCENT }}
            >
              {result.performance.lcp}
              <span className="text-[0.35em] text-white/50">s</span>
            </div>
            <div className="text-sm text-white/40 mt-3">
              Google PageSpeed Insights · Lighthouse LCP (mobile)
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-dashed border-white/25 bg-white/[0.03] p-6">
            <div className="text-2xl font-extrabold text-white/70">Speed not measured</div>
            <p className="text-white/45 mt-2 max-w-2xl">
              {result.performance.error ??
                "The performance test did not return a result, so the speed model below is unavailable."}
            </p>
          </div>
        )}

        {/* scores with verified counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <ScoreTile label="Performance" score={s.performance} />
          <ScoreTile label="Search basics" score={s.seo} verified={s.seoVerified} total={s.seoTotal} />
          <ScoreTile
            label="Structured data"
            score={s.schema}
            verified={s.schemaVerified}
            total={s.schemaTotal}
          />
          <ScoreTile
            label="AI readiness"
            score={s.aiReadiness}
            verified={s.aiReadinessVerified}
            total={s.aiReadinessTotal}
          />
        </div>

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

            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              {/* the chain, revealed as beats */}
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

              {/* sliders — always visible, never behind a toggle */}
              <div className="space-y-3">
                <Slider
                  label="Monthly visitors"
                  value={monthlyVisitors}
                  min={100}
                  max={5000}
                  step={100}
                  display={monthlyVisitors.toLocaleString("en-US")}
                  onChange={setMonthlyVisitors}
                />
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

            <div className="mt-6 rounded-xl border border-white/10 bg-black/25 p-5">
              <p className="text-white/50 text-sm leading-relaxed">{model.caveat}</p>
              <p className="text-white/35 text-xs mt-3">{model.supportingStat}</p>
            </div>
          </>
        ) : null}

        {/* check detail — could_not_verify styled neutrally, never as failure */}
        <div className="mt-10">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
            What we checked
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {allChecks.map((c) => {
              const st = STATUS_STYLE[c.status];
              return (
                <div
                  key={c.id}
                  className={`rounded-lg border bg-white/[0.02] px-4 py-3 flex items-center gap-3 ${
                    c.status === "could_not_verify"
                      ? "border-dashed border-white/15"
                      : "border-white/10"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
                  <span className="text-sm text-white/80 flex-1 min-w-0 truncate">{c.label}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${st.text}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-white/25 text-xs">
          Esc — new audit · R — re-run live
        </div>
      </div>
    </main>
  );
}
