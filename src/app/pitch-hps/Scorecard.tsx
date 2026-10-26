"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";
import Shot from "./Shot";
import { metrics, scorecard, shots } from "./content";

/**
 * One large paired value at a time, chosen from a quiet metric selector,
 * instead of a six-row report grid.
 *
 * NOTHING MEASURED WAS DROPPED to get there. Every value the grid carried is
 * still here and still reachable: each metric is a tab that carries its own
 * tool, its own dates and its own report links, and the unfavourable ones —
 * the 69, the 59, the 80, the failed mobile field data — are shown exactly as
 * measured. The SEO qualification sits on the SEO metric itself rather than in
 * a drawer, and the rubric rows say on the metric that they are a different
 * tool on different dates.
 */

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

export default function Scorecard() {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [key, setKey] = useState(metrics[0].key);
  const [swapping, setSwapping] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const m = metrics.find((x) => x.key === key) ?? metrics[0];

  const select = (next: string) => {
    if (next === key) return;
    if (reduced) { setKey(next); return; }
    setSwapping(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setKey(next); setSwapping(false); }, 180);
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % metrics.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + metrics.length) % metrics.length;
    if (n < 0) return;
    e.preventDefault();
    tabRefs.current[n]?.focus();
    select(metrics[n].key);
  };

  const side = (which: "l" | "r") => {
    const value = which === "l" ? m.left : m.right;
    const href = which === "l" ? m.hrefL : m.hrefR;
    const meta = which === "l" ? scorecard.left : scorecard.right;
    const shot = which === "l" ? shots.magnantHome : shots.cvrHome;
    return (
      <div className={styles.sideCol}>
        <div className={styles.phoneShot}>
          <div className={styles.phoneShotScreen}>
            <Shot {...shot} sizes="(max-width: 860px) 24vw, 140px" />
          </div>
        </div>
        <p
          className={`${styles.valNum} ${m.small ? styles.valSmall : ""}`}
          data-swapping={swapping ? "true" : "false"}
        >
          {value}
        </p>
        <p className={styles.siteName}>{meta.name}</p>
        <p className={styles.siteSub}>{meta.sub}</p>
        {href && (
          <p className={styles.siteSub}>
            <a href={href} target="_blank" rel="noopener noreferrer">Open the report</a>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={styles.board}>
      <div className={styles.metricTabs} role="tablist" aria-label="Which measurement to show">
        {metrics.map((x, i) => (
          <button
            key={x.key} type="button" role="tab"
            ref={(el) => { tabRefs.current[i] = el; }}
            aria-selected={x.key === key}
            tabIndex={x.key === key ? 0 : -1}
            className={styles.tab}
            onClick={() => select(x.key)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className={styles.pair}>
        {side("l")}
        <p className={styles.vs} aria-hidden="true">vs</p>
        {side("r")}
      </div>

      <div className={styles.boardFoot} aria-live="polite">
        <p className={styles.toolLine} data-swapping={swapping ? "true" : "false"}>{m.tool}</p>
        {m.qual && (
          <p className={styles.qualifier} data-swapping={swapping ? "true" : "false"}>{m.qual}</p>
        )}
      </div>
    </div>
  );
}
