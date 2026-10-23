import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./home-v2.css";
import PracticeRecord from "./PracticeRecord";
import { Enhancer, PerformanceScene } from "./Scenes";
import {
  closing,
  education,
  evidence,
  footer,
  hero,
  meta as pageMeta,
  nav,
  performance as perf,
  spine,
  straight,
  visibility,
} from "./content";

/**
 * InflowMD homepage V2 — an unlisted concept route for review.
 *
 * ISOLATION IS THE POINT. Everything this page needs lives in this
 * directory: its own copy, its own stylesheet (every selector under `.hv2`),
 * its own display font and its own metadata. It touches no shared component,
 * no root layout, no global stylesheet, no navigation and no config. It is
 * additive — deleting this directory removes it completely.
 *
 * NOT THE HOMEPAGE. `/` is untouched. This route is noindex/nofollow, absent
 * from the sitemap (which is a hand-maintained list, so nothing to remove)
 * and linked from nowhere.
 *
 * TYPOGRAPHY. Fraunces is declared here, so Next scopes it to this route and
 * no other page pays for it. Outfit is already the site's `--font-sans` from
 * the root layout and is inherited rather than re-declared.
 *
 * THE BODY IS CREAM SITE-WIDE. `.hv2` paints white and navy surfaces edge to
 * edge so none of that shows through, without editing globals.css.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hv2-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: pageMeta.title,
  description: pageMeta.description,
  /* Route-scoped override of the root layout's index/follow. */
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

const ROOT_ID = "hv2-root";

export default function HomeV2Page() {
  return (
    <div id={ROOT_ID} className={`hv2 ${fraunces.variable}`}>
      <Enhancer rootId={ROOT_ID} />

      {/* ---------------- navigation ---------------- */}
      {/* hv2-dark is required, not decorative: without it the ghost CTA
          inherits near-black ink on navy and is effectively invisible. */}
      <header className="hv2-nav hv2-dark">
        <div className="hv2-shell hv2-nav-inner">
          {/* The existing logo, untouched: no redraw, no recolour. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={nav.logoSrc} alt={nav.logoAlt} className="hv2-nav-logo" width={120} height={28} />
          <span className="hv2-nav-tag">{pageMeta.reviewLabel}</span>
          <div className="hv2-nav-actions">
            <a className="hv2-btn hv2-btn-ghost" href={nav.secondary.href}>
              {nav.secondary.label}
            </a>
            <a className="hv2-btn hv2-btn-primary" href={nav.primary.href}>
              {nav.primary.label}
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ---------------- hero ---------------- */}
        <section className="hv2-dark hv2-hero">
          <div className="hv2-shell hv2-hero-grid">
            <div>
              <p className="hv2-eyebrow">InflowMD</p>
              <h1 className="hv2-display hv2-h1">{hero.h1}</h1>
              <p className="hv2-lede hv2-hero-sub">{hero.supporting}</p>
              <div className="hv2-cta-row">
                <a className="hv2-btn hv2-btn-primary" href={hero.primary.href}>
                  {hero.primary.label}
                </a>
                <a className="hv2-btn hv2-btn-ghost" href={hero.secondary.href}>
                  {hero.secondary.label}
                </a>
              </div>
              <p className="hv2-audit-line">{hero.auditLine}</p>
              <p className="hv2-record-intro">{hero.recordIntro}</p>
            </div>
            {/* State A — a clear practice identity. */}
            <div data-reveal>
              <PracticeRecord />
            </div>
          </div>
        </section>

        {/* ---------------- journey spine ---------------- */}
        <section className="hv2-spine" aria-label="What this page covers">
          <div className="hv2-shell">
            <ol className="hv2-spine-list">
              {spine.map((s) => (
                <li key={s.num} className="hv2-spine-item">
                  <div className="hv2-spine-num">
                    {s.num} · {s.name}
                  </div>
                  <div className="hv2-spine-name hv2-display">{s.line}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- 01 · visibility (scene 1) ---------------- */}
        <section className="hv2-section">
          <div className="hv2-shell">
            <div className="hv2-section-head">
              <p className="hv2-eyebrow">
                {visibility.num} · {visibility.eyebrow}
              </p>
              <h2 className="hv2-display hv2-h2">{visibility.headline}</h2>
            </div>
            <div className="hv2-vis-grid">
              <div>
                <div className="hv2-prose">
                  {visibility.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <p className="hv2-pull">{visibility.pmPoint}</p>
                <p className="hv2-caption">{visibility.sceneCaption}</p>
              </div>

              {/* Scene 1. The fragments are decorative and desktop-only;
                  the record beneath them is always rendered and always
                  legible, so the scene resolves into the thing it is about
                  rather than leaving a chip cloud standing in for it. */}
              <div className="hv2-stage">
                <div className="hv2-fragments-label" aria-hidden="true">
                  {visibility.fragmentsLabel}
                </div>
                <div className="hv2-fragments" aria-hidden="true">
                  {visibility.fragments.map((f, i) => {
                    /* Numeric multiplication, capped at 24px. The first
                       deployment interpolated the sign and the magnitude as
                       strings ("-1" + "18" = "-118px"), which pushed a chip
                       past the viewport and widened the document to 1303px
                       at a 1280px viewport. */
                    const direction = i % 2 === 0 ? -1 : 1;
                    const magnitude = Math.min(24, 12 + (i % 4) * 4);
                    return (
                      <span
                        key={f}
                        className="hv2-chip"
                        style={
                          {
                            "--hv2-dx": `${direction * magnitude}px`,
                            "--hv2-delay": `${i * 55}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {f}
                      </span>
                    );
                  })}
                </div>
                <span className="hv2-converge" aria-hidden="true" />
                <PracticeRecord />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- evidence · how the audit works ---------------- */}
        <section className="hv2-dark hv2-section">
          <div className="hv2-shell">
            <div className="hv2-section-head">
              <p className="hv2-eyebrow">{evidence.eyebrow}</p>
              <h2 className="hv2-display hv2-h2">{evidence.headline}</h2>
            </div>
            <div className="hv2-ev-grid">
              {evidence.columns.map((c) => (
                <div key={c.title} className="hv2-ev-card" data-reveal>
                  <h3 className="hv2-ev-title">{c.title}</h3>
                  <p className="hv2-ev-body">{c.body}</p>
                  {c.groups?.map((g) => (
                    <div key={g.label} className="hv2-ev-group">
                      <div className="hv2-ev-group-label">{g.label}</div>
                      <ul className="hv2-ev-items">
                        {g.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <ul className="hv2-limits">
              {evidence.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <div className="hv2-cta-row">
              <a className="hv2-btn hv2-btn-primary" href={evidence.cta.href}>
                {evidence.cta.label}
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- 02 · performance (scene 2) ---------------- */}
        <section className="hv2-dark hv2-section">
          <div className="hv2-shell">
            <div className="hv2-section-head">
              <p className="hv2-eyebrow">
                {perf.num} · {perf.eyebrow}
              </p>
              <h2 className="hv2-display hv2-h2">{perf.headline}</h2>
              <div className="hv2-prose">
                {perf.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="hv2-shell">
            <PerformanceScene />
          </div>
        </section>

        {/* ---------------- 03 · education ---------------- */}
        <section className="hv2-section">
          <div className="hv2-shell">
            <div className="hv2-section-head">
              <p className="hv2-eyebrow">
                {education.num} · {education.eyebrow}
              </p>
              <h2 className="hv2-display hv2-h2">{education.headline}</h2>
            </div>
            <div className="hv2-edu-grid">
              <div>
                <div className="hv2-prose">
                  {education.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <p className="hv2-caption">{education.caution}</p>
              </div>
              {/* State C — the same record, now carrying the questions a
                  patient arrives with and the appointment cue. */}
              <div data-reveal>
                <PracticeRecord
                  questions={education.questions}
                  questionsLabel={education.questionsLabel}
                  showNextStep
                  nextStepLabel={education.affordanceLabel}
                  affordanceNote={education.affordanceNote}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- straight answers ---------------- */}
        <section className="hv2-section" style={{ paddingTop: 0 }}>
          <div className="hv2-shell">
            <div className="hv2-section-head">
              <p className="hv2-eyebrow">{straight.eyebrow}</p>
              <h2 className="hv2-display hv2-h2">{straight.headline}</h2>
            </div>
            <div className="hv2-qa">
              {straight.items.map((it) => (
                <div key={it.q} className="hv2-qa-item">
                  <h3 className="hv2-qa-q">{it.q}</h3>
                  <p className="hv2-qa-a">{it.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- closing ---------------- */}
        <section className="hv2-dark hv2-closing">
          <div className="hv2-shell">
            <h2 className="hv2-display hv2-h2">{closing.headline}</h2>
            <p className="hv2-lede" style={{ marginTop: "1.25rem" }}>
              {closing.body}
            </p>
            <div className="hv2-cta-row">
              <a className="hv2-btn hv2-btn-primary" href={closing.primary.href}>
                {closing.primary.label}
              </a>
              <a className="hv2-btn hv2-btn-ghost" href={closing.secondary.href}>
                {closing.secondary.label}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- footer ---------------- */}
      <footer className="hv2-dark hv2-footer">
        <div className="hv2-shell">
          <div className="hv2-footer-row">
            <span className="hv2-footer-brand">{footer.brand}</span>
            <a href={`mailto:${footer.email}`}>{footer.email}</a>
          </div>
          <p className="hv2-footer-note">{footer.note}</p>
        </div>
      </footer>
    </div>
  );
}
