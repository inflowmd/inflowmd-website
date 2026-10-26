import type { Metadata } from "next";
import styles from "./deck.module.css";
import Deck from "./Deck";
import Shot from "./Shot";
import Rfa from "./Rfa";
import HeroStage from "./HeroStage";
import Scorecard from "./Scorecard";
import ScreeningDemo from "./ScreeningDemo";
import {
  captions, concerns, footer, links, meta as pageMeta, order, pilot, pilotNote,
  rfa, scenes, shots,
} from "./content";

/**
 * /pitch-hps — unlisted HPS patient-journey concept, nine scenes.
 *
 * ISOLATION. Everything lives in src/app/pitch-hps/ and public/pitch-hps/.
 * The existing /pitch route, the homepage, /home-v2, /pricing, every audit
 * including the Vein and Skin Studio offer, every shared component and the
 * global stylesheet are untouched. Styles are a CSS module, so they cannot
 * reach another route.
 *
 * WHAT IS REAL HERE. Scene 4 runs the practice site's own RFA explainer, with
 * its geometry and renderer ported rather than imitated. Scene 5 runs the
 * practice site's own symptom screener: tapping a sign draws it on the leg the
 * patient chose, the count is a count of selections, and Continue leads to a
 * real next step. Nothing is stored, sent or submitted anywhere.
 *
 * EVERY NUMBER CARRIES ITS TOOL, TARGET AND DATE. The PageSpeed rows are a
 * matched pair measured minutes apart in one session; the InflowMD rubric rows
 * are a different tool on different dates and say so on the cell. A measured
 * low score is shown as measured. Nothing claims a ranking, an AI citation, a
 * conversion, a clinical outcome, a booked appointment or that one platform is
 * better than another.
 *
 * NOTHING AUTOPLAYS. Scene motion is driven by explicit controls, pauses off
 * screen and does not resume by itself.
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
  const s = Object.fromEntries(scenes.map((x) => [x.id, x])) as Record<string, (typeof scenes)[number]>;
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
        {/* 1 — one statement, then one dominant subject: the practice site
            itself, in the device it was captured on, with its own hero
            running the way that site runs it. */}
        <section id="open" className={`${styles.scene} ${styles.sceneOpen}`} aria-labelledby="open-h">
          <div className={`${styles.wrap} ${styles.openHead}`}>
            <p className={styles.kicker} data-fade>InflowMD · HPS</p>
            <h1 id="open-h" className={styles.h1} data-fade data-delay="1">
              {s.open.title} {s.open.titleAccent}
            </h1>
            <p className={styles.openSub} data-fade data-delay="2">{s.open.body}</p>
          </div>
          <div className={`${styles.wrap} ${styles.openStage}`} data-fade data-delay="3">
            <HeroStage />
          </div>
        </section>

        {/* 2 — the fragments, entering one after another. */}
        <section id="symptom" className={styles.scene} aria-labelledby="symptom-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.symptom.kicker}</p>
            <h2 id="symptom-h" className={styles.h2}>
              {s.symptom.title} <span className={styles.accent}>{s.symptom.titleAccent}</span>
            </h2>
            <div className={styles.hero}>
              <div>
                <ul className={styles.thoughts}>
                  {concerns.map((c, i) => (
                    <li key={c} className={styles.thought} data-fade data-delay={String((i % 4) + 1)}>
                      “{c}”
                    </li>
                  ))}
                </ul>
                <p className={styles.lede}>{s.symptom.body}</p>
              </div>
              <div className={styles.legArt} data-fade data-delay="2">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/cvi/stage-2-spider.webp"
                    alt="A lower leg with fine visible surface veins."
                    width={700} height={1000} loading="lazy"
                  />
                  <p className={styles.legCap}>Fine visible veins.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — a desktop capture, in a desktop. */}
        <section id="practice" className={`${styles.scene} ${styles.scenePractice}`} aria-labelledby="practice-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.practice.kicker}</p>
            <h2 id="practice-h" className={styles.h2}>
              {s.practice.title} <span className={styles.accent}>{s.practice.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.practice.body}</p>
            {/* Its own device sizing: the opening's height-derived clamp was
                shrinking this monitor and leaving it adrift of its caption. */}
            <div className={styles.practiceUnit} data-fade>
              <div className={styles.practiceMonitor}>
                <div className={styles.monitorFrame}>
                  <div className={styles.monitorScreen}>
                    <Shot {...shots.magnantDesktop} sizes="(min-width: 1024px) 900px, 92vw" />
                  </div>
                </div>
                <div className={styles.monitorStand} />
                <div className={styles.monitorFoot} />
              </div>
              <p className={styles.deviceCap}>{captions.magnantDesktop}</p>
            </div>
            <p className={styles.srcLine}><Src href={links.magnantDemo}>Open the pre-launch build</Src></p>
          </div>
        </section>

        {/* 4 — the real explainer, on a landscape tablet. */}
        <section id="treatment" className={`${styles.scene} ${styles.sceneStage}`} aria-labelledby="treatment-h">
          {/* The heading rides inside the sticky stage, so the stage and its
              controls are one screen at scene entry. */}
          <Rfa
            head={
              <div className={styles.stageHead}>
                <p className={styles.kicker}>{s.treatment.kicker}</p>
                <h2 id="treatment-h" className={styles.h2}>
                  Show how it works<span className={styles.accentDot}>.</span>
                </h2>
              </div>
            }
          />
          <div className={`${styles.wrap} ${styles.stageFoot}`}>
            <Drawer summary="How it works, and where it comes from">
              {rfa.steps.map((x) => (
                <p key={x.title}><strong>{x.title}</strong> {x.body}</p>
              ))}
              <p>{rfa.driver}</p>
              <p>{rfa.provenance}</p>
              <p>
                Source: <Src href={links.magnantAblation}>the practice site’s endovenous-ablation page</Src>,
                components/content/VeinFixExplainer.tsx and data/explainers.ts at commit eec6a94.
              </p>
            </Drawer>
          </div>
        </section>

        {/* 5 — the practice's own screening, running natively at full size. */}
        <section id="screening" className={`${styles.scene} ${styles.sceneScreening}`} aria-labelledby="screening-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.screening.kicker}</p>
            <h2 id="screening-h" className={styles.h2}>
              {s.screening.title} <span className={styles.accent}>{s.screening.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.screening.body}</p>
            <ScreeningDemo />
            <p className={styles.srcLine}>
              <Src href={links.magnantScreening}>Open the screening on the practice site</Src>
            </p>
          </div>
        </section>

        {/* 6 — the scorecard. */}
        <section id="scorecard" className={styles.scene} aria-labelledby="scorecard-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.scorecard.kicker}</p>
            <h2 id="scorecard-h" className={styles.h2}>
              {s.scorecard.title} <span className={styles.accent}>{s.scorecard.titleAccent}</span>
            </h2>
            {/* Each metric carries a concise tool / category / date label.
                The full evidence — report links, run configuration, dates and
                limits — lives in the handback, not on the slide. */}
            <Scorecard />
          </div>
        </section>

        {/* 7 — the order, two real captures. */}
        <section id="order" className={styles.scene} aria-labelledby="order-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.order.kicker}</p>
            <h2 id="order-h" className={styles.h2}>{order.headline}</h2>
            <div className={styles.compare}>
              {([order.left, order.right] as const).map((side) => (
                <div key={side.label} className={styles.side} data-fade>
                  <span className={styles.sideLabel}>{side.label}</span>
                  <p className={styles.sideSrc}><Src href={side.href}>{side.source}</Src></p>
                  <div className={styles.orderShot}>
                    <div className={styles.orderShotScreen}>
                      <Shot {...shots[side.shot]} sizes="(min-width: 900px) 260px, 62vw" />
                    </div>
                  </div>
                  <p className={styles.sideCap}>{side.caption}</p>
                  <p className={styles.sideSrc}>
                    {side.shot === "cvrStep1" ? captions.cvrStep1 : captions.magnantScreening}
                  </p>
                </div>
              ))}
            </div>
            <p className={styles.note}>{order.note}</p>
            <Drawer summary="How these two captures were taken">
              <p>{order.method}</p>
            </Drawer>
          </div>
        </section>

        {/* 8 — the pilot. */}
        <section id="pilot" className={styles.scene} aria-labelledby="pilot-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.pilot.kicker}</p>
            <h2 id="pilot-h" className={styles.h2}>
              {s.pilot.title} <span className={styles.accent}>{s.pilot.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.pilot.body}</p>
            <ul className={`${styles.cards} ${styles.cards2}`}>
              {pilot.map((p, i) => (
                <li key={p.label} className={styles.card} data-fade data-delay={String((i % 4) + 1)}>
                  <span className={styles.cardLabel}>{p.label}</span>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
            <p className={styles.note}>{pilotNote}</p>
          </div>
        </section>

        {/* 9 — the close. */}
        <section id="build" className={`${styles.scene} ${styles.sceneClose}`} aria-labelledby="build-h">
          <div className={styles.wrap}>
            <p className={styles.kicker}>{s.build.kicker}</p>
            <h2 id="build-h" className={styles.h2}>
              {s.build.title} <span className={styles.accent}>{s.build.titleAccent}</span>
            </h2>
            <p className={styles.lede}>{s.build.body}</p>
            <p className={styles.actionRow}>
              <Src href={links.magnantDemo}>Open the pre-launch build</Src>
              <a href="#treatment">Back to the treatment animation</a>
              <a href="#screening">Back to the screening demo</a>
            </p>
            <Drawer summary="Pilot outline">
              <ul>{pilot.map((p) => <li key={p.label}><strong>{p.label}</strong> — {p.body}</li>)}</ul>
              <p>{pilotNote}</p>
            </Drawer>
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
