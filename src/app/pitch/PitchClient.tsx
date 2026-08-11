"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge } from "../audit/Gauge";

/**
 * The booth pitch deck. Ten full-viewport sections; forward/back via
 * keyboard (presenter remotes send PageDown/PageUp), click-anywhere,
 * or the progress dots. Section S2b reveals its three lines one
 * keypress at a time before the deck moves on.
 *
 * Everything renders from local assets — no external requests.
 */

const NAVY = "#081C34";
const LIME = "#84B83B";
const BLUE = "#3B6FBF";

const SECTIONS = ["s0", "s1", "s2a", "s2b", "s2c", "s3a", "s3b", "s3c", "s4", "s5"] as const;
const S2B = SECTIONS.indexOf("s2b");
const S2B_LINES = 3;

/** Shared type scale — readable from six feet on a 1440p booth monitor. */
const PRIMARY = "text-[clamp(40px,4.5vw,104px)] font-extrabold leading-[1.08] tracking-tight text-white";
const SUB = "text-[clamp(20px,1.7vw,34px)] font-light text-white/60 leading-snug";

const INVISIBLE_LINES = [
  ["No medical schema", "AI can’t tell you’re a vein practice"],
  ["Blocked crawlers", "your site may lock ChatGPT out"],
  ["Unstructured content", "AI can’t parse what you offer"],
] as const;

/* ---------- small shared pieces ---------- */

function FailX() {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-full bg-red-500/15"
      style={{ width: "1.5em", height: "1.5em" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f87171"
        strokeWidth="3"
        strokeLinecap="round"
        className="w-[0.75em] h-[0.75em]"
        aria-hidden
      >
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </span>
  );
}

function PassCheck({ delayMs, animate }: { delayMs: number; animate: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full ${
        animate ? "pitch-pop" : ""
      }`}
      style={{ width: "1.5em", height: "1.5em", background: LIME, animationDelay: `${delayMs}ms` }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[0.8em] h-[0.8em]"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

/* ---------- the deck ---------- */

export default function PitchClient() {
  const [active, setActive] = useState(0);
  const [reveals, setReveals] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Handlers live on window; refs keep them reading fresh state.
  const stateRef = useRef({ active: 0, reveals: 0 });
  stateRef.current = { active, reveals };

  // Programmatic smooth scrolls must not let the IntersectionObserver roll
  // `active` back through the sections they pass — presenter keypresses read
  // that state. The flag lifts on scrollend (plus a fallback timer).
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<number | undefined>(undefined);

  /** S2b's reveal state is derived from travel direction on EVERY arrival:
      entering from below restarts the beat, from above shows it complete. */
  const reconcileReveals = useCallback((from: number, to: number) => {
    if (to !== S2B || from === S2B) return;
    setReveals(from < S2B ? 0 : S2B_LINES);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
      reconcileReveals(stateRef.current.active, clamped);
      setActive(clamped);
      scrollingRef.current = true;
      window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        scrollingRef.current = false;
      }, 1500);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sectionRefs.current[clamped]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    },
    [reconcileReveals]
  );

  const advance = useCallback(() => {
    const { active: a, reveals: r } = stateRef.current;
    if (a === S2B && r < S2B_LINES) {
      setReveals(r + 1);
      return;
    }
    goTo(a + 1);
  }, [goTo]);

  const back = useCallback(() => {
    const { active: a, reveals: r } = stateRef.current;
    if (a === S2B && r > 0) {
      setReveals(r - 1);
      return;
    }
    goTo(a - 1);
  }, [goTo]);

  const reset = useCallback(() => {
    setReveals(0);
    goTo(0);
  }, [goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return; // one step per physical press — held keys must not thrash
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
        case "PageDown":
          e.preventDefault();
          advance();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          back();
          break;
        case "Escape":
          e.preventDefault();
          reset();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, back, reset]);

  // Manual scrolling (trackpad, swipe) keeps the dots honest — but only when
  // the user is driving; programmatic scrolls already set their destination.
  useEffect(() => {
    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
          if (index >= 0 && index !== stateRef.current.active) {
            reconcileReveals(stateRef.current.active, index);
            setActive(index);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );
    for (const el of sectionRefs.current) if (el) observer.observe(el);

    const onScrollEnd = () => {
      scrollingRef.current = false;
    };
    container?.addEventListener("scrollend", onScrollEnd);
    return () => {
      observer.disconnect();
      container?.removeEventListener("scrollend", onScrollEnd);
    };
  }, [reconcileReveals]);

  const jumpTo = (index: number) => goTo(index);

  const section = (index: number, children: React.ReactNode, extra = "") => (
    <section
      key={SECTIONS[index]}
      ref={(el) => {
        sectionRefs.current[index] = el;
      }}
      className={`relative h-dvh snap-start flex flex-col items-center justify-center gap-[4vh] px-[7vw] text-center overflow-hidden ${extra}`}
    >
      {children}
    </section>
  );

  return (
    <div
      ref={containerRef}
      onClick={advance}
      className="pitch-scroll fixed inset-0 overflow-y-auto snap-y snap-mandatory text-white cursor-default select-none"
      style={{ background: NAVY }}
    >
      {/* Mesh background — the audit input screen's, retuned darker and
          subtler. On S0 (the resting attract loop) it breathes a little
          more visibly; everywhere else content is king. */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
          active === 0 ? "opacity-100" : "opacity-40"
        }`}
        aria-hidden
      >
        <div
          className="mesh-blob-1 absolute -top-40 -left-40 w-[46vw] h-[46vw] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(132,184,59,0.20), transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="mesh-blob-2 absolute -bottom-32 -right-24 w-[48vw] h-[48vw] rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(18,54,94,0.85), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="mesh-blob-3 absolute top-1/3 left-1/2 w-[36vw] h-[36vw] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(59,111,191,0.22), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Progress dots */}
      <nav
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        aria-label="Sections"
      >
        {SECTIONS.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => jumpTo(i)}
            aria-label={`Section ${i + 1}`}
            aria-current={active === i}
            className={`w-4 h-4 rounded-full transition-all ${
              active === i ? "scale-125" : "bg-white/25 hover:bg-white/50"
            }`}
            style={active === i ? { background: LIME } : undefined}
          />
        ))}
      </nav>

      {/* S0 — ATTRACT */}
      {section(
        0,
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/inflowmd-final.png"
            alt="InflowMD"
            draggable={false}
            width={788}
            height={118}
            className="w-[min(44vw,780px)] h-auto"
          />
          <p className={SUB}>AI-powered marketing for medical practices</p>
        </>
      )}

      {/* S1 — HOOK */}
      {section(
        1,
        <>
          <h2 className={`${PRIMARY} max-w-[16em]`}>
            How do patients find a vein specialist in 2026?
          </h2>
          <div className="flex flex-col items-center gap-[2.2vh] w-[min(46vw,760px)]">
            {/* Google-ish: the classic rounded search field */}
            <div className="w-full flex items-center gap-4 rounded-full bg-white/95 px-7 py-[1.6vh] shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.4" strokeLinecap="round" className="w-[1.4vw] min-w-5 aspect-square" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <div className="h-[1.1vh] min-h-2 flex-1 max-w-[60%] rounded-full bg-slate-300" />
            </div>
            {/* ChatGPT-ish: chat composer, lime highlight, slightly larger */}
            <div
              className="w-[108%] flex items-center gap-4 rounded-3xl bg-white/[0.07] px-7 py-[2.2vh] border-2"
              style={{ borderColor: LIME, boxShadow: `0 0 44px ${LIME}30` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.5vw] min-w-5 aspect-square" aria-hidden>
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              </svg>
              <div className="h-[1.1vh] min-h-2 flex-1 max-w-[55%] rounded-full bg-white/25" />
              <span className="ml-auto inline-flex items-center justify-center rounded-full w-[2.4vw] min-w-8 aspect-square" style={{ background: LIME }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[45%]" aria-hidden>
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
            </div>
            {/* Voice: waveform motif */}
            <div className="w-full flex items-center justify-center gap-[0.55vw] rounded-full bg-white/[0.05] border border-white/15 px-7 py-[1.7vh]">
              {[34, 62, 88, 52, 96, 44, 72, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-[0.45vw] min-w-1.5 rounded-full"
                  style={{
                    height: `${(h / 100) * 3.4}vh`,
                    background: i % 2 ? BLUE : "rgba(255,255,255,0.65)",
                  }}
                />
              ))}
            </div>
          </div>
          <p className={SUB}>The answer changed. Most practice websites didn&rsquo;t.</p>
        </>
      )}

      {/* S2a — chat exchange */}
      {section(
        2,
        <>
          <h2 className={`${PRIMARY} max-w-[14em]`}>
            Patients are asking AI for doctor recommendations.
          </h2>
          <div className="w-[min(44vw,720px)] flex flex-col gap-[2vh] text-left">
            <div className="self-end max-w-[75%] rounded-3xl rounded-br-md bg-white/15 px-8 py-[1.8vh] text-[clamp(18px,1.5vw,30px)] font-medium text-white/90">
              best vein specialist near me
            </div>
            <div className="self-start w-[88%] rounded-3xl rounded-bl-md bg-white/[0.06] border border-white/10 px-8 py-[2.2vh] flex flex-col gap-[1.6vh]">
              {[82, 66, 74].map((w, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span
                    className="inline-block w-[0.6vw] min-w-2 aspect-square rounded-full"
                    style={{ background: i === 0 ? LIME : "rgba(255,255,255,0.35)" }}
                  />
                  <div
                    className="h-[1.2vh] min-h-2.5 rounded-full bg-white/30 blur-[3px]"
                    style={{ width: `${w}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <p className={SUB}>AI answers from what it can read on your site.</p>
        </>
      )}

      {/* S2b — invisible, three reveals */}
      {section(
        3,
        <>
          <h2 className={`${PRIMARY} max-w-[13em]`}>
            Most vein practice sites are invisible to AI.
          </h2>
          <ul className="flex flex-col items-start gap-[3vh] text-[clamp(24px,2.1vw,44px)] font-semibold">
            {INVISIBLE_LINES.map(([head, tail], i) => (
              <li
                key={head}
                className={`flex items-center gap-5 transition-opacity duration-300 ${
                  reveals > i ? "opacity-100" : "opacity-0"
                }`}
              >
                {reveals > i && <span className="pitch-pop inline-flex"><FailX /></span>}
                {reveals <= i && <FailX />}
                <span className="text-white/90">
                  {head}
                  <span className="text-white/50 font-normal"> — {tail}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* S2c — the flip */}
      {section(
        4,
        <>
          {/* Abstract structured-data motif — angle brackets + node graph */}
          <svg
            viewBox="0 0 1200 700"
            className="absolute inset-0 w-full h-full opacity-[0.05]"
            fill="none"
            aria-hidden
          >
            <path d="M240 180 140 350l100 170" stroke={LIME} strokeWidth="14" strokeLinecap="round" />
            <path d="M960 180l100 170-100 170" stroke={LIME} strokeWidth="14" strokeLinecap="round" />
            <circle cx="430" cy="240" r="14" fill={BLUE} />
            <circle cx="620" cy="420" r="14" fill={LIME} />
            <circle cx="790" cy="260" r="14" fill={BLUE} />
            <circle cx="520" cy="560" r="14" fill="#fff" />
            <path d="M430 240 620 420m0 0 170-160M620 420 520 560" stroke="#fff" strokeWidth="4" />
          </svg>
          <h2 className={`${PRIMARY} max-w-[14em]`}>
            We build sites AI can read, understand, and recommend.
          </h2>
          <ul className="flex flex-col items-start gap-[3vh] text-[clamp(24px,2.1vw,44px)] font-semibold">
            {INVISIBLE_LINES.map(([head, tail], i) => (
              <li key={head} className="flex items-center gap-5">
                <PassCheck animate={active === 4} delayMs={i * 200} />
                <span className="text-white/90">
                  {head}
                  <span className="text-white/50 font-normal"> — {tail}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* S3a — 53% */}
      {section(
        5,
        <>
          <div
            className="font-extrabold leading-none tracking-tight text-[clamp(200px,30vh,320px)]"
            style={{ color: LIME }}
          >
            53%
          </div>
          <p className={`${PRIMARY} text-[clamp(32px,3vw,68px)] max-w-[16em]`}>
            of mobile visitors abandon after 3 seconds.
          </p>
          <p className="text-[clamp(16px,1.2vw,24px)] text-white/40">Google / SOASTA</p>
        </>
      )}

      {/* S3b — 3x bars */}
      {section(
        6,
        <>
          <h2 className={`${PRIMARY} max-w-[15em]`}>
            A 1-second site converts 3x better than a 5-second site.
          </h2>
          <div className="flex items-end gap-[4vw] h-[34vh]">
            <div className="flex flex-col items-center gap-3 h-full justify-end">
              <div
                className={`pitch-bar w-[9vw] min-w-24 rounded-t-2xl bg-white/20 ${
                  active === 6 ? "" : "pitch-bar-hidden"
                }`}
                style={{ height: "33.3%" }}
              />
              <span className="text-[clamp(18px,1.5vw,30px)] font-semibold text-white/50">
                5s site
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 h-full justify-end">
              <div
                className={`pitch-bar w-[9vw] min-w-24 rounded-t-2xl ${
                  active === 6 ? "" : "pitch-bar-hidden"
                }`}
                style={{ height: "100%", background: LIME, transitionDelay: "150ms" }}
              />
              <span className="text-[clamp(18px,1.5vw,30px)] font-semibold" style={{ color: LIME }}>
                1s site
              </span>
            </div>
          </div>
          <p className={SUB}>Portent, 2022 — 100M+ pageviews, lead-generation sites</p>
        </>
      )}

      {/* S3c — architecture */}
      {section(
        7,
        <>
          <svg
            viewBox="0 0 1200 320"
            className="absolute left-0 right-0 top-[16vh] w-full opacity-60"
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="pitch-swoosh" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={LIME} stopOpacity="0" />
                <stop offset="0.55" stopColor={LIME} stopOpacity="0.9" />
                <stop offset="1" stopColor={LIME} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-40 260 C 320 250, 520 90, 1240 60"
              stroke="url(#pitch-swoosh)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
          <h2 className={`${PRIMARY} max-w-[13em]`}>
            We build on the same architecture as the fastest sites on the web.
          </h2>
          <p className={SUB}>Fast by design — not by plugin.</p>
        </>
      )}

      {/* S4 — PROOF */}
      {section(
        8,
        <>
          <h2 className={`${PRIMARY} max-w-[13em]`}>Same test. Their site. Our build.</h2>
          <div className="flex items-center gap-[8vw]">
            <Gauge
              score={44}
              showValue={false}
              size={340}
              srLabel="Their site: performance score in the failing red zone"
            />
            <Gauge
              score={94}
              showValue={false}
              size={340}
              srLabel="Our build: performance score in the passing green zone"
            />
          </div>
          <p className={SUB}>Run it live on any site — including this one.</p>
        </>
      )}

      {/* S5 — HANDOFF */}
      {section(
        9,
        <>
          <h2 className={PRIMARY}>Want to see yours?</h2>
          <a
            href="/audit"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center min-h-[64px] rounded-2xl px-[3.5vw] py-[2.6vh] text-[clamp(24px,2vw,42px)] font-extrabold shadow-xl transition-transform hover:scale-[1.03]"
            style={{ background: LIME, color: NAVY }}
          >
            Run your practice&rsquo;s audit
          </a>
          <p className={SUB}>30 seconds. Google&rsquo;s own measurement.</p>
        </>
      )}
    </div>
  );
}
