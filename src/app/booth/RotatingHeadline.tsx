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

/** Out and in, back to back — 800ms end to end, never overlapping. */
const FADE_OUT_MS = 400;
const FADE_IN_MS = 400;

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
    holdMs: 4000,
  },
  {
    segments: [
      { text: "Your competitors are being recommended by AI. " },
      { text: "Are you?", accent: true },
    ],
    holdMs: 4000,
  },
  // 3 and 4 are one beat: the setup, then the finding. The setup carries no
  // accent at all — holding the green back is what makes it land on the next
  // state instead of competing with it.
  {
    segments: [{ text: "We audited every practice at this conference." }],
    holdMs: 4000,
  },
  {
    segments: [
      { text: "More than half are " },
      { text: "invisible to AI", accent: true },
      { text: "." },
    ],
    holdMs: 5000,
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
    <h1 className="mt-[2vmin] grid max-w-[15em] text-[clamp(26px,5.4vmin,62px)] leading-[1.08] tracking-tight text-white">
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
