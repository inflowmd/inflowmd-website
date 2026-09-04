import type { Metadata } from "next";
import PrintButton from "../[slug]/PrintButton";
import HashOpen from "../[slug]/HashOpen";
import {
  closing,
  crowns,
  directories,
  engine,
  entities,
  footer,
  gbp,
  healthgrades,
  investment,
  meta as pageMeta,
  nav,
  plan,
  practice,
  presenceSection,
  subdomain,
  summary,
  thesis,
  verdict,
  websiteFindings,
  websiteSection,
  type FindingBlock,
  type Stat,
  type TableBlock,
  type Tone,
} from "./content";

/**
 * Versailles Health and Wellness — confidential prospect audit.
 *
 * Reuses /audit/veinandmedspa's components verbatim: dark hero, PSI score
 * rings, severity-chipped cards on a coloured left rule, evidence insets,
 * alternating dark and warm-bg sections. No new tokens, no new CSS.
 *
 * Section 04 is TWO cards rather than a tier ladder — this prospect is
 * choosing between doing one practice or both, not between service levels —
 * so there are no tier names, no strikethroughs and exactly one value
 * comparison, anchored to the published ladder.
 *
 * Hidden like the rest of the series: noindex, nofollow, no sitemap entry,
 * linked from nowhere.
 */

const canonical = "https://www.inflowmd.com/audit/versailles-health-and-wellness";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  /** Absolute — the layout's "%s | InflowMD" template would put our name on
      her document and on the PDF she saves from it. */
  title: { absolute: pageMeta.title },
  description: `A review of ${practice.domain}, the entities behind it and the web presence around it, prepared ${practice.auditDate} by InflowMD.`,
  alternates: { canonical },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

const TONE_CHIP: Record<Tone, string> = {
  critical: "bg-red-500/15 text-red-300 border-red-400/40",
  warn: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  positive: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
};
const TONE_BAR: Record<Tone, string> = {
  critical: "border-l-red-500/70",
  warn: "border-l-amber-500/70",
  positive: "border-l-emerald-500/70",
};
const TONE_LABEL: Record<Tone, string> = {
  critical: "Critical",
  warn: "Attention",
  positive: "Strength",
};
const TONE_CHIP_LIGHT: Record<Tone, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  warn: "bg-amber-100 text-amber-900 border-amber-300",
  positive: "bg-emerald-100 text-emerald-900 border-emerald-300",
};
const TONE_VALUE: Record<Tone, string> = {
  critical: "text-red-400",
  warn: "text-orange-400",
  positive: "text-emerald-400",
};

/**
 * The copy arrived with **bold** and *italic* carrying real emphasis, so it
 * is rendered rather than stripped. Deliberately not a markdown parser: two
 * marks, no nesting, no links — anything more would be a licence to put
 * markup in copy that should stay plain.
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-accent font-semibold text-[11px] sm:text-xs tracking-[0.24em] uppercase">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
  light = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className={`mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] ${
          light ? "text-slate-900" : "text-white"
        }`}
      >
        {title}
        {accent && (
          <>
            {" "}
            <span className={light ? "text-accent" : "text-accent-light"}>{accent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p
          className={`text-base sm:text-lg leading-relaxed mt-5 max-w-3xl ${
            light ? "text-slate-600" : "text-gray-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** PageSpeed-Insights-style score ring — same conventions as the vein-ity report. */
function PsiGauge({ score, label, note }: { score: number; label: string; note: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);
  const color = score >= 90 ? "#0cce6b" : score >= 50 ? "#ffa400" : "#ff4e42";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} strokeWidth="7" stroke={`${color}29`} fill="none" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="7"
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="gauge-sweep"
            style={
              {
                "--gauge-circ": `${circumference}px`,
                filter: `drop-shadow(0 0 10px ${color}66)`,
              } as React.CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-extrabold tabular-nums" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-gray-300 font-semibold mt-3 text-center leading-snug">
        {label}
      </div>
      <div className="text-[11px] text-gray-500 mt-1 text-center leading-snug max-w-[16rem]">
        {note}
      </div>
    </div>
  );
}

function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
        >
          <div
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tabular-nums ${TONE_VALUE[s.tone]}`}
          >
            {s.value}
          </div>
          <div className="text-[11px] sm:text-xs text-gray-400 mt-3 leading-snug">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tables scroll inside their own container — the page body never scrolls
 * sideways, at any width.
 */
function DataTable({ table, light = false }: { table: TableBlock; light?: boolean }) {
  return (
    <div className="mt-4">
      {table.caption && (
        <div
          className={`text-[10px] font-bold tracking-[0.22em] uppercase mb-3 ${
            light ? "text-slate-500" : "text-gray-500"
          }`}
        >
          {table.caption}
        </div>
      )}
      <div
        className={`rounded-2xl border overflow-hidden ${
          light ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className={light ? "bg-slate-100 border-b border-slate-200" : "bg-white/[0.02] border-b border-white/10"}>
                {table.columns.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className={`text-left text-[10px] font-bold tracking-[0.2em] uppercase px-3 sm:px-5 py-3 ${
                      light ? "text-slate-500" : "text-gray-500"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => (
                <tr
                  key={r.cells.join("|")}
                  className={`align-top last:border-b-0 ${
                    light ? "border-b border-slate-200" : "border-b border-white/10"
                  } ${r.highlight ? (light ? "bg-accent/[0.07]" : "bg-accent/[0.12]") : ""}`}
                >
                  {r.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-3 sm:px-5 py-3.5 leading-snug ${
                        i === 0
                          ? light
                            ? "font-semibold text-slate-900"
                            : "font-semibold text-white"
                          : light
                            ? "text-slate-700"
                            : "text-gray-300"
                      }`}
                    >
                      {cell}
                      {r.highlight && i === 0 && (
                        <span className="ml-2 align-middle text-[9px] font-bold tracking-[0.18em] uppercase text-accent-light">
                          You
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Findings open by default. The vein-ity report collapses them, but this
 * document is meant to be printed and handed around, and a closed <details>
 * prints as a headline with nothing under it. Still collapsible on screen.
 */
/**
 * Every finding collapses now, criticals included.
 *
 * The chip and the one-line summary ARE the finding; the body is proof for
 * whoever wants it. Six open criticals were most of Section 01's height, and
 * the strip above the list carries the same information in four sentences.
 * Nothing is deleted — twenty-one findings checked by hand is the reason this
 * document is not a template, and every one of them is still a click away.
 *
 * PRINT. A closed <details> prints as a headline with nothing under it, so
 * globals.css forces every one of them open under @media print. If that rule
 * ever goes, the PDF quietly loses the entire report — which is now literally
 * true rather than half true.
 */
function Finding({ f, light = false }: { f: FindingBlock; light?: boolean }) {
  const Rich = light ? RichTextLight : RichText;
  return (
    <details
      id={`finding-${f.id}`}
      className={`group rounded-2xl border border-l-4 ${TONE_BAR[f.tone]} overflow-hidden ${
        light
          ? "border-slate-200 bg-white shadow-sm"
          : "border-white/10 bg-white/[0.03] backdrop-blur"
      }`}
    >
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 min-h-[64px]">
        <span
          className={`shrink-0 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${
            light ? TONE_CHIP_LIGHT[f.tone] : TONE_CHIP[f.tone]
          }`}
        >
          {TONE_LABEL[f.tone]}
        </span>
        <div className="flex-1 min-w-0">
          {f.tag && (
            <div
              className={`text-[10px] font-bold tracking-[0.22em] uppercase mb-1.5 ${
                light ? "text-accent" : "text-accent-light"
              }`}
            >
              {f.tag}
            </div>
          )}
          <h4
            className={`font-bold text-base sm:text-lg leading-snug ${
              light ? "text-slate-900" : "text-white"
            }`}
          >
            {f.title}
          </h4>
          {f.subhead && (
            <p
              className={`text-sm sm:text-base leading-snug mt-2 ${
                light ? "text-slate-600" : "text-gray-400"
              }`}
            >
              {f.subhead}
            </p>
          )}
        </div>
        <span
          aria-hidden
          className={`shrink-0 mt-1 group-open:rotate-180 transition-transform text-lg ${
            light ? "text-slate-400" : "text-gray-500"
          }`}
        >
          ▾
        </span>
      </summary>

      <div
        className={`px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t ${
          light ? "border-slate-100" : "border-white/5"
        }`}
      >
        {f.body.map((p, i) => (
          <p
            key={i}
            className={`text-sm sm:text-base leading-relaxed mt-4 ${
              light ? "text-slate-700" : "text-gray-200"
            }`}
          >
            <Rich text={p} />
          </p>
        ))}
        {f.table && <DataTable table={f.table} light={light} />}
        {f.meaning && (
          <div
            className={`mt-5 rounded-xl border p-4 sm:p-5 ${
              light ? "border-slate-200 bg-slate-50" : "border-white/10 bg-black/30"
            }`}
          >
            <div
              className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-2 ${
                light ? "text-slate-500" : "text-gray-500"
              }`}
            >
              What this means
            </div>
            <p
              className={`text-sm sm:text-base leading-relaxed ${
                light ? "text-slate-700" : "text-gray-200"
              }`}
            >
              <Rich text={f.meaning} />
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

function SubHeading({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h3
      className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-14 first:mt-0 mb-5 ${
        light ? "text-slate-900" : "text-white"
      }`}
    >
      {children}
    </h3>
  );
}


export default function VersaillesAuditPage() {
  return (
    <div className="min-h-screen bg-dark text-white audit-page">
      <HashOpen />

      {/* ============ HERO ============ */}
      <section className="relative bg-dark pt-16 sm:pt-20 md:pt-24 pb-14 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none no-print">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[520px] md:h-[520px] rounded-full bg-[#1a2a6c]/50 blur-[60px] md:blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full bg-[#2D6CDF]/20 blur-[60px] md:blur-[140px]" />
          <div className="absolute inset-0 bg-dark/40" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              ● Confidential
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs backdrop-blur">
              Prepared by InflowMD
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs backdrop-blur">
              {practice.auditDate}
            </span>
            <div className="ml-auto no-print">
              <PrintButton />
            </div>
          </div>

          <Eyebrow>{pageMeta.eyebrow}</Eyebrow>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-5xl">
            {pageMeta.h1}
          </h1>
          <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
            {pageMeta.lede}
          </p>

          <dl className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-4xl">
            {pageMeta.metaRow.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <dt className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">{m.label}</dt>
                <dd className="text-sm sm:text-base text-white font-semibold mt-2 leading-snug">{m.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-gray-500 text-xs sm:text-sm leading-relaxed max-w-3xl">{pageMeta.verifiedLine}</p>
        </div>
      </section>

      {/* ============ THE SHORT VERSION ============ */}
      <section className="bg-warm-bg py-10 sm:py-12 border-t border-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-dark-card shadow-xl p-6 sm:p-8">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">{summary.eyebrow}</div>
            <p className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold leading-[1.15] text-white max-w-4xl">
              <RichText text={summary.verdictLine} />
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
              <div>
                <div className="flex items-center gap-3">
                  {summary.scores.map((sc) => (
                    <div key={sc.label} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
                      <div className={`text-2xl sm:text-3xl font-extrabold tabular-nums leading-none ${Number(sc.value) >= 70 ? "text-orange-400" : "text-red-400"}`}>
                        {sc.value}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1.5 leading-tight">{sc.label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-gray-400 text-sm leading-snug">{summary.scoresNote}</p>
              </div>
              <ul className="space-y-2.5">
                {summary.findings.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    <span className="text-gray-200 text-sm sm:text-base leading-snug">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-white/10 pt-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/20 px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-accent-light">
                  {summary.recommendation.label}
                </span>
                <span className="text-white font-bold text-base sm:text-lg">{summary.recommendation.tier}</span>
                <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-white">{summary.recommendation.price}</span>
                <span className="text-sm text-gray-500">{summary.recommendation.per}</span>
              </div>
              <span className="text-sm text-accent-light">{summary.recommendation.note}</span>
              <a href="#verdict" className="no-print ml-auto inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-bold text-gray-200 hover:bg-white/10 transition-colors">
                {summary.readMore}
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION NAV ============ */}
      <nav aria-label="Report sections" className="sticky top-0 z-50 bg-dark/90 backdrop-blur border-y border-white/10 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ul className="flex gap-1 sm:gap-2 overflow-x-auto py-2.5">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="inline-flex items-center whitespace-nowrap rounded-full px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-300 hover:text-white hover:bg-white/[0.07] transition-colors">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main>
        {/* ============ VERDICT ============ */}
        <section id="verdict" className="bg-dark py-16 sm:py-24 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-10 md:p-12">
              <SectionHeading eyebrow="The verdict" title={verdict.title} />
              {verdict.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-5">
                  <RichText text={p} />
                </p>
              ))}
              <blockquote className="mt-8 border-l-2 border-accent/60 pl-5 sm:pl-6 max-w-3xl">
                <p className="text-white text-lg sm:text-xl md:text-2xl font-bold leading-snug">{verdict.pullquote}</p>
              </blockquote>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-8">
                <RichText text={verdict.closing} />
              </p>
              <div className="mt-10">
                <StatRow stats={verdict.stats} />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-3xl mt-8">{verdict.footnote}</p>
            </div>
          </div>
        </section>

        {/* ============ 01 — THE WEBSITE AUDIT ============ */}
        <section id="website" className="bg-warm-bg py-16 sm:py-24 scroll-mt-16 border-y border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading light eyebrow="Section 01" title={websiteSection.title} subtitle={websiteSection.sub} />

            <div className="rounded-3xl border border-white/10 bg-dark-card shadow-xl p-6 sm:p-10">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">{engine.eyebrow}</div>
              <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.08] text-white">
                {engine.headline} <span className="text-accent-light">{engine.headlineAccent}</span>
              </h3>
              <p className="mt-5 text-gray-400 text-base sm:text-lg leading-relaxed max-w-3xl">{engine.lede}</p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
                {engine.scores.map((s) => (
                  <PsiGauge key={s.label} score={s.score} label={s.label} note={s.note} />
                ))}
              </div>

              <p className="mt-10 text-gray-200 text-base sm:text-lg leading-relaxed max-w-3xl">
                <RichText text={engine.speedNote} />
              </p>
              <p className="mt-4 text-gray-400 text-base sm:text-lg leading-relaxed max-w-3xl">{engine.translation}</p>
            </div>

            <div className="mt-10 space-y-4">
              {websiteFindings.map((f) => (
                <Finding key={f.id} f={f} light />
              ))}
            </div>

            <div className="mt-10 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 sm:p-8">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-emerald-800 mb-3">{crowns.title}</div>
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl mb-6">{crowns.lead}</p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                {crowns.items.map((c) => (
                  <li key={c.title} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1.5 text-emerald-700 font-bold">✓</span>
                    <span>
                      <span className="block text-slate-900 font-bold text-sm sm:text-base leading-snug">{c.title}</span>
                      <span className="block text-slate-700 text-sm leading-relaxed mt-1">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ============ 02 — THE WEB PRESENCE SCAN ============ */}
        <section id="presence" className="bg-dark py-16 sm:py-24 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading eyebrow="Section 02" title={presenceSection.title} subtitle={presenceSection.sub} />

            <SubHeading>{entities.title}</SubHeading>
            {entities.body.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-4 first:mt-0">
                <RichText text={p} />
              </p>
            ))}
            <div className="mt-5 rounded-xl bg-black/30 border border-white/10 p-4 sm:p-5 max-w-3xl">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">What this means</div>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{entities.meaning}</p>
            </div>

            <SubHeading>{healthgrades.title}</SubHeading>
            {healthgrades.body.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-4 first:mt-0">
                <RichText text={p} />
              </p>
            ))}
            <div className="mt-5 rounded-xl bg-black/30 border border-white/10 p-4 sm:p-5 max-w-3xl">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">What this means</div>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{healthgrades.meaning}</p>
            </div>

            <SubHeading>{directories.title}</SubHeading>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl">{directories.body}</p>
            <div className="mt-8">
              <StatRow stats={directories.stats} />
            </div>
            {directories.extra.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-5">
                <RichText text={p} />
              </p>
            ))}
            <div className="mt-5 rounded-xl bg-black/30 border border-white/10 p-4 sm:p-5 max-w-3xl">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">What this means</div>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{directories.meaning}</p>
            </div>

            <SubHeading>{gbp.title}</SubHeading>
            {gbp.body.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-4 first:mt-0">
                <RichText text={p} />
              </p>
            ))}
            <h4 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-10 mb-4">{gbp.localTitle}</h4>
            {gbp.local.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-4 first:mt-0">
                <RichText text={p} />
              </p>
            ))}
            <div className="mt-5 rounded-xl bg-black/30 border border-white/10 p-4 sm:p-5 max-w-3xl">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">What this means</div>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{gbp.meaning}</p>
            </div>

            <SubHeading>{subdomain.title}</SubHeading>
            {subdomain.body.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-4 first:mt-0">
                <RichText text={p} />
              </p>
            ))}
            <div className="mt-5 rounded-xl bg-black/30 border border-white/10 p-4 sm:p-5 max-w-3xl">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">What this means</div>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{subdomain.meaning}</p>
            </div>
          </div>
        </section>

        {/* ============ 03 — THESIS AND PLAN ============ */}
        <section id="plan" className="bg-warm-bg py-16 sm:py-24 scroll-mt-16 border-y border-black/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Stated before anything else in this section, by protocol. */}
            <div className="rounded-2xl border-2 border-accent/40 bg-accent/[0.06] p-5 sm:p-7 mb-10">
              <p className="text-slate-800 text-base sm:text-lg leading-relaxed max-w-3xl">
                <RichTextLight text={thesis.protocolNote} />
              </p>
            </div>

            <SectionHeading light eyebrow="Section 03" title={thesis.title} subtitle={thesis.sub} />

            <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl">{thesis.intro}</p>
            <ul className="mt-5 space-y-3 max-w-3xl">
              {thesis.points.map((pt) => (
                <li key={pt} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-slate-700 text-sm sm:text-base leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
            {thesis.body.map((p, i) => (
              <p key={i} className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl mt-6">
                <RichTextLight text={p} />
              </p>
            ))}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl mt-6">{thesis.closing}</p>

            <div className="mt-16 border-t border-black/10 pt-14">
              <SectionHeading light eyebrow="The plan" title={plan.title} subtitle={plan.sub} />
              <div className="space-y-5">
                {plan.phases.map((phase, i) => (
                  <div key={phase.name} className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white font-extrabold text-sm tabular-nums">
                        {i + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{phase.name}</h3>
                      <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-slate-600">
                        {phase.timeframe}
                      </span>
                    </div>
                    <p className="mt-4 text-accent text-base sm:text-lg font-semibold leading-snug">{phase.outcome}</p>
                    <ol className="mt-6 space-y-4 list-none">
                      {phase.steps.map((step, n) => (
                        <li key={step} className="flex items-start gap-3 sm:gap-4">
                          <span className="mt-0.5 shrink-0 text-sm font-extrabold tabular-nums text-slate-400 w-5 text-right">{n + 1}</span>
                          <span className="text-slate-700 text-sm sm:text-base leading-relaxed">
                            <RichTextLight text={step} />
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl">
                  <RichTextLight text={plan.giveaway} />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 04 — INVESTMENT ============ */}
        <section id="investment" className="bg-dark py-16 sm:py-24 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading eyebrow="Section 04" title={investment.title} subtitle={investment.sub} />

            <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
              {investment.cards.map((card) => (
                <div
                  key={card.name}
                  className={`h-full flex flex-col rounded-3xl border p-6 sm:p-8 ${
                    card.recommended ? "border-accent/60 bg-accent/[0.09] ring-1 ring-accent/40" : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[26px]">
                    {card.recommended && (
                      <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/20 px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-accent-light">
                        Recommended
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">{card.name}</h3>

                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tabular-nums text-white leading-none">{card.price}</span>
                    <span className="text-sm text-gray-500">{card.per}</span>
                  </div>
                  <p className="mt-3 text-gray-400 text-sm sm:text-base">{card.note}</p>

                  {card.inherits && (
                    <div className="mt-6 text-[11px] font-bold tracking-[0.18em] uppercase text-accent-light">{card.inherits}</div>
                  )}
                  <ul className={`space-y-2.5 ${card.inherits ? "mt-3" : "mt-6"}`}>
                    {card.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-2.5">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                        <span className="text-gray-300 text-sm sm:text-base leading-relaxed">{inc}</span>
                      </li>
                    ))}
                  </ul>

                  {card.value && (
                    <p className="mt-6 text-accent-light text-sm sm:text-base font-semibold leading-snug">{card.value}</p>
                  )}
                  {card.footnote && <p className="mt-6 text-gray-400 text-sm sm:text-base">{card.footnote}</p>}
                  {card.limitation && (
                    <p className="mt-auto pt-6 text-gray-500 text-xs sm:text-sm leading-relaxed">{card.limitation}</p>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-8 text-gray-400 text-sm sm:text-base leading-relaxed max-w-3xl">{investment.bothNote}</p>
            <p className="mt-6 text-accent-light text-base sm:text-lg font-semibold leading-relaxed">{investment.deadline}</p>
          </div>
        </section>

        {/* ============ CLOSING ============ */}
        <section className="bg-dark pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-10 md:p-12">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-[1.08]">{closing.title}</h3>
              {closing.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mt-5">{p}</p>
              ))}
              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:text-base">
                <span className="text-white font-bold">{closing.signature.name}</span>
                <span aria-hidden className="text-gray-600">·</span>
                <a href={`mailto:${closing.signature.email}`} className="text-accent-light underline decoration-white/20 hover:decoration-accent-light">
                  {closing.signature.email}
                </a>
                <span aria-hidden className="text-gray-600">·</span>
                <a href="https://www.inflowmd.com" className="text-accent-light underline decoration-white/20 hover:decoration-accent-light">
                  {closing.signature.site}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-sm text-gray-400">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">Prepared by</div>
              <div className="text-white font-bold">Clayton Peterson</div>
              <div>Founder, InflowMD</div>
              <div className="mt-2">
                <a href="https://www.inflowmd.com" className="text-accent-light underline decoration-white/20 hover:decoration-accent-light">
                  inflowmd.com
                </a>
              </div>
              <p className="mt-4 leading-relaxed">{footer.line}</p>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">Methodology</div>
              <p className="leading-relaxed">{footer.methodology}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** RichText for the light sections — bold has to darken, not brighten. */
function RichTextLight({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
