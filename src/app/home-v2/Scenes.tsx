"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import PracticeRecord from "./PracticeRecord";
import { performance as perf } from "./content";

/**
 * The only client component on the page, and it does two things.
 *
 * 1. `useEnhanced` flips [data-enhanced="true"] on the page root after mount.
 *    Every hiding rule in the stylesheet is gated behind that attribute, so
 *    if JS never arrives the page is simply complete and static. Enhancement
 *    is opt-in, never opt-out.
 *
 * 2. The two scenes observe their own elements with IntersectionObserver.
 *    No scroll listeners, no rAF loop, no measurement on the main thread.
 *
 * Reduced motion is honoured in CSS rather than here, with one exception:
 * when the user prefers reduced motion we stop driving the active stop from
 * scroll and simply mark every stop active, because the pinning that made a
 * single "current" stop meaningful has been turned off.
 */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.(REDUCED_QUERY).matches === true
  );
}

/* Read through useSyncExternalStore rather than an effect: it is the
   SSR-safe way to consume a media query (the server snapshot is simply
   "not reduced"), and it keeps tracking the setting if the reader changes
   it while the page is open. */
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function reducedSnapshot() {
  return window.matchMedia(REDUCED_QUERY).matches;
}
function reducedServerSnapshot() {
  return false;
}

/** Adds the enhancement flag and wires once-only reveals. */
export function Enhancer({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.setAttribute("data-enhanced", "true");

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal], .hv2-stage"));
    if (!targets.length) return;

    const revealAll = () => targets.forEach((t) => t.classList.add("hv2-in"));

    /**
     * Below 900px the page is a plain static sequence: mark everything
     * revealed straight away and never observe. The stylesheet also gates
     * its hiding rules behind the same breakpoint, so the two cannot
     * disagree — and a reader who resizes from desktop down to phone width
     * can never be left with a section stuck hidden.
     */
    if (
      prefersReducedMotion() ||
      window.innerWidth < 900 ||
      !("IntersectionObserver" in window)
    ) {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("hv2-in");
            io.unobserve(e.target); // once only
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [rootId]);

  return null;
}

/* One zone per stop, all four different. "Open" lights the website row —
   the page the visitor opens — rather than re-lighting identity, which is
   what made Find and Open look identical in the first deployment. */
const ZONES = ["identity", "site", "care", "next"] as const;

/**
 * Performance scene. The four stop cards are always in the DOM with their
 * full text, at every width and in reduced motion — the sticky frame only
 * changes which one is emphasised. Nothing lives offscreen.
 */
export function PerformanceScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    reducedSnapshot,
    reducedServerSnapshot,
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced || !("IntersectionObserver" in window)) return;

    let io: IntersectionObserver | null = null;

    /**
     * Percentage rootMargin was the wrong tool here. The spec resolves
     * percentages against the root's WIDTH, implementations have differed
     * historically, and "-50% 0px -50% 0px" collapses the band to zero
     * height either way. This uses PIXELS derived from the viewport height,
     * which every implementation reads the same way, and keeps a band with
     * real height so a marker cannot slip through between samples.
     */
    const build = () => {
      io?.disconnect();

      /* Desktop only. Below the pinned breakpoint the scene is a plain
         static list and nothing should drive step state. */
      if (window.innerWidth < 900) {
        setActive(0);
        io = null;
        return;
      }

      const vh = window.innerHeight;
      const band = Math.max(96, Math.round(vh * 0.14)); // never zero-height
      const inset = Math.max(0, Math.round((vh - band) / 2));

      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              const i = Number((e.target as HTMLElement).dataset.stopMark);
              if (!Number.isNaN(i)) setActive(i);
            }
          }
        },
        { rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0 },
      );

      track.querySelectorAll<HTMLElement>("[data-stop-mark]").forEach((m) => io?.observe(m));
    };

    build();

    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(build, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, [reduced]);

  const litZone = reduced ? null : (ZONES[active] ?? null);

  return (
    <div className="hv2-perf-track" ref={trackRef}>
      {/* Scroll markers for the sticky frame. Purely positional. */}
      {!reduced &&
        perf.stops.map((s, i) => (
          <span
            key={s.key}
            data-stop-mark={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: `${(i / perf.stops.length) * 100}%`,
              height: `${100 / perf.stops.length}%`,
              left: 0,
              width: "1px",
              pointerEvents: "none",
            }}
          />
        ))}

      <div className="hv2-perf-sticky">
        <div>
          <ol className="hv2-stops">
            {perf.stops.map((s, i) => (
              <li
                key={s.key}
                className="hv2-stop"
                data-active={reduced || i === active ? "true" : "false"}
              >
                <span className="hv2-stop-label">
                  <span className="hv2-stop-dot" aria-hidden="true" />
                  {s.label}
                </span>
                <p className="hv2-stop-line">{s.line}</p>
              </li>
            ))}
          </ol>
          <p className="hv2-caption">{perf.sceneCaption}</p>
        </div>

        <div>
          <PracticeRecord
            lit={litZone}
            showNextStep
            nextStepLabel="Request an appointment"
          />
        </div>
      </div>
    </div>
  );
}
