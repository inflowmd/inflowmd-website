"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import type { AuditResult, Check } from "@/types/audit";
import { Gauge, gaugeColor } from "./Gauge";
import {
  buildConversionModel,
  MODEL_DEFAULTS,
} from "@/lib/conversionModel";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { cacheKey } from "@/lib/cache";
import { attendeeMatches, hasNoWebsite, letterOf, type Attendee } from "@/lib/attendees";
import {
  buildCategories,
  type CategoryItem,
  type CategoryKey,
  type ResolvedCategory,
} from "@/lib/categories";
import { speedMetrics, type SpeedBand } from "@/lib/speedMetrics";
import { buildVerdict, type Verdict, type VerdictTone } from "@/lib/verdict";
import { CHECK_EXPLANATIONS } from "@/lib/checkExplanations";
import { isValidEmail } from "@/lib/lead";
import { missingSpeedFallbackReason } from "@/lib/liveFallback";

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
 *  Canonical final URL — auditing the apex would eat a ~780ms redirect penalty.
 *  Whatever sits here must also be in NON_COUNTED_DOMAINS: this runs a real
 *  live audit every time a report is opened, so otherwise the booth counter
 *  would fill up with our own comparison runs. */
const COMPARISON_SITE = "https://centerforveincareandsurgery.com";
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

const domainOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Attribution shown under each category gauge. Only the Lighthouse score is
 *  Google's — the other three are our own analysis and must say so. */
/** The "checking medical practice identification" stage resolves when that
 *  check actually returned a verdict — not merely when the run finished. */
function medicalIdentificationResolved(r: AuditResult): boolean {
  const check = [...(r.seo ?? []), ...(r.schema ?? []), ...(r.aiReadiness ?? [])].find(
    (c) => c.id === "schema.medical"
  );
  return check !== undefined && check.status !== "could_not_verify";
}

/** Anchor a gauge can scroll to. */
const sectionId = (key: CategoryKey) => `findings-${key}`;

function scrollToSection(key: CategoryKey): void {
  const el = document.getElementById(sectionId(key));
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** Google's own wording for the metric bands, colored like the gauges. */
const SPEED_BAND_STYLE: Record<SpeedBand, { label: string; color: string }> = {
  good: { label: "Good", color: "#0cce6b" },
  "needs-improvement": { label: "Needs improvement", color: "#ffa400" },
  poor: { label: "Poor", color: "#ff4e42" },
};

const SOURCE_LABEL: Record<string, string> = {
  google: "Google PageSpeed Insights",
  inflowmd: "InflowMD analysis",
};

/* ---------- provenance + status styling ---------- */

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
  // Neutral grey, and deliberately NOT the could_not_verify treatment either:
  // "we did not check" and "this does not apply to you" are different claims.
  not_applicable: {
    dot: "bg-slate-500/60",
    text: "text-slate-400",
    label: "Not applicable",
  },
};

/**
 * What this check cost, in the category's own points. Shown only for weighted
 * categories — an unweighted one has no meaningful per-check arithmetic.
 */
function impactLine(item: CategoryItem): string {
  // An inapplicable check has no points line at all — there is nothing lost,
  // nothing earned, and nothing for the reader to act on.
  if (!item.applicable) return "";
  if (!item.counted) return `${item.weight} points excluded \u2014 not checked`;
  if (item.pointsLost === 0) return `${item.weight} of ${item.weight} points earned`;
  const lost = Number.isInteger(item.pointsLost) ? item.pointsLost : item.pointsLost.toFixed(1);
  return `${lost} of ${item.weight} points lost`;
}

/** One findings row — collapsed exactly as before, expandable for the why. */
function FindingRow({
  check,
  impact,
  defaultOpen = false,
}: {
  check: Check;
  impact?: CategoryItem;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const st = STATUS_STYLE[check.status];
  // The stock explanation tells the reader how to FIX the check. For a check
  // that does not apply there is nothing to fix, and showing "add medical
  // schema" under "Not applicable" would contradict the status. check.detail
  // carries the reason instead.
  const explanation =
    check.status === "not_applicable" ? undefined : CHECK_EXPLANATIONS[check.id];
  return (
    <div
      className={`rounded-lg border bg-white/[0.02] ${
        check.status === "could_not_verify"
          ? "border-dashed border-white/15"
          : check.status === "not_applicable"
            ? "border-slate-500/25"
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
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-white/80 truncate">{check.label}</span>
          {impact && impactLine(impact) && (
            <span
              className={`block text-[11px] tabular-nums ${
                impact.pointsLost > 0 ? "text-white/55" : "text-white/35"
              }`}
            >
              {impactLine(impact)}
            </span>
          )}
        </span>
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
          className={`booth-no-print w-4 h-4 shrink-0 text-white/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {/* Always in the DOM, hidden by class — print reveals every detail, and
          a stylesheet cannot un-hide markup that was never rendered. */}
      <div className={`px-4 pb-3.5 pl-[38px] ${open ? "" : "booth-collapsed"}`}>
        {explanation && (
          <p className="text-sm text-white/60 leading-snug">{explanation}</p>
        )}
        <p className="text-xs text-white/40 mt-1.5 leading-snug">{check.detail}</p>
      </div>
    </div>
  );
}

/**
 * A category's checks, split by what the doctor needs to see.
 *
 * Anything costing points is shown expanded — that is the evidence for the
 * score, and it should not take a click to read. Passing checks collapse
 * behind a count so the section stays short without hiding anything.
 *
 * could_not_verify sits with the visible rows rather than under "passing":
 * it is not a pass, and filing it there would quietly overstate the site.
 * It stays collapsed, because there is nothing to act on yet.
 */
function CheckList({ category }: { category: ResolvedCategory }) {
  const [showPassing, setShowPassing] = useState(false);
  const passing = category.items.filter((i) => i.check.status === "pass");
  const rest = category.items.filter((i) => i.check.status !== "pass");

  return (
    <>
      {rest.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2">
          {rest.map((item) => (
            <FindingRow
              key={item.check.id}
              check={item.check}
              impact={category.weighted ? item : undefined}
              defaultOpen={item.check.status === "fail" || item.check.status === "warn"}
            />
          ))}
        </div>
      )}

      {rest.length === 0 && (
        <p className="text-white/50 text-sm mb-2">Everything we could check here passed.</p>
      )}

      {passing.length > 0 && (
        <div className={rest.length > 0 ? "mt-3" : ""}>
          <button
            type="button"
            onClick={() => setShowPassing((v) => !v)}
            aria-expanded={showPassing}
            className="booth-no-print inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-sm font-bold text-white/60 hover:text-white hover:border-white/30 transition-colors"
            style={{ minHeight: 44 }}
          >
            {passing.length} passing check{passing.length === 1 ? "" : "s"}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`booth-no-print w-4 h-4 transition-transform ${showPassing ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div className={`grid sm:grid-cols-2 gap-2 mt-2 ${showPassing ? "" : "booth-collapsed"}`}>
            {passing.map((item) => (
              <FindingRow
                key={item.check.id}
                check={item.check}
                impact={category.weighted ? item : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The other route out that sits beside the email capture.
 *
 * Deliberately quieter than the send button — an outline button against its
 * solid lime fill — so the email stays the primary action. Rendered in BOTH
 * the form and the confirmation state: someone who has just handed over their
 * address is the most engaged they will be all day, and that is the worst
 * possible moment to remove the next step.
 *
 * The "or book a call" text link used to live here. Booking has its own card
 * beside this one now, so this is the only thing left in the row.
 */
function SecondaryActions({ className = "" }: { className?: string }) {
  return (
    <div
      className={`booth-no-print mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 ${className}`}
    >
      <a
        href="/why-nextjs"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 text-sm sm:text-base font-semibold text-white/80 hover:text-white hover:border-white/45 transition-colors"
        style={{ minHeight: 48 }}
      >
        How we fix all of this →
      </a>
    </div>
  );
}

/**
 * Lead capture. Two fields, because a third is a reason to walk away.
 *
 * The practice, its URL, the scores and the findings all come from the report
 * already on screen — a doctor should never be asked to retype what we just
 * measured for them.
 *
 * The submit never fails in the visitor's face: the route answers 200 even
 * when the mail service is down, so the only error path here is a network
 * drop, and that offers a retry rather than a dead end.
 */
function LeadForm({
  result,
  categories,
  verdict,
}: {
  result: AuditResult;
  categories: ResolvedCategory[];
  verdict: Verdict | null;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sentTo, setSentTo] = useState("");

  const byKey = Object.fromEntries(categories.map((c) => [c.key, c])) as Record<
    ResolvedCategory["key"],
    ResolvedCategory
  >;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("sending");

    const issues = categories
      .flatMap((c) => c.items)
      .filter((i) => i.check.status === "fail" || i.check.status === "warn")
      .map((i) => ({ id: i.check.id, label: i.check.label, status: i.check.status }));

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          report: {
            practiceName: result.practiceName ?? null,
            url: result.url,
            measuredAt: result.fetchedAt,
            fromCache: result.fromCache,
            verdict: verdict ? { headline: verdict.headline, subline: verdict.subline } : null,
            scores: {
              ai: byKey.ai.score,
              patientsFind: byKey.patientsFind.score,
              speed: byKey.speed.score,
            },
            issues,
          },
        }),
      });
      if (!res.ok) throw new Error(`lead endpoint returned ${res.status}`);
      setSentTo(email.trim());
      setState("sent");
    } catch (err) {
      console.error("[LEAD] submit failed", err);
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div
        className="booth-no-print flex h-full flex-col items-center justify-center rounded-2xl border-2 p-6 sm:p-10 text-center"
        style={{ borderColor: `${ACCENT}66`, background: `${ACCENT}14` }}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">Sent to {sentTo}</h2>
        <p className="text-white/70 text-base sm:text-lg mt-2">
          Check your inbox — I&rsquo;ll follow up next week.
        </p>
        <SecondaryActions className="sm:justify-center" />
      </div>
    );
  }

  return (
    <div
      className="booth-no-print flex h-full flex-col justify-center rounded-2xl border-2 p-6 sm:p-10"
      style={{ borderColor: `${ACCENT}66`, background: "rgba(0,0,0,0.25)" }}
    >
      <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-center">
        Want this report?
      </h2>
      <p className="text-white/60 text-base sm:text-lg mt-2 mb-6 text-center">
        We&rsquo;ll email you the full audit, plus what we&rsquo;d fix first.
      </p>

      {/* One column: at half the container width a pair of side-by-side
          64px fields is narrower than the addresses typed into them. */}
      <form onSubmit={submit} className="w-full max-w-xl mx-auto grid gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/45">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="you@practice.com"
            aria-label="Email address"
            className="rounded-xl bg-white/[0.06] border border-white/15 px-5 text-lg sm:text-xl text-white placeholder:text-white/25 outline-none focus:border-[#84B83B]/70"
            style={{ minHeight: 64 }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/45">
            Phone <span className="text-white/25">(optional)</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            aria-label="Phone number, optional"
            className="rounded-xl bg-white/[0.06] border border-white/15 px-5 text-lg sm:text-xl text-white placeholder:text-white/25 outline-none focus:border-[#84B83B]/70"
            style={{ minHeight: 64 }}
          />
        </label>

        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-xl px-8 font-extrabold text-lg text-[#081C34] transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: ACCENT, minHeight: 64 }}
        >
          {state === "sending" ? "Sending…" : "Send me this report"}
        </button>

        {state === "error" && (
          <p className="text-amber-300 text-sm text-center">
            {isValidEmail(email)
              ? "That didn't go through. Tap send once more."
              : "Please enter a valid email address."}
          </p>
        )}
      </form>

      <SecondaryActions />
    </div>
  );
}

declare global {
  interface Window {
    Calendly?: { initPopupWidget(options: { url: string }): void };
  }
}

/**
 * The strategy call, offered beside the report request rather than under it.
 *
 * The calendar used to be embedded inline here, and at the 1250px it needed
 * to render without its own scrollbar it owned the screen — wrong for a booth,
 * where this page is scrolled past while someone is talking. It is a modal
 * now: the calendar opens over the report and closes back onto it, so the
 * findings never leave the screen.
 *
 * THIS IS A LINK, NOT A BUTTON. The popup is Calendly's script talking to
 * Calendly's script; if widget.js has not landed yet, or is blocked by the
 * venue's wifi, a button would be dead and the doctor would have no way to
 * book. The anchor's href is the real booking page, and the click only
 * cancels the navigation once the popup API is actually there to take over.
 */
function CallCard() {
  function openPopup(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!window.Calendly?.initPopupWidget) return; // let the href do its job
    e.preventDefault();
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  }

  return (
    <div
      className="booth-no-print flex h-full flex-col items-center justify-center rounded-2xl border-2 p-6 sm:p-10 text-center"
      style={{ borderColor: `${ACCENT}66`, background: "rgba(0,0,0,0.25)" }}
    >
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      {/* The popup's own styling. React hoists this into the head; without it
          the overlay renders as an unstyled full-page block. */}
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />

      <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">Prefer to talk?</h2>
      <p className="text-white/60 text-base sm:text-lg mt-2 mb-6">
        Book a 15-minute call &mdash; we&rsquo;ll walk through these findings together.
      </p>
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={openPopup}
        className="w-full max-w-sm inline-flex items-center justify-center rounded-xl px-8 font-extrabold text-lg text-[#081C34] transition-opacity hover:opacity-90"
        style={{ background: ACCENT, minHeight: 64 }}
      >
        Book a strategy call
      </a>
    </div>
  );
}

/**
 * The two ways out, side by side and weighted the same: take the report away,
 * or talk it through. Stacked on a phone with the report first — that is the
 * one that works without a calendar in front of you.
 */
function NextSteps({
  result,
  categories,
  verdict,
}: {
  result: AuditResult;
  categories: ResolvedCategory[];
  verdict: Verdict | null;
}) {
  return (
    <div className="booth-no-print mt-10 grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <LeadForm result={result} categories={categories} verdict={verdict} />
      <CallCard />
    </div>
  );
}

/** The call both the popup and its fallback link open onto. */
const CALENDLY_URL = "https://calendly.com/inflowmd/strategy-call";

/** Short date for the speed gauge's attribution line. */
const measuredOn = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Banner accent per verdict tone. */
const VERDICT_TONE_COLOR: Record<VerdictTone, string> = {
  critical: "#ff4e42",
  weak: "#ffa400",
  fine: ACCENT,
};

/**
 * The verdict — one headline, readable across a booth aisle, chosen from all
 * three category scores by the matrix in src/lib/verdict.ts.
 *
 * Silent when nothing could be verified: with no measured category there is
 * no honest statement to make.
 */
function VerdictBanner({ verdict }: { verdict: Verdict | null }) {
  if (!verdict) return null;
  const accent = VERDICT_TONE_COLOR[verdict.tone];
  return (
    <div
      className="booth-verdict rounded-2xl border-2 p-6 sm:p-8 mb-8"
      style={{ borderColor: `${accent}66`, background: `${accent}14` }}
    >
      <div
        className="text-[11px] font-bold tracking-[0.22em] uppercase mb-2"
        style={{ color: accent }}
      >
        Verdict
      </div>
      <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">{verdict.headline}</h2>
      <p className="text-white/70 text-base sm:text-xl mt-3 max-w-3xl leading-snug">
        {verdict.subline}
      </p>
    </div>
  );
}

/**
 * The speed section's body: the patient-wait sentence the model already
 * produces, then the Lighthouse metrics behind the score with Google's own
 * thresholds. These are Google's numbers, not our checks — no weights, no
 * point costs, and a metric we do not have a value for is omitted rather
 * than rendered as a hole.
 */
function SpeedSection({ performance }: { performance: AuditResult["performance"] }) {
  const metrics = speedMetrics(performance);

  if (!performance.available) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.02] p-4">
        <p className="text-white/55 text-sm">
          {performance.error ?? "Google did not return a speed measurement for this page."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {performance.lcp !== null && (
        <p className="text-white/80 text-base sm:text-lg font-semibold leading-snug mb-4">
          On a typical phone connection, a patient waits {performance.lcp} seconds for the main
          content to appear.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-2">
        {metrics.map((m) => {
          const band = SPEED_BAND_STYLE[m.band];
          return (
            <div key={m.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-white/80 min-w-0">{m.label}</span>
                <span
                  className="text-lg font-extrabold tabular-nums shrink-0"
                  style={{ color: band.color }}
                >
                  {m.display}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 mt-0.5">
                <span className="text-[11px] text-white/40">{m.thresholdNote}</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-wider shrink-0"
                  style={{ color: band.color }}
                >
                  {band.label}
                </span>
              </div>
              <p className="text-xs text-white/45 mt-1.5 leading-snug">{m.meaning}</p>
            </div>
          );
        })}
      </div>
      {metrics.length === 0 && (
        <p className="text-white/45 text-sm">
          Google returned a score but no individual metrics for this page.
        </p>
      )}
    </div>
  );
}

/* Gauge lives in ./Gauge — shared with the /pitch deck. */

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
function ComparisonBlock({ their }: { their: AuditResult }) {
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
        data.scores.ai !== null,
        medicalIdentificationResolved(data),
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
  }, [clearAll]);

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
          Run this same test on a modern build
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
        <Gauge score={ourPerf} label="Modern architecture" size={150} valueClass="text-4xl" />
      </div>

      {/* Names what the two rings differ BY. Without it the right-hand ring is
          just a better number; with it, it is a different way of building. */}
      <p className="mt-4 text-center text-sm sm:text-base font-semibold tracking-wide text-white/45">
        Same test. Same day. Different architecture.
      </p>

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
          { title: "Modern architecture", r: comparison },
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

      {/* Small and muted on purpose: this answers the objection the two rings
          provoke ("so tune mine"), and an objection-killer that shouts reads
          as a sales line rather than an explanation. */}
      <p className="mt-6 text-center text-sm text-white/40 leading-snug">
        The gap isn&rsquo;t tuning. It&rsquo;s what the site is built on.
      </p>
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
  /** Per-stage outcomes, set only once the response has actually arrived. */
  const [stageOutcomes, setStageOutcomes] = useState<boolean[] | null>(null);
  /** How many stage lines (top-down) have flipped to their final state. */
  const [resolvedCount, setResolvedCount] = useState(0);
  /** Booth CTA card flips to the in-person instruction when tapped. */
  const [ctaFlipped, setCtaFlipped] = useState(false);
  /** ISO fetchedAt of a cached result currently on screen in place of a live
   *  one — drives the "Showing our pre-run audit from ..." line. Null means
   *  either a genuinely live result, or a cache render that doesn't need
   *  explaining (total-network-death mode, already flagged by the corner dot). */
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  /** "live" tries a real audit first; "cache-first" — set automatically when
   *  the booth's network looks dead — skips straight to the pre-warmed
   *  result. Never surfaced to the visitor, only via the corner dot.
   *
   *  Always starts "live" so the server and the first client render agree.
   *  Reading navigator.onLine during render made the two disagree whenever
   *  the browser was offline, which threw a hydration error and forced React
   *  to re-render the whole tree on the client — the page recovered, but
   *  slowly and unpredictably. The offline check runs in an effect below. */
  const [networkMode, setNetworkMode] = useState<"live" | "cache-first">("live");

  // Conversion-model inputs. Fixed, not adjustable: the sliders are gone, so
  // these are the published assumptions behind the sentence on screen rather
  // than dials a visitor can turn until they like the number.
  const monthlyVisitors = 800;
  const gapCaptureRate = MODEL_DEFAULTS.gapCaptureRate;
  const closeRate = MODEL_DEFAULTS.closeRate;
  const avgPatientValue = MODEL_DEFAULTS.avgPatientValue;

  const searchRef = useRef<HTMLInputElement>(null);
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
    if (scanTimer.current) clearInterval(scanTimer.current);
    if (resolveTimer.current) clearInterval(resolveTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
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
    setRunFailed(false);
    setPendingUrl("");
    setStageOutcomes(null);
    setResolvedCount(0);
    setCtaFlipped(false);
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
      // fromCache must be true here regardless of what the embedded JSON says:
      // the build-time import carries the flag as written by the pre-warm
      // (false, because it was live AT THAT TIME). Without this the header
      // reads "Measured just now" over a measurement that is days old.
      setResult({ ...cached, fromCache: true, practiceName: displayName ?? cached.practiceName });
      setCtaFlipped(false);
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
      setCtaFlipped(false);
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

        // A run can come back 200-and-useless: PageSpeed's daily quota runs
        // out and the audit succeeds carrying no speed number. Nothing
        // "failed", so the transport-level fallbacks above never fire — but
        // a cached result with a real measurement is strictly better than a
        // blank speed gauge, so swap to it silently. Same treatment as any
        // other fallback: no error state, just the pre-run note and a log.
        const cachedForCompare =
          cacheByUrl.get(cacheKey(data.url)) ?? cacheByUrl.get(cacheKey(target));
        if (attemptFallback) {
          const missingSpeed = missingSpeedFallbackReason(data, cachedForCompare);
          if (missingSpeed && cachedForCompare) {
            console.warn(
              `[BOOTH] Live audit for ${domainOf(data.url)} returned no speed data ` +
                `(${missingSpeed}) — showing the pre-run result from ` +
                `${cachedForCompare.fetchedAt} instead. The visitor never saw a failure.`
            );
            renderCachedResult(cachedForCompare, displayNameOverride, true);
            return;
          }
        }

        // Sanity check: a live score wildly different from what we measured
        // before is worth a loud flag before anyone quotes it out loud. The
        // live result is still what renders — this is a log, not a gate.
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
          data.scores.ai !== null,
          medicalIdentificationResolved(data),
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

      // Consult the browser directly, not just the state. `networkMode` starts
      // "live" so the server and first client render agree, and an effect flips
      // it — which leaves a brief window after load where the state still says
      // "live" on a machine that is plainly offline. A click landing in that
      // window would fire a doomed live audit instead of serving the cache, so
      // the decision reads navigator.onLine at the moment it is made.
      const offlineNow = typeof navigator !== "undefined" && navigator.onLine === false;
      if (networkMode === "cache-first" || offlineNow) {
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

    // Offline is knowable immediately; the probe below covers "online but the
    // API is unreachable". Done in an effect so SSR and hydration agree.
    if (navigator.onLine === false) setNetworkMode("cache-first");

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
  // Driven by all three category scores; unverified categories are excluded.
  const verdict = buildVerdict({
    ai: byKey.ai.score,
    patientsFind: byKey.patientsFind.score,
    speed: byKey.speed.score,
  });

  return (
    <main className="min-h-screen text-white" style={{ background: BG }}>
      <div className="booth-audit-report max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Print masthead — screen already shows the logo on the picker, but a
            printed page has to identify itself on its own. */}
        <div className="booth-print-only booth-print-masthead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/inflowmd-final.png" alt="InflowMD" width={788} height={118} />
          <div className="booth-print-meta">
            <strong>{result.practiceName ?? domainOf(result.url)}</strong>
            <span>{domainOf(result.url)}</span>
            <span>Audited {measuredOn(result.fetchedAt)}</span>
          </div>
        </div>

        {/* header — replaced by the print masthead on paper, which carries the
            same identity plus an accurate audit date. */}
        <div className="booth-screen-header flex items-start justify-between gap-4 mb-8">
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
          <div className="booth-no-print shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border px-4 text-sm font-bold transition-colors"
              style={{ minHeight: 44, borderColor: `${ACCENT}66`, color: ACCENT }}
            >
              Download report
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-white/15 px-4 text-sm font-bold text-white/70 hover:text-white hover:border-white/40 transition-colors"
              style={{ minHeight: 44 }}
            >
              Esc — New
            </button>
          </div>
        </div>
        {networkMode === "cache-first" && (
          <div
            className="fixed top-3 right-3 z-50 w-2 h-2 rounded-full bg-amber-400/60"
            title="Network unreachable — showing pre-run results only"
            aria-hidden
          />
        )}

        {/* VERDICT — the one sentence a doctor should leave with, driven by
            the single check that decides whether AI knows what this practice
            is. Silent when that check could not be verified: an unread page
            is not evidence for either claim. */}
        <VerdictBanner verdict={verdict} />

        {/* The three categories, equal weight visually — each scrolls to its
            own findings section. Attribution is per-gauge: only the speed
            number is Google's. */}
        <div className="booth-gauge-row grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-start">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => scrollToSection(c.key)}
              className="booth-gauge-card rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#84B83B]/40 transition-colors py-5 px-2"
              aria-label={`${c.label} — jump to findings`}
            >
              <Gauge
                label={c.label}
                score={c.score}
                size={140}
                valueClass="text-4xl"
                {...(c.key === "speed" ? {} : { verified: c.verified, total: c.total })}
                source={
                  c.key === "speed"
                    ? `${SOURCE_LABEL[c.source]} · measured ${measuredOn(result.fetchedAt)}`
                    : SOURCE_LABEL[c.source]
                }
              />
            </button>
          ))}
        </div>

        {/* Three sections, one per category, in gauge order. Within each,
            checks are ordered by what they actually cost — biggest point
            losses first, passes last — so the top of a section is the work
            list. could_not_verify stays neutral, never styled as failure. */}
        <div className="mt-10">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
            What we checked
          </div>
          <div className="space-y-8">
            {categories.map((c) => (
              <section key={c.key} id={sectionId(c.key)} className="scroll-mt-6">
                <div className="flex items-baseline justify-between gap-3 mb-3 border-b border-white/10 pb-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white/90">{c.label}</h3>
                  <span
                    className="text-lg font-extrabold tabular-nums shrink-0"
                    style={{ color: gaugeColor(c.score) }}
                  >
                    {c.score === null ? "—" : c.score}
                  </span>
                </div>

                {c.key === "speed" ? (
                  <SpeedSection performance={result.performance} />
                ) : (
                  <CheckList category={c} />
                )}
              </section>
            ))}
          </div>
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
              key: "ai",
              score: byKey.ai.score,
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
            <div className="mt-10 mb-8">
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

        {/* Our answer to the findings, stated once and without a pitch. Sits
            after the evidence and before the ask: the reader has just seen
            what is wrong, and this says what we would do instead. Deliberately
            architecture-neutral — /why-nextjs is where the stack is named. */}
        <div className="mt-10 mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40 mb-3">
            What we&rsquo;d do differently
          </div>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl">
            We don&rsquo;t optimize old platforms — we rebuild on modern architecture. Fast by
            design, structured so AI can read it, and built to move patients from symptoms to a
            screening.
          </p>
        </div>

        {/* NEXT STEPS — the evidence has landed; ask before the money talk.
            Email it, or talk it through: two cards, one weight. */}
        <NextSteps result={result} categories={categories} verdict={verdict} />

        {/* PATIENT VALUE — one statement, the stat behind it, the caveat.
            The sliders, the 12-step chain and the "show the math" toggle are
            gone: at a booth nobody tunes a model, and a doctor reading a
            number they just watched someone drag is reading our arithmetic,
            not their site. The full chain still exists in conversionModel.ts
            and still backs this sentence. */}
        {model ? (
          <div className="mb-8">
            <div
              className="rounded-2xl border-2 p-6 sm:p-8"
              style={{ borderColor: `${ACCENT}66`, background: `${ACCENT}14` }}
            >
              <div
                className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3"
                style={{ color: ACCENT }}
              >
                {model.bandLabel}
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
                {model.valueStatement}
              </p>
              <p className="mt-5 text-base sm:text-lg font-semibold text-white/80 leading-snug">
                {model.supportingStat}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-5">
              <p className="text-white/50 text-sm leading-relaxed">{model.caveat}</p>
            </div>
          </div>
        ) : null}

        {/* COMPARISON — only against a failing score, never against ourselves */}
        {perfScore !== null &&
          perfScore < 90 &&
          domainOf(result.url).replace(/^www\./, "") !== COMPARISON_HOST && (
            <div className="booth-no-print">
              <ComparisonBlock key={`${result.url}-${result.fetchedAt}`} their={result} />
            </div>
          )}

        {/* Print footer — a printed page has to say where it came from. */}
        <div className="booth-print-only booth-print-footer">
          inflowmd.com · Speed measured by Google PageSpeed Insights. Search and AI readiness
          analyzed by InflowMD.
        </div>
      </div>
    </main>
  );
}
