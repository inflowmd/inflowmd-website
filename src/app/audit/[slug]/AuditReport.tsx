import type { AuditData, Finding, HeroKpi, Severity } from "../data/types";
import PrintButton from "./PrintButton";
import HashOpen from "./HashOpen";
import ConversionLoadDemo from "./ConversionLoadDemo";

const SEV_CHIP: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-300 border-red-400/40",
  high: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  medium: "bg-yellow-500/15 text-yellow-300 border-yellow-400/40",
  low: "bg-slate-500/15 text-slate-300 border-slate-400/40",
};
const SEV_CHIP_LIGHT: Record<Severity, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-amber-100 text-amber-900 border-amber-300",
  medium: "bg-yellow-100 text-yellow-900 border-yellow-300",
  low: "bg-slate-100 text-slate-700 border-slate-300",
};
const SEV_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "Major",
  medium: "Medium",
  low: "Low",
};
const SEV_BAR: Record<Severity, string> = {
  critical: "border-l-red-500/70",
  high: "border-l-amber-500/70",
  medium: "border-l-yellow-500/70",
  low: "border-l-slate-500/70",
};

function gradeAccent(grade: string): string {
  const g = grade[0]?.toUpperCase();
  if (g === "A") return "text-emerald-400";
  if (g === "B") return "text-emerald-300";
  if (g === "C") return "text-amber-300";
  if (g === "D") return "text-orange-400";
  if (g === "F") return "text-red-400";
  return "text-white";
}
function kpiTone(tone?: HeroKpi["tone"]): string {
  if (tone === "critical") return "text-red-400";
  if (tone === "warn") return "text-orange-400";
  if (tone === "muted") return "text-gray-300";
  return "text-white";
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
  subtitle,
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
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

/** PageSpeed-Insights-style score ring. PSI color conventions: 0–49 red, 50–89 orange, 90–100 green. */
function PsiGauge({ score, label }: { score: number; label: string }) {
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
          <span
            className="text-3xl sm:text-4xl font-extrabold tabular-nums"
            style={{ color }}
          >
            {score}
          </span>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-gray-300 font-semibold mt-3 text-center leading-snug">
        {label}
      </div>
    </div>
  );
}

/** Compact expandable card — one line visible, evidence inside the expander. */
function ExecFindingCard({ f }: { f: Finding }) {
  return (
    <details
      id={`finding-${f.id}`}
      className={`group rounded-2xl border border-white/10 border-l-4 ${SEV_BAR[f.severity]} bg-white/[0.03] backdrop-blur overflow-hidden`}
    >
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 min-h-[64px]">
        <span
          className={`shrink-0 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${SEV_CHIP[f.severity]}`}
        >
          {SEV_LABEL[f.severity]}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base sm:text-lg leading-snug">
            {f.title}
          </h3>
          <div className="mt-2 flex items-start gap-2">
            <span className="shrink-0 mt-0.5 text-[10px] font-bold tracking-[0.22em] uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-400/40">
              Cost
            </span>
            <p className="text-red-100/90 text-sm sm:text-base leading-snug">
              {f.consequence}
            </p>
          </div>
        </div>
        <span
          aria-hidden
          className="shrink-0 mt-1 text-gray-500 group-open:rotate-180 transition-transform text-lg"
        >
          ▾
        </span>
      </summary>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-white/5">
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed mt-4">
          {f.summary}
        </p>
        {f.detail && (
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mt-3">
            {f.detail}
          </p>
        )}
        {f.evidence && (
          <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-4">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">
              Evidence — verbatim from site
            </div>
            {f.evidence.quote && (
              <blockquote className="font-mono text-xs sm:text-sm text-white border-l-2 border-accent/60 pl-3 leading-relaxed break-words">
                “{f.evidence.quote}”
              </blockquote>
            )}
            {f.evidence.url && (
              <div className="mt-2 text-xs text-gray-500 break-all">
                <span className="text-gray-600">Source:</span>{" "}
                <a
                  href={f.evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-light underline decoration-white/20 hover:decoration-accent-light"
                >
                  {f.evidence.label ?? f.evidence.url}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

/** Expander shell used across the collapsed layer. */
function Expander({
  id,
  eyebrow,
  title,
  meta,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden"
    >
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 min-h-[64px]">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">
              {eyebrow}
            </div>
          )}
          <h3 className="text-white font-bold text-base sm:text-lg leading-snug mt-1">
            {title}
          </h3>
          {meta && <p className="text-gray-400 text-sm mt-1">{meta}</p>}
        </div>
        <span
          aria-hidden
          className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform text-lg"
        >
          ▾
        </span>
      </summary>
      <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/5">{children}</div>
    </details>
  );
}

export default function AuditReport({ data }: { data: AuditData }) {
  const execFive = data.execFive
    .map((id) => data.findings.find((f) => f.id === id))
    .filter((f): f is Finding => Boolean(f));

  return (
    <div className="min-h-screen bg-dark text-white audit-page">
      <HashOpen />

      {/* ============ HERO ============ */}
      <section className="relative bg-dark pt-20 sm:pt-24 md:pt-28 pb-14 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none no-print">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[520px] md:h-[520px] rounded-full bg-[#1a2a6c]/50 blur-[60px] md:blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full bg-[#2D6CDF]/20 blur-[60px] md:blur-[140px]" />
          <div className="absolute inset-0 bg-dark/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              ● Confidential
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs backdrop-blur">
              Prepared by InflowMD
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs backdrop-blur">
              {data.auditDate}
            </span>
            <div className="ml-auto no-print">
              <PrintButton />
            </div>
          </div>

          <Eyebrow>
            Technical Site Audit — Prepared for {data.practice.name}
          </Eyebrow>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-5xl">
            The new site looks better.{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              The foundation doesn’t hold.
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
            {data.practice.ownerName} · {data.practice.ownerTitle} ·{" "}
            {data.practice.location} · Audited {data.auditDate} by InflowMD
          </p>
          {data.heroMessagingLine && (
            <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-3xl leading-relaxed">
              {data.heroMessagingLine}
            </p>
          )}
        </div>
      </section>

      {/* ============ KPI GRID + GRADE — dark cards on a light band ============ */}
      <section className="bg-warm-bg py-14 sm:py-20 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {data.heroKpis.map((k) => (
              <div
                key={k.label}
                className="h-full rounded-2xl border border-white/10 bg-dark-card shadow-xl p-5 sm:p-6"
              >
                <div
                  className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tabular-nums ${kpiTone(k.tone)}`}
                >
                  {k.value}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider mt-3 leading-snug">
                  {k.label}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-1">{k.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-dark-card shadow-xl p-5 sm:p-6">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-4">
              Grade breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {data.categories.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-black/30 border border-white/10 px-5 sm:px-6 py-5 sm:py-6"
                >
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-gray-200 leading-tight">
                      {c.label}
                    </div>
                    {c.note && (
                      <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-snug">
                        {c.note}
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 font-extrabold text-4xl sm:text-5xl tabular-nums leading-none ${gradeAccent(c.grade)}`}
                  >
                    {c.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ============ SHOWDOWN — PSI-style side by side ============ */}
        {data.showdown && (
          <section className="bg-dark py-16 sm:py-24 border-t border-white/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              eyebrow="Section — side by side, measured"
              title={
                <>
                  Your current site vs. a modern build.{" "}
                  <span className="text-accent-light">Same test, same engine.</span>
                </>
              }
              subtitle="Google's own performance test, run on both sites. Nothing simulated — anyone can re-run it."
            />

            {/* Gauge panels */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              {/* Theirs */}
              <div className="rounded-2xl border border-red-400/40 bg-red-500/[0.05] p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-3 mb-6">
                  <div>
                    <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">
                      {data.showdown.theirName}
                    </div>
                    <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-red-300 mt-1">
                      {data.showdown.theirCaption}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/25 text-red-300 text-sm font-bold border border-red-400/40 shrink-0"
                  >
                    ✗
                  </span>
                </div>
                <div className="flex items-start justify-around gap-4">
                  {data.showdown.gauges.map((g) => (
                    <PsiGauge key={g.label} score={g.theirs} label={g.label} />
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-red-400/20 grid grid-cols-2 gap-3">
                  {data.showdown.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-red-300 font-extrabold text-xl sm:text-2xl tabular-nums leading-none">
                        {m.theirs}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1.5 leading-snug">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ours */}
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/[0.05] p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-3 mb-6">
                  <div>
                    <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">
                      {data.showdown.ourName}
                    </div>
                    <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-300 mt-1">
                      {data.showdown.ourCaption}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/25 text-emerald-300 text-sm font-bold border border-emerald-400/40 shrink-0"
                  >
                    ✓
                  </span>
                </div>
                <div className="flex items-start justify-around gap-4">
                  {data.showdown.gauges.map((g) => (
                    <PsiGauge key={g.label} score={g.ours} label={g.label} />
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-emerald-400/20 grid grid-cols-2 gap-3">
                  {data.showdown.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-emerald-300 font-extrabold text-xl sm:text-2xl tabular-nums leading-none">
                        {m.ours}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1.5 leading-snug">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Build-quality rows — ✗ vs ✓ */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[680px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 px-4 sm:px-6 py-3">
                        &nbsp;
                      </th>
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-red-300 px-4 sm:px-6 py-3">
                        {data.showdown.theirName}
                      </th>
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-300 px-4 sm:px-6 py-3">
                        {data.showdown.ourName}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.showdown.rows.map((r) => (
                      <tr key={r.label} className="border-b border-white/10 last:border-b-0 align-top">
                        <td className="px-4 sm:px-6 py-4 font-semibold text-white whitespace-nowrap">
                          {r.label}
                        </td>
                        <td className="px-4 sm:px-6 py-4 bg-red-500/[0.06]">
                          <div className="flex items-start gap-2.5">
                            <span
                              aria-label="Fails"
                              className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/25 text-red-300 text-xs font-bold border border-red-400/40"
                            >
                              ✗
                            </span>
                            <span className="text-red-200">{r.theirs}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 bg-emerald-500/[0.06]">
                          <div className="flex items-start gap-2.5">
                            <span
                              aria-label="Passes"
                              className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/40"
                            >
                              ✓
                            </span>
                            <span className="text-white font-semibold">{r.ours}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 sm:px-6 py-3 border-t border-white/10 text-[11px] italic text-gray-500">
                {data.showdown.note}
              </div>
            </div>

            {/* Live example — a real site we built */}
            {data.showdown.liveExample && (
              <div className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/[0.05] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-emerald-300 mb-1.5">
                    See it live
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg leading-snug">
                    {data.showdown.liveExample.name}
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base leading-snug mt-1">
                    {data.showdown.liveExample.blurb}
                  </p>
                </div>
                <a
                  href={data.showdown.liveExample.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-light transition-colors px-6 py-4 text-white font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(45,108,223,0.4)] whitespace-nowrap"
                >
                  See the live site in action
                  <span aria-hidden>→</span>
                </a>
              </div>
            )}

            {/* Payoff — the point of the whole comparison */}
            <div className="mt-5 rounded-2xl border-2 border-accent/50 bg-gradient-to-br from-accent/[0.16] to-transparent p-6 sm:p-8 md:p-10">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light mb-3">
                Why this matters
              </div>
              <p className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight max-w-4xl">
                {data.showdown.payoffStat}
              </p>

              <div className="mt-6 grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                {/* Left — the words */}
                <div>
                  <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                    {data.showdown.payoffLine}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
                      <span aria-hidden>↑</span> More speed
                    </div>
                    <span aria-hidden className="text-gray-600">→</span>
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
                      <span aria-hidden>↑</span> More conversions
                    </div>
                    <span aria-hidden className="text-gray-600">→</span>
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
                      <span aria-hidden>↑</span> More patients
                    </div>
                  </div>
                  <p className="mt-5 text-[11px] italic text-gray-500">
                    {data.showdown.payoffSource}
                  </p>
                </div>

                {/* Right — the picture, animated */}
                <div className="rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5">
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">
                    What a slow load costs
                  </div>
                  <ConversionLoadDemo />
                </div>
              </div>
            </div>
            </div>
          </section>
        )}

        {/* ============ TOP 5 FINDINGS ============ */}
        <section className="bg-dark py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="Findings — the top 5"
            title={
              <>
                What shipped.{" "}
                <span className="text-accent-light">Tap any card for evidence.</span>
              </>
            }
          />
          <div className="space-y-3">
            {execFive.map((f) => (
              <ExecFindingCard key={f.id} f={f} />
            ))}

            {/* Content-errors: table of quotes lives inside an expander nested near this finding */}
            <Expander
              id="content-errors-table"
              eyebrow="Top 5 verbatim content errors"
              title="See the five worst live samples"
              meta="All findings observed live · logged out · July 7, 2026"
            >
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 px-4 py-3 min-w-[280px]">
                        Verbatim quote
                      </th>
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 px-4 py-3">
                        Where
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contentErrorRows.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/10 last:border-b-0 align-top"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs sm:text-sm text-white leading-relaxed break-words">
                            “{r.quote}”
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-sm">{r.where}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Expander>
          </div>
          </div>
        </section>

        {/* ============ MARKET POSITION — light ============ */}
        <section className="bg-warm-bg py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            light
            eyebrow={data.market.eyebrow}
            title={
              <>
                Where you stand in{" "}
                <span className="text-accent">Kansas City.</span>
              </>
            }
          />
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl -mt-4 mb-4">
            {data.market.subline}
          </p>
          {data.market.contextLine && (
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-3xl mb-10">
              {data.market.contextLine}
            </p>
          )}

          {/* Fact cards — compact face (title + cost), detail collapsed */}
          <div className="space-y-3">
            {data.market.facts.map((mf, i) => (
              <details
                key={mf.id}
                id={`fact-${mf.id}`}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 min-h-[64px]">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-snug">
                      {mf.title}
                    </h3>
                    <div className="mt-2 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 text-[10px] font-bold tracking-[0.22em] uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                        Why it costs leads
                      </span>
                      <p className="text-slate-700 text-sm sm:text-base leading-snug">
                        {mf.cost}
                      </p>
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="shrink-0 mt-1 text-slate-400 group-open:rotate-180 transition-transform text-lg"
                  >
                    ▾
                  </span>
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-100">
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4">
                    {mf.fact}
                  </p>

                  {/* SERP recreation lives inside Fact 1's expander */}
                  {i === 0 && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-200 text-[10px] font-bold tracking-[0.22em] uppercase text-slate-500">
                        Evidence — SERP recreation
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                              <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-3 sm:px-4 py-2.5 w-10">
                                #
                              </th>
                              <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-3 sm:px-4 py-2.5">
                                Practice
                              </th>
                              <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-3 sm:px-4 py-2.5">
                                Rating
                              </th>
                              <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-3 sm:px-4 py-2.5">
                                Reviews
                              </th>
                              <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-3 sm:px-4 py-2.5">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.market.serp.map((e) => (
                              <tr
                                key={e.rank}
                                className={`border-b border-slate-100 last:border-b-0 align-top ${
                                  e.isSubject ? "bg-amber-100" : ""
                                }`}
                              >
                                <td className="px-3 sm:px-4 py-3">
                                  <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold tabular-nums ${
                                      e.isSubject
                                        ? "bg-amber-200 text-amber-900 border border-amber-300"
                                        : "bg-white text-slate-600 border border-slate-200"
                                    }`}
                                  >
                                    {e.rank}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-4 py-3">
                                  <div
                                    className={`font-bold text-sm sm:text-base leading-snug ${
                                      e.isSubject ? "text-amber-900" : "text-slate-900"
                                    }`}
                                  >
                                    {e.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {e.category}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-sm text-slate-700 font-semibold tabular-nums whitespace-nowrap">
                                  {e.rating}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-sm text-slate-700 tabular-nums">
                                  {e.reviews}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-sm text-slate-500">
                                  {e.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2.5 border-t border-slate-200 text-[11px] italic text-slate-500">
                        {data.market.serpCaption}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>

          {/* Through-line */}
          <div className="mt-8 rounded-2xl border-2 border-accent/40 bg-white shadow-sm p-6 sm:p-7">
            <p className="text-slate-900 text-base sm:text-lg md:text-xl leading-relaxed font-semibold max-w-4xl">
              {data.market.throughLine}
            </p>
          </div>
          </div>
        </section>

        {/* ============ GATED — ADDITIONAL FINDINGS — dark ============ */}
        <section id="complete-report" className="bg-dark py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow={`+${data.additionalCount} more findings`}
            title={
              <>
                The rest of the report.{" "}
                <span className="text-accent-light">In the walkthrough.</span>
              </>
            }
          />

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
            {/* Teaser rows: name visible, evidence is skeleton-only (no gated text in DOM) */}
            <ul className="space-y-3">
              {data.additionalTeasers.map((t) => (
                <li
                  key={t.title}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
                >
                  <span
                    className={`shrink-0 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${SEV_CHIP[t.severity]}`}
                  >
                    {SEV_LABEL[t.severity]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm sm:text-base leading-snug">
                      {t.title}
                    </div>
                    {/* Skeleton — no readable content ships to the DOM */}
                    <div
                      className="mt-3 space-y-2 select-none"
                      aria-hidden
                    >
                      <div className="h-2.5 rounded-full bg-white/10 w-11/12" />
                      <div className="h-2.5 rounded-full bg-white/10 w-9/12" />
                      <div className="h-2.5 rounded-full bg-white/10 w-7/12" />
                    </div>
                  </div>
                  <span aria-hidden className="shrink-0 text-gray-500 mt-1">
                    🔒
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-gray-200">
                <span aria-hidden>＋</span>
                {data.additionalCount} additional findings in the complete report
              </span>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-accent/50 bg-gradient-to-br from-accent/[0.14] to-transparent p-5 sm:p-6">
              <a
                href={data.cta.walkthroughUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent-light transition-colors px-6 py-4 text-white font-bold text-sm sm:text-base shadow-[0_0_24px_rgba(45,108,223,0.4)]"
              >
                Request the complete report
                <span aria-hidden>→</span>
              </a>
              <p className="mt-3 text-gray-300 text-sm sm:text-base leading-relaxed">
                Delivered in a 15-minute walkthrough with Clayton — bring your web
                vendor if you’d like.
              </p>
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
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">
                Prepared by
              </div>
              <div className="text-white font-bold">Clayton Peterson</div>
              <div>Founder, InflowMD</div>
              <div className="mt-2">
                <a
                  href="https://www.inflowmd.com"
                  className="text-accent-light underline decoration-white/20 hover:decoration-accent-light"
                >
                  inflowmd.com
                </a>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">
                Methodology
              </div>
              <p className="leading-relaxed">{data.methodologyNote}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
