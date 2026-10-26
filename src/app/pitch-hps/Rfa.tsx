"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";
import { rfa } from "./content";

/**
 * The practice site's own RFA (endovenous ablation) explainer, ported into a
 * presentation wrapper for this review deck.
 *
 * SOURCE — vein-specialists @ eec6a944f368ad392e72d9b213efa32bfa23e90f:
 *   src/components/content/VeinFixExplainer.tsx  (geometry, renderer, SVG)
 *   src/data/explainers.ts  (VEIN_FIX_COPY)
 * The path geometry, the renderer's progress mapping, the particle loop, the
 * valve and bulge construction and the three poses are COPIED, not reworked.
 * Treatment mechanics are unchanged: reflux → catheter and seal → the treated
 * vein fades while healthy flow remains.
 *
 * WHAT THE WRAPPER CHANGES, and only this: the original is driven by page
 * scroll on desktop and by three chips on phones. Here it is driven by
 * explicit controls, because a deck scene must not move on its own.
 *   · Play advances progress 0→3 once and then STOPS. It never loops.
 *   · Pause freezes everything in place — the progression clock, the tween
 *     clock and the particle loop all stop on the same frame, because the
 *     rAF loop itself is cancelled rather than being fed a zero delta.
 *   · Replay returns to the start and plays once.
 *   · The three step buttons tween to that step's settled pose.
 *   · Leaving the viewport pauses it, and it does NOT resume on return.
 *   · Under reduced motion nothing moves at all: the step buttons snap to
 *     each pose and Play/Pause is not offered. All three steps' text is in
 *     the document at every moment either way, so no required content is
 *     ever behind an animation.
 *
 * The illustration is aria-hidden, exactly as in the source: the step text
 * carries the meaning. The clinical copy is pending physician review and is
 * not presented as approved.
 */

const VIEW_W = 500;
const VIEW_H = 640;
const DEEP = "M330 660 C 334 520, 324 380, 330 230 S 332 80, 330 -20";
const SICK =
  "M150 660 C 100 610, 220 570, 160 520 S 90 440, 165 390 S 250 320, 175 265 S 120 190, 200 150 C 245 128, 290 112, 330 96";
const NS = "http://www.w3.org/2000/svg";
/** The pose each step settles on: reflux, sealed (tip at the junction), result. */
const POSE = [0.5, 1.97, 3];
/** One full pass, in seconds. */
const PLAY_SECONDS = 9;

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

type Api = { play: () => void; pause: () => void; toStep: (n: number) => void; replay: () => void };

export default function Rfa() {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stage = useRef<HTMLDivElement | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const api = useRef<Api | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const root = svg.current, st = stage.current;
    if (!root || !st) return;
    const $ = <T extends Element>(id: string) => root.querySelector(`[data-v="${id}"]`) as unknown as T;
    const r = {
      deep: $<SVGPathElement>("deep"), sick: $<SVGPathElement>("sick"), seal: $<SVGPathElement>("seal"),
      wire: $<SVGPathElement>("wire"), deepGlow: $<SVGPathElement>("deepGlow"), sickG: $<SVGGElement>("sickG"),
      tip: $<SVGCircleElement>("tip"), tipGlow: $<SVGCircleElement>("tipGlow"),
      deepValves: $<SVGGElement>("deepValves"), sickValves: $<SVGGElement>("sickValves"),
      bulges: $<SVGGElement>("bulges"), deepDots: $<SVGGElement>("deepDots"), sickDots: $<SVGGElement>("sickDots"),
    };
    const LD = r.deep.getTotalLength(), LS = r.sick.getTotalLength();
    const mk = <K extends keyof SVGElementTagNameMap>(
      tag: K, attrs: Record<string, string | number>, style: Partial<CSSStyleDeclaration>, parent: Element,
    ) => {
      const el = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
      Object.assign(el.style, style);
      parent.appendChild(el);
      return el;
    };
    const normalAt = (path: SVGPathElement, len: number) => {
      const L = path.getTotalLength();
      const a = path.getPointAtLength(Math.max(0, len - 1)), b = path.getPointAtLength(Math.min(L, len + 1));
      const dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
      return { x: -dy / m, y: dx / m, tx: dx / m, ty: dy / m };
    };
    // valves: two cusps; closed = tips meet pointing toward the heart, open = a gap between them
    const valve = (path: SVGPathElement, len: number, parent: SVGGElement, open: boolean, color: string) => {
      const p = path.getPointAtLength(len), n = normalAt(path, len), dir = path === r.deep ? 1 : -1;
      const g = mk("g", {}, {}, parent);
      for (const s of [-1, 1]) {
        const bx = p.x + n.x * 14 * s, by = p.y + n.y * 14 * s;
        const off = open ? 7 : 0.5;
        const tx = p.x + n.x * off * s + n.tx * 12 * dir, ty = p.y + n.y * off * s + n.ty * 12 * dir;
        mk("path", {
          d: `M${bx} ${by} Q ${(bx + tx) / 2} ${(by + ty) / 2} ${tx} ${ty}`,
          "stroke-width": 3, "stroke-linecap": "round", fill: "none",
        }, { stroke: color }, g);
      }
      return g;
    };
    for (const g of [r.deepValves, r.sickValves, r.bulges, r.deepDots, r.sickDots]) g.replaceChildren();
    [0.2, 0.45, 0.7].forEach((f) =>
      valve(r.deep, LD * f, r.deepValves, false, "color-mix(in srgb, var(--vf-gradient-mid) 70%, var(--vf-ink))"));
    const sickValves = [0.3, 0.55, 0.78].map((f) => valve(r.sick, LS * f, r.sickValves, true, "var(--vf-reflux)"));
    const bulges = [0.18, 0.42, 0.62].map((f) => {
      const p = r.sick.getPointAtLength(LS * f);
      return mk("ellipse", { cx: p.x, cy: p.y, rx: 24, ry: 18 },
        { fill: "var(--vf-reflux)", fillOpacity: "0.28", transformBox: "fill-box", transformOrigin: "center" }, r.bulges);
    });
    const dd = Array.from({ length: 16 }, (_, i) => ({
      el: mk("circle", { r: 4.2, "stroke-width": 2 }, { fill: "var(--vf-surface)", stroke: "var(--vf-cyan)" }, r.deepDots),
      t: i / 16,
    }));
    // a fixed wobble phase per particle (deterministic: no hydration or render-to-render drift)
    const sd = Array.from({ length: 14 }, (_, j) => ({
      el: mk("circle", { r: 4 }, { fill: "var(--vf-reflux-dot)", fillOpacity: "0.85" }, r.sickDots),
      t: j / 14, j: (j * 2.39) % 6,
    }));
    for (const p of [r.seal, r.wire]) { p.style.strokeDasharray = `${LS}`; p.style.strokeDashoffset = `${LS}`; }

    const stepOf = (p: number) => (p < 1 ? 0 : p < 2 ? 1 : 2);
    let P = 0;

    const render = (next: number) => {
      P = next;
      const s = stepOf(P);
      const t2 = Math.min(1, Math.max(0, P - 1)), t3 = Math.min(1, Math.max(0, P - 2));
      const len = t2 * LS * 0.97;
      r.wire.style.strokeDashoffset = `${P >= 2 ? LS : LS - len}`;
      r.seal.style.strokeDashoffset = `${P >= 2 ? 0 : LS - Math.max(0, len - 40)}`;
      const tp = r.sick.getPointAtLength(Math.max(1, len));
      const show = P > 1 && P < 2 ? "1" : "0";
      for (const c of [r.tip, r.tipGlow]) {
        c.setAttribute("cx", `${tp.x}`); c.setAttribute("cy", `${tp.y}`); c.setAttribute("opacity", show);
      }
      r.sickG.style.opacity = `${1 - t3 * 0.82}`;
      r.deepGlow.style.strokeOpacity = `${0.15 + t3 * 0.5}`;
      r.deep.style.strokeOpacity = `${0.45 + t3 * 0.5}`;
      bulges.forEach((b) => { b.style.fillOpacity = `${0.28 * (1 - t2)}`; });
      sickValves.forEach((v) => v.setAttribute("opacity", `${1 - t2 * 0.6}`));
      st.dataset.step = `${s}`;
      if (s !== stepRef.current) { stepRef.current = s; setStep(s); }
    };
    // particles (and the step's static pose under reduced motion, with dt = 0)
    const place = (now: number, dt: number) => {
      const t2 = Math.min(1, Math.max(0, P - 1)), t3 = Math.min(1, Math.max(0, P - 2));
      const dSpeed = 0.07 + t3 * 0.08, sSpeed = 0.06 * (1 - t2);
      for (const d of dd) {
        d.t = (d.t + dt * dSpeed) % 1;
        const p = r.deep.getPointAtLength(d.t * LD);
        d.el.setAttribute("cx", `${p.x}`); d.el.setAttribute("cy", `${p.y}`);
        d.el.setAttribute("opacity", `${0.55 + t3 * 0.45}`);
      }
      for (const d of sd) {
        d.t = (d.t + dt * sSpeed) % 1;
        const L = (1 - d.t) * LS, p = r.sick.getPointAtLength(L), n = normalAt(r.sick, L);
        const w = dt ? Math.sin(now / 300 + d.j) * 5 : 0;
        d.el.setAttribute("cx", `${p.x + n.x * w}`); d.el.setAttribute("cy", `${p.y + n.y * w}`);
        d.el.setAttribute("opacity", `${(1 - t2) * 0.85}`);
      }
      if (dt) bulges.forEach((b, i) => {
        b.style.transform = `scale(${1 + Math.sin(now / 500 + i) * 0.06 * (1 - t2)})`;
      });
    };

    /* One clock for everything. `mode` decides what the frame advances, and
       when it goes idle the loop is cancelled, so the particles stop on the
       same frame as the progression — a paused stage is genuinely still. */
    let mode: "idle" | "play" | "tween" = "idle";
    let loop = 0, last = 0, visible = false;
    let from = 0, to = 0, t0 = 0, ms = 0;

    const stop = () => {
      mode = "idle";
      cancelAnimationFrame(loop);
      loop = 0;
      setPlaying(false);
    };
    const frame = (now: number) => {
      loop = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (mode === "play") {
        const nextP = P + dt * (3 / PLAY_SECONDS);
        if (nextP >= 3) { render(3); place(now, dt); stop(); return; }
        render(nextP);
      } else if (mode === "tween") {
        const k = Math.min(1, (now - t0) / ms), e = 0.5 - Math.cos(Math.PI * k) / 2;
        render(from + (to - from) * e);
        if (k >= 1) { place(now, dt); stop(); return; }
      }
      place(now, dt);
      if (visible && mode !== "idle") loop = requestAnimationFrame(frame);
    };
    const start = () => {
      if (loop || !visible) return;
      last = performance.now();
      loop = requestAnimationFrame(frame);
    };

    api.current = {
      play: () => {
        if (reduced) return;
        if (P >= 2.995) render(0);
        mode = "play";
        setPlaying(true);
        start();
      },
      pause: stop,
      toStep: (n: number) => {
        stepRef.current = n;
        setStep(n);
        if (reduced) { render(POSE[n]); place(0, 0); return; }
        from = P; to = POSE[n];
        t0 = performance.now();
        ms = Math.min(1600, 500 + Math.abs(to - from) * 500);
        mode = "tween";
        setPlaying(true);
        start();
      },
      replay: () => {
        render(0);
        stepRef.current = 0;
        setStep(0);
        if (reduced) { render(POSE[0]); place(0, 0); return; }
        mode = "play";
        setPlaying(true);
        start();
      },
    };

    /* Off screen it pauses, and it stays paused when it comes back: a scene
       the reader has scrolled away from must not be running, and must not
       start itself again. */
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (!visible) stop();
    }, { threshold: 0.15 });
    io.observe(st);

    render(reduced ? POSE[0] : 0);
    place(0, 0);

    return () => {
      io.disconnect();
      cancelAnimationFrame(loop);
      api.current = null;
      /* The effect rebuilds when the reduced-motion preference changes. The
         old loop is cancelled here, so the control must stop claiming to be
         playing: without this, turning reduced motion on mid-playback left a
         Pause button over a frozen stage. */
      setPlaying(false);
    };
  }, [reduced]);

  const onPlayPause = useCallback(() => {
    if (playing) api.current?.pause();
    else api.current?.play();
  }, [playing]);

  return (
    <div className={styles.rfa}>
      <div className={styles.tablet}>
        <div className={styles.tabletScreen}>
          <div className={styles.rfaGrid}>
            <div className={styles.rfaCopy}>
              <p className={styles.rfaMicro}>{rfa.micro}</p>
              <h3 className={styles.rfaHead}>{rfa.heading}</h3>
              {/* All three steps are always present. The active one is marked,
                  and nothing required is hidden behind the animation. */}
              <ol className={styles.rfaSteps}>
                {rfa.steps.map((s, i) => (
                  <li key={s.title} className={styles.rfaStep} data-state={step === i ? "on" : i < step ? "done" : "off"}>
                    <span aria-hidden="true" className={styles.rfaStepNum}>{i + 1}</span>
                    <h4 className={styles.rfaStepTitle}>{s.title}</h4>
                    <p className={styles.rfaStepBody}>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div ref={stage} className={styles.rfaStage} data-step={step}>
              <p aria-hidden="true" className={styles.rfaHeart}>{rfa.heart}</p>
              <svg
                ref={svg} aria-hidden="true" focusable="false"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet"
                className={styles.rfaSvg}
              >
                <defs>
                  <linearGradient id="vf-healthy" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" style={{ stopColor: "var(--vf-cyan)" }} />
                    <stop offset=".5" style={{ stopColor: "var(--vf-gradient-mid)" }} />
                    <stop offset="1" style={{ stopColor: "var(--vf-green)" }} />
                  </linearGradient>
                  <linearGradient id="vf-sick" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" style={{ stopColor: "var(--vf-reflux)" }} />
                    <stop offset="1" style={{ stopColor: "var(--vf-reflux-deep)" }} />
                  </linearGradient>
                  <linearGradient id="vf-seal" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" style={{ stopColor: "var(--vf-cyan)" }} />
                    <stop offset="1" style={{ stopColor: "var(--vf-green)" }} />
                  </linearGradient>
                  <radialGradient id="vf-tip">
                    <stop offset="0" style={{ stopColor: "var(--vf-cyan)", stopOpacity: 0.95 }} />
                    <stop offset=".55" style={{ stopColor: "var(--vf-green)", stopOpacity: 0.35 }} />
                    <stop offset="1" style={{ stopColor: "var(--vf-green)", stopOpacity: 0 }} />
                  </radialGradient>
                  <filter id="vf-soft"><feGaussianBlur stdDeviation="6" /></filter>
                </defs>
                {/* the deep (healthy) vein */}
                <g>
                  <path data-v="deepGlow" d={DEEP} strokeWidth="56" fill="none" filter="url(#vf-soft)"
                    style={{ stroke: "var(--vf-gradient-mid)", strokeOpacity: 0.15 }} />
                  <path d={DEEP} strokeWidth="40" fill="none" strokeLinecap="round" style={{ stroke: "var(--vf-line)" }} />
                  <path data-v="deep" d={DEEP} stroke="url(#vf-healthy)" strokeWidth="30" fill="none"
                    strokeLinecap="round" style={{ strokeOpacity: 0.45 }} />
                  <g data-v="deepValves" />
                  <g data-v="deepDots" />
                </g>
                {/* the diseased superficial vein, joining the deep vein at the top */}
                <g data-v="sickG">
                  <path d={SICK} strokeWidth="44" fill="none" strokeLinecap="round" style={{ stroke: "var(--vf-reflux-soft)" }} />
                  <path data-v="sick" d={SICK} stroke="url(#vf-sick)" strokeOpacity=".55" strokeWidth="32" fill="none" strokeLinecap="round" />
                  <g data-v="bulges" />
                  <g data-v="sickValves" />
                  <g data-v="sickDots" />
                  <path data-v="seal" d={SICK} stroke="url(#vf-seal)" strokeOpacity=".9" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path data-v="wire" d={SICK} strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round"
                    style={{ stroke: "var(--vf-ink)" }} />
                  <circle data-v="tipGlow" r="34" fill="url(#vf-tip)" opacity="0" />
                  <circle data-v="tip" r="6" strokeWidth="3" opacity="0"
                    style={{ fill: "var(--vf-surface)", stroke: "var(--vf-cyan)" }} />
                </g>
              </svg>
              {rfa.labels.map((l) => (
                <p
                  key={l.title} aria-hidden="true" className={styles.rfaLabel}
                  data-on={step === l.step ? "true" : "false"}
                  style={l.side === "l" ? { left: `${l.x}%`, top: `${l.y}%` } : { right: `${l.x}%`, top: `${l.y}%` }}
                >
                  {l.title}
                  <small>{l.small}</small>
                </p>
              ))}
              <p aria-hidden="true" className={styles.rfaStatus}>
                <i data-step={step} />
                {rfa.status[step]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rfaControls}>
        {!reduced && (
          <>
            <button type="button" className={styles.btn} onClick={onPlayPause}>
              {playing ? "Pause" : "Play"}
            </button>
            <button type="button" className={styles.btn} aria-label="Replay animation" onClick={() => api.current?.replay()}>
              Replay
            </button>
          </>
        )}
        <span className={styles.rfaStepGroup} role="group" aria-label="Show a step of the animation">
          {rfa.steps.map((s, i) => (
            <button
              key={s.title} type="button" className={styles.btnStep}
              aria-pressed={step === i} aria-label={`Show step ${i + 1}: ${s.title}`}
              onClick={() => api.current?.toStep(i)}
            >
              {i + 1}
            </button>
          ))}
        </span>
        <span className={styles.rfaLive} aria-live="polite">{rfa.status[step]}</span>
      </div>
    </div>
  );
}
