"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./deck.module.css";
import {
  AGE, CEAP, DEMO_NOTE, DUR, EVEIN_COPY as C, GROUPS, HRS, IMPACT, LEG_PATH, LOW_MAX,
  MARK, MOD_MAX, OUTCOME, SCALE, SIDE, STEP_NAMES, STOCK, TIERS,
  calc, fresh, reported, vis,
  type GroupKey, type Item, type State,
} from "./eveinData";

/**
 * The practice's own eVein screening, running natively in this scene.
 *
 * SOURCE — vein-specialists @ 1e96271:
 *   src/components/evein/EVeinScreening.tsx  (the Signs → Symptoms → History → Result flow)
 *   src/data/evein.ts                        (questions, points, thresholds, result copy)
 *   src/components/site/SymptomScreener.tsx  (the leg drawing and its per-sign overlays)
 * Every clinical label, point value, threshold and line of result wording comes from
 * ./eveinData.ts, ported verbatim. The tier is whatever calc() returns — it is never
 * derived from how many boxes are ticked, and nothing here invents an assessment.
 * Only the layout and the presentation controls are this deck's.
 *
 * PRESENTATION ONLY — a hard boundary. Answers live in this component's state and
 * nowhere else. There is no identifier or contact field, no upload, no form, no
 * submission, no practice notification, no storage, no URL parameter and no analytics
 * carrying a choice. The source's submission plumbing — VirtualEvaluation, the Cognito
 * embed, EVeinHandoff, EVeinDraft — is deliberately not imported, and the result says
 * what the next step is rather than claiming one was taken.
 */

type Side = keyof typeof SIDE;

export default function ScreeningDemo() {
  const [s, setS] = useState<State>(fresh);
  const r = calc(s);
  const headRef = useRef<HTMLHeadingElement | null>(null);
  const moved = useRef(false);

  /* Each stage is a real step, so focus follows it — but not on first render,
     which would pull focus away from the page. */
  useEffect(() => {
    if (!moved.current) { moved.current = true; return; }
    headRef.current?.focus();
  }, [s.step]);

  const set = (p: Partial<State>) => setS((v) => ({ ...v, ...p }));
  const toggle = (it: Item) =>
    setS((v) => {
      const on = { ...v.on };
      const side = { ...v.side };
      if (on[it.id]) { delete on[it.id]; delete side[it.id]; }
      else { on[it.id] = true; if (it.sides) side[it.id] = "B"; }
      return { ...v, on, side };
    });
  const onLeg = (id: string, leg: "R" | "L") => s.side[id] === leg || s.side[id] === "B";

  const key = (["signs", "symptoms", "history"] as const)[Math.min(s.step, 2)];
  const done = s.step === 3;

  /* ─────────── the legs, from the practice's own screener ─────────── */
  const legSvg = (leg: "R" | "L") => (
    <svg viewBox="0 0 100 410" aria-hidden="true" className={styles.dLeg}>
      <defs>
        <linearGradient id={`dm-skin-${leg}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--vf-surface)" />
          <stop offset="1" stopColor="var(--vf-tint-cyan)" />
        </linearGradient>
        <radialGradient id={`dm-stain-${leg}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="var(--vf-leg-stain)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--vf-leg-stain)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* the patient's right leg (viewer's left) is the mirror image */}
      <g transform={leg === "R" ? "translate(100 0) scale(-1 1)" : undefined}>
        <path d={LEG_PATH} fill={`url(#dm-skin-${leg})`} stroke="var(--vf-blue-deep)" strokeOpacity=".3" strokeWidth="1.6" />
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
          if (mk === "disc") return <ellipse key={mk} {...p} cx="42" cy="345" rx="15" ry="24" fill={`url(#dm-stain-${leg})`} />;
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

  /* what the legs are currently showing, in words, for anyone not seeing them */
  const drawn = GROUPS.signs.flatMap((g) => g.items)
    .filter((it) => s.on[it.id] && MARK[it.id])
    .map((it) => {
      const side = (s.side[it.id] ?? "B") as Side;
      return `${it.t} on ${side === "B" ? "both legs" : `the ${SIDE[side].toLowerCase()} leg`}`;
    });
  const legSummary = drawn.length ? `Legs showing: ${drawn.join("; ")}.` : "Legs showing nothing yet.";

  /* ─────────── small controls ─────────── */
  const chips = (
    name: string, legend: string, opts: Record<string, string>, value: string,
    onPick: (v: string) => void,
  ) => (
    <fieldset className={styles.dChips}>
      <legend>{legend}</legend>
      {Object.entries(opts).map(([v, label]) => (
        <label key={v} className={styles.dChip} data-on={value === v ? "true" : "false"}>
          <input type="radio" name={`dm-${name}`} value={v} checked={value === v}
            onChange={() => onPick(v)} className={styles.srOnly} />
          {label}
        </label>
      ))}
    </fieldset>
  );
  const picker = (
    id: string, label: string, opts: Record<string, string>, value: string,
    onPick: (v: string) => void,
  ) => (
    <p className={styles.dField}>
      <label htmlFor={`dm-${id}`}>{label}</label>
      <select id={`dm-${id}`} value={value} onChange={(e) => onPick(e.target.value)} className={styles.dSelect}>
        <option value="">Select…</option>
        {Object.entries(opts).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </p>
  );

  const groupBlock = (g: (typeof GROUPS)[GroupKey][number]) => (
    <section key={g.title} className={styles.dGroup}>
      <h4 className={styles.dGroupTitle}>{g.title}</h4>
      {g.note && <p className={styles.dGroupNote}>{g.note}</p>}
      <div className={styles.dChoices}>
        {g.items.filter((it) => vis(s, it)).map((it) => {
          const on = Boolean(s.on[it.id]);
          return (
            <div key={it.id} className={styles.dChoice} data-on={on ? "true" : "false"} data-warn={it.warn ? "true" : undefined}>
              <label className={styles.dChoiceLabel}>
                <input type="checkbox" className={styles.srOnly} checked={on} onChange={() => toggle(it)} />
                <span className={styles.dTick} aria-hidden="true">
                  {on && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                  )}
                </span>
                <span className={styles.dChoiceText}>{it.t}</span>
              </label>
              {it.sides && on && (
                <fieldset className={styles.dSides}>
                  <legend>{`Which leg: ${it.t}`}</legend>
                  {(["R", "L", "B"] as const).map((sv) => (
                    <label key={sv} className={styles.dSide} data-on={s.side[it.id] === sv ? "true" : "false"}>
                      <input type="radio" className={styles.srOnly} name={`dm-side-${it.id}`} value={sv}
                        checked={s.side[it.id] === sv}
                        onChange={() => setS((v) => ({ ...v, side: { ...v.side, [it.id]: sv } }))} />
                      {SIDE[sv]}
                    </label>
                  ))}
                </fieldset>
              )}
              {it.year && on && (
                <p className={styles.dField}>
                  <label htmlFor={`dm-y-${it.id}`}>Year, if you know it</label>
                  <input id={`dm-y-${it.id}`} className={styles.dYear} inputMode="numeric" maxLength={4}
                    value={s.year[it.id] ?? ""} placeholder="e.g. 2019"
                    onChange={(e) => setS((v) => ({ ...v, year: { ...v.year, [it.id]: e.target.value.replace(/\D/g, "").slice(0, 4) } }))} />
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  /* ─────────── the stages ─────────── */
  const stage = () => (
    <>
      <div className={styles.dHead}>
        <h3 ref={headRef} tabIndex={-1} className={styles.dStageTitle}>{C.heads[key][0]}</h3>
        <p className={styles.dStageSub}>{C.heads[key][1]}</p>
      </div>

      {key === "symptoms" && chips("sex", "Gender", { F: "Female", M: "Male" }, s.sex, (v) => set({ sex: v as State["sex"] }))}

      {key === "history" && (
        <>
          {picker("age", "Your age", AGE, s.age, (v) => set({ age: v as State["age"] }))}
          <section className={styles.dGroup}>
            <h4 className={styles.dGroupTitle}>Daily routine</h4>
            {picker("sit", "Hours sitting per day", HRS, s.sit, (v) => set({ sit: v as State["sit"] }))}
            {picker("stand", "Hours standing per day", HRS, s.stand, (v) => set({ stand: v as State["stand"] }))}
          </section>
        </>
      )}

      {GROUPS[key].map((g) => (
        <div key={g.title}>
          {g.treated && (
            <section className={styles.dGroup}>
              <h4 className={styles.dGroupTitle}>Past treatment</h4>
              {chips("treated", "Ever treated for a vein problem?", { yes: "Yes", no: "No" }, s.treated,
                (v) => set({ treated: v as State["treated"] }))}
            </section>
          )}
          {(!g.treated || s.treated === "yes") && groupBlock(g)}
        </div>
      ))}

      {key === "symptoms" && (
        <section className={styles.dGroup}>
          <h4 className={styles.dGroupTitle}>Severity</h4>
          {picker("dur", "How long have you had them?", DUR, s.dur, (v) => set({ dur: v as State["dur"] }))}
          <p className={styles.dField}>
            <label htmlFor="dm-sev">Worst leg discomfort</label>
            <span className={styles.dRange}>
              <input id="dm-sev" type="range" min={0} max={10} step={1} value={s.sev}
                onChange={(e) => set({ sev: parseInt(e.target.value, 10) || 0 })} />
              <output htmlFor="dm-sev">{s.sev}</output>
            </span>
            <span className={styles.dRangeEnds}><span>0 none</span><span>10 worst</span></span>
          </p>
          {chips("impact", "Effect on your day", IMPACT, s.impact, (v) => set({ impact: v as State["impact"] }))}
        </section>
      )}

      {key === "history" && s.treated === "yes" && (
        <section className={styles.dGroup}>
          <h4 className={styles.dGroupTitle}>After treatment</h4>
          {chips("outcome", "How did your symptoms change?", OUTCOME, s.outcome, (v) => set({ outcome: v as State["outcome"] }))}
        </section>
      )}
      {key === "history" && (
        <section className={styles.dGroup}>
          <h4 className={styles.dGroupTitle}>Compression stockings</h4>
          {chips("stock", "Have you tried them?", STOCK, s.stock, (v) => set({ stock: v as State["stock"] }))}
        </section>
      )}
    </>
  );

  const lowW = ((LOW_MAX + 1) / SCALE) * 100;
  const modW = ((MOD_MAX - LOW_MAX) / SCALE) * 100;
  const pct = (Math.min(r.total, SCALE) / SCALE) * 100;
  const t = TIERS[r.tier];

  const result = () => (
    <>
      <div className={styles.dHead}>
        <h3 ref={headRef} tabIndex={-1} className={styles.dStageTitle}>Your result</h3>
      </div>

      {r.urgent && (
        <div role="alert" className={styles.dUrgent}>
          <strong>{C.urgent.strong}</strong>
          <p>{C.urgent.body}</p>
        </div>
      )}

      <section className={styles.dTier} data-tier={r.tier}>
        <span className={styles.dTierLabel}>Screening result</span>
        <p className={styles.dTierName}>{t.name}</p>
        <p className={styles.dTierBody}>{t.body}</p>
        <div
          role="img"
          aria-label={`Score ${r.total}. Scores 0 to ${LOW_MAX} are lower, ${LOW_MAX + 1} to ${MOD_MAX} moderate, ${MOD_MAX + 1} and above higher.`}
          className={styles.dScale}
        >
          <span className={styles.dScaleTrack}>
            <span className={styles.dScaleLow} style={{ width: `${lowW}%` }} />
            <span className={styles.dScaleMod} style={{ width: `${modW}%` }} />
            <span className={styles.dScaleHigh} style={{ width: `${100 - lowW - modW}%` }} />
          </span>
          <span className={styles.dScaleDot} style={{ left: `${pct}%` }} />
          <span className={styles.dScaleTicks}>
            <span>0</span><span>{LOW_MAX + 1}</span><span>{MOD_MAX + 1}</span><span>{SCALE}+</span>
          </span>
        </div>
        <p className={styles.dScore}>Your score: <strong>{r.total}</strong></p>
      </section>

      {r.raised && <p className={styles.dNote}>{C.raised(r.raised)}</p>}
      {r.dvt && <p className={styles.dNote}>{C.dvt}</p>}
      {r.pelvic && <p className={styles.dNote}>{C.pelvicNote}</p>}

      <section className={styles.dGroup}>
        <h4 className={styles.dGroupTitle}>Clinical class</h4>
        <ol aria-label={`Clinical class C${r.maxc}, ${CEAP[r.maxc].n}`} className={styles.dLadder}>
          {CEAP.map((c) => (
            <li key={c.c} data-at={c.c === r.maxc ? "true" : "false"}>
              <span className={styles.dLadderC}>C{c.c}</span>
              <span className={styles.dLadderN}>{c.n}</span>
            </li>
          ))}
        </ol>
        <p className={styles.dGroupNote}>{C.ladderCaption}</p>
      </section>

      <details className={styles.drawer}>
        <summary>Score details and the answers given<span className={styles.chev} aria-hidden="true">▾</span></summary>
        <div className={styles.drawerBody}>
          <p>Signs {r.sec.signs} · Symptoms {r.sec.symptoms} · History and risk {r.sec.history}</p>
          {(["signs", "symptoms", "history"] as const).map((k) => {
            const items = reported(s, k);
            return (
              <div key={k}>
                <p><strong>{k[0].toUpperCase() + k.slice(1)}</strong></p>
                {items.length ? <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul> : <p>None reported</p>}
              </div>
            );
          })}
        </div>
      </details>
    </>
  );

  const back = () => set({ step: Math.max(0, s.step - 1) });
  const next = () => (done ? setS(fresh()) : set({ step: s.step + 1 }));

  return (
    <div className={styles.demo}>
      <ol className={styles.dRail} aria-label="Screening stages">
        {STEP_NAMES.map((n, i) => (
          <li key={n} aria-current={i === s.step ? "step" : undefined} data-state={i < s.step ? "done" : i === s.step ? "on" : "off"}>
            <span className={styles.dRailBar} aria-hidden="true" />
            <span className={styles.dRailName}>{n}</span>
          </li>
        ))}
      </ol>

      <div className={styles.dBody} data-done={done ? "true" : "false"}>
        <div className={styles.dMain}>
          {done ? result() : stage()}

          <nav className={styles.dNav} aria-label={done ? "Result actions" : "Screening navigation"}>
            {s.step > 0 && (
              <button type="button" data-act="back" className={styles.dBtn} onClick={back}>
                {done ? "Edit answers" : "Back"}
              </button>
            )}
            <button type="button" data-act={done ? "reset" : "next"}
              className={done ? styles.dBtn : styles.dBtnGo} onClick={next}>
              {C.next[s.step]}
            </button>
            {s.step > 0 && !done && (
              <button type="button" data-act="reset" className={styles.dBtnQuiet}
                onClick={() => setS(fresh())}>Start over</button>
            )}
          </nav>

          <p className={styles.dFine}>{DEMO_NOTE}</p>
        </div>

        {!done && (
          <aside className={styles.dAside} aria-label="Your legs">
            <div className={styles.dAsideIn}>
              <div className={styles.dLegs}>
                {(["R", "L"] as const).map((leg) => (
                  <figure key={leg}>
                    {legSvg(leg)}
                    <figcaption>{leg === "R" ? "Right leg" : "Left leg"}</figcaption>
                  </figure>
                ))}
              </div>
              <p className={styles.dLegState} aria-live="polite">{legSummary}</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
