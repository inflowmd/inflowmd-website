import { Fragment } from "react";
import type { Metadata } from "next";
import PrintButton from "../[slug]/PrintButton";
import HashOpen from "../[slug]/HashOpen";
import {
  clinicGrid,
  close,
  exhibits,
  exhibitsSection,
  footer,
  mechanism,
  meta as pageMeta,
  plan,
  practice,
  site,
  type Exhibit,
  type ListingCard,
  type Tone,
  type Visual,
} from "./content";

/**
 * Miller Vein — confidential prospect audit, rebuilt as exhibits.
 *
 * The previous version of this page was 24,000 characters of prose. The
 * reader runs eight clinics and will not read it. Every finding on it was
 * inherently visual — a record naming the wrong city, two directory listings
 * that disagree with each other, reviews stranded on an address nobody
 * occupies, three phone numbers — and had been written as paragraphs. This
 * version shows those things and puts the supporting prose behind disclosure.
 *
 * ONE RULE DRIVES THE LAYOUT: the page must be fully scannable with nothing
 * expanded. Every <details> here is closed on screen and carries no finding
 * that is not already stated in the exhibit above it. The disclosures hold
 * dates, taxonomy codes, the ingestion chain and the could-not-verify list —
 * the evidence, not the argument.
 *
 * PRINT. Paper has nobody to click, so globals.css forces every <details>
 * open for print with two rules (::details-content AND the direct-child
 * display override — Chrome needs both). That is why nothing on this page
 * builds its own collapse behaviour: a hand-rolled one would not print.
 *
 * COLOUR AND PRINT, the trap worth documenting. globals.css only forces
 * `bg-dark`, `bg-white/*` and `bg-black/*` to white on paper. A `bg-dark-card`
 * panel would keep its dark background while its text was forced to near
 * black, printing unreadable — so every dark inset here is `bg-black/*`. For
 * the same reason the bar comparison prints its numbers as text beside the
 * bars: if the browser drops the bar fills, the data still survives.
 *
 * Mock directory listings are deliberately LIGHT cards on the dark inset.
 * They are meant to read as screenshots of somebody else's website, which is
 * what they represent, and `bg-white` (no slash) is untouched by the print
 * rules, so they print as the white cards they already are.
 *
 * Hidden like the rest of the series: noindex, nofollow, no sitemap entry,
 * linked from nowhere.
 */

const canonical = "https://www.inflowmd.com/audit/millervein";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  /** Absolute — the layout's "%s | InflowMD" template would put our name on
      his document and on the PDF he saves from it. */
  title: { absolute: pageMeta.title },
  description: `A review of ${practice.domain}, the federal records behind it and the web presence around it, prepared ${practice.auditDate} by InflowMD.`,
  alternates: { canonical },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

const TONE_TEXT: Record<Tone, string> = {
  critical: "text-red-400",
  warn: "text-amber-400",
  positive: "text-emerald-400",
  neutral: "text-gray-300",
};

/** On the light mock-listing cards, where the dark-mode values are unreadable. */
const TONE_TEXT_LIGHT: Record<Tone, string> = {
  critical: "text-red-600",
  warn: "text-amber-700",
  positive: "text-emerald-700",
  neutral: "text-slate-700",
};

/**
 * The copy arrived with **bold** and *italic* and `code` carrying real
 * emphasis, so it is rendered rather than stripped. Deliberately not a
 * markdown parser: three marks, no nesting, no links — anything more would be
 * a licence to put markup in copy that should stay plain.
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
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
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="font-mono text-[0.9em] text-accent-light">
              {part.slice(1, -1)}
            </code>
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
    <p className="text-accent-light font-semibold text-[11px] sm:text-xs tracking-[0.24em] uppercase">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.08] text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg leading-relaxed mt-4 max-w-3xl text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Every collapsible on the page. Closed on screen, forced open on paper by
 * globals.css. The summary states what is inside rather than teasing it —
 * a reader who does not open it has lost evidence, never a finding.
 */
function Disclosure({
  id,
  label,
  blocks,
}: {
  id: string;
  label: string;
  blocks: string[];
}) {
  return (
    <details id={id} className="group mt-5 rounded-xl border border-white/10 bg-black/20">
      <summary className="cursor-pointer list-none px-4 sm:px-5 py-3.5 flex items-center gap-3 text-sm font-bold text-gray-300 hover:text-white transition-colors">
        <span aria-hidden className="text-accent-light group-open:rotate-180 transition-transform">
          ▾
        </span>
        {label}
      </summary>
      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/5">
        {blocks.map((b, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-300 mt-4">
            <RichText text={b} />
          </p>
        ))}
      </div>
    </details>
  );
}

/* ---------------- the four exhibit visuals ---------------- */

function ListingVisual({ cards }: { cards: ListingCard[] }) {
  return (
    <div className="space-y-3">
      {cards.map((c) => (
        <div key={c.source} className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
            {c.source}
          </div>
          <div className="mt-2 font-bold text-slate-900 text-sm sm:text-base">{c.name}</div>
          <dl className="mt-2.5 space-y-1.5">
            {c.fields.map((f) => (
              <div key={f.label} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <dt className="text-slate-500">{f.label} —</dt>
                <dd className={`font-bold ${TONE_TEXT_LIGHT[f.tone]}`}>{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 text-sm text-slate-500">{c.city}</div>
        </div>
      ))}
    </div>
  );
}

function AddressVisual({
  halves,
}: {
  halves: { figure: string; label: string; address: string; tone: Tone }[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {halves.map((h) => (
        <div
          key={h.label}
          className={`rounded-xl border p-4 ${
            h.tone === "critical"
              ? "border-red-400/40 bg-red-500/10"
              : "border-white/15 bg-white/[0.04]"
          }`}
        >
          <div className={`text-3xl font-extrabold tabular-nums leading-none ${TONE_TEXT[h.tone]}`}>
            {h.figure}
          </div>
          <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            {h.label}
          </div>
          <div className="mt-2 font-mono text-[11px] sm:text-xs leading-relaxed text-gray-200 break-words">
            {h.address}
          </div>
        </div>
      ))}
    </div>
  );
}

function TilesVisual({
  tiles,
  caption,
}: {
  tiles: { label: string; on: boolean }[];
  caption: string;
}) {
  return (
    <div>
      {/* Always five across, never wrapped. The exhibit's whole claim is
          "four of five", and a row that breaks 4+1 reads as the opposite. */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-lg border px-1 py-3 text-center ${
              t.on
                ? "border-emerald-400/50 bg-emerald-500/15"
                : "border-dashed border-red-400/40 bg-transparent"
            }`}
          >
            <div
              aria-hidden
              className={`text-base leading-none ${t.on ? "text-emerald-400" : "text-red-400/70"}`}
            >
              {t.on ? "●" : "○"}
            </div>
            <div
              className={`mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.06em] leading-tight ${
                t.on ? "text-emerald-300" : "text-gray-400"
              }`}
            >
              {t.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400 leading-relaxed">{caption}</p>
    </div>
  );
}

function PhoneVisual({ rows }: { rows: { number: string; source: string; tone: Tone }[] }) {
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div
          key={r.number}
          className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3.5 py-3 ${
            r.tone === "critical" ? "border-red-400/50 bg-red-500/[0.07]" : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
            {r.number}
          </span>
          <span aria-hidden className="text-gray-600">
            →
          </span>
          <span className="text-xs sm:text-sm text-gray-400">{r.source}</span>
        </div>
      ))}
    </div>
  );
}

function ExhibitVisual({ visual }: { visual: Visual }) {
  if (visual.kind === "listings") return <ListingVisual cards={visual.cards} />;
  if (visual.kind === "addresses") return <AddressVisual halves={visual.halves} />;
  if (visual.kind === "tiles") return <TilesVisual tiles={visual.tiles} caption={visual.caption} />;
  return <PhoneVisual rows={visual.rows} />;
}

/**
 * Two columns: the claim on the left, the evidence for it on the right.
 * Collapses to one column below 720px, where the figure reads first and the
 * visual follows it.
 */
function ExhibitCard({ e }: { e: Exhibit }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:p-7">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8 md:items-start">
        <div>
          <div
            className={`text-4xl sm:text-5xl font-extrabold leading-none tabular-nums ${TONE_TEXT[e.figureTone]}`}
          >
            {e.figure}
          </div>
          <h3 className="mt-4 text-lg sm:text-xl font-extrabold leading-snug text-white">
            {e.headline}
          </h3>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-400">{e.line}</p>
          {/* Muted, but above the visual rather than behind a disclosure: the
              reader must not reach the mock listings without it. */}
          {e.reassurance && (
            <p className="mt-4 border-l-2 border-white/15 pl-3.5 text-sm leading-relaxed text-gray-500">
              {e.reassurance}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 sm:p-5">
          <ExhibitVisual visual={e.visual} />
        </div>
      </div>
      {e.disclosure && (
        <Disclosure
          id={`exhibit-${e.id}`}
          label={e.disclosure.label}
          blocks={e.disclosure.blocks}
        />
      )}
    </article>
  );
}

/* ---------------- the site section ---------------- */

/**
 * His numbers on the left, a build of ours on the right, one row per metric.
 * The right column is attributed to a named domain on every screen: an
 * unattributed green column next to his would read as a promise about his
 * site, which is the one thing this block must never do.
 */
function SideBySide({ data }: { data: typeof site.sideBySide }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:p-8">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 sm:gap-x-6 gap-y-5 items-end">
        {/* headers */}
        <div>
          <div className="text-sm sm:text-base font-extrabold text-white leading-snug">
            {data.left.title}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-gray-500 leading-snug">
            {data.left.sub}
          </div>
        </div>
        <div aria-hidden />
        <div>
          <div className="text-sm sm:text-base font-extrabold text-emerald-400 leading-snug">
            {data.right.title}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-gray-500 leading-snug">
            {data.right.sub}
          </div>
        </div>

        {data.rows.map((r) => (
          <Fragment key={r.label}>
            <div className="col-span-3 border-t border-white/10 pt-4 -mb-1">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">
                {r.label}
              </div>
            </div>
            <div
              className={`text-4xl sm:text-5xl font-extrabold tabular-nums leading-none ${TONE_TEXT[r.mineTone]}`}
            >
              {r.mine}
            </div>
            <div aria-hidden className="text-gray-600 text-xl sm:text-2xl pb-1">
              →
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none text-emerald-400">
              {r.theirs}
            </div>
          </Fragment>
        ))}
      </div>

      <p className="mt-6 border-t border-white/10 pt-4 text-xs sm:text-sm text-emerald-400/90 leading-relaxed">
        {data.right.attribution}
      </p>
      <p className="mt-3 text-[11px] sm:text-xs text-gray-500 leading-relaxed">{data.provenance}</p>
    </div>
  );
}

/**
 * Four bullets a side, no paragraphs. The stack comparison on /why-nextjs
 * (SpeedRace, StackTower, AssemblyLanes) was considered and not reused: those
 * are scroll-triggered client animations in a "use client" narrative file,
 * none of them exported, and they carry their own CSS and inline styles that
 * would print as dark-on-dark. Lifting one would have meant refactoring
 * /why-nextjs for a page that needs a static four-line list.
 */
function StackCompare({
  stacks,
}: {
  stacks: { label: string; note: string; ours: boolean; bullets: string[] }[];
}) {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
      {stacks.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl border p-5 sm:p-6 ${
            s.ours ? "border-accent/50 bg-accent/[0.07]" : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <div
            className={`text-[10px] font-bold tracking-[0.22em] uppercase ${
              s.ours ? "text-accent-light" : "text-gray-500"
            }`}
          >
            {s.note}
          </div>
          <h4 className="mt-2 text-lg sm:text-xl font-extrabold text-white leading-snug">
            {s.label}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {s.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className={`mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full ${
                    s.ours ? "bg-accent-light" : "bg-gray-600"
                  }`}
                />
                <span className="text-sm leading-snug text-gray-300">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * The number is printed as text beside every bar on purpose: print engines
 * routinely drop background fills, and the comparison has to survive that.
 *
 * Three treatments, because the bars mean three different things: "ours" is
 * a site we built — green, thicker, and labelled with its domain so it can
 * never be mistaken for a score we are promising him — "self" is Miller Vein
 * in the accent colour, and "other" is everyone else, muted.
 */
function BarCompare({
  title,
  rows,
  note,
}: {
  title: string;
  rows: { label: string; sublabel?: string; value: number; variant: "self" | "ours" | "other" }[];
  note: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
      <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">{title}</div>
      <div className="mt-5 space-y-4">
        {rows.map((r) => {
          const ours = r.variant === "ours";
          const labelClass = ours
            ? "font-extrabold text-emerald-400"
            : r.variant === "self"
              ? "font-extrabold text-accent-light"
              : "text-gray-300";
          return (
            <div key={r.label} className={ours ? "pb-1" : undefined}>
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-sm leading-snug ${labelClass}`}>
                  {r.label}
                  {r.sublabel && (
                    <span className="ml-2 font-mono text-[11px] font-normal text-emerald-300/80 break-all">
                      {r.sublabel}
                    </span>
                  )}
                </span>
                <span
                  className={`tabular-nums ${
                    ours
                      ? "text-base font-extrabold text-emerald-400"
                      : r.variant === "self"
                        ? "text-sm font-extrabold text-accent-light"
                        : "text-sm font-bold text-gray-300"
                  }`}
                >
                  {r.value}
                </span>
              </div>
              <div
                className={`mt-2 w-full overflow-hidden rounded-full bg-white/10 ${
                  ours ? "h-4" : "h-2.5"
                }`}
              >
                <div
                  className={`h-full rounded-full ${
                    ours ? "bg-emerald-400" : r.variant === "self" ? "bg-accent" : "bg-slate-500"
                  }`}
                  style={{ width: `${r.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-gray-400">{note}</p>
    </div>
  );
}

export default function MillerVeinAuditPage() {
  return (
    <div className="min-h-screen bg-dark text-white audit-page">
      <HashOpen />

      {/* ============ 01 · HERO ============ */}
      <section className="relative bg-dark pt-16 sm:pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
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
          <h1 className="mt-5 text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.06] tracking-tight max-w-4xl">
            {pageMeta.h1Lead} <span className="text-red-400">{pageMeta.h1Accent}</span>
            {pageMeta.h1Tail}
          </h1>
          <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
            {pageMeta.sub}
          </p>

          {/* A single inline row of figures — not cards. Four facts, read in
              one pass, separated by middots that disappear at the wrap. */}
          <dl className="mt-10 flex flex-wrap items-baseline gap-x-5 gap-y-3 border-t border-white/10 pt-6 max-w-4xl">
            {pageMeta.figures.map((f, i) => (
              <div key={f.label} className="flex items-baseline gap-2">
                {i > 0 && (
                  <span aria-hidden className="hidden sm:inline text-gray-700 mr-3">
                    ·
                  </span>
                )}
                <dt className="sr-only">{f.label}</dt>
                <dd className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-white leading-none">
                    {f.value}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 leading-snug">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main>
        {/* ============ 02 · THE MECHANISM ============ */}
        <section className="bg-black/20 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Three steps, left to right, stacking under md. The arrows are
                decorative and disappear on the stacked layout. */}
            <ol className="grid gap-4 sm:gap-5 md:grid-cols-3">
              {mechanism.steps.map((s) => (
                <li
                  key={s.num}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-sm font-extrabold text-accent-light tabular-nums">
                    {s.num}
                  </div>
                  <h3 className="mt-4 text-base sm:text-lg font-extrabold text-white leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.line}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-base sm:text-lg font-bold text-accent-light leading-relaxed">
              {mechanism.payoff}
            </p>
          </div>
        </section>

        {/* ============ 03 · THE CLINIC GRID ============ */}
        <section className="bg-dark border-t border-white/10 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading eyebrow={clinicGrid.eyebrow} title={clinicGrid.title} />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {clinicGrid.clinics.map((c) => (
                <div
                  key={c.city}
                  className={`rounded-2xl p-4 sm:p-5 ${
                    c.state === "wrong"
                      ? "border-2 border-red-500/70 bg-red-500/10"
                      : "border border-dashed border-white/20 bg-transparent"
                  }`}
                >
                  <div
                    className={`font-bold text-sm sm:text-base leading-snug ${
                      c.state === "wrong" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {c.city}
                  </div>
                  <div
                    className={`mt-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                      c.state === "wrong" ? "text-red-400" : "text-gray-600"
                    }`}
                  >
                    {c.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {clinicGrid.legend.map((l) => (
                <div key={l.text} className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={`h-3 w-3 shrink-0 rounded-sm ${
                      l.state === "wrong"
                        ? "border-2 border-red-500/70 bg-red-500/20"
                        : "border border-dashed border-white/30"
                    }`}
                  />
                  <span className="text-xs text-gray-400">{l.text}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-gray-500 leading-relaxed max-w-3xl">
              {clinicGrid.footnote}
            </p>
          </div>
        </section>

        {/* ============ 04 · THE FOUR EXHIBITS ============ */}
        <section className="bg-black/20 border-t border-white/10 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading title={exhibitsSection.title} />
            <div className="space-y-5 sm:space-y-6">
              {exhibits.map((e) => (
                <ExhibitCard key={e.id} e={e} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ 05 · THE SITE ============ */}
        <section className="bg-dark border-t border-white/10 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading eyebrow={site.eyebrow} title={site.title} />
            <SideBySide data={site.sideBySide} />

            {/* Where we would take it — the reference build, measured, never
                a promised score for his site. */}
            <div className="mt-12 sm:mt-14 border-t border-white/10 pt-10 sm:pt-12">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {site.future.title}
              </h3>
              <div className="mt-6">
                <StackCompare stacks={site.future.stacks} />
              </div>
              <BarCompare
                title={site.comparison.title}
                rows={site.comparison.rows}
                note={site.comparisonNote}
              />
            </div>

            <Disclosure
              id="site-numbers"
              label={site.disclosure.label}
              blocks={site.disclosure.blocks}
            />
          </div>
        </section>

        {/* ============ 06 · THE PLAN ============ */}
        <section className="bg-black/20 border-t border-white/10 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading title={plan.title} subtitle={plan.sub} />
            <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
              {plan.phases.map((p) => (
                <div
                  key={p.num}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light">
                      Phase {p.num}
                    </span>
                    <span aria-hidden className="text-gray-700">
                      ·
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500">
                      {p.timeframe}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base sm:text-lg font-extrabold text-white leading-snug">
                    {p.name}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <span
                          aria-hidden
                          className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light"
                        />
                        <span className="text-sm leading-snug text-gray-300">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 07 · CLOSE ============ */}
        <section className="bg-dark border-t border-white/10 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-10 md:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-[1.08] max-w-3xl">
                {close.title}
              </h2>
              <p className="mt-5 text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                {close.body}
              </p>
              <a
                href={close.ctaHref}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-accent-light transition-colors"
              >
                {close.ctaLabel}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-white font-bold">{close.signature.name}</span>
            <span aria-hidden className="text-gray-600">
              ·
            </span>
            <a
              href={`mailto:${close.signature.email}`}
              className="text-accent-light underline decoration-white/20 hover:decoration-accent-light"
            >
              {close.signature.email}
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">{footer.line}</p>
          {/* The could-not-verify list is what keeps the rest of the document
              trustworthy, so it is collapsed rather than dropped. */}
          <Disclosure id="method" label={footer.methodLabel} blocks={footer.method} />
        </div>
      </footer>
    </div>
  );
}
