"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A calm, looping demonstration of the 7%-per-second rule:
 * a page "loads" while the clock climbs 0 → 5.0s, and the share of
 * conversions kept ticks down 7 points per second. No comparison,
 * no "you vs us" — just the principle, animated.
 */
const MAX_SECONDS = 5;
const DROP_PER_SECOND = 7;
const RAMP_MS = 4200; // 0 → 5.0s
const HOLD_MS = 1500; // pause on the result
const CYCLE_MS = RAMP_MS + HOLD_MS;

function colorFor(pct: number): string {
  if (pct >= 93) return "#0cce6b";
  if (pct >= 86) return "#7ec93f";
  if (pct >= 79) return "#ffa400";
  if (pct >= 72) return "#ff7a2f";
  return "#ff4e42";
}

export default function ConversionLoadDemo() {
  const [seconds, setSeconds] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(-1);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSeconds(MAX_SECONDS);
      return;
    }
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const into = (t - start) % CYCLE_MS;
      const s = Math.min(MAX_SECONDS, (into / RAMP_MS) * MAX_SECONDS);
      const rounded = Math.round(s * 10) / 10;
      if (rounded !== lastRef.current) {
        lastRef.current = rounded;
        setSeconds(rounded);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const conversion = Math.max(
    100 - DROP_PER_SECOND * seconds,
    100 - DROP_PER_SECOND * MAX_SECONDS,
  );
  const drop = Math.round(100 - conversion);
  const color = colorFor(conversion);

  return (
    <div>
      {/* the two live numbers */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums leading-none">
            {seconds.toFixed(1)}
            <span className="text-2xl text-gray-500">s</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1.5">
            Load time
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none"
            style={{ color }}
          >
            {Math.round(conversion)}%
          </div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1.5">
            Conversions kept
          </div>
        </div>
      </div>

      {/* conversion meter */}
      <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${conversion}%`, background: color }}
        />
      </div>

      <p className="mt-4 text-sm leading-snug text-gray-400">
        By <span className="text-white font-semibold">{MAX_SECONDS.toFixed(1)} seconds</span>,{" "}
        <span style={{ color }} className="font-bold">
          {drop}%
        </span>{" "}
        of would-be patients are already gone.
      </p>
    </div>
  );
}
