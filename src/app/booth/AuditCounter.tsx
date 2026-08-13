"use client";

import { useEffect, useState } from "react";

/**
 * Live count of practices audited at the event, for the bottom of the poster.
 *
 * THE THRESHOLD IS THE WHOLE DESIGN. "3 practices audited at this conference"
 * says the booth is empty; it is worse than saying nothing. Below MINIMUM the
 * component renders null — not a placeholder, not a zero, nothing — so the
 * strip is genuinely empty until the number is worth showing.
 *
 * The same silence covers every failure: an unreachable store, a null count, a
 * failed poll. There is no state in which this renders a number it is not sure
 * of.
 */

/** Nothing renders below this. An early low number undersells the booth. */
const MINIMUM = 10;
const POLL_MS = 30_000;

export default function AuditCounter() {
  const [count, setCount] = useState<number | null>(null);
  /** Bumped on every increment to retrigger the number's entrance. */
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    let previous: number | null = null;

    const poll = async () => {
      try {
        const res = await fetch("/api/audit-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number | null };
        if (!alive || typeof data.count !== "number") return;
        // Only animate a real increase. A flat poll must not make the number
        // twitch every 30 seconds all day.
        if (previous !== null && data.count > previous) setTick((t) => t + 1);
        previous = data.count;
        setCount(data.count);
      } catch {
        // Keep whatever is on screen; a dropped poll is not news.
      }
    };

    void poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (count === null || count < MINIMUM) return null;

  return (
    <p className="text-center text-[clamp(11px,1.7vmin,18px)] font-light tracking-wide text-slate-400">
      <span
        key={tick}
        className="booth-count-bump inline-block font-semibold tabular-nums text-slate-200"
      >
        {count}
      </span>{" "}
      practices audited at this conference
    </p>
  );
}
