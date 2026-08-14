"use client";

import { useEffect, useState } from "react";

/**
 * The booth poster's rotating question sequence.
 *
 * Four questions, then the two-part call to action, cycling forever.
 *
 * THE CROSSFADE IS SEQUENTIAL, NOT SIMULTANEOUS. Fading both states at once
 * over the same 800ms put them both near half opacity in the middle of every
 * transition, stacked in the same cell — two questions legible at once, which
 * read as jumbled text. The outgoing state now fades fully to 0 first, and
 * only then does the incoming one start from 0. At most one state is ever
 * readable, and for ~50ms between them the block is empty on purpose.
 *
 * THE QR CODE MUST NOT MOVE. In landscape the stage is a centred flex row
 * with the copy left and the QR right, so a copy block that changed height
 * between states would nudge the QR all day. Every state is stacked in the
 * SAME grid cell, which sizes the block once to the tallest line and holds it
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

/** Out and in, back to back — 800ms end to end, never overlapping. */
const FADE_OUT_MS = 400;
const FADE_IN_MS = 400;

/**
 * One accent phrase per state; everything else stays white. The trailing "?"
 * sits outside the accent span where the phrase itself does not include it.
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
    holdMs: 4000,
  },
  {
    segments: [
      { text: "Your competitors are being recommended by AI. " },
      { text: "Are you?", accent: true },
    ],
    holdMs: 4000,
  },
  {
    segments: [
      { text: "How many patients leave " },
      { text: "before your site finishes loading", accent: true },
      { text: "?" },
    ],
    holdMs: 4000,
  },
  {
    segments: [
      { text: "Would you refer a patient to " },
      { text: "your own website", accent: true },
      { text: "?" },
    ],
    holdMs: 4000,
  },
  {
    segments: [
      { text: "Find out in " },
      { text: "60 seconds", accent: true },
      { text: "." },
    ],
    holdMs: 6000,
  },
  {
    segments: [{ text: "Scan to " }, { text: "audit your practice", accent: true }],
    holdMs: 6000,
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
    <h1 className="mt-[2.5vmin] grid max-w-[15em] text-[clamp(26px,5.4vmin,62px)] leading-[1.08] tracking-tight text-white">
      {SLIDES.map((slide, i) => {
        const showing = i === index && visible;
        return (
          <span
            key={keyOf(slide)}
            aria-hidden={!showing}
            // The duration rides in on a custom property rather than an inline
            // `transition`, so motion-reduce:transition-none can still win —
            // an inline transition would outrank the class and animate anyway.
            className="[grid-area:1/1] transition-opacity duration-[var(--fade)] ease-in-out motion-reduce:transition-none"
            style={
              {
                opacity: showing ? 1 : 0,
                // Asymmetric on purpose: a state leaves in FADE_OUT_MS and the
                // next arrives in FADE_IN_MS, so they never share the screen.
                "--fade": `${showing ? FADE_IN_MS : FADE_OUT_MS}ms`,
              } as React.CSSProperties
            }
          >
            {slide.segments.map((segment) => (
              <span
                key={segment.text}
                className={segment.accent ? "font-extrabold" : "font-medium"}
                style={segment.accent ? { color: ACCENT } : undefined}
              >
                {segment.text}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
