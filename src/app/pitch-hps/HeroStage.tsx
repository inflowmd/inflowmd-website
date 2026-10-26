"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./deck.module.css";
import Shot from "./Shot";
import { captions, shots } from "./content";

/**
 * The opening subject: the practice site, shown in the device it was captured on.
 *
 * THE HERO PLAYS THE WAY THE PRACTICE SITE PLAYS IT. The posture below is
 * copied from the client's own component (vein-specialists @ eec6a94,
 * src/components/site/HeroVideo.tsx), verified against the running site:
 *   · No <video> in the server HTML. It mounts after load + idle, so its bytes
 *     can never compete with the page's own first paint.
 *   · Desktop only, at the same 768px gate. Phones keep the still, exactly as
 *     the real site does — so on a phone this scene shows the practice site's
 *     own mobile composition instead, which is what a phone visitor sees.
 *   · prefers-reduced-motion or Save-Data: still only, and no video bytes are
 *     requested at all.
 *   · autoplay, muted, loop, playsInline, preload="none", aria-hidden. No audio.
 * The live geometry was read from the running site: the hero band is the top
 * 851 of the 900px viewport, object-fit cover, object-position 58% 60%. The
 * video is placed on exactly that band, and the site's own chrome — navigation,
 * headline, buttons and the scrim behind them — is layered back over it from a
 * transparent-hero capture, so the frame reads as the real page with its hero
 * running rather than as a bare video.
 *
 * ADDED FOR THIS PRESENTATION, and not automatic on the client site: a visible
 * Pause/Play control, and an off-screen pause so a scene the reader has left is
 * not still running. The client site has neither.
 */

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const snap = () => window.matchMedia(QUERY).matches;
const serverSnap = () => false;

/** The hero band is 851 of the captured 900px viewport. */
const HERO_BAND = `${(851 / 900) * 100}%`;

export default function HeroStage() {
  const reduced = useSyncExternalStore(subscribe, snap, serverSnap);
  const [armedState, setArmed] = useState(false);
  /* reduced motion withdraws the video outright; no element, so no bytes */
  const armed = armedState && !reduced;
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const vid = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!wide || conn?.saveData) return;

    let cancelled = false;
    const begin = () => { if (!cancelled) setArmed(true); };
    const schedule = () => {
      const ric = (window as Window & {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void;
      }).requestIdleCallback;
      if (ric) ric(begin, { timeout: 2500 });
      else window.setTimeout(begin, 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", schedule); };
  }, [reduced]);

  /* A scene the reader has scrolled away from must not keep running. */
  useEffect(() => {
    const el = box.current;
    if (!el || !armed) return;
    const io = new IntersectionObserver((es) => {
      const v = vid.current;
      if (!v) return;
      if (es.some((e) => e.isIntersecting)) { if (!v.paused) setPlaying(true); }
      else if (!v.paused) { v.pause(); setPlaying(false); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [armed]);

  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) { void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
    else { v.pause(); setPlaying(false); }
  };

  return (
    <div className={styles.heroStage}>
      {/* Desktop: the 1440 capture, in a monitor, with the real hero on its band. */}
      <div className={styles.monitorOnly} ref={box}>
        <div className={styles.monitor}>
          <div className={styles.monitorFrame}>
            <div className={styles.monitorScreen}>
              <Shot {...shots.magnantDesktop} sizes="(min-width: 1024px) 1040px, 94vw" priority />
              {armed && (
                <>
                  <video
                    ref={vid}
                    className={styles.heroVideo}
                    style={{ height: HERO_BAND }}
                    aria-hidden="true" tabIndex={-1}
                    autoPlay muted loop playsInline preload="none"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                  >
                    <source src="/pitch-hps/magnant-hero-720.mp4" type="video/mp4" />
                  </video>
                  {/* the practice site's own navigation, headline, buttons and
                      scrim, captured with the hero media made transparent */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.heroChrome} alt="" aria-hidden="true" loading="lazy"
                    width={1440} height={900}
                    srcSet="/pitch-hps/magnant-chrome-720.webp 720w, /pitch-hps/magnant-chrome-1440.webp 1440w"
                    sizes="(min-width: 1024px) 1040px, 94vw"
                    src="/pitch-hps/magnant-chrome-1440.webp"
                  />
                </>
              )}
            </div>
          </div>
          <div className={styles.monitorStand} />
          <div className={styles.monitorFoot} />
        </div>
        {armed && (
          <div className={styles.heroCtrl}>
            <button type="button" className={styles.ghostLight} onClick={toggle}>
              {playing ? "Pause hero" : "Play hero"}
            </button>
            <span className={styles.heroNote}>
              The practice site’s own hero clip, played as that site plays it.
            </span>
          </div>
        )}
      </div>

      {/* Phone: the practice site's own mobile composition, whole and uncropped.
          The real site serves phones the still and no video, so neither does
          this. Cropping the wide capture into a portrait device would cut the
          source headline and navigation off at the edge, which is why the
          phone gets the phone capture instead. */}
      <div className={styles.phoneOnly}>
        <div className={styles.heroPhone}>
          <div className={styles.heroPhoneScreen}>
            <Shot {...shots.magnantHome} sizes="(max-width: 860px) 70vw, 300px" />
          </div>
        </div>
      </div>

      <p className={styles.deviceCap}>{captions.magnantDesktop}</p>
    </div>
  );
}
