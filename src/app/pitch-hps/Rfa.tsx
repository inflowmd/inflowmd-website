"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";
import { rfa } from "./content";

/**
 * The practice site's own RFA (endovenous ablation) explainer.
 *
 * SOURCE — vein-specialists @ eec6a944f368ad392e72d9b213efa32bfa23e90f:
 *   src/components/content/VeinFixExplainer.tsx  (geometry, renderer, SVG, drivers)
 *   src/data/explainers.ts  (VEIN_FIX_COPY)
 * The path geometry, the renderer's progress mapping, the particle loop, the
 * valve and bulge construction and the three poses are COPIED, not reworked.
 * Treatment mechanics are unchanged: reflux → catheter and seal → the treated
 * vein fades while healthy flow remains. This is the full explainer, not the
 * decorative RfaDivider.
 *
 * IT IS DRIVEN THE WAY THE PRACTICE SITE DRIVES IT, verified against that
 * source and against the running site:
 *   · From 900px up, the section is a tall runway with a sticky stage, and
 *     scroll position maps to progress 0..3 — the same formula, the same
 *     progress bar. Nothing plays by itself; the reader's scroll is the clock.
 *   · Below 900px there is no runway. Three step chips tween the stage to each
 *     settled pose, exactly as the source does on phones.
 *   · The particle loop runs only while the stage is on screen.
 *   · Under reduced motion nothing moves: each step renders its settled pose.
 *
 * ADDED FOR THIS PRESENTATION, and not automatic on the client site: a Replay
 * control, and on phones only — where the client site has no scroll driver — a
 * Play control that runs the same progression once and stops. Neither exists on
 * the practice site, and neither starts on its own.
 */

const VIEW_W = 500;
const VIEW_H = 640;
const DEEP = "M330 660 C 334 520, 324 380, 330 230 S 332 80, 330 -20";
const SICK =
  "M150 660 C 100 610, 220 570, 160 520 S 90 440, 165 390 S 250 320, 175 265 S 120 190, 200 150 C 245 128, 290 112, 330 96";
const NS = "http://www.w3.org/2000/svg";
/** The pose each step settles on: reflux, sealed (tip at the junction), result. */
const POSE = [0.5, 1.97, 3];
/** The phone-only Play control's single pass, in seconds. */
const PLAY_SECONDS = 9;
/** The scroll runway, as the source sizes it. */
const WIDE = "(min-width: 900px)";

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

type Api = { play: () => void; pause: () => void; toStep: (n: number) => void; replay: () => void };

export default function Rfa({ head }: { head?: React.ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [wide, setWide] = useState(false);
  const section = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const bar = useRef<HTMLSpanElement | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const api = useRef<Api | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const root = svg.current, st = stage.current, sec = section.current;
    if (!root || !st || !sec) return;
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
    // particles (and each step's static pose under reduced motion, with dt = 0)
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

    const mq = window.matchMedia(WIDE);
    setWide(mq.matches);

    /* ── the practice site's desktop driver: scroll position → 0..3 ── */
    const headerH = () => document.querySelector("header")?.getBoundingClientRect().height ?? 72;
    let scrollFrame = 0;
    const fromScroll = () => {
      scrollFrame = 0;
      if (!mq.matches) return;
      const rect = sec.getBoundingClientRect();
      const h = headerH();
      const total = rect.height - (window.innerHeight - h);
      const pr = total > 0 ? Math.min(1, Math.max(0, (h - rect.top) / total)) : 1;
      if (bar.current) bar.current.style.transform = `scaleX(${pr})`;
      const next = pr * 3;
      render(reduced ? POSE[stepOf(next)] : next);
      if (reduced) place(0, 0);
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(fromScroll); };

    /* ── the phone driver, and the presentation's own Play ── */
    let mode: "idle" | "play" | "tween" = "idle";
    let loop = 0, last = 0, visible = false;
    let from = 0, to = 0, t0 = 0, ms = 0;

    const stopDriver = (freeze = false) => {
      mode = "idle";
      setPlaying(false);
      if (freeze) { cancelAnimationFrame(loop); loop = 0; }
    };
    const frame = (now: number) => {
      loop = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (mode === "play") {
        const nextP = P + dt * (3 / PLAY_SECONDS);
        if (nextP >= 3) { render(3); stopDriver(); } else render(nextP);
      } else if (mode === "tween") {
        const k = Math.min(1, (now - t0) / ms), e = 0.5 - Math.cos(Math.PI * k) / 2;
        render(from + (to - from) * e);
        if (k >= 1) stopDriver();
      }
      place(now, dt);
      /* The particle loop keeps running while the stage is on screen, as it
         does on the practice site — the scroll driver needs it even when no
         transition is in flight. */
      if (visible && !reduced) loop = requestAnimationFrame(frame);
    };
    const start = () => {
      if (loop || !visible || reduced) return;
      last = performance.now();
      loop = requestAnimationFrame(frame);
    };

    api.current = {
      play: () => {
        if (reduced || mq.matches) return;
        if (P >= 2.995) render(0);
        mode = "play"; setPlaying(true); start();
      },
      pause: () => stopDriver(true),
      toStep: (n: number) => {
        stepRef.current = n;
        setStep(n);
        if (mq.matches) {
          /* On desktop the scroll IS the driver, so a step control moves the
             scroll to that pose rather than animating against it. */
          const h = headerH();
          const total = sec.getBoundingClientRect().height - (window.innerHeight - h);
          const target = sec.offsetTop - h + total * (POSE[n] / 3);
          window.scrollTo({ top: Math.max(0, target), behavior: reduced ? "auto" : "smooth" });
          return;
        }
        if (reduced) { render(POSE[n]); place(0, 0); return; }
        from = P; to = POSE[n];
        t0 = performance.now();
        ms = Math.min(1600, 500 + Math.abs(to - from) * 500);
        mode = "tween"; setPlaying(true); start();
      },
      replay: () => {
        if (mq.matches) { api.current?.toStep(0); return; }
        render(0);
        stepRef.current = 0;
        setStep(0);
        if (reduced) { render(POSE[0]); place(0, 0); return; }
        mode = "play"; setPlaying(true); start();
      },
    };

    /* the particle loop runs only while the stage is on screen */
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (!visible) stopDriver(true);
      else start();
    }, { threshold: 0.15 });
    io.observe(st);

    const onWide = () => {
      setWide(mq.matches);
      stopDriver(true);
      if (mq.matches) fromScroll();
      else { render(POSE[stepRef.current]); place(0, 0); }
      start();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onWide);

    if (mq.matches) fromScroll();
    else render(reduced ? POSE[0] : 0);
    place(0, 0);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onWide);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(loop);
      io.disconnect();
      api.current = null;
      setPlaying(false);
    };
  }, [reduced]);

  const onPlayPause = useCallback(() => {
    if (playing) api.current?.pause();
    else api.current?.play();
  }, [playing]);

  return (
    <div ref={section} className={styles.rfaScroll}>
      <div className={styles.rfaSticky}>
        {head}
        <div className={styles.tablet}>
          <div className={styles.tabletScreen}>
            <div className={styles.vfCopy}>
              <p className={styles.stepIndex}>STEP {step + 1} / 3</p>
              <p className={`${styles.stepLine} ${styles.stepLive}`}>{rfa.steps[step].title}</p>
              {/* With reduced motion on, all three read at once instead. */}
              <div className={styles.stepStatic}>
                {rfa.steps.map((s, i) => (
                  <p key={s.title} className={styles.stepLine} data-on={step === i ? "true" : "false"}>
                    {i + 1} · {s.title}
                  </p>
                ))}
              </div>
            </div>

            <div ref={stage} className={styles.vfStage} data-step={step}>
              <p aria-hidden="true" className={styles.vfHeart}>{rfa.heart}</p>
              <svg
                ref={svg} aria-hidden="true" focusable="false"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet"
                className={styles.vfSvg}
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
                  key={l.title} aria-hidden="true" className={styles.vfLabel}
                  data-on={step === l.step ? "true" : "false"}
                  style={l.side === "l" ? { left: `${l.x}%`, top: `${l.y}%` } : { right: `${l.x}%`, top: `${l.y}%` }}
                >
                  {l.title}
                  <small>{l.small}</small>
                </p>
              ))}
              <p aria-hidden="true" className={styles.vfStatus}>
                <i data-step={step} />
                {rfa.status[step]}
              </p>
            </div>
          </div>
        </div>

        {/* the source's own desktop progress bar */}
        {wide && !reduced && (
          <span aria-hidden="true" className={styles.rfaBar}>
            <span ref={bar} style={{ transform: "scaleX(0)" }} />
          </span>
        )}

        <p className={styles.useLine}>{rfa.use}</p>

        <div className={styles.rfaControls}>
          {!wide && !reduced && (
            <button type="button" className={styles.ghostLight} onClick={onPlayPause}>
              {playing ? "Pause" : "Play"}
            </button>
          )}
          {!reduced && (
            <button type="button" className={styles.ghostLight} aria-label="Replay animation"
              onClick={() => api.current?.replay()}>
              Replay
            </button>
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
    </div>
  );
}
