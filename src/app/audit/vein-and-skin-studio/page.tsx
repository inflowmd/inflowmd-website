import type { Metadata } from "next";
import Image from "next/image";
import PrintButton from "../[slug]/PrintButton";
import Rich from "./rich";
import { competitors, findings, findingsHeading, measurement, meta as pageMeta, scope, working } from "./content";
import { priorities, findingDisplay, competitorDisplay, phaseDisplay, measureLabels, monthlyPlans } from "./display";
import styles from "./report.module.css";

// Presentation only. Approved detailed findings remain unchanged in content.ts.
// Static SVG gauge and native disclosures require no new client JavaScript.
const canonical = "https://www.inflowmd.com/audit/vein-and-skin-studio";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  /** Absolute — the layout's "%s | InflowMD" template would otherwise put
      our name on the client's document and on the PDF saved from it. */
  title: { absolute: pageMeta.title },
  description: pageMeta.description,
  alternates: { canonical },
  /* openGraph and twitter are replaced wholesale by the last segment that
     defines them, never deep-merged, so every field is restated here. Left
     unset, this route would inherit the root layout's marketing claim. */
  openGraph: {
    type: "article",
    locale: "en_US",
    siteName: "InflowMD",
    url: canonical,
    title: pageMeta.title,
    description: pageMeta.description,
  },
  twitter: {
    card: "summary",
    title: pageMeta.title,
    description: pageMeta.description,
  },
  /* noindex is a crawler instruction, not access control. */
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

type IconKind = "path" | "pin" | "chart" | "calendar" | "check";
function Icon({ kind }: { kind: IconKind }) {
  const paths: Record<IconKind, React.ReactNode> = {
    path: <><path d="M4 18h7a4 4 0 0 0 0-8H9a3 3 0 0 1 0-6h11" /><path d="m16 1 4 3-4 3" /><circle cx="4" cy="18" r="2" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    chart: <><path d="M3 3v18h18M7 16v-4m5 4V8m5 8V4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6m10-6v6M3 11h18m-13 5 2 2 5-5" /></>,
    check: <><path d="m5 12 4 4L19 6" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10" /></>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
function Chevron() {
  return <svg className={styles.chevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
}
function EvidenceText({ label, text }: { label: string; text: string }) {
  return <div><p className={styles.evidenceLabel}>{label}</p><p><Rich text={text} light /></p></div>;
}

export default function VeinAndSkinStudioPage() {
  return (
    <div className={`${styles.report} audit-page`}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.topline}>
            <p className={styles.byline}>{pageMeta.preparedBy}</p>
            <div className="no-print"><PrintButton /></div>
          </div>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.identity}>
                <Image className={styles.logo} src="/audit/vein-and-skin-studio/logo.svg" alt="Vein & Skin Studio" width={128} height={128} unoptimized />
                <p className={styles.eyebrow}>Patient acquisition<br />review · October 2026</p>
              </div>
              <h1>{pageMeta.practice}</h1>
              <p className={styles.prepared}>{pageMeta.preparedFor}<span className={styles.date}>{pageMeta.researchDate}</span></p>
              <p className={styles.fairIntro}>Your site already gives patients a substantial vein-care foundation. These are the opportunities on top of it.</p>
            </div>
            <div className={styles.metricPanel}>
              <p className={styles.eyebrow}>Website performance snapshot</p>
              <div className={styles.metrics}>
                <figure className={styles.gauge} aria-label="Lighthouse performance score: 48 out of 100">
                  <div className={styles.dial}>
                    <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="#fee2e2" strokeWidth="8" /><circle cx="60" cy="60" r="52" fill="none" stroke="#dc3545" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="48 100" /></svg>
                    <div className={styles.score}><strong>48</strong><span>/100</span></div>
                  </div>
                  <figcaption>Performance</figcaption>
                </figure>
                <div className={styles.lcp}><strong>5.18 <span>s</span></strong><p><b>LCP</b><br />Largest Contentful Paint</p></div>
              </div>
              <p className={styles.labNote}>Single lab test · Device unspecified</p>
              <details className={styles.method} id="measurement-method">
                <summary className={styles.disclosure}>How this was measured<Chevron /></summary>
                <div className={styles.methodBody}>
                  <p>Google PageSpeed Insights (Lighthouse lab data), retrieved through the InflowMD auditor on <time dateTime="2026-10-23T15:22:10.432Z">2026-10-23T15:22:10.432Z</time>.</p>
                  <p>The device configuration was not recorded. No real-user field data was available. This is not a mobile score, a Google ranking score or an average patient experience. Red indicates the Lighthouse score range; the finding remains <strong>Investigate</strong>.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.section} aria-labelledby="priorities">
          <div className={styles.container}>
            <div className={styles.sectionHeader}><div><p className={styles.sectionLabel}>The focus</p><h2 id="priorities">Three priorities. A clearer path.</h2></div></div>
            <ol className={styles.priorities}>{priorities.map((p, i) => <li className={styles.priority} key={p.title}>
              <div className={styles.priorityTop}><span className={styles.priorityNumber}>0{i + 1}</span><span className={styles.priorityIcon}><Icon kind={p.icon} /></span></div>
              <h3>{p.title}</h3><p>{p.body}</p>
            </li>)}</ol>
          </div>
        </section>
        <section className={`${styles.section} ${styles.offer}`} aria-labelledby="plans">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div><p className={styles.sectionLabel}>Your personalized offer</p><h2 id="plans">We recommend Visibility.</h2></div>
              <p className={styles.sectionLead}>Start with the website platform, local visibility and a consistent review process. Add Growth for ongoing content; consider paid ads later, once measurement, capacity and budget are agreed.</p>
            </div>
            <div className={styles.offerTerms}>
              <div><strong>Month-to-month.</strong><span>No long-term commitment.</span></div>
              <div><strong>$0 setup fee</strong><span>Waived for your practice on every plan.</span></div>
            </div>
            <div className={styles.planGrid}>
              {monthlyPlans.map(plan => <article key={plan.name} className={`${styles.planCard} ${plan.recommended ? styles.recommendedPlan : ""}`} aria-label={`${plan.name} plan${plan.recommended ? ", recommended" : ""}`}>
                <p className={styles.planLabel}>{plan.recommended ? "Recommended for your practice" : "Also available"}</p>
                <h3>{plan.name}</h3>
                {/* The published rate, struck through, with a visible "Standard"
                    label beside it: the strike-through alone would carry the whole
                    meaning for anyone who cannot perceive it. */}
                {plan.originalPrice !== undefined && (
                  <p className={styles.planStandard}>
                    <span className={styles.standardLabel}>Standard</span>
                    <del>${plan.originalPrice.toLocaleString("en-US")}/month</del>
                  </p>
                )}
                <p className={styles.planPrice}><strong>${plan.price.toLocaleString("en-US")}</strong><span>/month</span></p>
                {plan.savingsMonthly !== undefined && plan.savingsAnnual !== undefined && (
                  <p className={styles.planSavings}>
                    Save ${plan.savingsMonthly.toLocaleString("en-US")}/month · ${plan.savingsAnnual.toLocaleString("en-US")}/year
                  </p>
                )}
                {plan.savingsNote && <p className={styles.planFinePrint}>{plan.savingsNote}</p>}
                <p className={styles.planTerms}>Month-to-month · $0 setup</p>
                <p className={styles.planFocus}>{plan.focus}</p>
                <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
                {plan.included && <p className={styles.planIncluded}>{plan.included}</p>}
                <p className={styles.planNote}>{plan.note}</p>
              </article>)}
            </div>
            <p className={styles.offerNote}>The vein-focused website, patient education and screening experience are included in this personalized Visibility offer; implementation details will be confirmed in the agreement. Prices shown are recurring monthly service fees. The setup fee is waived whichever plan you choose. Cancellation terms will be confirmed in your agreement. Visibility is our recommendation; no plan has been selected.</p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="opportunities">
          <div className={styles.container}>
            <div className={styles.sectionHeader}><div><p className={styles.sectionLabel}>What to improve</p><h2 id="opportunities">{findingsHeading}</h2></div><p className={styles.sectionLead}>The action is up front. Open any finding for the evidence and recommended next step.</p></div>
            <div className={styles.findings}>{findings.map(f => {
              const display = findingDisplay[f.id];
              const context = f.n === "1" ? working.items[2] : f.n === "2" ? working.items[1] : null;
              return <details key={f.id} id={`finding-${f.id}`} className={styles.finding}>
                <summary className={styles.findingSummary}>
                  <span className={styles.findingNumber} aria-hidden="true">{f.n.padStart(2, "0")}</span>
                  <div className={styles.findingText}><div className={styles.findingTitle}><h3>{display.title}</h3><span className={`${styles.chip} ${f.tone === "attention" ? styles.attention : ""}`}>{f.severity}</span></div><p>{display.summary}</p></div><Chevron />
                </summary>
                <div className={styles.findingBody}>
                  <div className={styles.evidence}><div><EvidenceText label="Observed" text={f.observed} />{f.detail && <p className={styles.detail}>{f.detail}</p>}</div><EvidenceText label="Why it matters" text={f.why} /></div>
                  <div className={styles.recommendation}><EvidenceText label="Recommended next step" text={f.recommendation} /></div>
                  {context && <p className={styles.context}><Rich text={context.body} light /></p>}
                </div>
              </details>;
            })}</div>
          </div>
        </section>
        <section className={`${styles.section} ${styles.competitorSection}`} aria-labelledby="competitors">
          <div className={styles.container}>
            <div className={styles.sectionHeader}><div><p className={styles.sectionLabel}>Nearby patient experiences</p><h2 id="competitors">Local competitor takeaways</h2></div><p className={styles.sectionLead}>Published approaches worth learning from. No measured rankings, clinical comparison or patient-volume claims.</p></div>
            <div className={styles.competitorCards}>{competitorDisplay.map((c, i) => <article key={c.name} className={styles.competitorCard}>
              <span className={styles.cardIcon}><Icon kind={c.icon} /></span><p className={styles.provider}>{c.name}<br />{c.focus}</p><h3>{c.headline}</h3><p className={styles.takeaway}>{c.takeaway}</p>
              <details className={styles.cardDetails} id={`competitor-${i + 1}`}><summary className={styles.disclosure}>Published approach & source<Chevron /></summary><div><p><Rich text={competitors.rows[i][0]} light /></p><EvidenceText label="Published approach" text={competitors.rows[i][1]} /><EvidenceText label="Opportunity for your practice" text={competitors.rows[i][2]} /></div></details>
            </article>)}</div>
            <p className={styles.comparisonNote}>{competitors.closing}</p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="sequence">
          <div className={styles.container}>
            <div className={styles.sectionHeader}><div><p className={styles.sectionLabel}>From findings to action</p><h2 id="sequence">What happens next</h2></div><p className={styles.sectionLead}>A recommended sequence, not a committed schedule.</p></div>
            <ol className={styles.timeline}>{phaseDisplay.map((phase, i) => <li key={phase.days} className={styles.phase}>
              <div className={styles.phaseDays}><span>Days</span>{phase.days}</div><div className={styles.phaseContent}><h3>{phase.title}</h3><p>{phase.summary}</p><details className={styles.phaseDetails} id={`phase-${i + 1}`}><summary className={styles.disclosure}>See the actions<Chevron /></summary><p>{measurement.phases[i].body}</p></details></div>
            </li>)}</ol>
            <div className={styles.measures}>{measurement.measures.map((m, i) => <details className={styles.measure} key={m.title} id={`measure-${i + 1}`}><summary>{measureLabels[i]}<Chevron /></summary><p>{m.body}</p></details>)}</div>
            <p className={styles.measureNote}>{measurement.closing}</p>
          </div>
        </section>
        <section className={styles.scope} aria-label="Scope and supporting detail">
          <div className={styles.container}><details id="scope"><summary className={styles.disclosure}>Scope, sources & existing foundations<Chevron /></summary><div className={styles.scopeBody}>
            {scope.paragraphs.map((p, i) => <p key={i}><Rich text={p} light /></p>)}
            <p><Rich text={working.items[0].body} light /></p><p><Rich text={working.items[3].body} light /></p>
          </div></details></div>
        </section>
      </main>
      <footer className={styles.footer}><div className={styles.container}>{pageMeta.preparedBy} for Dr. Zbigniew Moszczynski · {pageMeta.researchDate}</div></footer>
    </div>
  );
}
