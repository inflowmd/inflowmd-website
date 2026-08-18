"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge } from "../audit/Gauge";
import CviStages, { CVI_STAGES } from "@/components/CviStages";

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
/** The assessment result: concerning, not alarming. */
const AMBER = "#f59e0b";

/**
 * One id per rendered section — the progress dots map this array and goTo
 * clamps to its length, so an id with no section behind it produces a
 * seventeenth dot the deck can scroll to with nothing on it. That reads from
 * the floor as a duplicate final slide, because the CTA simply stays put.
 */
const SECTIONS = [
  // S0 carries two beats: the logo alone, then the three pillars.
  "s0",
  "s1",
  "s2a",
  "s2b",
  "s2c",
  // Act 3 — speed. The claim, the side-by-side demonstration and the statistic
  // behind it now share one screen instead of three.
  "s3a",
  "s3b",
  "s3c",
  // Act 4 — how we build. The assessment and what it turns into are one screen
  // too: the join between them was the argument.
  "s4a",
  "s4b",
  "s4c",
  "s4d",
  "s5",
] as const;

/**
 * Which act each section belongs to. The bookends — the attract screen and the
 * closing CTA — sit outside the framework and carry no label.
 *
 * Indexed by section, so this has to move whenever SECTIONS does; keeping it
 * directly beneath that array is the reminder.
 */
const ACTS = [
  { number: "01", label: "Visibility" },
  { number: "02", label: "Performance" },
  { number: "03", label: "Vein Education" },
] as const;

/** section index → act index, or null for the bookends. */
const ACT_OF_SECTION: ReadonlyArray<number | null> = [
  null, // s0  attract
  0, //    s1  how patients search
  0, //    s2a asking AI
  0, //    s2b invisible to AI
  0, //    s2c what we do about it
  1, //    s3a claim + comparison + the statistic
  1, //    s3b 3x bars
  1, //    s3c architecture
  2, //    s4a brochures
  2, //    s4b what patients believe
  2, //    s4c the stages
  2, //    s4d assessment becomes appointment
  null, // s5  the CTA
];

/**
 * How long autoplay rests on each slide, in ms.
 *
 * The rule is that a slide's animation must FINISH before the deck moves —
 * cutting a build halfway reads as a fault, not as pace. These numbers are
 * therefore derived from the animations themselves, not chosen for rhythm:
 *
 *   s1  the three search bars are a ~9.6s loop (type, think, speak)
 *   s6  the booking sim is a 4s CSS loop; one full click-to-booked cycle
 *   s9  the beliefs light one at a time: 0.5s + 3 × 1.2s
 *   s10 the stage walk: 0.5s + 5 × 0.7s, plus the last transition
 *   s11 the assessment runs ~7.8s end to end, then wants a beat to be read
 *   s0  the attract screen holds longest — it is what a passer-by sees most
 *   s12 the CTA holds before looping back
 *
 * Everything else is a rise-in and gets the standard rest.
 */
const AUTOPLAY_STANDARD_MS = 5_500;
const AUTOPLAY_MS: Readonly<Record<number, number>> = {
  0: 10_000,
  1: 10_000,
  2: 7_000,
  5: 6_500,
  6: 6_500,
  9: 6_500,
  10: 7_000,
  11: 10_000,
  12: 8_000,
};

/** Two minutes of nobody touching it and the booth goes back to attracting. */
const IDLE_BACK_TO_AUTOPLAY_MS = 120_000;

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

/* ---------- S3c: the stages, walked ---------- */

/**
 * Advances the lime accent along the CVI progression once the screen is live.
 * One press brings the screen up and the progression walks itself — the deck's
 * rule is one keypress per section, so this must not need four.
 */
function StageWalk({ live }: { live: boolean }) {
  const [reached, setReached] = useState(0);

  useEffect(() => {
    if (!live) {
      setReached(0);
      return;
    }
    if (prefersReducedMotion()) {
      setReached(CVI_STAGES.length);
      return;
    }
    const timers: number[] = [];
    for (let i = 1; i <= CVI_STAGES.length; i++) {
      timers.push(window.setTimeout(() => setReached(i), 500 + i * 700));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live]);

  return <CviStages variant="stage" reached={reached} />;
}

/* ---------- S4b: three beliefs, lit one at a time ---------- */

const PATIENT_THOUGHTS = ["“Just tired legs.”", "“It runs in the family.”", "“It’s only cosmetic.”"];

/**
 * Lights each belief in turn, then leaves all three standing in white.
 * Sequential rather than simultaneous: three phrases arriving together are a
 * list, and a list is scanned. One at a time, each is read.
 */
function ThoughtCycle({ live }: { live: boolean }) {
  /** -1 before the cycle, 0..2 while lighting, 3 once settled. */
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    // Every state change goes through a timer, including the resets: setting
    // state straight from an effect body cascades an extra render, and the
    // linter is right to flag it. A 0ms timer lands on the next tick and
    // behaves identically here.
    const timers: number[] = [];
    if (!live) {
      timers.push(window.setTimeout(() => setPhase(-1), 0));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
    if (prefersReducedMotion()) {
      timers.push(window.setTimeout(() => setPhase(PATIENT_THOUGHTS.length), 0));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
    PATIENT_THOUGHTS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setPhase(i), 500 + i * 1200));
    });
    timers.push(
      window.setTimeout(() => setPhase(PATIENT_THOUGHTS.length), 500 + PATIENT_THOUGHTS.length * 1200)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[4vw] gap-y-[2vh]">
      {PATIENT_THOUGHTS.map((thought, i) => {
        const lit = phase === i;
        const settled = phase >= PATIENT_THOUGHTS.length || phase > i;
        return (
          <span
            key={thought}
            className="text-[clamp(20px,2.1vw,42px)] font-light italic transition-all duration-500"
            style={{
              color: lit ? LIME : "#fff",
              opacity: lit || settled ? 1 : 0.22,
              textShadow: lit ? `0 0 clamp(18px,2vw,38px) ${LIME}66` : "none",
            }}
          >
            {thought}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- S4a: the brochure every practice already has ---------- */

/**
 * A typical vein practice site, drawn rather than screenshotted. Specific
 * enough that a doctor recognises their own — hero slab, three treatment
 * cards, a phone number top right, an appointment button, a footer strip —
 * and deliberately dated: flat greys and one dull blue, the palette of a site
 * built in 2019 and left alone since.
 */
function BrochureMockup() {
  const DULL = "#5b7fa8";
  const card = (i: number) => (
    <div key={i} className="flex-1 rounded-[0.4vw] border border-black/5 bg-white p-[0.7vw]">
      <div className="mb-[0.5vw] h-[1.6vw] w-[1.6vw] rounded-full" style={{ background: `${DULL}33` }} />
      <div className="mb-[0.35vw] h-[0.5vw] w-[70%] rounded-full bg-slate-300" />
      <div className="h-[0.35vw] w-[92%] rounded-full bg-slate-200" />
      <div className="mt-[0.25vw] h-[0.35vw] w-[80%] rounded-full bg-slate-200" />
    </div>
  );
  return (
    <div className="pitch-brochure w-[min(52vw,780px)] overflow-hidden rounded-[0.9vw] border border-white/12 bg-[#f4f5f7] shadow-2xl">
      {/* browser chrome */}
      <div className="flex items-center gap-[0.5vw] bg-[#e4e6ea] px-[1vw] py-[0.7vw]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[0.6vw] w-[0.6vw] rounded-full bg-black/15" />
        ))}
        <div className="ml-[0.6vw] h-[1vw] flex-1 rounded-full bg-white/70" />
      </div>
      {/* nav + phone number */}
      <div className="flex items-center justify-between px-[1.2vw] py-[0.9vw]" style={{ background: DULL }}>
        <div className="h-[0.8vw] w-[7vw] rounded-full bg-white/70" />
        <div className="flex items-center gap-[0.8vw]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[0.45vw] w-[2.4vw] rounded-full bg-white/40" />
          ))}
          <div className="h-[0.7vw] w-[5vw] rounded-full bg-white/85" />
        </div>
      </div>
      {/* hero: placeholder photo + headline bars */}
      <div className="flex gap-[1vw] px-[1.2vw] py-[1.2vw]">
        <div className="flex h-[8vw] flex-[1.1] items-center justify-center rounded-[0.4vw] bg-slate-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" className="h-[2.4vw] w-[2.4vw]" aria-hidden>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.8" />
            <path d="m21 16-5.5-5.5L7 19" />
          </svg>
        </div>
        <div className="flex flex-[1.4] flex-col justify-center gap-[0.6vw]">
          <div className="h-[1.1vw] w-[88%] rounded-full bg-slate-400" />
          <div className="h-[0.55vw] w-[95%] rounded-full bg-slate-300" />
          <div className="h-[0.55vw] w-[78%] rounded-full bg-slate-300" />
          <div
            className="mt-[0.5vw] flex h-[2vw] w-[11vw] items-center justify-center rounded-[0.3vw]"
            style={{ background: DULL }}
          >
            <div className="h-[0.5vw] w-[7vw] rounded-full bg-white/85" />
          </div>
        </div>
      </div>
      {/* three treatment cards */}
      <div className="flex gap-[1vw] px-[1.2vw] pb-[1.2vw]">{[0, 1, 2].map(card)}</div>
      {/* footer strip */}
      <div className="flex items-center justify-between px-[1.2vw] py-[0.9vw]" style={{ background: "#33455c" }}>
        <div className="h-[0.4vw] w-[9vw] rounded-full bg-white/25" />
        <div className="h-[0.4vw] w-[5vw] rounded-full bg-white/20" />
      </div>
    </div>
  );
}

/* ---------- S4d: assessment becomes appointment ---------- */

const SYMPTOMS = [
  { label: "Leg pain, aching or cramping", picked: true },
  { label: "Restless legs", picked: true },
  { label: "Swelling of the legs or ankles", picked: true },
  { label: "Leg fatigue or weakness", picked: true },
  { label: "Skin discoloration or texture changes", picked: false },
  { label: "Open wounds or venous ulcers", picked: false },
];
const PICKED_COUNT = SYMPTOMS.filter((s) => s.picked).length;

/**
 * Each row's position in the tick order (1-based), or null if it is never
 * ticked. Computed once at module scope: doing it with a running counter
 * inside the component meant reassigning a variable during render, which the
 * compiler rules reject — and rightly, since it makes the row list depend on
 * evaluation order rather than on the data.
 */
const PICK_ORDER: ReadonlyArray<number | null> = SYMPTOMS.reduce<Array<number | null>>(
  (acc, s) => {
    const ticked = acc.filter((x) => x !== null).length;
    acc.push(s.picked ? ticked + 1 : null);
    return acc;
  },
  []
);
const STEP_MS = 800;

/**
 * The scale both simulated screens are drawn against.
 *
 * They used to size their boxes in px-capped vh (`min(40vh,410px)`) while
 * their type stayed in raw vh. Past the cap the box stopped growing and the
 * text did not, so at 2560x1440 the appointment card's aspect ratio had gone
 * from 1.66 to 0.83 — the squish. Now one clamped font-size drives both, every
 * internal measure is in em, and the pair can only ever scale together.
 */
const SIM_SCALE = "var(--pitch-sim-scale, clamp(7px, 1vh, 12px))";
/** Matches the CSS move below — beat 4 must not land mid-slide. */
const MOVE_STEP_MS = 1200;

/** The assessment, drawn. Presentational — the choreography lives above it. */
function CheckerDevice({
  checked,
  pressed,
  result,
}: {
  checked: number;
  pressed: boolean;
  result: boolean;
}) {
  const rows = SYMPTOMS.map((s, i) => {
    const order = PICK_ORDER[i];
    return { ...s, on: order !== null && order <= checked };
  });

  return (
    <div className="rounded-[2.6em] border-[0.5em] border-white/15 bg-black p-[0.5em] shadow-[0_30px_90px_rgba(0,0,0,0.6)]" style={{ fontSize: SIM_SCALE }}>
      <div className="relative w-[40em] overflow-hidden rounded-[2.1em] bg-[#0b1620] px-[2.4em] py-[2.6em]">
        <p className="text-[1.8em] font-semibold leading-tight text-white">
          Do you experience any of these in your legs?
        </p>
        <p className="mt-[0.6em] text-[1.3em] text-white/40">Select all that apply.</p>

        <div className="mt-[1.6em] flex flex-col gap-[0.9em]">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-2 rounded-[1.1em] border px-[1.3em] py-[1.1em] transition-all duration-300"
              style={{
                borderColor: row.on ? "#2f9fd0" : "rgba(255,255,255,0.09)",
                background: row.on ? "rgba(47,159,208,0.12)" : "rgba(255,255,255,0.02)",
              }}
            >
              <span className="text-[1.35em] leading-tight text-white/85">{row.label}</span>
              <span className="shrink-0 transition-opacity duration-300" style={{ opacity: row.on ? 1 : 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#7fd4f5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-[1.7em] w-[1.7em]" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-[1.8em] flex justify-end">
          <span
            className="rounded-full px-[2em] py-[1em] text-[1.4em] font-bold text-white transition-all duration-300"
            style={{
              background: pressed ? LIME : "#1a7fa8",
              transform: pressed ? "scale(0.96)" : "scale(1)",
              boxShadow: pressed ? `0 0 0 0.5vh ${LIME}44` : "none",
            }}
          >
            Continue →
          </span>
        </div>

        {/* The flag. Amber and an exclamation: a tick would read as "you
            passed", which is the opposite of the point. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1620] px-[2.2em] text-center transition-opacity duration-500"
          style={{ opacity: result ? 1 : 0, pointerEvents: "none" }}
        >
          <div className="mb-[2em] flex h-[5.6em] w-[5.6em] items-center justify-center rounded-full" style={{ background: AMBER }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="h-[3em] w-[3em]" aria-hidden>
              <path d="M12 7v6" />
              <circle cx="12" cy="17" r="0.6" fill="#fff" stroke="none" />
            </svg>
          </div>
          <p className="text-[2em] font-extrabold leading-snug text-white">
            Your symptoms suggest you need a vein screening.
          </p>
        </div>
      </div>
    </div>
  );
}

/** What the assessment turns into: a booked screening. */
function AppointmentCard() {
  return (
    <div className="w-[38em] rounded-[2em] border border-white/12 bg-white/[0.04] p-[3em] shadow-[0_30px_90px_rgba(0,0,0,0.45)]" style={{ fontSize: SIM_SCALE }}>
      <div className="flex items-center gap-[1.4em]">
        <span className="flex h-[4.4em] w-[4.4em] items-center justify-center rounded-full" style={{ background: LIME }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="h-[2.4em] w-[2.4em]" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="text-[1.7em] font-bold uppercase tracking-[0.16em] text-white/50">
          Appointment booked
        </span>
      </div>

      <div className="mt-[3em] flex items-start gap-[2em]">
        {/* calendar leaf */}
        <div className="w-[9em] shrink-0 overflow-hidden rounded-[1.2em] border border-white/15">
          <div className="py-[0.7em] text-center text-[1.3em] font-bold uppercase tracking-[0.14em] text-white" style={{ background: LIME }}>
            Aug
          </div>
          <div className="bg-white/[0.06] py-[1em] text-center text-[3.4em] font-extrabold leading-none text-white">
            19
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[2.4em] font-extrabold leading-tight text-white">Vein Screening</p>
          <p className="mt-[0.8em] text-[1.7em] text-white/55">Tuesday · 2:30 PM</p>
          <p className="mt-[0.4em] text-[1.7em] text-white/55">Ultrasound · 30 minutes</p>
        </div>
      </div>
    </div>
  );
}

/**
 * One screen, four beats: the patient answers, the assessment flags them, the
 * device steps aside, and the appointment lands in the space it vacated.
 *
 * The device starts CENTRED and only moves once its job is done. Parking it
 * on the left from the first frame left a hole on the right that read as a
 * layout mistake rather than as a space waiting to be filled — and the move
 * itself is the transition, so the headline changes during it. One beat, not
 * two things happening near each other.
 */
function ScreeningTurn({ live }: { live: boolean }) {
  const [checked, setChecked] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [result, setResult] = useState(false);
  /** Beat 3: the device slides left and the headline swaps. */
  const [moved, setMoved] = useState(false);
  /** Beat 4: the appointment lands. */
  const [booked, setBooked] = useState(false);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const set = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    if (!live) {
      set(() => {
        setChecked(0);
        setPressed(false);
        setResult(false);
        setMoved(false);
        setBooked(false);
        setSnap(false);
      }, 0);
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
    if (prefersReducedMotion()) {
      // The finished composition, arrived at without moving.
      set(() => {
        setSnap(true);
        setChecked(PICKED_COUNT);
        setPressed(true);
        setResult(true);
        setMoved(true);
        setBooked(true);
      }, 0);
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    for (let i = 1; i <= PICKED_COUNT; i++) set(() => setChecked(i), i * STEP_MS);
    const afterChecks = PICKED_COUNT * STEP_MS + 500;
    set(() => setPressed(true), afterChecks);
    set(() => setResult(true), afterChecks + 600);
    // Beat 3 waits out a hold on the result — the flag is the point of the
    // assessment and deserves a moment before the screen rearranges.
    set(() => setMoved(true), afterChecks + 600 + 1500);
    set(() => setBooked(true), afterChecks + 600 + 1500 + MOVE_STEP_MS);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live]);

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  /**
   * Deliberately slow: this move IS the transition between the two halves of
   * the argument, and the headline crossfades over exactly the same window so
   * the pair reads as one motion rather than as two changes near each other.
   */
  const MOVE_MS = 1200;
  const move = snap ? "none" : `transform ${MOVE_MS}ms ${ease}`;
  const fade = snap ? "none" : `opacity ${MOVE_MS}ms ${ease}`;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Both headlines share one grid cell so the block never changes height
          and the crossfade has nothing to push around. */}
      {/* Both headlines share one grid cell so the block never changes height
          and the crossfade has nothing to push around. Their max-widths differ
          because their lengths do — each is set to break across two lines, not
          three, at booth scale. */}
      <h2 className="grid justify-items-center text-center">
        <span
          className="[grid-area:1/1] max-w-[13em] text-[clamp(34px,3.9vw,84px)] font-extrabold leading-[1.08] tracking-tight text-white"
          style={{ opacity: moved ? 0 : 1, transition: fade }}
          aria-hidden={moved}
        >
          And we ask them for their symptoms.
        </span>
        <span
          className="[grid-area:1/1] max-w-[17em] text-[clamp(30px,3.3vw,72px)] font-extrabold leading-[1.1] tracking-tight text-white"
          style={{ opacity: moved ? 1 : 0, transition: fade }}
          aria-hidden={!moved}
        >
          That&rsquo;s what turns a{" "}
          <span style={{ color: LIME }}>website visitor</span> into a{" "}
          <span style={{ color: LIME }}>vein screening</span>.
        </span>
      </h2>

      {/* Fixed stage: the device is centred in it and later translates out of
          centre, so nothing below reflows when the composition changes. */}
      <div className="pitch-sim-stage relative mt-[5vh] h-[54vh] w-full">
        <div
          className="pitch-sim-device absolute left-1/2 top-1/2"
          style={{
            // Movement only. Shrinking on the way out made the device look
            // demoted rather than moved aside; it is the same device either
            // side of the transition, so it stays the same size.
            // The offsets are variables rather than literals so the tablet
            // sheet can send the device UP instead of left — side by side is
            // the one thing that does not fit at 834px.
            transform: moved
              ? "translate(calc(-50% - var(--pitch-sim-shift-x, 21vw)), calc(-50% - var(--pitch-sim-shift-y, 0px)))"
              : "translate(-50%, -50%)",
            transition: move,
          }}
        >
          <CheckerDevice checked={checked} pressed={pressed} result={result} />
        </div>

        <div
          className="pitch-sim-card absolute left-1/2 top-1/2"
          style={{
            transform:
              "translate(calc(-50% + var(--pitch-sim-card-x, 20vw)), calc(-50% + var(--pitch-sim-card-y, 0px)))",
            opacity: booked ? 1 : 0,
            transition: snap ? "none" : `opacity 800ms ${ease}`,
          }}
          aria-hidden={!booked}
        >
          <AppointmentCard />
        </div>
      </div>
    </div>
  );
}

/* ---------- S5: the recipe, in three ---------- */

/** Line icons in the deck's own style: 2px strokes, round caps, no fill. */
const RECAP_ICONS = {
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
  click: (
    <>
      <rect x="3" y="4" width="13" height="9" rx="2.5" />
      <path d="m12.5 12.5 8 3.2-3.4 1.3-1.3 3.4z" />
    </>
  ),
} as const;

const RECAP = [
  ["Visibility", "Be found by patients and AI", "search"],
  ["Performance", "Every second costs conversions", "gauge"],
  ["Vein Education", "Turn visitors into screenings", "click"],
] as const;

const RECAP_STEP_MS = 900;
const RECAP_HOLD_MS = 8000;

/**
 * The three acts, reassembled across the screen. Builds left to right so the
 * deck lands as a recipe rather than a blur, then holds long enough to say
 * "so that's the three pieces" before moving itself on.
 */
function Recap({ live, onDone }: { live: boolean; onDone?: () => void }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(onDone);
  // Synced in an effect, not during render: writing a ref while rendering is
  // a side effect in the render path, and React's lint rules are right to
  // reject it. The callback is only ever read from a timer.
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timers: number[] = [];
    if (!live) {
      timers.push(window.setTimeout(() => setShown(0), 0));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
    if (prefersReducedMotion()) {
      timers.push(window.setTimeout(() => setShown(RECAP.length), 0));
      if (doneRef.current) timers.push(window.setTimeout(() => doneRef.current?.(), RECAP_HOLD_MS));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
    RECAP.forEach((_, i) =>
      timers.push(window.setTimeout(() => setShown(i + 1), 400 + i * RECAP_STEP_MS))
    );
    // On the intro there is nothing to advance to — the presenter talks over
    // it and presses on when ready — so the hold only exists when asked for.
    if (doneRef.current) {
      timers.push(
        window.setTimeout(
          () => doneRef.current?.(),
          400 + RECAP.length * RECAP_STEP_MS + RECAP_HOLD_MS
        )
      );
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live]);

  return (
    // mx-auto is load-bearing: this row has a FIXED width once the viewport
    // passes ~1790px, and a fixed-width block inside a full-width parent
    // aligns left. On a 1440-wide laptop the slack is 14px and invisible; on a
    // 2560 monitor it is 351px and the framework sits visibly off-centre.
    <div className="pitch-recap mx-auto flex w-[min(84vw,1500px)] items-start justify-between gap-[4vw]">
      {RECAP.map(([label, line, icon], i) => (
        <div
          key={label}
          className="flex flex-1 flex-col items-center text-center"
          style={{
            opacity: i < shown ? 1 : 0,
            transform: i < shown ? "translateY(0)" : "translateY(16px)",
            transition:
              "opacity 600ms cubic-bezier(0.22,1,0.36,1), transform 600ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="mb-[2.4vh] h-[7vh] w-[7vh]"
            fill="none"
            stroke={LIME}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {RECAP_ICONS[icon]}
          </svg>
          <div
            className="text-[clamp(26px,2.9vw,62px)] font-extrabold leading-none tracking-tight"
            style={{ color: LIME }}
          >
            {label}
          </div>
          <div className="mt-[1.6vh] max-w-[11em] text-[clamp(16px,1.5vw,32px)] font-light leading-snug text-white">
            {line}
          </div>
        </div>
      ))}
    </div>
  );
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
    <div className="pitch-searchbars flex flex-col items-center gap-[2.4vh] w-[min(46vw,760px)]">
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
    <div className="pitch-scan-card relative w-[min(20vw,340px)] shrink-0" aria-hidden>
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
    <div className="pitch-scan-card relative w-[min(20vw,340px)] shrink-0" aria-hidden>
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
    <div className="pitch-gauges flex items-center gap-[8vw]">
      <div className="pitch-rise flex flex-col items-center" style={{ "--rise": "150ms" } as React.CSSProperties}>
        <Gauge
          score={scores.a}
          size="var(--pitch-gauge-size, 380px)"
          valueClass="text-8xl pitch-gauge-value"
          srLabel="Their site: performance score 42 of 100"
        />
        <p className="mt-[1.6vh] text-[clamp(14px,1.2vw,24px)] font-bold uppercase tracking-[0.18em] text-white/45">
          Their site
        </p>
      </div>
      <div className="pitch-rise flex flex-col items-center" style={{ "--rise": "300ms" } as React.CSSProperties}>
        <Gauge
          score={scores.b}
          size="var(--pitch-gauge-size, 380px)"
          valueClass="text-8xl pitch-gauge-value"
          srLabel="Modern architecture: performance score 98 of 100"
        />
        <p className="mt-[1.6vh] text-[clamp(14px,1.2vw,24px)] font-bold uppercase tracking-[0.18em]" style={{ color: LIME }}>
          Modern architecture
        </p>
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

  /**
   * The attract screen holds two states. The first press reveals the three
   * pillars beneath the tagline instead of advancing, so the framework can be
   * introduced out loud before the deck moves; the press after that leaves S0
   * as normal. Held in a ref as well as state because the key handler reads it
   * without re-subscribing.
   */
  const [introRevealed, setIntroRevealed] = useState(false);
  const introRef = useRef(false);
  useEffect(() => {
    introRef.current = introRevealed;
  }, [introRevealed]);

  /**
   * The booth runs itself until someone touches it. Autoplay is the DEFAULT —
   * the monitor is attracting for most of the day and presenting for minutes
   * of it.
   */
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef(true);
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  /**
   * Someone walked up. Stop attracting, go back to the top, and hand over —
   * landing them mid-act would mean starting the conversation halfway through
   * an argument they have not heard the setup for.
   */
  const takeOver = useCallback(() => {
    autoplayRef.current = false;
    setAutoplay(false);
    introRef.current = false;
    setIntroRevealed(false);
    goTo(0);
  }, [goTo]);

  /** Back to attracting, from the top. */
  const resumeAutoplay = useCallback(() => {
    introRef.current = false;
    setIntroRevealed(false);
    autoplayRef.current = true;
    setAutoplay(true);
    goTo(0);
  }, [goTo]);

  const advance = useCallback(() => {
    if (stateRef.current.active === 0 && !introRef.current) {
      introRef.current = true;
      setIntroRevealed(true);
      return;
    }
    goTo(stateRef.current.active + 1);
  }, [goTo]);
  const back = useCallback(() => {
    if (stateRef.current.active === 0 && introRef.current) {
      introRef.current = false;
      setIntroRevealed(false);
      return;
    }
    goTo(stateRef.current.active - 1);
  }, [goTo]);
  const reset = useCallback(() => {
    introRef.current = false;
    setIntroRevealed(false);
    goTo(0);
  }, [goTo]);

  // The clock. Re-armed on every slide change, so each slide gets its own
  // rest and nothing overlaps.
  useEffect(() => {
    if (!autoplay) return;
    const rest = AUTOPLAY_MS[active] ?? AUTOPLAY_STANDARD_MS;
    const t = window.setTimeout(() => {
      goTo(active >= SECTIONS.length - 1 ? 0 : active + 1);
    }, rest);
    return () => window.clearTimeout(t);
  }, [autoplay, active, goTo]);

  // Manual mode times out: after two quiet minutes the booth resumes
  // attracting, from the top.
  useEffect(() => {
    if (autoplay) return;
    let idle = window.setTimeout(resumeAutoplay, IDLE_BACK_TO_AUTOPLAY_MS);
    const poke = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(resumeAutoplay, IDLE_BACK_TO_AUTOPLAY_MS);
    };
    window.addEventListener("keydown", poke);
    window.addEventListener("pointerdown", poke);
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("keydown", poke);
      window.removeEventListener("pointerdown", poke);
    };
  }, [autoplay, resumeAutoplay]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return; // one step per physical press — held keys must not thrash
      // The first press is the takeover and nothing else: it must not also
      // advance, or the presenter lands on s1 having asked for the start.
      if (autoplayRef.current) {
        e.preventDefault();
        takeOver();
        return;
      }
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        resumeAutoplay();
        return;
      }
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
  }, [advance, back, reset, takeOver, resumeAutoplay]);

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
      onClick={() => (autoplayRef.current ? takeOver() : advance())}
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
      {/* Autoplay tell. Deliberately almost invisible — it exists so the
          presenter can see at a glance whether the deck will move on its own,
          and a visitor should never read it as a control. */}
      <div
        className="pitch-autoplay-tell pointer-events-none fixed bottom-[3vh] left-[4vw] z-50 h-[7px] w-[7px] rounded-full transition-opacity duration-700"
        style={{ background: "#ffffff", opacity: autoplay ? 0.16 : 0 }}
        aria-hidden
      />

      {/* Act marker. Fixed rather than per-section so it is genuinely still
          while slides advance beneath it — a label re-rendered inside each
          section would re-run its entrance animation every press. All three
          are stacked in one grid cell and swapped by opacity, which gives the
          crossfade for free and keeps the box from resizing between acts. */}
      <div
        className="pitch-act-marker pointer-events-none fixed left-[4vw] top-[6vh] z-50 grid"
        aria-hidden
      >
        {ACTS.map((act, i) => (
          <span
            key={act.number}
            className="[grid-area:1/1] whitespace-nowrap text-[clamp(12px,1.05vw,22px)] font-bold uppercase tracking-[0.32em]"
            style={{
              opacity: ACT_OF_SECTION[active] === i ? 1 : 0,
              transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <span className="text-white/35">{act.number}</span>
            <span className="text-white/25"> — </span>
            <span style={{ color: LIME }}>{act.label}</span>
          </span>
        ))}
      </div>

      <nav
        className="pitch-rail fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4"
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
            className={`pitch-rail-dot w-4 h-4 rounded-full transition-all ${
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
          {/* The framework, on the second beat of the attract screen. Nothing
              auto-advances here — the presenter talks over it. */}
          <div
            className="mt-[3vh] w-full transition-opacity duration-500"
            style={{ opacity: introRevealed ? 1 : 0 }}
            aria-hidden={!introRevealed}
          >
            <Recap live={active === 0 && introRevealed} />
          </div>
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
          <div className="pitch-chat-row flex items-center gap-[2.5vw] pitch-rise" style={{ "--rise": "220ms" } as React.CSSProperties}>
            <div className="pitch-chat-col w-[min(34vw,600px)] flex flex-col gap-[2vh] text-left">
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
          <div className="pitch-invisible-row flex items-center gap-[4vw] pitch-rise" style={rise(200)}>
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
          <ul className="pitch-build-list flex flex-col items-start gap-[3vh] text-[clamp(20px,1.6vw,34px)] font-semibold max-w-[40em] text-left">
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

      {/* ═══ ACT 3 — SPEED ═══ */}
      {/* S3a — the demonstration, with the claim above it and its evidence
          below. Five competing elements fitted on one screen before: the
          headline ran three lines wide enough to collide with the act marker,
          and the rings — the only thing here worth seeing from the floor —
          were the smallest they have ever been. The headline is now one line,
          the rings are bigger, and everything else is explicitly a footnote. */}
      {section(
        5,
        <>
          <DotGrid className="inset-x-[24vw] top-[4vh] h-[14vh] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <h2 className={`${PRIMARY} pitch-rise`} style={rise(0)}>
            Faster sites convert.
          </h2>
          <CountingGauges live={active === 5} />
          <p
            className="pitch-rise text-[clamp(18px,1.6vw,34px)] font-semibold tracking-wide text-white/70"
            style={rise(500)}
          >
            Same test. Same day. Different architecture.
          </p>
          {/* Footnotes, and sized like footnotes. */}
          <p
            className="pitch-rise text-[clamp(13px,1.05vw,22px)] font-light text-white/40"
            style={rise(650)}
          >
            The gap isn&rsquo;t tuning. It&rsquo;s what the site is built on.
          </p>
          <p
            className="pitch-rise max-w-[52em] text-[clamp(12px,0.95vw,20px)] font-light leading-snug text-white/30"
            style={rise(780)}
          >
            53% of mobile visitors abandon a page that takes longer than 3 seconds to load —
            Google / SOASTA, 2016
          </p>
        </>,
        // Clearance for the act marker: the composition sits below it rather
        // than centring into it.
        "pt-[12vh]"
      )}

      {/* S3b — 3x bars + the conversion, illustrated */}
      {section(
        6,
        <>
          <h2 className={`${PRIMARY} max-w-[15em] pitch-rise`} style={rise(0)}>
            A 1-second site converts 3x better than a 5-second site.
          </h2>
          <div className="pitch-bars-row flex items-center gap-[6vw] pitch-rise" style={{ "--rise": "220ms" } as React.CSSProperties}>
            <div className="pitch-bars flex items-end gap-[4vw] h-[32vh]">
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

      {/* ═══ ACT 4 — HOW WE BUILD ═══ */}

      {/* S4a — the billboard */}
      {section(
        8,
        <>
          <h2 className={`${PRIMARY} max-w-[13em] pitch-rise`} style={rise(0)}>
            Your website has one job.
          </h2>
          {/* Under the headline, above the mockup: the qualifier belongs with
              the claim it qualifies, not a screen-height below it. */}
          <p className={`${SUB} pitch-rise`} style={rise(200)}>
            Turning visitors into patients. Most sites were never built for it.
          </p>
          <div className="pitch-rise" style={rise(400)}>
            <BrochureMockup />
          </div>
        </>
      )}

      {/* S4b — what patients actually believe */}
      {section(
        9,
        <>
          <DotGrid className="left-[10vw] top-[16vh] w-[18vw] h-[26vh] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
          <h2 className={`${PRIMARY} max-w-[14em] pitch-rise`} style={rise(0)}>
            Most patients don&rsquo;t know CVI is progressive.
          </h2>
          {/* Lit one at a time — see ThoughtCycle. */}
          <div className="pitch-rise" style={rise(300)}>
            <ThoughtCycle live={active === 9} />
          </div>
          <p className={`${SUB} pitch-rise`} style={rise(1400)}>
            They think it&rsquo;s tired legs. Or genetics. Or cosmetic.
          </p>
        </>
      )}

      {/* S4c — THE CENTREPIECE: the stages, walked */}
      {section(
        10,
        <>
          <h2 className={`${PRIMARY} pitch-rise`} style={rise(0)}>
            So we teach the stages.
          </h2>
          <div className="pitch-stage-wrap w-[min(84vw,1500px)] pitch-rise" style={rise(200)}>
            <StageWalk live={active === 10} />
          </div>
          <p
            className="pitch-rise text-[clamp(24px,2.4vw,50px)] font-semibold leading-snug text-white/85"
            style={rise(420)}
          >
            Patients who understand progression{" "}
            <span className="font-extrabold" style={{ color: LIME }}>
              don&rsquo;t wait
            </span>
            .
          </p>
        </>
      )}

      {/* S4d — assessment becomes appointment, on one screen */}
      {section(
        11,
        <ScreeningTurn live={active === 11} />
      )}

      {/* S5 — HANDOFF */}
      {section(
        12,
        <>
          <h2 className={`${PRIMARY} pitch-rise`} style={rise(0)}>
            Your next patient{" "}
            <span style={{ color: LIME }}>just asked AI</span>.
          </h2>
          {/* Under the headline, above the button: the instruction the button
              then carries out. */}
          <p className={`${SUB} pitch-rise`} style={rise(160)}>
            Find out what it said.
          </p>
          <a
            href="/audit"
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            className="pitch-cta pitch-rise inline-flex items-center justify-center min-h-[64px] rounded-2xl px-[3.5vw] py-[2.6vh] text-[clamp(24px,2vw,42px)] font-extrabold shadow-xl transition-transform hover:scale-[1.03]"
            style={{ background: LIME, color: NAVY, "--rise": "200ms" } as React.CSSProperties}
          >
            Run your practice&rsquo;s audit
          </a>
          <p className="pitch-rise text-[clamp(15px,1.2vw,26px)] font-light text-white/40" style={{ "--rise": "360ms" } as React.CSSProperties}>
            30 seconds. Google&rsquo;s own measurement.
          </p>
        </>
      )}
    </div>
  );
}
