"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";

/**
 * Deck controls and reveal behaviour.
 *
 * MANUAL BY DEFAULT, AND THERE IS NO AUTOPLAY AT ALL. There is no timer, no
 * idle resume and no click-anywhere advance; the previous deck had all three
 * and they are deliberately absent here. Moving between scenes scrolls to the
 * scene — the document remains a document, so a reader can also simply scroll.
 *
 * KEYBOARD. Arrow keys move between scenes, but ONLY when focus is not inside
 * a control, link, disclosure or field. Nothing here steals focus.
 *
 * REDUCED MOTION is read through useSyncExternalStore, which is SSR-safe and
 * keeps tracking the setting if it changes while the page is open. When it is
 * on, no transition is enabled and scrolling is instant.
 */

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

const INTERACTIVE = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY", "DETAILS"]);

export default function Deck({ ids, labels }: { ids: string[]; labels: string[] }) {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  /* While a Previous/Next/Replay scroll is in flight the spy must not
     overwrite the index: smooth scrolling fires scroll events the whole way,
     so reading position mid-animation reported the scene being passed
     through rather than the one asked for. */
  const seeking = useRef(false);
  const seekTimer = useRef<number | undefined>(undefined);

  const goTo = useCallback(
    (next: number) => {
      const i = Math.max(0, Math.min(ids.length - 1, next));
      setIndex(i);
      /* Release the guard when the scroll actually finishes. A fixed timeout
         expired mid-flight on a long Replay from the end of the deck, and the
         spy then overwrote the index with whatever was passing. `scrollend`
         is exact where supported; the timeout is only a fallback. */
      seeking.current = true;
      window.clearTimeout(seekTimer.current);
      const release = () => {
        seeking.current = false;
        window.removeEventListener("scrollend", release);
        window.clearTimeout(seekTimer.current);
      };
      /* `in` on `window` narrows the type to never in the else branch, so
         the capability check is done on a plain object reference. */
      const hasScrollEnd = "onscrollend" in (window as object);
      if (hasScrollEnd) {
        window.addEventListener("scrollend", release, { once: true });
        seekTimer.current = window.setTimeout(release, 2500);
      } else {
        seekTimer.current = window.setTimeout(release, reduced ? 120 : 1400);
      }
      const el = document.getElementById(ids[i]);
      el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      /* Focus deliberately STAYS on the control that was pressed, so repeated
         Enter keeps working. Moving it to the heading meant the second Enter
         never reached the button. The aria-live counter announces the scene
         change instead, and scroll-margin-top keeps the heading clear of the
         sticky bar. */
    },
    [ids, reduced],
  );

  /* Opt-in reveal + which scene is on screen. One observer, no scroll handler. */
  useEffect(() => {
    const root = document.getElementById("hps-deck");
    if (!root) return;
    if (!reduced) root.setAttribute("data-motion", "on");
    else root.removeAttribute("data-motion");

    const fades = Array.from(root.querySelectorAll<HTMLElement>(".fade, [data-fade]"));
    if (reduced || !("IntersectionObserver" in window)) {
      fades.forEach((f) => f.setAttribute("data-in", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", "true"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    fades.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, [reduced]);

  /* Track the scene currently in view so the counter is honest.
     A ratio-based band was wrong at the very top of the document: with
     -45%/-45% insets the centre line sits inside scene 2 before the reader
     has scrolled at all, so the deck opened reporting "2 / 10" and left
     Previous enabled. Reading position is computed from rects instead --
     the last scene whose top has passed a third of the viewport -- and the
     document top is pinned to scene 1. The observer is only the trigger. */
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const compute = () => {
      if (window.scrollY <= 8) return 0;
      /* The final scene's top can never cross the line once the document has
         run out of scroll, so the bottom of the page pins to the last scene. */
      const d = document.documentElement;
      if (window.innerHeight + window.scrollY >= d.scrollHeight - 4) return sections.length - 1;
      const line = window.innerHeight * 0.33;
      let active = 0;
      sections.forEach((sec, i) => { if (sec.getBoundingClientRect().top <= line) active = i; });
      return active;
    };

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (seeking.current) return;
        setIndex(compute());
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  /* Arrow keys, only outside interactive context. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (INTERACTIVE.has(t.tagName) || t.isContentEditable || t.closest("details,a,button,input,select,textarea"))) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); goTo(index + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); goTo(index - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  return (
    <div className={styles.controls} ref={rootRef}>
      <span className={styles.counter} aria-live="polite">
        {index + 1} / {ids.length} · {labels[index]}
      </span>
      <button type="button" className={styles.btn} onClick={() => goTo(index - 1)} disabled={index === 0}>
        Previous
      </button>
      <button type="button" className={styles.btn} onClick={() => goTo(index + 1)} disabled={index === ids.length - 1}>
        Next
      </button>
      <button type="button" className={styles.btn} onClick={() => goTo(0)}>
        Replay
      </button>
    </div>
  );
}
