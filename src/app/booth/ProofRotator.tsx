"use client";

import { useEffect, useState } from "react";

/**
 * Rotating proof line at the foot of the booth display. The first line is
 * server-rendered, so the page is complete before (or without) JavaScript;
 * the rotation and fade are progressive enhancement only.
 */

const LINES = [
  "We found clinically incorrect FAQ answers live on a surgeon’s website.",
  "One practice’s blog advertised a specialty the physician doesn’t offer.",
  "A vein clinic’s site named a completely different clinic.",
  "Most medical sites fail Google’s speed test. Ours score 100.",
];

const ROTATE_MS = 6_000;
const FADE_MS = 450;

export default function ProofRotator() {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHidden(true);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % LINES.length);
        setHidden(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <p
      className={`kiosk-proof max-w-[36em] text-center text-[clamp(15px,2.4vmin,24px)] font-medium leading-snug text-slate-400${
        hidden ? " kiosk-proof-hidden" : ""
      }`}
    >
      {LINES[index]}
    </p>
  );
}
