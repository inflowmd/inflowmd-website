"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./deck.module.css";
import { links, screener as C, signGroups } from "./content";

/**
 * The practice site's own symptom screener, ported into a phone for this deck.
 *
 * SOURCE — vein-specialists @ eec6a944f368ad392e72d9b213efa32bfa23e90f:
 *   src/components/site/SymptomScreener.tsx  (leg geometry, every overlay)
 *   src/data/evein.ts  (GROUPS.signs)
 *   src/data/screener.ts  (FRONT_DOOR copy)
 * The leg path, the per-sign overlay shapes and the Right / Left / Both
 * mapping are copied, so tapping a sign draws it on the leg the patient chose
 * exactly as it does on the practice site.
 *
 * PRIVACY — selections are React state in this component and nothing else.
 * There is no storage, no cookie, no URL parameter, no request, no analytics
 * event and no intake submission. Continue does not send anything: it shows
 * the next step and offers a real link to the practice's own screening, which
 * the reader may follow or not.
 *
 * The count is a count of selections. It is never a diagnosis, a stage, a
 * severity or a score, and nothing here infers one from it.
 */

type Side = "R" | "L" | "B";
type Pick = Side | true;

/** sign id → its marker on the legs */
const MARK: Record<string, string> = {
  s_sp: "sp", s_var: "var", s_swl: "swl", s_disc: "disc", s_hard: "hard", s_heal: "heal", s_open: "open",
};
const LEG =
  "M10 0C8 50 16 110 22 160C25 178 20 192 20 205C16 240 20 275 28 305C32 325 34 345 33 362C32 372 28 380 26 388C24 398 32 402 46 402L84 402C94 402 94 392 86 388C76 384 66 378 62 366C60 345 64 320 70 290C76 260 72 225 64 205C62 195 64 180 66 165C74 120 88 60 90 0Z";

const SIGNS = signGroups.flatMap((g) => g.items);

export default function Screener() {
  const [sel, setSel] = useState<Record<string, Pick>>({});
  const [view, setView] = useState<"signs" | "next">("signs");
  const headRef = useRef<HTMLHeadingElement | null>(null);
  const moved = useRef(false);

  const picked = SIGNS.filter((s) => sel[s.id]);

  /* Changing view is a real step, so focus follows it. It deliberately does
     not fire on first render, which would steal focus from the page. */
  useEffect(() => {
    if (!moved.current) { moved.current = true; return; }
    headRef.current?.focus();
  }, [view]);

  const toggle = (id: string, sides: boolean) =>
    setSel((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = sides ? "B" : true;
      return next;
    });
  const onLeg = (id: string, leg: "R" | "L") => sel[id] === leg || sel[id] === "B";

  const legSvg = (leg: "R" | "L") => (
    <svg viewBox="0 0 100 410" aria-hidden="true" className={styles.leg}>
      <defs>
        <linearGradient id={`fd-skin-${leg}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--vf-surface)" />
          <stop offset="1" stopColor="var(--vf-tint-cyan)" />
        </linearGradient>
        <radialGradient id={`fd-stain-${leg}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="var(--vf-leg-stain)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--vf-leg-stain)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* the patient's right leg (viewer's left) is the mirror image */}
      <g transform={leg === "R" ? "translate(100 0) scale(-1 1)" : undefined}>
        <path d={LEG} fill={`url(#fd-skin-${leg})`} stroke="var(--vf-blue-deep)" strokeOpacity=".3" strokeWidth="1.6" />
        {Object.entries(MARK).map(([id, mk]) => {
          const show = onLeg(id, leg);
          const p = { className: styles.mark, "data-on": show ? "true" : "false" };
          if (mk === "sp") return (
            <g key={mk} {...p} stroke="var(--vf-leg-vein-fine)" strokeWidth="1.1" fill="none" strokeLinecap="round">
              <path d="M60 105l-8 6m8-6l2 9m-2-9l9-2m-15 8l-6-2m14 3l4 6" />
              <path d="M54 300l-6 4m6-4l1 7m-1-7l7-1" />
            </g>
          );
          if (mk === "var") return (
            <path key={mk} {...p} d="M26 212C34 222 20 232 27 245C35 258 22 270 30 283C38 296 26 308 34 320C39 330 34 340 39 350"
              fill="none" stroke="var(--vf-leg-vein)" strokeWidth="4.2" strokeLinecap="round" />
          );
          if (mk === "swl") return (
            <ellipse key={mk} {...p} cx="46" cy="372" rx="32" ry="18" fill="var(--vf-cyan)" fillOpacity=".14"
              stroke="var(--vf-cyan)" strokeOpacity=".55" strokeWidth="1.2" strokeDasharray="3 4" />
          );
          if (mk === "disc") return <ellipse key={mk} {...p} cx="42" cy="345" rx="15" ry="24" fill={`url(#fd-stain-${leg})`} />;
          if (mk === "hard") return (
            <ellipse key={mk} {...p} cx="48" cy="360" rx="12" ry="10" fill="none" stroke="var(--vf-leg-stain)"
              strokeWidth="1.6" strokeOpacity=".7" />
          );
          if (mk === "heal") return (
            <path key={mk} {...p} d="M30 336q6-4 12 0" fill="none" stroke="var(--vf-leg-ulcer-rim)" strokeWidth="2.4" strokeLinecap="round" />
          );
          return (
            <g key={mk} {...p}>
              <ellipse cx="40" cy="352" rx="7" ry="5" fill="var(--vf-leg-ulcer)" />
              <ellipse cx="40" cy="352" rx="10.5" ry="8" fill="none" stroke="var(--vf-leg-ulcer-rim)" strokeWidth="1.4" />
            </g>
          );
        })}
      </g>
    </svg>
  );

  return (
    <div className={styles.phone}>
      <div className={styles.phoneScreen}>
        {view === "signs" ? (
          <>
            {/* The legs and the count are the response the reader is meant to
                see, so the stage pins to the top of the viewport while the
                choices scroll past it.

                phBody BOUNDS that stickiness to the stage and the choices. An
                unbounded sticky stage stayed pinned over the footer and sat on
                top of Continue: the button's rectangle was clean, but a tap at
                its centre hit the stage, so it could not be pressed. Bounded,
                the stage is pushed up as the list ends and has left the band
                by the time Continue is on screen. */}
            <div className={styles.phBody}>
            <div className={styles.phStage}>
            <p className={styles.phEyebrow}>{C.eyebrow}</p>
            <h3 ref={headRef} tabIndex={-1} className={styles.phHead}>{C.heading}</h3>
            <p className={styles.phLede}>{C.lede}</p>

            <div className={styles.legs}>
              {(["R", "L"] as const).map((leg) => (
                <figure key={leg} className={styles.legFig}>
                  {legSvg(leg)}
                  <figcaption>{leg === "R" ? C.legs.right : C.legs.left}</figcaption>
                </figure>
              ))}
            </div>
            {sel.s_pelv && <p className={styles.phPelvic}>{C.pelvicNote}</p>}

            <div className={styles.readout} aria-live="polite">
              <strong>{picked.length ? C.picked(picked.length) : C.empty}</strong>
              <span>{picked.length ? C.pickedBody : C.emptyBody}</span>
            </div>
            </div>

            <div className={styles.phScroll}>
            {signGroups.map((g) => (
              <div key={g.title} className={styles.signGroup}>
                <p className={styles.signGroupTitle}>{g.title}</p>
                {g.items.map((it) => {
                  const v = sel[it.id];
                  return (
                    <div key={it.id} className={styles.sign} data-on={v ? "true" : "false"}>
                      <label className={styles.signLabel}>
                        <input
                          type="checkbox" className={styles.signBox}
                          checked={Boolean(v)} onChange={() => toggle(it.id, it.sides)}
                        />
                        <span className={styles.signTick} aria-hidden="true">
                          {v && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                          )}
                        </span>
                        <span className={styles.signText}>{it.t}</span>
                      </label>
                      {it.sides && v && (
                        /* NATIVE radio inputs, one group per sign. Custom
                           role="radio" buttons looked right but had no arrow
                           keys and no roving focus; the real control brings
                           both for free, plus the correct group semantics. The
                           input is visually replaced by its label, never
                           removed, so it stays operable by keyboard. */
                        <fieldset className={styles.sides}>
                          <legend>{`Which leg: ${it.t}`}</legend>
                          {(["R", "L", "B"] as const).map((sv) => (
                            <label key={sv} className={styles.sideBtn} data-on={v === sv ? "true" : "false"}>
                              <input
                                type="radio" className={styles.sideInput}
                                name={`side-${it.id}`} value={sv} checked={v === sv}
                                onChange={() => setSel((prev) => ({ ...prev, [it.id]: sv }))}
                              />
                              {C.sideLabels[sv]}
                            </label>
                          ))}
                        </fieldset>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            </div>
            </div>

            <div className={styles.phFoot}>
              <button
                type="button" className={styles.phCta}
                disabled={!picked.length} onClick={() => setView("next")}
              >
                {C.cta}
              </button>
              <p className={styles.phPrivacy}>{C.privacy}</p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.phScroll}>
            <h3 ref={headRef} tabIndex={-1} className={styles.phHead}>{C.nextHead}</h3>
            <p className={styles.phLede}>{C.nextBody}</p>
            <p className={styles.phCarried}>{picked.length ? C.nextCarried : C.nextNone}</p>
            {picked.length > 0 && (
              <ul className={styles.chips}>
                {picked.map((s) => (
                  <li key={s.id} className={styles.chip}>
                    {s.t}
                    {sel[s.id] !== true && ` · ${C.sideWords[sel[s.id] as Side]}`}
                  </li>
                ))}
              </ul>
            )}
            </div>
            <div className={styles.phFoot}>
              <a className={styles.phCta} href={links.magnantScreening} target="_blank" rel="noopener noreferrer">
                {C.nextLink}
              </a>
              <button type="button" className={styles.phBack} onClick={() => setView("signs")}>{C.back}</button>
              <p className={styles.phPrivacy}>{C.privacy}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
