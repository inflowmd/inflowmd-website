"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge } from "../audit/Gauge";

/**
 * The booth pitch deck. Ten full-viewport sections; forward/back via
 * keyboard (presenter remotes send PageDown/PageUp), click-anywhere,
 * or the progress dots. One press per section — every section loads
 * its own content automatically on entry.
 *
 * Every section replays a staggered rise-in when it becomes active
 * (`is-live`), and the showpiece sections run looping CSS/JS motion:
 * S1 types and thinks, S2a scans a site, S3b books an appointment,
 * S4 counts its scores up. All of it respects prefers-reduced-motion.
 *
 * Everything renders from local assets — no external requests.
 */

const NAVY = "#081C34";
const LIME = "#84B83B";
const BLUE = "#3B6FBF";

const SECTIONS = ["s0", "s1", "s2a", "s2b", "s2c", "s3a", "s3b", "s3c", "s4", "s5"] as const;

/** Shared type scale — readable from six feet on a 1440p booth monitor. */
const PRIMARY = "text-[clamp(40px,4.5vw,104px)] font-extrabold leading-[1.08] tracking-tight text-white";
const SUB = "text-[clamp(20px,1.7vw,34px)] font-light text-white/60 leading-snug";

const INVISIBLE_LINES = [
  ["No medical schema", "AI can’t tell you’re a vein practice"],
  ["Blocked crawlers", "your site may lock ChatGPT out"],
  ["Unstructured content", "AI can’t parse what you offer"],
] as const;

/**
 * S2c — what we DO about it. Deliberately not the S2b list with the marks
 * flipped: a mirrored list reads as the same slide twice, so these are stated
 * as actions. Split lead/rest only for the deck's two-tone rhythm — the two
 * halves concatenate to the exact line.
 */
const BUILD_LINES = [
  ["Medical schema", " that tells AI exactly what you treat and where"],
  ["Content structured so AI can parse your services", ", not guess at them"],
  ["Built for every AI crawler", " — ChatGPT, Perplexity, Claude, and whatever comes next"],
] as const;

/** Household names from the Next.js showcase — the architecture we build on. */
const FAST_SITES = [
  "OpenAI",
  "Netflix",
  "Nike",
  "TikTok",
  "Notion",
  "DoorDash",
  "Twitch",
  "Target",
  "Washington Post",
];

const SEARCH_QUERY = "vein specialist near me";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- small shared pieces ---------- */

function FailX({ delayMs = 0, animate = false }: { delayMs?: number; animate?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-red-500/15 ${
        animate ? "pitch-pop" : ""
      }`}
      style={{ width: "1.5em", height: "1.5em", animationDelay: `${delayMs}ms` }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f87171"
        strokeWidth="3"
        strokeLinecap="round"
        className="w-[0.75em] h-[0.75em]"
        aria-hidden
      >
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </span>
  );
}

function PassCheck({ delayMs, animate }: { delayMs: number; animate: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full ${
        animate ? "pitch-pop" : ""
      }`}
      style={{ width: "1.5em", height: "1.5em", background: LIME, animationDelay: `${delayMs}ms` }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[0.8em] h-[0.8em]"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

/** Subtle dot-grid texture patch — the deck's ambient ornament. */
function DotGrid({ className }: { className: string }) {
  return <div className={`pitch-dotgrid pointer-events-none absolute ${className}`} aria-hidden />;
}

/* ---------- S1: search bars that type, think, and listen ---------- */

function SearchBars({ live }: { live: boolean }) {
  // One looping story: the SAME question walks through all three doors.
  // Google types it → the AI assistant types it and thinks → the voice
  // assistant hears it (waveform surges, transcript appears). Chained
  // timeouts so cleanup is a single cancel.
  const [gChars, setGChars] = useState(0);
  const [cChars, setCChars] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [glow, setGlow] = useState(false);
  const [vChars, setVChars] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!live) return;
    if (prefersReducedMotion()) {
      setGChars(SEARCH_QUERY.length);
      setCChars(SEARCH_QUERY.length);
      setVChars(SEARCH_QUERY.length);
      setThinking(false);
      setGlow(true);
      setSpeaking(false);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), ms));
    };

    const L = SEARCH_QUERY.length;
    const cycle = () => {
      if (cancelled) return;
      setGChars(0);
      setCChars(0);
      setVChars(0);
      setThinking(false);
      setGlow(false);
      setSpeaking(false);
      // Door 1: Google
      for (let i = 1; i <= L; i++) later(() => setGChars(i), 300 + i * 55);
      const gDone = 300 + L * 55;
      // Door 2: the AI assistant
      for (let i = 1; i <= L; i++) later(() => setCChars(i), gDone + 600 + i * 45);
      const cDone = gDone + 600 + L * 45;
      later(() => setThinking(true), cDone + 250);
      later(() => {
        setThinking(false);
        setGlow(true);
      }, cDone + 1900);
      // Door 3: voice
      const vStart = cDone + 2600;
      later(() => setSpeaking(true), vStart - 150);
      for (let i = 1; i <= L; i++) later(() => setVChars(i), vStart + i * 50);
      const vDone = vStart + L * 50;
      later(() => setSpeaking(false), vDone + 900);
      later(cycle, vDone + 2600);
    };
    cycle();

    return () => {
      cancelled = true;
      for (const t of timers) window.clearTimeout(t);
    };
  }, [live]);

  const label = (text: string) => (
    <p className="mb-[0.7vh] text-left text-[clamp(12px,0.95vw,18px)] font-bold uppercase tracking-[0.3em] text-white/40">
      {text}
    </p>
  );

  return (
    <div className="flex flex-col items-center gap-[2.4vh] w-[min(46vw,760px)]">
      {/* Door 1 — Google */}
      <div className="w-full">
        {label("Google")}
        <div className="w-full flex items-center gap-4 rounded-full bg-white/95 px-7 py-[1.6vh] shadow-lg text-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.4" strokeLinecap="round" className="w-[1.4vw] min-w-5 aspect-square shrink-0" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <div className="flex-1 text-[clamp(16px,1.4vw,28px)] font-medium text-slate-700 whitespace-nowrap overflow-hidden">
            {gChars > 0 ? SEARCH_QUERY.slice(0, gChars) : ""}
            {gChars < SEARCH_QUERY.length && <span className="pitch-caret inline-block w-[2px] h-[1.05em] align-middle bg-slate-500" />}
          </div>
        </div>
      </div>

      {/* Door 2 — the AI assistant, lime highlight, slightly larger */}
      <div className="w-[108%]">
        {label("ChatGPT & AI assistants")}
        <div
          className={`w-full flex items-center gap-4 rounded-3xl bg-white/[0.07] px-7 py-[2.2vh] border-2 transition-shadow duration-500 text-left ${
            glow ? "pitch-ai-glow" : ""
          }`}
          style={{ borderColor: LIME, boxShadow: `0 0 44px ${LIME}30` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.5vw] min-w-5 aspect-square shrink-0" aria-hidden>
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          </svg>
          <div className="flex-1 text-[clamp(16px,1.4vw,28px)] font-medium text-white/85 whitespace-nowrap overflow-hidden">
            {thinking ? (
              <span className="inline-flex items-center gap-2" aria-label="Assistant thinking">
                <span className="pitch-think-dot" />
                <span className="pitch-think-dot" style={{ animationDelay: "160ms" }} />
                <span className="pitch-think-dot" style={{ animationDelay: "320ms" }} />
              </span>
            ) : (
              <>
                {cChars > 0 ? SEARCH_QUERY.slice(0, cChars) : ""}
                {cChars > 0 && cChars < SEARCH_QUERY.length && (
                  <span className="pitch-caret inline-block w-[2px] h-[1.05em] align-middle bg-white/80" />
                )}
              </>
            )}
          </div>
          <span className="ml-auto inline-flex items-center justify-center rounded-full w-[2.4vw] min-w-8 aspect-square shrink-0" style={{ background: LIME }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[45%]" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Door 3 — voice: the waveform surges while the words are heard */}
      <div className="w-full">
        {label("Siri & voice")}
        <div className={`w-full flex items-center gap-5 rounded-full bg-white/[0.05] border border-white/15 px-7 py-[1.7vh] ${speaking ? "pitch-speaking" : ""}`}>
          <span className="flex items-center gap-[0.4vw] shrink-0">
            {[34, 62, 88, 52, 96, 44, 72, 30].map((h, i) => (
              <span
                key={i}
                className="pitch-wavebar w-[0.45vw] min-w-1.5 rounded-full"
                style={{
                  height: `${(h / 100) * 3.4}vh`,
                  background: i % 2 ? BLUE : "rgba(255,255,255,0.65)",
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </span>
          <div className="flex-1 text-left text-[clamp(16px,1.4vw,28px)] font-medium italic text-white/75 whitespace-nowrap overflow-hidden">
            {vChars > 0 ? `\u201C${SEARCH_QUERY.slice(0, vChars)}${vChars === SEARCH_QUERY.length ? "\u201D" : ""}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- S2a: the AI reading a site while it answers ---------- */

function SiteScan() {
  return (
    <div className="relative w-[min(20vw,340px)] shrink-0" aria-hidden>
      {/* Browser-ish card being read */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/12">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10">
          <span className="w-2 h-2 rounded-full bg-white/25" />
          <span className="w-2 h-2 rounded-full bg-white/25" />
          <span className="w-2 h-2 rounded-full bg-white/25" />
          <span className="ml-2 h-2 w-1/2 rounded-full bg-white/15" />
        </div>
        <div className="flex flex-col gap-[1.1vh] p-5">
          {[88, 64, 76, 52, 70, 40].map((w, i) => (
            <span
              key={i}
              className="pitch-scanline-item h-[0.9vh] min-h-1.5 rounded-full bg-white/25"
              style={{ width: `${w}%`, animationDelay: `${i * 460}ms` }}
            />
          ))}
        </div>
        {/* The reading beam */}
        <span className="pitch-scanbeam absolute left-0 right-0 h-10" />
      </div>
      <p className="mt-3 text-center text-[clamp(12px,0.95vw,18px)] uppercase tracking-[0.25em] text-white/35 font-semibold">
        Reading your site
      </p>
    </div>
  );
}

function FlowDots() {
  // Dashes flowing from the scanned site into the answer.
  return (
    <svg viewBox="0 0 120 24" className="w-[min(7vw,120px)] shrink-0 opacity-70" fill="none" aria-hidden>
      <path
        d="M4 12h112"
        stroke={LIME}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="10 14"
        className="pitch-flow"
      />
      <path d="m104 4 12 8-12 8" stroke={LIME} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- S2b: the AI scanning a site and finding nothing ---------- */

function BrokenScan() {
  // Mirror of S2a's reading card, but the read fails: sparse fragments,
  // dashed empty slots, a red beam, and ✗ marks where content should be.
  const rows: Array<{ w: number; empty?: boolean }> = [
    { w: 58 },
    { w: 0, empty: true },
    { w: 26 },
    { w: 0, empty: true },
    { w: 40 },
    { w: 0, empty: true },
  ];
  return (
    <div className="relative w-[min(20vw,340px)] shrink-0" aria-hidden>
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/12">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10">
          <span className="w-2 h-2 rounded-full bg-white/25" />
          <span className="w-2 h-2 rounded-full bg-white/25" />
          <span className="w-2 h-2 rounded-full bg-white/25" />
          <span className="ml-2 h-2 w-1/2 rounded-full bg-white/15" />
        </div>
        <div className="flex flex-col gap-[1.15vh] p-5">
          {rows.map((row, i) =>
            row.empty ? (
              <span
                key={i}
                className="flex items-center gap-3 h-[1.6vh] min-h-3"
                style={{ width: "78%" }}
              >
                <span className="flex-1 h-full rounded-full border border-dashed border-white/20" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="pitch-scanfail-x w-[1vw] min-w-3.5 aspect-square"
                  style={{ animationDelay: `${i * 460}ms` }}
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </span>
            ) : (
              <span
                key={i}
                className="pitch-scanfail-item h-[0.9vh] min-h-1.5 rounded-full bg-white/20"
                style={{ width: `${row.w}%`, animationDelay: `${i * 460}ms` }}
              />
            )
          )}
        </div>
        <span className="pitch-scanbeam pitch-scanbeam-fail absolute left-0 right-0 h-10" />
      </div>
      <p className="mt-3 text-center text-[clamp(12px,0.95vw,18px)] uppercase tracking-[0.25em] text-red-300/60 font-semibold">
        Nothing to read
      </p>
    </div>
  );
}

/* ---------- S3b: the conversion, illustrated ---------- */

function BookingSim({ live }: { live: boolean }) {
  return (
    <div
      className={`relative flex flex-col items-center gap-[2vh] rounded-3xl bg-white/[0.05] border border-white/10 px-[3vw] py-[4vh] ${
        live ? "pitch-sim-live" : ""
      }`}
    >
      <div className="h-[1vh] min-h-2 w-[9vw] rounded-full bg-white/15" />
      <div className="h-[1vh] min-h-2 w-[12vw] rounded-full bg-white/10" />
      <div className="pitch-sim-btn relative mt-[1.5vh] inline-flex items-center justify-center rounded-2xl px-[2.6vw] py-[2.2vh] text-[clamp(18px,1.5vw,30px)] font-extrabold overflow-hidden" style={{ background: LIME, color: NAVY }}>
        <span className="pitch-sim-label inline-flex items-center gap-3">Book Appointment</span>
        <span className="pitch-sim-booked absolute inset-0 inline-flex items-center justify-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-[1.1em] h-[1.1em]" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Booked
        </span>
        <span className="pitch-sim-ripple absolute inset-0 rounded-2xl" />
      </div>
      {/* Cursor */}
      <svg viewBox="0 0 24 24" className="pitch-sim-cursor absolute w-[2vw] min-w-7 drop-shadow-lg" style={{ left: "50%", top: "62%" }} aria-hidden>
        <path d="M5 3l14 8-6 1.5L16 19l-3 1.5-3-6.5L5 18V3z" fill="#fff" stroke={NAVY} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/* ---------- S4: scores that count up ---------- */

function CountingGauges({ live }: { live: boolean }) {
  const [scores, setScores] = useState<{ a: number; b: number }>({ a: 0, b: 0 });

  useEffect(() => {
    if (!live) return;
    if (prefersReducedMotion()) {
      setScores({ a: 42, b: 98 });
      return;
    }
    setScores({ a: 0, b: 0 });
    let raf = 0;
    const started = performance.now();
    const DURATION = 1600;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / DURATION);
      const e = ease(t);
      setScores({ a: Math.round(42 * e), b: Math.round(98 * e) });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  return (
    <div className="flex items-center gap-[8vw]">
      <div className="pitch-rise" style={{ "--rise": "150ms" } as React.CSSProperties}>
        <Gauge
          score={scores.a}
          size={340}
          valueClass="text-8xl"
          srLabel="Their site: performance score 42 of 100"
        />
      </div>
      <div className="pitch-rise" style={{ "--rise": "300ms" } as React.CSSProperties}>
        <Gauge
          score={scores.b}
          size={340}
          valueClass="text-8xl"
          srLabel="Our build: performance score 98 of 100"
        />
      </div>
    </div>
  );
}

/* ---------- the deck ---------- */

export default function PitchClient() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Handlers live on window; refs keep them reading fresh state.
  const stateRef = useRef({ active: 0 });
  stateRef.current = { active };

  // Programmatic smooth scrolls must not let the IntersectionObserver roll
  // `active` back through the sections they pass — presenter keypresses read
  // that state. The flag lifts on scrollend (plus a fallback timer).
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<number | undefined>(undefined);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
      setActive(clamped);
      scrollingRef.current = true;
      window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        scrollingRef.current = false;
      }, 1500);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sectionRefs.current[clamped]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    },
    []
  );

  const advance = useCallback(() => goTo(stateRef.current.active + 1), [goTo]);
  const back = useCallback(() => goTo(stateRef.current.active - 1), [goTo]);
  const reset = useCallback(() => goTo(0), [goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return; // one step per physical press — held keys must not thrash
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
        case "PageDown":
          e.preventDefault();
          advance();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          back();
          break;
        case "Escape":
          e.preventDefault();
          reset();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, back, reset]);

  // Manual scrolling (trackpad, swipe) keeps the dots honest — but only when
  // the user is driving; programmatic scrolls already set their destination.
  useEffect(() => {
    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
          if (index >= 0 && index !== stateRef.current.active) {
            setActive(index);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );
    for (const el of sectionRefs.current) if (el) observer.observe(el);

    const onScrollEnd = () => {
      scrollingRef.current = false;
    };
    container?.addEventListener("scrollend", onScrollEnd);
    return () => {
      observer.disconnect();
      container?.removeEventListener("scrollend", onScrollEnd);
    };
  }, []);

  const jumpTo = (index: number) => goTo(index);

  /** Rise-in delay: pair with the `pitch-rise` class on the same element. */
  const rise = (delayMs: number) => ({ "--rise": `${delayMs}ms` } as React.CSSProperties);

  const section = (index: number, children: React.ReactNode, extra = "") => (
    <section
      key={SECTIONS[index]}
      ref={(el) => {
        sectionRefs.current[index] = el;
      }}
      className={`relative h-dvh snap-start flex flex-col items-center justify-center gap-[4vh] px-[7vw] text-center overflow-hidden ${
        active === index ? "is-live" : ""
      } ${extra}`}
    >
      {children}
    </section>
  );

  return (
    <div
      ref={containerRef}
      onClick={advance}
      className="pitch-scroll fixed inset-0 overflow-y-auto snap-y snap-mandatory text-white cursor-default select-none"
      style={{ background: NAVY }}
    >
      {/* Mesh background — the audit input screen's, retuned darker and
          subtler. On S0 (the resting attract loop) it breathes a little
          more visibly; everywhere else content is king. */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
          active === 0 ? "opacity-100" : "opacity-40"
        }`}
        aria-hidden
      >
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
        {/* Ambient dot texture over the whole deck, very quiet */}
        <div className="pitch-dotgrid absolute inset-0 opacity-[0.35]" />
      </div>

      {/* Progress dots */}
      <nav
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        aria-label="Sections"
      >
        {SECTIONS.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => jumpTo(i)}
            aria-label={`Section ${i + 1}`}
            aria-current={active === i}
            className={`w-4 h-4 rounded-full transition-all ${
              active === i ? "scale-125" : "bg-white/25 hover:bg-white/50"
            }`}
            style={active === i ? { background: LIME } : undefined}
          />
        ))}
      </nav>

      {/* S0 — ATTRACT */}
      {section(
        0,
        <>
          <DotGrid className="inset-x-[10vw] top-[8vh] h-[24vh] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/inflowmd-final.png"
            alt="InflowMD"
            draggable={false}
            width={788}
            height={118}
            className="w-[min(44vw,780px)] h-auto pitch-rise"
            style={rise(0)}
          />
          <p
            className="text-[clamp(28px,2.6vw,52px)] font-extrabold tracking-tight text-white"
            aria-label="Get More Patients. Powered by AI"
          >
            {(
              [
                ["Get", false],
                ["More", false],
                ["Patients.", true],
                ["Powered", false],
                ["by", false],
                ["AI", true],
              ] as const
            ).map(([word, lime], i) => (
              <span
                key={word + i}
                aria-hidden
                className={`pitch-word inline-block will-change-transform ${
                  lime ? "pitch-word-lime" : ""
                }`}
                style={{ "--word": `${240 + i * 95}ms`, ...(lime ? { color: LIME } : {}) } as React.CSSProperties}
              >
                {word}
                {i < 5 ? "\u00A0" : ""}
              </span>
            ))}
          </p>
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "340ms" } as React.CSSProperties}>
            AI-powered marketing for medical practices
          </p>
        </>
      )}

      {/* S1 — HOOK */}
      {section(
        1,
        <>
          <h2 className={`${PRIMARY} max-w-[16em] pitch-rise`} style={rise(0)}>
            How do patients find a vein specialist in 2026?
          </h2>
          <div className="pitch-rise" style={rise(200)}>
            <SearchBars live={active === 1} />
          </div>
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "380ms" } as React.CSSProperties}>
            The answer changed. Most practice websites didn&rsquo;t.
          </p>
        </>
      )}

      {/* S2a — chat exchange + the AI reading the site */}
      {section(
        2,
        <>
          <h2 className={`${PRIMARY} max-w-[14em] pitch-rise`} style={rise(0)}>
            Patients are asking AI for doctor recommendations.
          </h2>
          <div className="flex items-center gap-[2.5vw] pitch-rise" style={{ "--rise": "220ms" } as React.CSSProperties}>
            <div className="w-[min(34vw,600px)] flex flex-col gap-[2vh] text-left">
              <div className="self-end max-w-[80%] rounded-3xl rounded-br-md bg-white/15 px-8 py-[1.8vh] text-[clamp(18px,1.5vw,30px)] font-medium text-white/90">
                best vein specialist near me
              </div>
              <div className="self-start w-[92%] rounded-3xl rounded-bl-md bg-white/[0.06] border border-white/10 px-8 py-[2.2vh] flex flex-col gap-[1.6vh]">
                {[82, 66, 74].map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span
                      className="inline-block w-[0.6vw] min-w-2 aspect-square rounded-full"
                      style={{ background: i === 0 ? LIME : "rgba(255,255,255,0.35)" }}
                    />
                    <div
                      className="pitch-answer-bar h-[1.2vh] min-h-2.5 rounded-full bg-white/30 blur-[3px]"
                      style={{ width: `${w}%`, animationDelay: `${i * 700}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <FlowDots />
            <SiteScan />
          </div>
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "400ms" } as React.CSSProperties}>
            AI answers from what it can read on your site.
          </p>
        </>
      )}

      {/* S2b — invisible: the scan comes up empty, lines load on entry */}
      {section(
        3,
        <>
          <h2 className={`${PRIMARY} max-w-[13em] pitch-rise`} style={rise(0)}>
            Most vein practice sites are invisible to AI.
          </h2>
          <div className="flex items-center gap-[4vw] pitch-rise" style={rise(200)}>
            <ul className="flex flex-col items-start gap-[3vh] text-[clamp(24px,2.1vw,44px)] font-semibold">
              {INVISIBLE_LINES.map(([head, tail], i) => (
                <li
                  key={head}
                  className="flex items-center gap-5 pitch-rise"
                  style={rise(350 + i * 250)}
                >
                  <FailX animate={active === 3} delayMs={350 + i * 250} />
                  <span className="text-white/90">
                    {head}
                    <span className="text-white/50 font-normal"> — {tail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <BrokenScan />
          </div>
        </>
      )}

      {/* S2c — the flip */}
      {section(
        4,
        <>
          {/* Abstract structured-data motif — angle brackets + node graph */}
          <svg
            viewBox="0 0 1200 700"
            className="absolute inset-0 w-full h-full opacity-[0.05]"
            fill="none"
            aria-hidden
          >
            <path d="M240 180 140 350l100 170" stroke={LIME} strokeWidth="14" strokeLinecap="round" />
            <path d="M960 180l100 170-100 170" stroke={LIME} strokeWidth="14" strokeLinecap="round" />
            <circle cx="430" cy="240" r="14" fill={BLUE} />
            <circle cx="620" cy="420" r="14" fill={LIME} />
            <circle cx="790" cy="260" r="14" fill={BLUE} />
            <circle cx="520" cy="560" r="14" fill="#fff" />
            <path d="M430 240 620 420m0 0 170-160M620 420 520 560" stroke="#fff" strokeWidth="4" />
          </svg>
          <DotGrid className="right-[6vw] bottom-[10vh] w-[18vw] h-[26vh] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
          <h2 className={`${PRIMARY} max-w-[14em] pitch-rise`} style={rise(0)}>
            We build sites AI can read, understand, and recommend.
          </h2>
          {/* Longer sentences than S2b, so a step down in size and room to
              wrap — these are read from the back of a booth. */}
          <ul className="flex flex-col items-start gap-[3vh] text-[clamp(20px,1.6vw,34px)] font-semibold max-w-[40em] text-left">
            {BUILD_LINES.map(([lead, rest], i) => (
              <li
                key={lead}
                className="flex items-start gap-5 pitch-rise"
                style={rise(300 + i * 250)}
              >
                <span className="shrink-0 mt-[0.1em]">
                  <PassCheck animate={active === 4} delayMs={300 + i * 250} />
                </span>
                <span className="text-white/90 leading-snug">
                  {lead}
                  <span className="text-white/50 font-normal">{rest}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* S3a — 53% */}
      {section(
        5,
        <>
          <div
            className="font-extrabold leading-none tracking-tight text-[clamp(200px,30vh,320px)] pitch-rise"
            style={{ color: LIME, "--rise": "0ms" } as React.CSSProperties}
          >
            53%
          </div>
          <p className={`${PRIMARY} text-[clamp(32px,3vw,68px)] max-w-[16em] pitch-rise`} style={{ "--rise": "200ms" } as React.CSSProperties}>
            of mobile visitors abandon after 3 seconds.
          </p>
          <p className="text-[clamp(16px,1.2vw,24px)] text-white/40 pitch-rise" style={{ "--rise": "360ms" } as React.CSSProperties}>
            Google / SOASTA
          </p>
        </>
      )}

      {/* S3b — 3x bars + the conversion, illustrated */}
      {section(
        6,
        <>
          <h2 className={`${PRIMARY} max-w-[15em] pitch-rise`} style={rise(0)}>
            A 1-second site converts 3x better than a 5-second site.
          </h2>
          <div className="flex items-center gap-[6vw] pitch-rise" style={{ "--rise": "220ms" } as React.CSSProperties}>
            <div className="flex items-end gap-[4vw] h-[32vh]">
              <div className="flex flex-col items-center gap-3 h-full justify-end">
                <div
                  className={`pitch-bar w-[8vw] min-w-24 rounded-t-2xl bg-white/20 ${
                    active === 6 ? "" : "pitch-bar-hidden"
                  }`}
                  style={{ height: "33.3%" }}
                />
                <span className="text-[clamp(18px,1.5vw,30px)] font-semibold text-white/50">
                  5s site
                </span>
              </div>
              <div className="flex flex-col items-center gap-3 h-full justify-end">
                <div
                  className={`pitch-bar w-[8vw] min-w-24 rounded-t-2xl ${
                    active === 6 ? "" : "pitch-bar-hidden"
                  }`}
                  style={{ height: "100%", background: LIME, transitionDelay: "150ms" }}
                />
                <span className="text-[clamp(18px,1.5vw,30px)] font-semibold" style={{ color: LIME }}>
                  1s site
                </span>
              </div>
            </div>
            <BookingSim live={active === 6} />
          </div>
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "400ms" } as React.CSSProperties}>
            Portent, 2022 — 100M+ pageviews, lead-generation sites
          </p>
        </>
      )}

      {/* S3c — architecture */}
      {section(
        7,
        <>
          <svg
            viewBox="0 0 1200 320"
            className="absolute left-0 right-0 top-[16vh] w-full opacity-60"
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="pitch-swoosh" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={LIME} stopOpacity="0" />
                <stop offset="0.55" stopColor={LIME} stopOpacity="0.9" />
                <stop offset="1" stopColor={LIME} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-40 260 C 320 250, 520 90, 1240 60"
              stroke="url(#pitch-swoosh)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
          <DotGrid className="left-[8vw] top-[14vh] w-[20vw] h-[30vh] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <DotGrid className="right-[10vw] bottom-[12vh] w-[16vw] h-[24vh] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <h2 className={`${PRIMARY} max-w-[13em] pitch-rise`} style={rise(0)}>
            We build on the same architecture as the fastest sites on the web.
          </h2>
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "200ms" } as React.CSSProperties}>
            Fast by design — not by plugin.
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-x-[1.6vw] gap-y-[1.4vh] max-w-[60vw] pitch-rise"
            style={{ "--rise": "360ms" } as React.CSSProperties}
          >
            {FAST_SITES.map((name, i) => (
              <span key={name} className="inline-flex items-center gap-[1.6vw]">
                {i > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: `${LIME}66` }} />
                )}
                <span className="text-[clamp(14px,1.15vw,24px)] font-semibold uppercase tracking-[0.18em] text-white/45">
                  {name}
                </span>
              </span>
            ))}
          </div>
        </>
      )}

      {/* S4 — PROOF */}
      {section(
        8,
        <>
          <DotGrid className="inset-x-[20vw] top-[8vh] h-[18vh] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <h2 className={`${PRIMARY} max-w-[13em] pitch-rise`} style={rise(0)}>
            Same test. Their site. Our build.
          </h2>
          <CountingGauges live={active === 8} />
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "450ms" } as React.CSSProperties}>
            Run it live on any site — including this one.
          </p>
        </>
      )}

      {/* S5 — HANDOFF */}
      {section(
        9,
        <>
          <h2 className={`${PRIMARY} pitch-rise`} style={rise(0)}>
            Want to see yours?
          </h2>
          <a
            href="/audit"
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            className="pitch-rise inline-flex items-center justify-center min-h-[64px] rounded-2xl px-[3.5vw] py-[2.6vh] text-[clamp(24px,2vw,42px)] font-extrabold shadow-xl transition-transform hover:scale-[1.03]"
            style={{ background: LIME, color: NAVY, "--rise": "200ms" } as React.CSSProperties}
          >
            Run your practice&rsquo;s audit
          </a>
          <p className={`${SUB} pitch-rise`} style={{ "--rise": "360ms" } as React.CSSProperties}>
            30 seconds. Google&rsquo;s own measurement.
          </p>
        </>
      )}
    </div>
  );
}
