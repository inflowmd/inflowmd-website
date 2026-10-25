"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";
import { journeySteps, journeySymptoms } from "./content";

/**
 * The evolving illustrative phone — scene 4.
 *
 * ONE DEVICE, FOUR STATES, DRIVEN BY HAND. Symptoms the patient recognises,
 * then a plain-language explanation, then a voluntary request, then the staff
 * handoff. Previous / Next / Replay drive it; nothing is on a timer and
 * nothing advances on its own.
 *
 * IT IS A DRAWING, AND IT SAYS SO THE WHOLE TIME. The "Illustrative — not a
 * live form" badge is inside the device in every state, not just at the end.
 * There is no input, no submit control, no appointment date and no "booked"
 * state: the fourth state is a handoff that explicitly says staff will make
 * contact.
 *
 * REDUCED MOTION KEEPS EVERYTHING. The four states are also rendered as a
 * readable list beside the device, so with reduced motion, with no JS, or on
 * a narrow screen the whole sequence is present without operating anything.
 */

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

export default function PhoneJourney() {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [i, setI] = useState(0);
  const [entering, setEntering] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const last = journeySteps.length - 1;

  const go = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(last, next));
      setI(n);
      if (reduced) return;
      /* A short enter transition, then it stops. Motion explains the change
         and then gets out of the way. */
      setEntering(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setEntering(false), 30);
    },
    [last, reduced],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const step = journeySteps[i];

  return (
    <div className={styles.journey}>
      <div>
        <div className={styles.phone}>
          <div className={styles.phoneScreen}>
            {/* Present in every state, not only the last. */}
            <span className={styles.phoneBadge}>Illustrative — not a live form</span>

            <div
              className={styles.phoneState}
              data-enter={entering ? "true" : undefined}
              key={step.key}
            >
              {/* Patient-facing copy. The implementation explanation lives in
                  the list beside the device, never on its screen. */}
              <p className={styles.phoneHead}>{step.screenHead}</p>
              <p className={styles.phoneBody} style={{ marginTop: 10 }}>
                {step.screen}
              </p>

              {step.key === "symptoms" && (
                <ul className={styles.chips} style={{ marginTop: 14 }}>
                  {journeySymptoms.map((sx, k) => (
                    <li key={sx} className={`${styles.chip} ${k < 2 ? styles.chipOn : ""}`}>
                      {sx}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(step.key === "request" || step.key === "received") && (
              <>
                <div className={styles.fakeCta} aria-hidden="true">
                  {step.key === "request" ? "Request an evaluation" : "Request received"}
                </div>
                <p className={styles.fakeNote}>
                  {step.key === "request"
                    ? "A drawing of the control a patient would see. It is not connected to anything."
                    : "No appointment is created. The office makes contact to arrange one."}
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.controls} style={{ justifyContent: "center", marginTop: 16 }}>
          <span className={styles.counter} aria-live="polite">
            State {i + 1} / {journeySteps.length} · {step.label}
          </span>
          <button type="button" className={styles.btn} onClick={() => go(i - 1)} disabled={i === 0}>
            Previous state
          </button>
          <button type="button" className={styles.btn} onClick={() => go(i + 1)} disabled={i === last}>
            Next state
          </button>
          <button type="button" className={styles.btn} onClick={() => go(0)} aria-label="Replay the phone journey">
            Replay journey
          </button>
        </div>
      </div>

      {/* Always rendered: the same four states as readable text. */}
      <ol className={styles.stateList}>
        {journeySteps.map((j, k) => (
          <li key={j.key} className={styles.stateItem} data-active={k === i ? "true" : undefined}>
            <h4>
              {k + 1}. {j.head}
            </h4>
            <p>{j.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
