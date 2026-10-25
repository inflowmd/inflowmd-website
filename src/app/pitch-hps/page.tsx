import type { Metadata } from "next";
import styles from "./deck.module.css";
import Deck from "./Deck";
import Shot from "./Shot";
import PhoneJourney from "./PhoneJourney";
import {
  auditor, comparison, concerns, footer, links, magnantHistorical,
  meta as pageMeta, pilot, pilotNote, psi, scenes, shots, stageImages, stageNote,
} from "./content";

/**
 * /pitch-hps — unlisted HPS patient-journey concept.
 *
 * ISOLATION. Everything lives in src/app/pitch-hps/ and public/pitch-hps/.
 * The existing /pitch route, the homepage, /home-v2, /pricing, every audit
 * including the Vein and Skin Studio offer, every shared component and the
 * global stylesheet are untouched. Styles are a CSS module, so they cannot
 * reach another route.
 *
 * EVERY NUMBER IS LABELLED WITH ITS SOURCE. PageSpeed scores carry tool,
 * target, date and device; the InflowMD rubric sits in its own panel and is
 * never blended with them; the historical pre-launch sample carries its own
 * date and its limits. Nothing claims a ranking, an AI citation, a
 * conversion or a platform being better than another platform.
 *
 * NOTHING AUTOPLAYS and nothing is submitted. The journey scene is labelled
 * illustrative and creates no appointment.
 */

const canonical = "https://www.inflowmd.com/pitch-hps";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: { absolute: pageMeta.title },
  description: pageMeta.description,
  alternates: { canonical },
  openGraph: {
    type: "article", locale: "en_US", siteName: "InflowMD", url: canonical,
    title: pageMeta.title, description: pageMeta.description,
  },
  twitter: { card: "summary", title: pageMeta.title, description: pageMeta.description },
  robots: {
    index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

const PHONE_SIZES = "(min-width: 900px) 300px, 78vw";

function Drawer({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className={styles.drawer}>
      <summary>
        {summary}
        <span className={styles.chev} aria-hidden="true">▾</span>
      </summary>
      <div className={styles.drawerBody}>{children}</div>
    </details>
  );
}

function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default function PitchHpsPage() {
  const s = Object.fromEntries(scenes.map((x) => [x.id, x]));
  const ids = scenes.map((x) => x.id);
  const labels = scenes.map((x) => x.label);

  return (
    <div id="hps-deck" className={styles.deck}>
      <header className={styles.bar}>
        <div className={`${styles.wrap} ${styles.barIn}`}>
          <span className={styles.brand}>InflowMD</span>
          <span className={styles.tag}>{pageMeta.reviewLabel}</span>
          <Deck ids={ids} labels={labels} />
        </div>
      </header>

      <main>
        {/* 1 — the device carries the scene, not the heading. */}
        <section id="open" className={styles.scene} aria-labelledby="open-h">
          <div className={`${styles.wrap} ${styles.hero}`}>
            <div>
              <p className={styles.kicker}>HPS · Patient journey</p>
              <h1 id="open-h" data-scene-heading className={styles.h1}>
                {s.open.title} <span className={styles.accent}>{s.open.titleAccent}</span>
              </h1>
              <p className={styles.lede}>{s.open.body}</p>
              <p className={styles.note}>{s.open.note}</p>
            </div>
            <div className={styles.heroArt} data-fade>
              <div>
                <div className={styles.device}>
                  <div className={styles.screen}>
                    <Shot {...shots.magnantHome} sizes={PHONE_SIZES} priority />
                  </div>
                </div>
                <p className={styles.deviceCap}>
                  A working pre-launch build for a real vein practice. Captured October 24, 2026.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2 — the fragments carry it, large and quiet. */}
        <section id="recognize" className={styles.scene} aria-labelledby="recognize-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.recognize.kicker}</p>
            <h2 id="recognize-h" data-scene-heading className={styles.h2}>
              {s.recognize.title} <span className={styles.accent}>{s.recognize.titleAccent}</span>
            </h2>
            <div className={styles.hero} style={{ marginTop: 30 }}>
              <div>
                <ul className={styles.thoughts}>
                  {concerns.map((c, i) => (
                    <li key={c} className={styles.thought} data-fade data-delay={String((i % 4) + 1)}>
                      “{c}”
                    </li>
                  ))}
                </ul>
                <p className={styles.lede} style={{ marginTop: 26 }}>{s.recognize.body}</p>
                <p className={styles.note}>{s.recognize.note}</p>
              </div>
              <div className={styles.heroArt} data-fade>
                <div style={{ maxWidth: 240 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.stageImg}
                    src={stageImages[1].src}
                    alt={stageImages[1].alt}
                    width={700}
                    height={1000}
                    style={{ borderRadius: 16 }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — the clinical imagery is the scene. */}
        <section id="understand" className={styles.scene} aria-labelledby="understand-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.understand.kicker}</p>
            <h2 id="understand-h" data-scene-heading className={styles.h2}>
              {s.understand.title} <span className={styles.accent}>{s.understand.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.understand.body}</p>
            <ul className={styles.stages}>
              {stageImages.map((st, i) => (
                <li key={st.src} className={styles.stage} data-fade data-delay={String((i % 4) + 1)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.stageImg} src={st.src} alt={st.alt} width={700} height={1000} loading="lazy" />
                  <div className={styles.stageCap}>
                    <p className={styles.stageName}>{st.name}</p>
                    <p className={styles.stageDesc}>{st.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.note}>{stageNote}</p>
            <p className={styles.note}>{s.understand.note}</p>
          </div>
        </section>

        {/* 4 — one device, four states, driven by hand. */}
        <section id="journey" className={styles.scene} aria-labelledby="journey-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.journey.kicker}</p>
            <h2 id="journey-h" data-scene-heading className={styles.h2}>
              {s.journey.title} <span className={styles.accent}>{s.journey.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.journey.body}</p>
            <PhoneJourney />
            <p className={styles.note}>{s.journey.note}</p>
          </div>
        </section>

        {/* 5 */}
        <section id="demo" className={styles.scene} aria-labelledby="demo-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.demo.kicker}</p>
            <h2 id="demo-h" data-scene-heading className={styles.h2}>
              {s.demo.title} <span className={styles.accent}>{s.demo.titleAccent}</span>
            </h2>
            <div className={styles.grid2}>
              <div>
                <p className={styles.lede}>{s.demo.body}</p>
                <p className={styles.note}>{s.demo.note}</p>
                <p style={{ marginTop: 18 }}>
                  <Src href={links.magnantDemo}>Open the pre-launch demo</Src>
                  {" · "}
                  <Src href={links.magnantScreening}>Open the online screening</Src>
                </p>
              </div>
              <div data-fade>
                <div className={styles.device}>
                  <div className={styles.screen}>
                    <Shot {...shots.magnantHome} sizes={PHONE_SIZES} priority />
                  </div>
                </div>
                <p className={styles.deviceCap}>
                  Pre-launch build · Vein Specialists · captured October 24, 2026
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 — the sequence comparison. Two real captures, fairly labelled. */}
        <section id="difference" className={styles.scene} aria-labelledby="difference-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.difference.kicker}</p>
            <h2 id="difference-h" data-scene-heading className={styles.h2}>
              {comparison.headline}
            </h2>
            <p className={styles.lede}>{s.difference.body}</p>
            <div className={styles.compare}>
              {([comparison.left, comparison.right] as const).map((side) => (
                <div key={side.label} className={styles.side} data-fade>
                  <span className={styles.sideLabel}>{side.label}</span>
                  <p className={styles.sideSrc}>
                    <Src href={side.href}>{side.source}</Src>
                  </p>
                  <div className={styles.device} style={{ marginTop: 16 }}>
                    <div className={styles.screen}>
                      <Shot {...shots[side.shot]} sizes={PHONE_SIZES} />
                    </div>
                  </div>
                  <p className={styles.sideCap}>{side.caption}</p>
                </div>
              ))}
            </div>
            <p className={styles.qualifier}>{comparison.qualifier}</p>
            <ol className={styles.ribbon}>
              {comparison.ribbon.map((r) => <li key={r}>{r}</li>)}
            </ol>
            <p className={styles.note}>{s.difference.note}</p>
            <Drawer summary="The five steps, and how these captures were taken">
              <ul>{comparison.steps.map((x) => <li key={x}>{x}</li>)}</ul>
              <p>{comparison.stepsNote}</p>
              <p>
                Captures: <Src href={comparison.left.href}>{comparison.left.source}</Src> at 390×900 CSS @2×, and{" "}
                <Src href={comparison.right.href}>{comparison.right.source}</Src> at 390×844 CSS @2×, both on
                October 24, 2026. Display widths are comparable at 390 CSS px; the heights differ, so these are
                not identical viewports.
              </p>
              <p>
                On centerforvein.com the cookie notice was hidden locally so their page is not shown behind a
                modal — it was never accepted and no consent was stored. Step 1 was reached by using the page’s
                own visible “Start Quiz” control. No field was filled, nothing was submitted, and no form field,
                consent control or source label was hidden.
              </p>
            </Drawer>
          </div>
        </section>

        {/* 7 — measurement */}
        <section id="measure" className={styles.scene} aria-labelledby="measure-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.measure.kicker}</p>
            <h2 id="measure-h" data-scene-heading className={styles.h2}>
              {s.measure.title} <span className={styles.accent}>{s.measure.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.measure.body}</p>
            {/* Minimum provenance sits beside the numbers, not only in the
                drawer: what was measured, with what, when, and that it is a
                single lab run. The long configuration and field data stay in
                the drawer below. */}
            <p className={styles.provenance}>
              <strong>centerforvein.com homepage</strong> · Google PageSpeed Insights / Lighthouse ·
              October 24, 2026 · single lab run per device
            </p>
            <div className={styles.gauges}>
              {psi.gauges.map((g) => {
                const r = 30, c = 2 * Math.PI * r;
                return (
                  <div key={g.device} className={styles.gauge} data-fade>
                    <div className={styles.dial}>
                      <svg className={styles.dialSvg} width="74" height="74" viewBox="0 0 74 74" aria-hidden="true">
                        <circle className={styles.dialTrack} cx="37" cy="37" r={r} fill="none" strokeWidth="7" />
                        <circle
                          className={styles.dialValAmber} cx="37" cy="37" r={r} fill="none" strokeWidth="7"
                          strokeLinecap="round" strokeDasharray={c}
                          strokeDashoffset={c * (1 - g.score / 100)}
                          transform="rotate(-90 37 37)"
                        />
                      </svg>
                      <div>
                        <div className={`${styles.dialNum} ${styles.amber}`}>{g.score}</div>
                        <div className={styles.gaugeDev}>{g.device} performance · amber</div>
                      </div>
                    </div>
                    <p className={styles.gaugeCfg}>{g.config}</p>
                    <p className={styles.gaugeMetrics}>{g.metrics}</p>
                    <p className={styles.gaugeCfg}><Src href={g.href}>Open the PageSpeed report</Src></p>
                  </div>
                );
              })}
            </div>
            <p className={styles.note}>{psi.banding}</p>
            <p className={styles.note}>{s.measure.note}</p>
            <Drawer summary="Exact measurement evidence, field data and limits">
              <p><strong>Target:</strong> <Src href={links.cvrHome}>{psi.target}</Src></p>
              <p><strong>Tool:</strong> {psi.tool}</p>
              <p><strong>When:</strong> {psi.when}</p>
              <p>{psi.others}</p>
              <p><strong>{psi.field.head}</strong></p>
              <ul><li>{psi.field.mobile}</li><li>{psi.field.desktop}</li></ul>
              <p>{psi.field.note}</p>
              <ul>{psi.limits.map((l) => <li key={l}>{l}</li>)}</ul>
              <p><strong>{magnantHistorical.head}</strong> — {magnantHistorical.target}, {magnantHistorical.tool},{" "}
                {magnantHistorical.when}. {magnantHistorical.mobile}. {magnantHistorical.desktop}.{" "}
                <Src href={magnantHistorical.href}>Report</Src>
              </p>
              <ul>{magnantHistorical.limits.map((l) => <li key={l}>{l}</li>)}</ul>
            </Drawer>
          </div>
        </section>

        {/* 8 — our rubric, in its own panel */}
        <section id="foundations" className={styles.scene} aria-labelledby="foundations-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.foundations.kicker}</p>
            <h2 id="foundations-h" data-scene-heading className={styles.h2}>
              {s.foundations.title} <span className={styles.accent}>{s.foundations.titleAccent}</span>
            </h2>
            <div className={styles.gauge} data-fade style={{ marginTop: 28 }}>
              <span className={styles.cardLabel}>{auditor.head}</span>
              <div className={styles.scoreRow} style={{ marginTop: 14 }}>
                {auditor.scores.map((x) => {
                  const r = 26, c = 2 * Math.PI * r;
                  return (
                    <span key={x.label} className={styles.dial}>
                      <svg className={styles.dialSvg} width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                        <circle className={styles.dialTrack} cx="32" cy="32" r={r} fill="none" strokeWidth="6" />
                        <circle className={styles.dialValGreen} cx="32" cy="32" r={r} fill="none" strokeWidth="6"
                          strokeLinecap="round" strokeDasharray={c}
                          strokeDashoffset={c * (1 - x.value / 100)} transform="rotate(-90 32 32)" />
                      </svg>
                      <span>
                        <span className={`${styles.dialNum} ${styles.green}`}>{x.value}</span>
                        <span className={styles.gaugeDev} style={{ display: "block" }}>{x.label}</span>
                      </span>
                    </span>
                  );
                })}
              </div>
              <p className={styles.gaugeMetrics} style={{ marginTop: 14 }}>{auditor.interpretation}</p>
            </div>
            <p className={styles.lede}>{s.foundations.body}</p>
            <p className={styles.note}>{s.foundations.note}</p>
            <Drawer summary="What this rubric does and does not measure">
              <ul>{auditor.scope.map((x) => <li key={x}>{x}</li>)}</ul>
              <p>{auditor.ours}</p>
              <p>Target: <Src href={links.cvrHome}>centerforvein.com</Src></p>
            </Drawer>
          </div>
        </section>

        {/* 9 */}
        <section id="pilot" className={styles.scene} aria-labelledby="pilot-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.pilot.kicker}</p>
            <h2 id="pilot-h" data-scene-heading className={styles.h2}>
              {s.pilot.title} <span className={styles.accent}>{s.pilot.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.pilot.body}</p>
            <ul className={`${styles.cards} ${styles.cards2}`}>
              {pilot.map((p) => (
                <li key={p.label} className={styles.card} data-fade>
                  <span className={styles.cardLabel}>{p.label}</span>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
            <p className={styles.note}>{pilotNote}</p>
            <p className={styles.note}>{s.pilot.note}</p>
          </div>
        </section>

        {/* 10 */}
        <section id="partnership" className={styles.scene} aria-labelledby="partnership-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.partnership.kicker}</p>
            <h2 id="partnership-h" data-scene-heading className={styles.h2}>
              {s.partnership.title} <span className={styles.accent}>{s.partnership.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.partnership.body}</p>
            <p style={{ marginTop: 18 }}>
              <Src href={links.magnantDemo}>Open the pre-launch demo</Src>
            </p>
            <Drawer summary="Pilot outline">
              <ul>{pilot.map((p) => <li key={p.label}><strong>{p.label}</strong> — {p.body}</li>)}</ul>
              <p>{pilotNote}</p>
            </Drawer>
            <p className={styles.note}>{s.partnership.note}</p>
          </div>
        </section>
      </main>

      <footer className={styles.foot}>
        <div className={styles.wrap}>
          <span className={styles.brand}>{footer.brand}</span>
          <p>{footer.note}</p>
        </div>
      </footer>
    </div>
  );
}
