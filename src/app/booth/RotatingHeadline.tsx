"use client";

import { useEffect, useState } from "react";

/**
 * The booth poster's rotating question sequence.
 *
 * Four questions, then the two-part call to action, cycling forever.
 *
 * TWO THINGS THIS COMPONENT MUST NOT DO:
 *
 * 1. Move the QR code. In landscape the stage is a centred flex row with the
 *    copy on the left and the QR on the right, so a copy block that changed
 *    height between states would nudge the QR up and down all day. Every state
 *    is stacked in the SAME grid cell, which sizes the block to the tallest
 *    line once and holds it there — the QR never moves and never fades.
 *
 * 2. Colour anything. Emphasis is weight only. The single accent on this page
 *    belongs to the QR card and its caption; a coloured word up here would
 *    read as a second thing to look at.
 */

/** `lead` is set in a lighter weight, `emphasis` in the heaviest. */
interface Slide {
  lead?: string;
  emphasis: string;
  /** Milliseconds at FULL opacity, before the crossfade to the next state. */
  holdMs: number;
}

const FADE_MS = 800;

/**
 * The CTA pair hold longer than the questions: a question only has to be read,
 * but "scan" has to be read, believed, and acted on — six seconds is roughly
 * how long it takes someone to get a phone out of a pocket.
 */
const SLIDES: Slide[] = [
  {
    lead: "When a patient asks AI for a vein specialist, ",
    emphasis: "does your name come up?",
    holdMs: 4000,
  },
  {
    lead: "Your competitors are being recommended by AI. ",
    emphasis: "Are you?",
    holdMs: 4000,
  },
  {
    lead: "How many patients leave ",
    emphasis: "before your site finishes loading?",
    holdMs: 4000,
  },
  {
    lead: "Would you refer a patient to ",
    emphasis: "your own website?",
    holdMs: 4000,
  },
  { emphasis: "Find out in 60 seconds.", holdMs: 6000 },
  { emphasis: "Scan to audit your practice", holdMs: 6000 },
];

export default function RotatingHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reduced motion is handled in CSS (motion-reduce:transition-none) rather
    // than in state — setting state straight from an effect just to disable a
    // transition would cascade a second render for nothing. All this effect
    // decides is whether the sequence advances at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let current = 0;
    const advance = () => {
      current = (current + 1) % SLIDES.length;
      setIndex(current);
      // Hold at full opacity, THEN spend FADE_MS crossfading to the next one.
      timer = setTimeout(advance, SLIDES[current].holdMs + FADE_MS);
    };
    timer = setTimeout(advance, SLIDES[0].holdMs + FADE_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className="mt-[2.5vmin] grid max-w-[15em] text-[clamp(26px,5.4vmin,62px)] leading-[1.08] tracking-tight text-white">
      {SLIDES.map((slide, i) => {
        const showing = i === index;
        return (
          <span
            key={slide.emphasis}
            aria-hidden={!showing}
            className="[grid-area:1/1] transition-opacity duration-[800ms] ease-in-out motion-reduce:transition-none"
            style={{ opacity: showing ? 1 : 0 }}
          >
            {slide.lead && <span className="font-medium text-white/85">{slide.lead}</span>}
            <span className="font-extrabold">{slide.emphasis}</span>
          </span>
        );
      })}
    </h1>
  );
}
