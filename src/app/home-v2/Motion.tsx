"use client";

import { useEffect } from "react";

/**
 * The whole motion engine. It renders nothing.
 *
 * Design rules it is built to satisfy:
 *   - No React state is touched during scrolling. Every frame writes directly
 *     to the DOM (custom properties, transforms, classList), so React never
 *     re-renders on scroll.
 *   - One passive scroll listener and one rAF per frame, shared by all
 *     scenes. Reads are batched before writes within the frame to avoid
 *     interleaving layout reads and style writes.
 *   - Enhancement is opt-in: until this module sets data-motion="on" the
 *     stylesheet shows everything in its finished, readable state. If the JS
 *     never loads, the page is complete.
 *   - It activates only at >=1024px and only without prefers-reduced-motion.
 *     The brief's floor for disabling pins is 900px; 1024 also keeps devices
 *     from overlapping prose at intermediate tablet widths.
 */
export default function Motion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const wide = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let ticking = false;
    let active = false;

    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const band = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

    /* Scene elements are looked up once per activation, not per frame. */
    let hero: HTMLElement | null = null;
    let heroPh: HTMLElement | null = null;
    let heroTab: HTMLElement | null = null;
    let scenes: HTMLElement[] = [];

    const collect = () => {
      hero = root.querySelector<HTMLElement>("[data-hero]");
      heroPh = root.querySelector<HTMLElement>("[data-hero-phone]");
      heroTab = root.querySelector<HTMLElement>("[data-hero-tablet]");
      scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
      /* Trace lengths are measured once so the draw can be expressed as a
         fraction without re-measuring every frame. */
      root.querySelectorAll<SVGPathElement>(".hv2-traces path").forEach((p) => {
        const len = p.getTotalLength();
        p.style.setProperty("--len", String(Math.ceil(len)));
      });
    };

    const frame = () => {
      ticking = false;
      if (!active) return;
      const vh = window.innerHeight;

      /* ---- reads ---- */
      const heroRect = hero?.getBoundingClientRect();
      const sceneData = scenes.map((el) => {
        const r = el.getBoundingClientRect();
        const travel = r.height - vh;
        return { el, p: travel > 0 ? clamp(-r.top / travel) : r.top < vh ? 1 : 0 };
      });

      /* ---- writes ---- */
      if (heroRect && heroRect.bottom > 0) {
        const y = -heroRect.top;
        /* Opposing drift, deliberately small but visible. */
        if (heroPh) heroPh.style.setProperty("--ph-y", `${(y * -0.08).toFixed(1)}px`);
        if (heroTab) heroTab.style.setProperty("--tab-y", `${(y * 0.05).toFixed(1)}px`);
      }

      for (const { el, p } of sceneData) {
        const kind = el.dataset.scene;

        if (kind === "visibility") {
          el.style.setProperty("--draw", band(p, 0.05, 0.55).toFixed(3));
          const lits = el.querySelectorAll<HTMLElement>(".hv2-type");
          lits.forEach((t, i) => {
            const at = 0.12 + i * 0.14;
            t.classList.toggle("is-lit", p >= at);
          });
        }

        if (kind === "performance") {
          /* The loading surface fades out as the capture is revealed. */
          el.style.setProperty("--load", (1 - band(p, 0.08, 0.42)).toFixed(3));
          el.style.setProperty("--reveal", band(p, 0.14, 0.78).toFixed(3));
          el.style.setProperty("--fil", band(p, 0.02, 0.86).toFixed(3));
          const i = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
          el.querySelectorAll<HTMLElement>(".hv2-stages span").forEach((s, k) =>
            s.classList.toggle("is-cur", k === i),
          );
        }

        if (kind === "education") {
          const i = p < 0.38 ? 0 : p < 0.72 ? 1 : 2;
          el.querySelectorAll<HTMLElement>(".hv2-frame").forEach((f, k) =>
            f.classList.toggle("is-cur", k === i),
          );
          el.querySelectorAll<HTMLElement>(".hv2-rail li").forEach((s, k) =>
            s.classList.toggle("is-cur", k === i),
          );
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(frame);
    };

    /** Remove every inline value this module wrote, so turning motion off
        leaves the stylesheet's finished state intact rather than a frozen
        mid-animation one. */
    const reset = () => {
      heroPh?.style.removeProperty("--ph-y");
      heroTab?.style.removeProperty("--tab-y");
      for (const el of scenes) {
        el.style.removeProperty("--draw");
        el.style.removeProperty("--load");
        el.style.removeProperty("--reveal");
        el.style.removeProperty("--fil");
        el.querySelectorAll<HTMLElement>(".hv2-type").forEach((t) => t.classList.remove("is-lit"));
        el.querySelectorAll<HTMLElement>(".hv2-frame").forEach((f) => f.classList.remove("is-cur"));
        el.querySelectorAll<HTMLElement>(".hv2-rail li").forEach((s) => s.classList.remove("is-cur"));
        el.querySelectorAll<HTMLElement>(".hv2-stages span").forEach((s) => s.classList.remove("is-cur"));
      }
    };

    const sync = () => {
      const want = wide.matches && !reduced.matches;
      if (want === active) return;
      active = want;
      if (active) {
        root.setAttribute("data-motion", "on");
        collect();
        onScroll();
      } else {
        root.removeAttribute("data-motion");
        reset();
      }
    };

    collect();
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    wide.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    /* ---- scene 4 controls, used below 1024px and in reduced motion ---- */
    const film = root.querySelector<HTMLElement>(".hv2-film");
    const step = (dir: number) => () => {
      if (!film) return;
      const frameEl = film.querySelector<HTMLElement>(".hv2-frame");
      const w = frameEl ? frameEl.getBoundingClientRect().width + 16 : film.clientWidth;
      film.scrollBy({ left: dir * w, behavior: reduced.matches ? "auto" : "smooth" });
    };
    const prevBtn = root.querySelector<HTMLButtonElement>("[data-film-prev]");
    const nextBtn = root.querySelector<HTMLButtonElement>("[data-film-next]");
    const onPrev = step(-1);
    const onNext = step(1);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      wide.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      root.removeAttribute("data-motion");
    };
  }, [rootId]);

  return null;
}
