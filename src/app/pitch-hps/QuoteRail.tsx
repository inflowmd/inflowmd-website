"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";
import { concerns, symptomKicker } from "./content";

/**
 * The quote rail: four things a patient actually says, each in its own band,
 * one "hot" at a time.
 *
 * The cycle is decoration — every quote and every tag is in the document the
 * whole time and none of them is hidden, so the rail reads the same whether or
 * not it is moving. Under reduced motion nothing cycles and every band is hot,
 * which is the complete state rather than a frozen frame of a partial one.
 */

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

const EVERY = 2600;

export default function QuoteRail() {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [hot, setHot] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setHot((h) => (h + 1) % concerns.length), EVERY);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className={styles.quoteRail}>
      <ul className={styles.quotes}>
        {concerns.map((c, i) => (
          <li key={c.text} className={styles.quote} data-hot={reduced || i === hot ? "true" : "false"}>
            <p className={styles.quoteText}>“{c.text}”</p>
            <p className={styles.quoteTag}>{c.tag}</p>
          </li>
        ))}
      </ul>
      <p className={styles.quoteKicker}>{symptomKicker}</p>
    </div>
  );
}
