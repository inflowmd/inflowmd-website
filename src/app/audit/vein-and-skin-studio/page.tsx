import type { Metadata } from "next";
import PrintButton from "../[slug]/PrintButton";
import Rich from "./rich";
import {
  competitors,
  findings,
  findingsHeading,
  measurement,
  meta as pageMeta,
  scope,
  summary,
  working,
  type Tone,
} from "./content";

/**
 * Vein and Skin Studio — unlisted prospect report.
 *
 * Reuses the existing audit design language (dark hero, severity-chipped
 * collapsible evidence cards, scrolling data table) with no new tokens,
 * colours or stylesheets. Everything it needs lives in this directory; no
 * shared helper, route, layout or style is modified.
 *
 * HashOpen IS DELIBERATELY NOT IMPORTED. The shared helper scrolls with
 * `behavior: "smooth"` unconditionally, which would animate under
 * prefers-reduced-motion, and fixing that would mean editing a shared file
 * this task may not touch. This page has no in-page hash navigation, so the
 * helper has nothing to do here and is simply omitted.
 *
 * NO RED ANYWHERE. Nothing in the approved copy supports a Critical
 * severity, so the palette runs amber (attention) and neutral (review)
 * only — Finding 3 in particular renders as INVESTIGATE.
 *
 * NO COMMERCIAL CONTENT. No price, tier, package, fee, term or deadline.
 *
 * NOTHING HERE CALLS THE PAGE CONFIDENTIAL. The route is unlisted and
 * noindex, which is a crawler instruction and not access control; a
 * "Confidential" badge would describe protection the page does not have,
 * and the word does not appear in the approved copy either.
 */

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

const TONE_CHIP: Record<Tone, string> = {
  attention: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  review: "bg-white/[0.06] text-gray-300 border-white/20",
};
const TONE_BAR: Record<Tone, string> = {
  attention: "border-l-amber-500/70",
  review: "border-l-white/25",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-accent-light font-semibold text-[11px] sm:text-xs tracking-[0.24em] uppercase">
      {children}
    </p>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.08] text-white"
    >
      {children}
    </h2>
  );
}

export default function VeinAndSkinStudioPage() {
  return (
    <div className="min-h-screen bg-dark text-white audit-page">
      {/* ============ HERO ============ */}
      <section className="relative bg-dark pt-16 sm:pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none no-print">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[520px] md:h-[520px] rounded-full bg-[#1a2a6c]/50 blur-[60px] md:blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full bg-[#2D6CDF]/20 blur-[60px] md:blur-[140px]" />
          <div className="absolute inset-0 bg-dark/40" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs">
              {pageMeta.preparedBy}
            </span>
            <div className="ml-auto no-print">
              <PrintButton />
            </div>
          </div>

          <Eyebrow>{pageMeta.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.06] tracking-tight">
            {pageMeta.practice}
          </h1>
          <p className="mt-5 text-gray-300 text-base sm:text-lg font-medium">
            {pageMeta.preparedFor}
          </p>
          <p className="mt-1.5 text-gray-500 text-sm">{pageMeta.researchDate}</p>
        </div>
      </section>

      <main>
        {/* ============ EXECUTIVE SUMMARY ============ */}
        <section className="bg-black/20 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading id="executive-summary">{summary.heading}</SectionHeading>
            <p className="mt-5 text-gray-200 text-base sm:text-lg leading-relaxed">
              {summary.verdict}
            </p>
            <p className="mt-6 text-gray-400 text-sm sm:text-base">{summary.lead}</p>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {summary.priorities.map((p) => (
                <li
                  key={p.n}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light">
                    Priority {p.n}
                  </div>
                  <h3 className="mt-3 text-base sm:text-lg font-extrabold text-white leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-400">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ WHAT IS ALREADY WORKING ============ */}
        <section className="bg-dark border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading id="already-working">{working.heading}</SectionHeading>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {working.items.map((w) => (
                <li
                  key={w.title}
                  className="rounded-2xl border border-l-4 border-emerald-500/70 border-y-white/10 border-r-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <h3 className="text-base font-extrabold text-white leading-snug">{w.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-300">
                    <Rich text={w.body} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ PRIORITIZED OPPORTUNITIES ============ */}
        <section className="bg-black/20 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading id="opportunities">{findingsHeading}</SectionHeading>
            <div className="mt-6 space-y-4">
              {findings.map((f) => (
                <details
                  key={f.id}
                  id={`finding-${f.id}`}
                  className={`group rounded-2xl border border-l-4 ${TONE_BAR[f.tone]} border-y-white/10 border-r-white/10 bg-white/[0.03] overflow-hidden`}
                >
                  <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 min-h-[64px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-light">
                    <span
                      className={`shrink-0 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${TONE_CHIP[f.tone]}`}
                    >
                      {f.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">
                        Opportunity {f.n}
                      </div>
                      <h3 className="mt-1.5 font-bold text-base sm:text-lg leading-snug text-white">
                        {f.title}
                      </h3>
                    </div>
                    <span
                      aria-hidden
                      className="shrink-0 mt-1 text-lg text-gray-500 group-open:rotate-180 transition-transform motion-reduce:transition-none"
                    >
                      ▾
                    </span>
                  </summary>

                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-white/5">
                    <div className="mt-4">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
                        Observed
                      </div>
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-200">
                        <Rich text={f.observed} />
                      </p>
                      {f.detail && (
                        <p className="mt-2.5 text-xs leading-relaxed text-gray-500">{f.detail}</p>
                      )}
                    </div>
                    <div className="mt-5">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
                        Why it matters
                      </div>
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-200">
                        <Rich text={f.why} />
                      </p>
                    </div>
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 sm:p-5">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
                        Recommendation
                      </div>
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-200">
                        <Rich text={f.recommendation} />
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ LOCAL COMPETITOR CONTEXT ============ */}
        <section className="bg-dark border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading id="competitors">{competitors.heading}</SectionHeading>
            <p className="mt-5 text-gray-400 text-sm sm:text-base leading-relaxed max-w-3xl">
              {competitors.lead}
            </p>
            {/* The table scrolls inside this container; the page never does. */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10">
                    {competitors.columns.map((c) => (
                      <th
                        key={c}
                        scope="col"
                        className="text-left px-4 py-3 text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-white/5 last:border-b-0 align-top">
                      {row.map((cell, i) => (
                        <td
                          key={i}
                          className={`px-4 py-4 leading-relaxed ${
                            i === 0 ? "text-white font-semibold" : "text-gray-300"
                          }`}
                        >
                          <Rich text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-5 text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {competitors.closing}
            </p>
          </div>
        </section>

        {/* ============ MEASUREMENT AND RECOMMENDED SEQUENCE ============ */}
        <section className="bg-black/20 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading id="measurement">{measurement.heading}</SectionHeading>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {measurement.phases.map((p) => (
                <div
                  key={p.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <h3 className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light">
                    {p.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{p.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-gray-400 text-sm sm:text-base">{measurement.measuresLead}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {measurement.measures.map((m) => (
                <li
                  key={m.title}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3.5"
                >
                  <span className="font-bold text-white text-sm">{m.title}</span>{" "}
                  <span className="text-sm text-gray-300 leading-relaxed">{m.body}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-gray-400 text-sm leading-relaxed max-w-3xl">
              {measurement.closing}
            </p>
          </div>
        </section>

        {/* ============ SCOPE AND SUPPORTING DETAIL ============ */}
        <section className="bg-dark border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading id="scope">{scope.heading}</SectionHeading>
            <div className="mt-5 space-y-4 max-w-3xl">
              {scope.paragraphs.map((p, i) => (
                <p key={i} className="text-sm sm:text-base leading-relaxed text-gray-400">
                  <Rich text={p} />
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm text-gray-500">
          <p>
            {pageMeta.preparedBy} for Dr. Zbigniew Moszczynski, {pageMeta.practice}.{" "}
            {pageMeta.researchDate}.
          </p>
        </div>
      </footer>
    </div>
  );
}
