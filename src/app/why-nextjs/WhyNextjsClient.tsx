"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { LazyMotion, domAnimation, m, useInView, useReducedMotion } from "framer-motion";

/* ============================================================
   Why we build it this way — the third piece.

   The deck argues three things (visibility, performance, vein
   education). The audit measures the first two against a real
   practice site. This page is what a doctor lands on from the
   report's "How we fix all of this" button, and it has one job:
   explain why those numbers are a property of the architecture
   rather than a to-do list.

   It therefore shares the deck's and the report's visual language
   exactly — navy ground, lime accent, brand blue as the secondary,
   the deck's dot-grid texture and act-label numbering — so it reads
   as the same product rather than as a technology blog post.

   This is also the ONLY page that names Next.js, React and Vercel.
   /pitch and /audit are deliberately architecture-neutral: they say
   "modern architecture" so the argument survives whatever we build
   on next. The names live here, where a doctor who wants to go and
   look them up can.

   RULE FOR THIS FILE: no paragraphs. Nothing on the page runs
   longer than two short sentences, because it is read on a phone
   between patients. An idea that needs a paragraph gets a visual
   instead — which is why the race, the lattices, the two source
   panes and the surface lists carry most of the argument, and the
   copy only names what they show. If you find yourself writing a
   third sentence, you are drawing the wrong thing.
   ============================================================ */

const NAVY = "#081C34";
const LIME = "#84B83B";
const BLUE = "#3B6FBF";

/** Where a booked call goes. Same calendar the audit report opens. */
const CALENDLY_URL = "https://calendly.com/inflowmd/strategy-call";

/* ---------- shared pieces ---------- */

/**
 * The deck's entrance, at reading pace rather than presentation pace:
 * 16px and 600ms, once, on the way in. The deck rises 30px because it is
 * read from six feet away; this is read at a desk.
 */
function Rise({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 0.7, 0.3, 1] }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

/**
 * The deck's act marker, reused as the section number: "01 — WHEN THE PAGE
 * GETS MADE" is the same object as "01 — VISIBILITY" on the booth screen.
 */
function SectionMark({ number, label }: { number?: string; label: string }) {
  return (
    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.26em]">
      {/* The two closing sections are not part of the numbered argument, so
          they carry the label alone rather than a dash standing in for a
          number they do not have. */}
      {number && (
        <>
          <span className="text-white/35">{number}</span>
          <span className="text-white/20"> — </span>
        </>
      )}
      <span style={{ color: LIME }}>{label}</span>
    </div>
  );
}

/** Ambient ground, fixed behind everything — the audit's mesh, the deck's dots. */
function Ambient() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div
        className="mesh-blob-1 absolute -top-40 -left-40 w-[46vw] h-[46vw] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(132,184,59,0.20), transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="mesh-blob-2 absolute -bottom-32 -right-24 w-[48vw] h-[48vw] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(18,54,94,0.85), transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="mesh-blob-3 absolute top-1/3 left-1/2 w-[36vw] h-[36vw] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(59,111,191,0.22), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div className="pitch-dotgrid absolute inset-0 opacity-[0.28]" />
    </div>
  );
}

/**
 * Section shell. One column, one rhythm: mark, heading, lede, then the
 * visual, then the argument in prose beneath it.
 */
function Section({
  number,
  label,
  heading,
  lede,
  children,
}: {
  number: string;
  label: string;
  heading: React.ReactNode;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section className="why-section py-14 sm:py-20 lg:py-24">
      <Rise>
        <SectionMark number={number} label={label} />
        <h2 className="mt-5 text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.08] tracking-tight max-w-[16em]">
          {heading}
        </h2>
        <p className="mt-5 text-lg sm:text-2xl font-light leading-snug text-white/60 max-w-[32em]">
          {lede}
        </p>
      </Rise>
      {children}
    </section>
  );
}

/** The lime half of a two-tone line — the deck's own emphasis. */
function Hi({ children }: { children: React.ReactNode }) {
  return <span style={{ color: LIME }}>{children}</span>;
}

/* ---------- hero ---------- */

/**
 * Where they are, in three words. A doctor arrives here from the report's
 * button, and the first thing the page has to do is place itself in a
 * sequence they have already half-walked.
 */
function Trail() {
  const steps = ["The deck", "Your audit", "The architecture"] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em]">
      {steps.map((step, i) => (
        <span key={step} className="inline-flex items-center gap-3">
          {i > 0 && <span className="text-white/20">→</span>}
          <span style={i === 2 ? { color: LIME } : undefined} className={i < 2 ? "text-white/30" : ""}>
            {step}
          </span>
        </span>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-28">
      <Rise>
        <Trail />
      </Rise>
      <Rise delay={0.08}>
        <h1 className="mt-8 text-[clamp(36px,6.4vw,78px)] font-extrabold leading-[1.04] tracking-tight max-w-[13em]">
          The scores aren&rsquo;t luck. They&rsquo;re <Hi>next-generation architecture</Hi>.
        </h1>
      </Rise>
      <Rise delay={0.16}>
        <p className="mt-8 text-lg sm:text-2xl font-light leading-snug text-white/60 max-w-[30em]">
          Nothing in your report was a tuning problem. Those numbers come from when the page gets
          made, and where it lives.
        </p>
      </Rise>
    </section>
  );
}

/* ---------- the race ---------- */

/** The deck's red — the one the audit's failing gauges use. */
const RED = "#ff4e42";

/** A browser, drawn. White inside, because a real page is. */
function BrowserFrame({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "old" | "modern";
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/40 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="hidden sm:flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </span>
        <span
          className="sm:ml-2 text-[9px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.18em] whitespace-nowrap"
          style={{ color: tone === "old" ? RED : LIME }}
        >
          {label}
        </span>
      </div>
      <div className="relative h-[200px] sm:h-[280px] lg:h-[300px] overflow-hidden bg-white">{children}</div>
    </div>
  );
}

/**
 * The clock under each frame. Counts in real time to the finish it is given,
 * then stops on it — a number that lands before the page does would be
 * telling a different story than the frame above it.
 */
function Clock({ ms, tone, run }: { ms: number; tone: "old" | "modern"; run: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  // Resets go through a timer for the reason the deck documents: setting
  // state straight from an effect body cascades an extra render.
  useEffect(() => {
    if (!run) {
      const t = window.setTimeout(() => setShown(0), 0);
      return () => window.clearTimeout(t);
    }
    if (reduce) {
      const t = window.setTimeout(() => setShown(ms), 0);
      return () => window.clearTimeout(t);
    }
    let raf = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const v = Math.min(ms, now - started);
      setShown(v);
      if (v < ms) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, ms, reduce]);

  return (
    <span
      className="font-mono text-lg sm:text-2xl font-bold tabular-nums"
      style={{ color: tone === "old" ? RED : LIME }}
    >
      {(shown / 1000).toFixed(2)}s
    </span>
  );
}

/** The old way: a spinner, then content arriving in pieces, shoving itself
 *  down the page when the image finally turns up. */
function OldLoad() {
  return (
    <>
      <m.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 3.8, ease: "linear" }}
        className="absolute left-0 top-0 z-10 h-1"
        style={{ background: RED }}
      />
      <m.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.4, duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className="h-9 w-9 animate-spin rounded-full border-4"
          style={{ borderColor: "rgba(0,0,0,0.10)", borderTopColor: RED }}
        />
      </m.div>
      <div className="absolute inset-0 p-3 sm:p-5">
        <m.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.2 }}
          className="mb-3 h-6 w-3/5 rounded bg-slate-300"
        />
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.2 }}
          className="mb-2 h-3 w-4/5 rounded bg-slate-200"
        />
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.2 }}
          className="mb-2 h-3 w-3/4 rounded bg-slate-200"
        />
        {/* The shove: the image arrives late and pushes everything under it
            down the page. This is the moment a patient loses their place. */}
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 76 }}
          transition={{ delay: 2.9, duration: 0.3 }}
          className="my-3 w-full rounded bg-slate-300"
        />
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.2 }}
          className="mb-3 h-3 w-2/3 rounded bg-slate-200"
        />
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.7, duration: 0.2 }}
          className="h-8 w-32 rounded"
          style={{ background: RED }}
        />
      </div>
    </>
  );
}

/** A modern build: the whole page, at once, because it was already a file. */
function ModernLoad() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14, delay: 0.12 }}
      className="absolute inset-0 p-3 sm:p-5"
    >
      <div className="mb-3 h-6 w-3/5 rounded" style={{ background: BLUE }} />
      <div className="mb-2 h-3 w-4/5 rounded bg-slate-300" />
      <div className="mb-2 h-3 w-3/4 rounded bg-slate-300" />
      <div className="my-3 h-[76px] w-full rounded bg-slate-200" />
      <div className="mb-3 h-3 w-2/3 rounded bg-slate-300" />
      <div className="h-8 w-32 rounded" style={{ background: LIME }} />
    </m.div>
  );
}

/**
 * The two loads, side by side, on the same clock.
 *
 * It runs itself when it comes into view and can be replayed, because the
 * whole point is watching it happen — a doctor who scrolled past the first
 * run has been shown nothing. Remounted by key so every replay starts from
 * a genuinely blank frame rather than from wherever the last one stopped.
 */
function SpeedRace() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setPlaying(true), 0);
    return () => window.clearTimeout(t);
  }, [inView]);

  const replay = () => {
    setPlaying(false);
    setRun((r) => r + 1);
    window.setTimeout(() => setPlaying(true), 60);
  };

  return (
    <section ref={ref} className="py-14 sm:py-20 border-t border-white/10">
      <Rise>
        <SectionMark label="The same page, both ways" />
        <h2 className="mt-5 text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.08] tracking-tight max-w-[15em]">
          Watch them load <Hi>side by side</Hi>.
        </h2>
      </Rise>

      <LazyMotion features={domAnimation} strict>
        <div key={run} className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-6">
          <div>
            <BrowserFrame label="WordPress" tone="old">
              {playing && <OldLoad />}
            </BrowserFrame>
            <div className="mt-3 sm:mt-4 flex flex-col gap-0.5 px-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-xs sm:text-base font-semibold text-white/50">
                Rebuilt on every visit
              </span>
              <Clock ms={3800} tone="old" run={playing} />
            </div>
          </div>

          <div>
            <BrowserFrame label="Next.js" tone="modern">
              {playing && <ModernLoad />}
            </BrowserFrame>
            <div className="mt-3 sm:mt-4 flex flex-col gap-0.5 px-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-xs sm:text-base font-semibold text-white/50">
                Built before the visit
              </span>
              <Clock ms={400} tone="modern" run={playing} />
            </div>
          </div>
        </div>
      </LazyMotion>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-2 rounded-xl border px-6 font-bold transition-colors hover:bg-white/[0.06]"
          style={{ borderColor: `${LIME}66`, color: LIME, minHeight: 52 }}
        >
          &#8635; Run it again
        </button>
      </div>
    </section>
  );
}

/* ---------- the bridge: the deck's three, mapped to one build ---------- */

/** The deck's own recap icons, redrawn here so the pillars are recognisably
 *  the same three objects a doctor watched on the booth screen. */
const PILLAR_ICONS = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-5.2-5.2" />
    </>
  ),
  gauge: (
    <>
      <path d="M3.5 18a9 9 0 1 1 17 0" />
      <path d="M12 18 16.5 9.5" />
      <circle cx="12" cy="18" r="1.4" />
    </>
  ),
} as const;

const PILLARS = [
  {
    icon: "search",
    name: "Visibility",
    deck: "Be found by patients and AI",
    here: "A page that arrives complete is a page an assistant can quote.",
    measured: "Measured in your audit",
  },
  {
    icon: "gauge",
    name: "Performance",
    deck: "Every second costs conversions",
    here: "A file that already exists has nothing left to assemble.",
    measured: "Measured in your audit",
  },
] as const;

function Pillars() {
  return (
    <section className="py-16 sm:py-20 border-t border-white/10">
      <Rise>
        <h2 className="text-[clamp(26px,3.4vw,44px)] font-extrabold leading-tight tracking-tight max-w-[18em]">
          Two scores, one architecture.
        </h2>
        <p className="mt-5 text-base sm:text-xl font-light leading-snug text-white/60 max-w-[38em]">
          Your audit measured visibility and performance. Both come out of how the site is built.
        </p>
      </Rise>
      <div className="mt-12 grid gap-8 sm:gap-6 sm:grid-cols-2">
        {PILLARS.map((p, i) => (
          <Rise key={p.name} delay={0.08 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9"
                fill="none"
                stroke={LIME}
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {PILLAR_ICONS[p.icon]}
              </svg>
              <div className="mt-5 text-xl sm:text-2xl font-extrabold" style={{ color: LIME }}>
                {p.name}
              </div>
              <div className="mt-1 text-sm text-white/40">{p.deck}</div>
              <p className="mt-4 text-base leading-relaxed text-white/80">{p.here}</p>
              <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                {p.measured}
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ---------- 01: when the page gets made ---------- */

const WP_STEPS = [
  "Patient asks for the page",
  "Server starts PHP",
  "Database queried for the content",
  "Plugins filter the result, in order",
  "Theme assembles the HTML",
  "The page begins to arrive",
] as const;

/**
 * The chain, walked. The WordPress side loops — that is the entire point of
 * the visual, since the work is not slow so much as repeated — and the
 * Next.js side resolves once and stays resolved.
 *
 * Reduced motion gets the finished state of both: every step lit, no walk.
 */
function AssemblyLanes() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-120px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(-1);

  // Every state change goes through a timer, the resets included: setting
  // state straight from an effect body cascades an extra render, and the
  // linter is right to flag it. A 0ms timer lands on the next tick and
  // behaves identically here — the same rule the deck follows.
  useEffect(() => {
    const timers: number[] = [];
    const later = (fn: () => void) => timers.push(window.setTimeout(fn, 0));
    const cleanup = () => timers.forEach((t) => window.clearTimeout(t));

    if (reduce) {
      later(() => setStep(WP_STEPS.length));
      return cleanup;
    }
    if (!inView) {
      later(() => setStep(-1));
      return cleanup;
    }
    let i = 0;
    later(() => setStep(0));
    const walk = window.setInterval(() => {
      i = i >= WP_STEPS.length ? 0 : i + 1;
      setStep(i);
    }, 620);
    return () => {
      cleanup();
      window.clearInterval(walk);
    };
  }, [inView, reduce]);

  return (
    <div ref={ref} className="mt-12 grid gap-5 lg:grid-cols-2 lg:items-stretch">
      {/* WordPress — every visit, from the top */}
      <div className="flex flex-col rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            WordPress
          </div>
          <div
            className="text-[11px] font-bold uppercase tracking-[0.18em] shrink-0"
            style={{ color: "#ffa400" }}
          >
            On every visit
          </div>
        </div>
        <ol className="mt-6 space-y-1">
          {WP_STEPS.map((text, i) => {
            const lit = step >= i;
            const active = step === i;
            return (
              <li key={text} className="flex items-center gap-4 py-2">
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-all duration-300"
                  style={{
                    background: lit ? "rgba(255,164,0,0.16)" : "rgba(255,255,255,0.04)",
                    color: lit ? "#ffa400" : "rgba(255,255,255,0.3)",
                    boxShadow: active ? "0 0 0 3px rgba(255,164,0,0.18)" : "none",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-sm sm:text-base leading-snug transition-colors duration-300"
                  style={{ color: lit ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}
                >
                  {text}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/45">
          Six steps, every visit. The next patient waits through them again.
        </p>
      </div>

      {/* Ours — done once, then handed over */}
      <div
        className="flex flex-col rounded-2xl border-2 p-6 sm:p-8"
        style={{ borderColor: `${LIME}66`, background: `${LIME}0f` }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Next.js
          </div>
          <div
            className="text-[11px] font-bold uppercase tracking-[0.18em] shrink-0"
            style={{ color: LIME }}
          >
            Once, at build
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: LIME }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="text-sm sm:text-base text-white/80">
              All six steps — run at build time, before anyone visits
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 py-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
            style={{ background: `${LIME}26`, color: LIME }}
          >
            1
          </span>
          <span className="text-sm sm:text-base text-white/90">Patient asks for the page</span>
        </div>
        <div className="flex items-center gap-4 py-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
            style={{ background: `${LIME}26`, color: LIME }}
          >
            2
          </span>
          <span className="text-sm sm:text-base font-semibold text-white">
            The page is already a file. It sends.
          </span>
        </div>

        <p className="mt-auto pt-6 text-sm leading-relaxed text-white/55">
          <span className="block border-t border-white/10 pt-5">
            Two steps. Nothing left to assemble.
          </span>
        </p>
      </div>
    </div>
  );
}

function WhenSection() {
  return (
    <Section
      number="01"
      label="When the page gets made"
      heading={
        <>
          WordPress builds the page <Hi>on every visit</Hi>.
        </>
      }
      lede="Next.js built it once, before anyone asked. It is already waiting."
    >
      <AssemblyLanes />
    </Section>
  );
}

/* ---------- 02: where the page lives ---------- */

/**
 * The network, drawn.
 *
 * Deliberately not a map: a recognisable coastline invites a doctor to check
 * whether their own city has a dot, which is not the claim. The field is the
 * deck's dot texture with the nodes promoted out of it — one distant server on
 * the left panel, a scattering of them on the right — and the animated packet
 * is the only thing that differs between the two.
 */
function NetworkField({ variant, compact = false }: { variant: "single" | "edge"; compact?: boolean }) {
  const reduce = useReducedMotion();
  const single = variant === "single";

  // Two shapes of the same lattice. Wide is the page's own proportion; the
  // compact one is close to square, because a sixteen-column field squeezed
  // into a phone leaves every node and label too small to read — and this is
  // the diagram that most needs to be legible.
  const COLS = compact ? 8 : 16;
  const ROWS = compact ? 7 : 5;
  const cell = 40;
  const w = COLS * cell;
  const h = ROWS * cell + 34; // room for the labels under the bottom row

  const dots: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      dots.push({ x: c * cell + cell / 2, y: r * cell + cell / 2 });
    }
  }

  const at = (c: number, r: number) => ({ x: cell * c, y: cell * r });

  /** The patient. */
  const patient = compact ? at(1.5, 1.5) : at(1.5, 2.5);
  /** The WordPress datacenter, as far from the patient as the field allows. */
  const datacenter = compact ? at(5.5, 5.5) : at(13.5, 1.5);
  /** Ours: a spread, the first of which is the patient's neighbour. */
  const edges = compact
    ? [at(2.5, 2.5), at(5.5, 0.5), at(6.5, 3.5), at(4.5, 4.5), at(1.5, 5.5), at(6.5, 6.5), at(3.5, 6.5)]
    : [
        at(4.5, 2.5),
        at(6.5, 0.5),
        at(8.5, 3.5),
        at(9.5, 1.5),
        at(9.5, 4.5),
        at(11.5, 0.5),
        at(12.5, 3.5),
        at(14.5, 1.5),
        at(14.5, 4.5),
      ];
  const target = single ? datacenter : edges[0];

  // Above the node in the compact field: the route leaves the patient
  // diagonally there and would otherwise run through its own caption.
  const label = (x: number, y: number, text: string, above = false) => (
    <text
      x={x}
      y={above ? y - 26 : y + 32}
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      letterSpacing="1.6"
      fill="rgba(255,255,255,0.45)"
    >
      {text}
    </text>
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto"
      role="img"
      aria-label={
        single
          ? "A patient at one corner of the field and a single server at the far side, the request crossing the whole distance."
          : "The same patient with servers spread across the field, the nearest one a short hop away."
      }
    >
      {/* the field */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.7" fill="rgba(255,255,255,0.11)" />
      ))}

      {/* the route */}
      <path
        d={`M${patient.x} ${patient.y} L${target.x} ${target.y}`}
        stroke={single ? "rgba(255,164,0,0.6)" : `${LIME}cc`}
        strokeWidth="2.4"
        strokeDasharray="7 9"
        strokeLinecap="round"
        fill="none"
        className={reduce ? undefined : single ? "why-route-slow" : "why-route-fast"}
      />

      {/* servers */}
      {single ? (
        <g>
          <circle cx={datacenter.x} cy={datacenter.y} r="18" fill="rgba(255,164,0,0.12)" />
          <circle cx={datacenter.x} cy={datacenter.y} r="8" fill="#ffa400" />
          {label(datacenter.x, datacenter.y, "WORDPRESS")}
        </g>
      ) : (
        edges.map((e, i) => (
          <g key={i}>
            <circle cx={e.x} cy={e.y} r={i === 0 ? 18 : 12} fill={`${LIME}24`} />
            <circle cx={e.x} cy={e.y} r={i === 0 ? 8 : 5.5} fill={LIME} />
            {i === 0 && label(e.x, e.y, "NEAREST COPY")}
          </g>
        ))
      )}

      {/* the patient */}
      <g>
        <circle cx={patient.x} cy={patient.y} r="17" fill="rgba(255,255,255,0.10)" />
        <circle cx={patient.x} cy={patient.y} r="7" fill="#fff" />
        {label(patient.x, patient.y, "PATIENT", compact)}
      </g>
    </svg>
  );
}

function WhereSection() {
  return (
    <Section
      number="02"
      label="Where the page lives"
      heading={
        <>
          WordPress runs on <Hi>one server</Hi>. Next.js runs on hundreds.
        </>
      }
      lede="A patient is answered by whichever copy is nearest them."
    >
      <div className="mt-12 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-9">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              WordPress — one server, one datacenter
            </div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#ffa400" }}
            >
              Every request makes the trip
            </div>
          </div>
          <div className="mt-7">
            <div className="hidden sm:block">
              <NetworkField variant="single" />
            </div>
            <div className="sm:hidden">
              <NetworkField variant="single" compact />
            </div>
          </div>
          <p className="mt-7 border-t border-white/10 pt-5 text-sm sm:text-base leading-relaxed text-white/50 max-w-[46em]">
            Every request crosses the whole distance. So does every response.
          </p>
        </div>

        <div
          className="rounded-2xl border-2 p-6 sm:p-9"
          style={{ borderColor: `${LIME}66`, background: `${LIME}0f` }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              Next.js — a copy on every continent
            </div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: LIME }}
            >
              The nearest one answers
            </div>
          </div>
          <div className="mt-7">
            <div className="hidden sm:block">
              <NetworkField variant="edge" />
            </div>
            <div className="sm:hidden">
              <NetworkField variant="edge" compact />
            </div>
          </div>
          <p className="mt-7 border-t border-white/10 pt-5 text-sm sm:text-base leading-relaxed text-white/60 max-w-[46em]">
            The closest copy answers. Distance stops mattering.
          </p>
        </div>
      </div>

    </Section>
  );
}

/* ---------- 03: what it is built on ---------- */

/**
 * The WordPress stack, bottom to top, as it is actually assembled — and the
 * reason the tower leans: every layer is a thing that ships on its own
 * schedule and has to keep standing on the one beneath it.
 */
const WP_STACK = [
  "Shared Hosting",
  "MySQL Database",
  "PHP",
  "WordPress Core",
  "Theme",
  "Page Builder",
  "SEO Plugin",
  "Security Plugin",
  "Cache Plugin",
  "Backup Plugin",
  "Forms Plugin",
  "12 more plugins…",
] as const;

/**
 * Twelve parts against one.
 *
 * The lean is cumulative rather than random: each block sits a little further
 * off the one below it, which is what makes the top of the tower look like it
 * is going somewhere. The whole thing sways from its base — slowly, a degree
 * either side, so it reads as precarious rather than as an animation. Still
 * under prefers-reduced-motion; the lean alone makes the point.
 */
function StackTower() {
  return (
    <div className="mt-12 grid grid-cols-2 items-end gap-4 sm:gap-10">
      {/* the tower */}
      <div>
        <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          WordPress
        </div>
        <div className="why-tower flex flex-col-reverse gap-1 sm:gap-1.5">
          {WP_STACK.map((layer, i) => {
            const plugin = i >= 6;
            return (
              <div
                key={layer}
                className="rounded-md border px-2 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.08em] sm:tracking-[0.12em] whitespace-nowrap overflow-hidden text-ellipsis"
                style={{
                  // Each layer leans a little further than the one under it.
                  transform: `rotate(${(i * 0.34).toFixed(2)}deg) translateX(${(i * 1.5).toFixed(1)}px)`,
                  borderColor: plugin ? "rgba(255,164,0,0.28)" : "rgba(255,255,255,0.14)",
                  background: plugin ? "rgba(255,164,0,0.08)" : "rgba(255,255,255,0.05)",
                  color: plugin ? "rgba(255,196,110,0.85)" : "rgba(255,255,255,0.7)",
                }}
              >
                {layer}
              </div>
            );
          })}
        </div>
      </div>

      {/* the one part */}
      <div>
        <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Next.js
        </div>
        <div
          className="flex items-center justify-center rounded-xl border-2 py-10 sm:py-14 text-lg sm:text-3xl font-extrabold tracking-tight"
          style={{ borderColor: BLUE, background: `${BLUE}26`, color: "#fff" }}
        >
          Next.js
        </div>
      </div>
    </div>
  );
}

function StabilitySection() {
  return (
    <Section
      number="03"
      label="What it's built on"
      heading={
        <>
          Twelve things to keep standing — or <Hi>one</Hi>.
        </>
      }
      lede="No database, no admin login, no plugins to keep patched."
    >
      <StackTower />
    </Section>
  );
}

/* ---------- the names ---------- */

const STACK = [
  ["Next.js", "The framework the site is built with. It renders your pages to finished HTML before anyone visits."],
  ["React", "How the pages are composed — built as parts, not installed as plugins."],
  ["Vercel", "The network your pages are published to, which keeps a copy near every patient."],
] as const;

function Names() {
  return (
    <section className="py-16 sm:py-20 border-t border-white/10">
      <Rise>
        <SectionMark label="The names, since you'll hear them" />
        <p className="mt-5 max-w-[46em] text-base sm:text-lg leading-relaxed text-white/70">
          Three names, and they are the whole stack. No plugin list underneath them.
        </p>
      </Rise>
      <div className="mt-9 grid gap-5 sm:grid-cols-3">
        {STACK.map(([name, what], i) => (
          <Rise key={name} delay={0.07 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              {/* The glow cycles one name at a time — the delay is the whole
                  mechanism, so the three share a single long animation and
                  take their turn out of it. */}
              <div
                className="why-stackname text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
                style={{ animationDelay: `${i * 3}s` } as React.CSSProperties}
              >
                {name}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">{what}</p>
            </div>
          </Rise>
        ))}
      </div>
      <Rise>
        <p className="mt-8 text-sm leading-relaxed text-white/35 max-w-[46em]">
          The same architecture is behind OpenAI, Netflix, Nike and the Washington Post.
        </p>
      </Rise>
    </section>
  );
}

/* ---------- close ---------- */

declare global {
  interface Window {
    Calendly?: { initPopupWidget(options: { url: string }): void };
  }
}

/**
 * The two ways out, weighted the same — the audit report's own close, so a
 * doctor arriving from that page finds the same pair of cards waiting.
 *
 * The call is A LINK, not a button, for the reason the report gives: the
 * popup is Calendly's script talking to Calendly's script, and if widget.js
 * has not landed the href still books the call.
 */
function Close() {
  function openPopup(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!window.Calendly?.initPopupWidget) return; // let the href do its job
    e.preventDefault();
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  }

  return (
    <section className="py-16 sm:py-24 border-t border-white/10">
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <div
          className="flex h-full flex-col items-center justify-center rounded-2xl border-2 p-8 sm:p-10 text-center"
          style={{ borderColor: `${LIME}66`, background: "rgba(0,0,0,0.25)" }}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-balance">
            Haven&rsquo;t run yours yet?
          </h2>
          <p className="text-white/60 text-base sm:text-lg mt-2 mb-6">
            Thirty seconds, on your own domain, using Google&rsquo;s own measurement.
          </p>
          <a
            href="/audit"
            className="w-full max-w-sm inline-flex items-center justify-center rounded-xl px-8 font-extrabold text-lg transition-opacity hover:opacity-90"
            style={{ background: LIME, color: NAVY, minHeight: 64 }}
          >
            Run your practice&rsquo;s audit
          </a>
        </div>

        <div
          className="flex h-full flex-col items-center justify-center rounded-2xl border-2 p-8 sm:p-10 text-center"
          style={{ borderColor: `${LIME}66`, background: "rgba(0,0,0,0.25)" }}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-balance">Prefer to talk?</h2>
          <p className="text-white/60 text-base sm:text-lg mt-2 mb-6">
            Book a 15-minute call — we&rsquo;ll walk through your findings together.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openPopup}
            className="w-full max-w-sm inline-flex items-center justify-center rounded-xl px-8 font-extrabold text-lg transition-opacity hover:opacity-90"
            style={{ background: LIME, color: NAVY, minHeight: 64 }}
          >
            Book a strategy call
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export default function WhyNextjsClient() {
  return (
    <main className="relative min-h-screen text-white" style={{ background: NAVY }}>
      <Ambient />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-12 pb-20">
        <Hero />
        <SpeedRace />
        <Pillars />
        <WhenSection />
        <WhereSection />
        <StabilitySection />
        <Names />
        <Close />
      </div>
    </main>
  );
}
