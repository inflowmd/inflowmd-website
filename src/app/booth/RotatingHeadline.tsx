"use client";

import { useEffect, useState } from "react";

/**
 * The booth poster's rotating sequence — the only large text on the page.
 *
 * Eight states: four questions, a two-state census beat (setup, then the
 * finding), and the two-part call to action, cycling forever.
 *
 * THE CROSSFADE IS SEQUENTIAL, NOT SIMULTANEOUS. Fading both states at once
 * over the same 800ms put them both near half opacity in the middle of every
 * transition, stacked in the same cell — two questions legible at once, which
 * read as jumbled text. The outgoing state now fades fully to 0 first, and
 * only then does the incoming one start from 0. At most one state is ever
 * readable, and for ~50ms between them the block is empty on purpose.
 *
 * THE QR CODE MUST NOT MOVE. The poster is a centred column with the QR
 * directly below this block, so a headline that changed height between states
 * would push the code up and down all day. Every state is stacked in the SAME
 * grid cell, which sizes the block once to the tallest state and holds it
 * there — a fixed-height stack, with no per-state height to maintain by hand.
 */

interface Segment {
  text: string;
  accent?: boolean;
}

interface Slide {
  segments: Segment[];
  /** Milliseconds at FULL opacity, before the fade-out begins. */
  holdMs: number;
}

const ACCENT = "#84B83B";

/**
 * Out and in, back to back — 1.2s end to end, never overlapping. The drift
 * that rides along with the fade lives in globals.css (.booth-state): the
 * outgoing state lifts as it goes, the incoming one rises into place, so the
 * duration is shared with CSS and both have to move together if either does.
 */
const FADE_OUT_MS = 600;
const FADE_IN_MS = 600;

/**
 * At most one accent phrase per state; everything else stays white. The
 * trailing "?" sits outside the accent span where the phrase does not
 * include it.
 *
 * The CTA pair hold longer than the questions: a question only has to be read,
 * but "scan" has to be read, believed, and acted on — six seconds is roughly
 * how long it takes someone to get a phone out of a pocket.
 */
const SLIDES: Slide[] = [
  {
    segments: [
      { text: "When a patient asks AI for a vein specialist, " },
      { text: "does your name come up", accent: true },
      { text: "?" },
    ],
    holdMs: 5500,
  },
  {
    segments: [
      { text: "Your competitors are being recommended by AI. " },
      { text: "Are you?", accent: true },
    ],
    holdMs: 5500,
  },
  {
    // One state, not two. Split across frames, a glance caught either the
    // setup with no finding or the finding with no basis for it.
    segments: [
      { text: "We audited every practice at this conference. More than half are " },
      { text: "invisible to AI", accent: true },
      { text: "." },
    ],
    holdMs: 7000,
  },
  {
    segments: [
      { text: "How many patients leave " },
      { text: "before your site finishes loading", accent: true },
      { text: "?" },
    ],
    holdMs: 5500,
  },
  {
    segments: [
      { text: "Would you refer a patient to " },
      { text: "your own website", accent: true },
      { text: "?" },
    ],
    holdMs: 5500,
  },
  {
    segments: [
      { text: "Find out in " },
      { text: "60 seconds", accent: true },
      { text: "." },
    ],
    holdMs: 7000,
  },
  {
    segments: [{ text: "Scan to " }, { text: "audit your practice", accent: true }],
    holdMs: 8000,
  },
];

const keyOf = (slide: Slide) => slide.segments.map((s) => s.text).join("");

export default function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  /** False only during a fade-out, which is what keeps the two apart. */
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reduced motion is handled in CSS (motion-reduce:transition-none) rather
    // than in state — setting state straight from an effect just to disable a
    // transition would cascade a second render for nothing. All this effect
    // decides is whether the sequence advances at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let fadeOut: ReturnType<typeof setTimeout>;
    let swap: ReturnType<typeof setTimeout>;
    let current = 0;

    const schedule = () => {
      // holdMs is time at FULL opacity, so the fade-in has to be paid for
      // before the clock starts — otherwise 400ms of every hold is spent
      // arriving and a "4 second" question is only readable for 3.6.
      const visibleFor = FADE_IN_MS + SLIDES[current].holdMs;
      // Hold, then fade THIS one out…
      fadeOut = setTimeout(() => setVisible(false), visibleFor);
      // …and only once it has reached 0, swap in the next and fade it up.
      swap = setTimeout(() => {
        current = (current + 1) % SLIDES.length;
        setIndex(current);
        setVisible(true);
        schedule();
      }, visibleFor + FADE_OUT_MS);
    };
    schedule();

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(swap);
    };
  }, []);

  return (
    <h1 className="mt-[4.5vmin] grid max-w-[15em] text-[clamp(26px,5.4vmin,62px)] leading-[1.08] tracking-tight text-white">
      {SLIDES.map((slide, i) => {
        const showing = i === index && visible;
        return (
          <span
            key={keyOf(slide)}
            aria-hidden={!showing}
            /* active | out | parked. Three states, not two: the one leaving
               lifts upward, while the ones waiting sit BELOW the line so the
               next arrival rises into place. A single "hidden" style would
               have made every incoming state drop in from above. */
            data-state={showing ? "active" : i === index ? "out" : "parked"}
            className="booth-state [grid-area:1/1]"
          >
            {/* The accented phrase always starts its own line — from across
                a booth that green line is read first, and it should never
                begin halfway along someone else's. A state with NO accent
                (the census setup) renders as a single block: findIndex would
                return -1 here and slice(0, -1) would quietly eat its last
                segment. */}
            {(() => {
              const accentAt = slide.segments.findIndex((seg) => seg.accent);
              if (accentAt === -1) {
                return (
                  <span className="block font-medium">
                    {slide.segments.map((seg) => seg.text).join("")}
                  </span>
                );
              }
              const lead = slide.segments.slice(0, accentAt).map((seg) => seg.text).join("").trimEnd();
              return (
                <>
                  {lead && <span className="block font-medium">{lead}</span>}
                  <span className="block font-extrabold">
                    {slide.segments.slice(accentAt).map((segment) => (
                      <span key={segment.text} style={segment.accent ? { color: ACCENT } : undefined}>
                        {segment.text}
                      </span>
                    ))}
                  </span>
                </>
              );
            })()}
          </span>
        );
      })}
    </h1>
  );
}
