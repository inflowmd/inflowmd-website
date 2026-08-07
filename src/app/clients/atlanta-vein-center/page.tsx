import type { Metadata } from "next";
import PrintButton from "./PrintButton";
import HashOpen from "./HashOpen";
import RoiCalculator from "./RoiCalculator";

const CANONICAL = "https://www.inflowmd.com/clients/atlanta-vein-center";
const TITLE = "Confidential Growth Strategy — Prepared for Atlanta Vein Center";
const DESCRIPTION =
  "Market analysis and growth plan for Atlanta Vein Center, prepared July 2026 by InflowMD.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: "InflowMD",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/* ============================================================
   Shared bits — dark + light variants of the same language
   ============================================================ */

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
    <div className="mb-8 sm:mb-10 max-w-3xl">
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
          className={`text-base sm:text-lg leading-relaxed mt-5 ${
            light ? "text-slate-600" : "text-gray-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Chip({
  tone,
  light = false,
  children,
}: {
  tone: "verified" | "estimate";
  light?: boolean;
  children: React.ReactNode;
}) {
  const cls = light
    ? tone === "verified"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : "bg-amber-100 text-amber-900 border-amber-300"
    : tone === "verified"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40"
      : "bg-amber-500/15 text-amber-300 border-amber-400/40";
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border ${cls}`}
    >
      {children}
    </span>
  );
}

function Expander({
  id,
  title,
  meta,
  light = false,
  children,
}: {
  id: string;
  title: string;
  meta?: string;
  light?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      className={`group rounded-2xl border overflow-hidden ${
        light
          ? "border-slate-200 bg-white shadow-sm"
          : "border-white/10 bg-white/[0.03] backdrop-blur"
      }`}
    >
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 min-h-[64px]">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-base sm:text-lg leading-snug ${
              light ? "text-slate-900" : "text-white"
            }`}
          >
            {title}
          </h3>
          {meta && (
            <p className={`text-sm mt-1 ${light ? "text-slate-600" : "text-gray-400"}`}>
              {meta}
            </p>
          )}
        </div>
        <span
          aria-hidden
          className={`shrink-0 group-open:rotate-180 transition-transform text-lg ${
            light ? "text-slate-400" : "text-gray-500"
          }`}
        >
          ▾
        </span>
      </summary>
      <div
        className={`px-5 sm:px-6 pb-6 pt-1 border-t ${
          light ? "border-slate-100" : "border-white/5"
        }`}
      >
        {children}
      </div>
    </details>
  );
}

/** Light-surface fact card — headline + one consequence line visible, detail collapsed. */
function FactCard({
  id,
  title,
  consequence,
  children,
}: {
  id: string;
  title: string;
  consequence: string;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      className="group rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white shadow-sm overflow-hidden"
    >
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 min-h-[64px]">
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-snug">
            {title}
          </h3>
          <div className="mt-2 flex items-start gap-2">
            <span className="shrink-0 mt-0.5 text-[10px] font-bold tracking-[0.22em] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              What it means
            </span>
            <p className="text-slate-700 text-sm sm:text-base leading-snug">{consequence}</p>
          </div>
        </div>
        <span
          aria-hidden
          className="shrink-0 mt-1 text-slate-400 group-open:rotate-180 transition-transform text-lg"
        >
          ▾
        </span>
      </summary>
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-100">{children}</div>
    </details>
  );
}

/* ============================================================
   Page data
   ============================================================ */

const KPIS: {
  value: string;
  label: string;
  note: string;
  tone: "critical" | "warn" | "good";
  small?: boolean;
}[] = [
  {
    value: "5",
    label: "Vein clinics advertising nearby",
    note: "National chains + established locals in your corridor",
    tone: "warn",
  },
  {
    value: "June 8, 2026",
    label: "A chain opened down the street",
    note: "United Vein & Vascular, 3333 Old Milton Pkwy",
    tone: "warn",
    small: true,
  },
  {
    value: "1",
    label: "Google review for Atlanta Vein Center",
    note: "Competitors have dozens",
    tone: "critical",
  },
  {
    value: "~$2,500+",
    label: "Value of one treated vein patient",
    note: "Medicare-based, full treatment course",
    tone: "good",
  },
  {
    value: "<1",
    label: "Patients per month to break even",
    note: "At the recommended investment level",
    tone: "good",
  },
  {
    value: "~2",
    label: "Patients per month the model projects",
    note: "Realistic scenario, after the first 90 days",
    tone: "good",
  },
];

function kpiTone(t: "critical" | "warn" | "good") {
  if (t === "critical") return "text-red-400";
  if (t === "warn") return "text-orange-400";
  return "text-emerald-400";
}

// Break-even: total = ad spend + $500 management + $500 existing plan.
// Patients to break even = total / $2,500 (conservative low-end patient value).
const BREAK_EVEN = [
  { ads: "$500", total: "$1,500", patients: "0.6", recommended: false },
  { ads: "$1,000", total: "$2,000", patients: "0.8", recommended: true },
  { ads: "$1,500", total: "$2,500", patients: "1.0", recommended: false },
];

const CPT_ROWS = [
  { proc: "Radiofrequency ablation — first vein", code: "36475", rate: "~$1,057" },
  { proc: "Radiofrequency ablation — each additional vein", code: "36476", rate: "~$279" },
  { proc: "Laser ablation — first vein", code: "36478", rate: "~$981" },
  { proc: "VenaSeal closure — first vein", code: "36482", rate: "~$1,659" },
];

const MODEL_ROWS = [
  { label: "Cost for each click", c: "$15", r: "$10", s: "$7" },
  { label: "Clicks that become inquiries", c: "4%", r: "6%", s: "8%" },
  { label: "Inquiries that book a consultation", c: "50%", r: "60%", s: "65%" },
  { label: "Consultations that become treated patients", c: "40%", r: "50%", s: "60%" },
  { label: "Treated patients per month at $1,000 in ads", c: "~0.5", r: "~1.8", s: "~4.4" },
];

/* ============================================================
   Page — backgrounds alternate: dark/dark/LIGHT/dark/LIGHT/dark/LIGHT/dark/LIGHT/dark
   ============================================================ */

export default function AtlantaVeinCenterPage() {
  return (
    <div className="min-h-screen bg-dark text-white audit-page">
      <HashOpen />

      {/* ============ 1. HERO — dark ============ */}
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
              July 2026
            </span>
            <div className="ml-auto no-print">
              <PrintButton />
            </div>
          </div>

          <Eyebrow>Growth Strategy — Prepared for Atlanta Vein Center</Eyebrow>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-5xl">
            Four national chains are advertising in Alpharetta.{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              You aren&rsquo;t.
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
            Dr. Michael Williams · Alpharetta, Georgia · Prepared July 2026 by InflowMD
          </p>
          <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            This is what it costs to be visible in your market — and what it returns.
          </p>
        </div>
      </section>

      {/* ============ 2. KPI GRID — dark ============ */}
      <section className="bg-dark py-14 sm:py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {KPIS.map((k) => (
              <div
                key={k.label}
                className="h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 sm:p-6"
              >
                <div
                  className={`font-extrabold leading-none tabular-nums ${kpiTone(k.tone)} ${
                    k.small
                      ? "text-xl sm:text-2xl md:text-3xl"
                      : "text-3xl sm:text-4xl md:text-5xl"
                  }`}
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
        </div>
      </section>

      <main>
        {/* ============ 3. MARKET — LIGHT ============ */}
        <section className="bg-warm-bg py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              light
              eyebrow="Section — your market"
              title={
                <>
                  What&rsquo;s actually happening{" "}
                  <span className="text-accent">in your market.</span>
                </>
              }
              subtitle="Three facts — tap any card for the evidence."
            />

            <div className="space-y-3">
              <FactCard
                id="fact-chains"
                title="Your corridor is filling up with national chains."
                consequence="These are companies with national television budgets competing for the same patients — within a few minutes’ drive of your office."
              >
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4">
                  Center for Vein Restoration, USA Vein Clinics, United Vein &amp; Vascular,
                  and Vein Clinics of America all operate clinics on or near Old Milton
                  Parkway. United Vein &amp; Vascular opened theirs on June 8, 2026.
                </p>
                <div className="mt-4 space-y-3 text-sm sm:text-base">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3">
                      National chains
                    </div>
                    <ul className="space-y-2 text-slate-700 leading-relaxed">
                      <li>
                        <strong className="text-slate-900">Center for Vein Restoration</strong>{" "}
                        — 8 Georgia clinics including Alpharetta (Old Milton Pkwy), Sandy
                        Springs, and Canton. Runs a dedicated advertising landing page;
                        advertises on national television.
                      </li>
                      <li>
                        <strong className="text-slate-900">USA Vein Clinics</strong> — 160+
                        locations nationally; Alpharetta (Old Milton Pkwy), Brookhaven, and
                        Midtown. Advertises on national television.
                      </li>
                      <li>
                        <strong className="text-slate-900">
                          United Vein &amp; Vascular Centers
                        </strong>{" "}
                        — opened at 3333 Old Milton Pkwy, Suite 340 on June 8, 2026; roughly
                        8 metro Atlanta locations. Advertises on national television.
                      </li>
                      <li>
                        <strong className="text-slate-900">Vein Clinics of America</strong> —
                        Alpharetta (2775 Old Milton Pkwy, Ste 200), Brookhaven, and Atlantic
                        Station.
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3">
                      Established locals &amp; hospital programs
                    </div>
                    <ul className="space-y-2 text-slate-700 leading-relaxed">
                      <li>
                        <strong className="text-slate-900">North Atlanta Vascular Clinic</strong>{" "}
                        — established 2006; Alpharetta, Johns Creek, Cumming, Lawrenceville.
                      </li>
                      <li>
                        <strong className="text-slate-900">VeinInnovations</strong> —
                        independent local, Johns Creek / Suwanee.
                      </li>
                      <li>
                        <strong className="text-slate-900">
                          North Georgia Vein &amp; Aesthetics
                        </strong>{" "}
                        — Dr. Peter Wrobel, Alpharetta / Forsyth.
                      </li>
                      <li>
                        <strong className="text-slate-900">Emory Vein Center</strong> and{" "}
                        <strong className="text-slate-900">Northside Vascular Surgery</strong>{" "}
                        — hospital-system vein and vascular programs across metro Atlanta.
                      </li>
                    </ul>
                  </div>
                </div>
              </FactCard>

              <FactCard
                id="fact-reviews"
                title="You have one review. They have dozens."
                consequence="When a patient compares you side by side with a clinic showing 4.9 stars and sixteen reviews, the choice is made before they ever see your website."
              >
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4">
                  Atlanta Vein Center has a single Google review as of July 2026.
                  VeinInnovations, a nearby independent practice, holds a verified 4.9★
                  across 16 reviews.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3">
                  Reviews do two jobs. Patients use them to choose — and Google uses them to
                  price your advertising. Google rates every ad on how relevant and
                  trustworthy it looks (Google calls this a &ldquo;Quality Score&rdquo; — its
                  1-to-10 rating of an ad and the listing behind it). A practice with a
                  single review generally pays more for the same visibility than the clinic
                  next door. Building reviews makes advertising cheaper as well as more
                  effective.
                </p>
              </FactCard>

              <FactCard
                id="fact-organic"
                title="Patients searching for a vein doctor in Alpharetta can’t find you."
                consequence="Page one belongs to the chains and the hospital systems — a new practice doesn’t rank there on its own for months or years."
              >
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4">
                  The free (unpaid) results for vein searches in this market are held by the
                  chains&rsquo; location pages, medical directories, and the hospital systems
                  — Emory and Northside. A newly launched practice site with a small number
                  of pages and a single review cannot displace them in the near term.
                  That&rsquo;s not a criticism of your site; it&rsquo;s how Google treats new
                  websites.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3">
                  This is why paid placement is the only near-term path to page-one
                  visibility — it&rsquo;s the one spot on the page a new practice can occupy
                  immediately, while the long-term foundation builds underneath.
                </p>
              </FactCard>
            </div>
          </div>
        </section>

        {/* ============ 4. PATIENT VALUE — dark ============ */}
        <section className="bg-dark py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              eyebrow="Section — patient value"
              title={
                <>
                  What one patient{" "}
                  <span className="text-accent-light">is worth.</span>
                </>
              }
            />

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Chip tone="verified">Verified</Chip>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-emerald-400 leading-none tabular-nums">
                  ~$1,057
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-4">
                  Medicare&rsquo;s 2026 national rate for a single vein ablation — one
                  procedure, one vein, in the office.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Chip tone="estimate">Estimate</Chip>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-emerald-400 leading-none tabular-nums">
                  $2,000–$6,000+
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-4">
                  A full treatment course — both legs, multiple veins, ultrasound,
                  follow-up. Commercial insurers often pay more than Medicare.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/[0.12] to-transparent p-5 sm:p-6">
              <p className="text-white text-base sm:text-lg leading-relaxed font-semibold">
                These are Medicare&rsquo;s published rates, not our estimates — your billing
                team can confirm them in a minute.
              </p>
            </div>

            <div className="mt-5">
              <Expander
                id="cpt-detail"
                title="The procedure-by-procedure rates"
                meta="Medicare 2026 national rates, office setting — plus the cosmetic cash-pay range"
              >
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 px-4 py-3">
                          Procedure
                        </th>
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 px-4 py-3">
                          Billing code
                        </th>
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 px-4 py-3">
                          Medicare 2026 rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {CPT_ROWS.map((r) => (
                        <tr key={r.code} className="border-b border-white/10 last:border-b-0">
                          <td className="px-4 py-3.5 text-white font-semibold">{r.proc}</td>
                          <td className="px-4 py-3.5 text-gray-400 tabular-nums">{r.code}</td>
                          <td className="px-4 py-3.5 text-emerald-300 font-bold tabular-nums">
                            {r.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 italic mt-3">
                  Source: Medtronic CY2026 Medicare national unadjusted rates, office
                  (non-facility) setting.
                </p>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300 leading-relaxed space-y-2">
                  <p>
                    <strong className="text-white">Cosmetic sclerotherapy (cash-pay):</strong>{" "}
                    ~$350–$500 per session <Chip tone="verified">Verified</Chip> — ASPS
                    average $500; CareCredit average $497, range $250–$825. A typical course
                    runs 1–4+ sessions.
                  </p>
                  <p>
                    <strong className="text-white">One caveat:</strong> medical vein care is
                    insurance-reimbursed only when documented medical-necessity criteria are
                    met (CMS coverage policy L34536).
                  </p>
                </div>
              </Expander>
            </div>
          </div>
        </section>

        {/* ============ 5. THE MATH — LIGHT ============ */}
        <section className="bg-warm-bg py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              light
              eyebrow="Section — the math"
              title={
                <>
                  The math, <span className="text-accent">up front.</span>
                </>
              }
            />

            <div className="rounded-2xl border-2 border-accent/40 bg-white shadow-sm p-6 sm:p-8 mb-6">
              <p className="text-slate-900 text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight max-w-4xl">
                At the recommended investment, this pays for itself with{" "}
                <span className="text-accent">
                  less than one treated patient per month.
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-4 sm:px-6 py-3">
                        Monthly ad budget
                      </th>
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-4 sm:px-6 py-3">
                        Total monthly cost
                      </th>
                      <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-4 sm:px-6 py-3">
                        Patients needed to break even
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {BREAK_EVEN.map((r) => (
                      <tr
                        key={r.ads}
                        className={`border-b border-slate-100 last:border-b-0 ${
                          r.recommended ? "bg-accent/[0.06]" : ""
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 tabular-nums">
                          {r.ads}
                          {r.recommended && (
                            <span className="ml-2 text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
                              Recommended
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-slate-700 tabular-nums">
                          {r.total}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-emerald-700 font-bold tabular-nums">
                          {r.patients}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 sm:px-6 py-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                Total monthly cost = ad budget + $500 campaign management + your existing
                $500 plan. Break-even assumes one treated patient is worth $2,500 — a
                deliberately conservative value from the low end of the estimated
                $2,000–$6,000 treatment-course range above.
              </div>
            </div>

            {/* ROI calculator */}
            <div className="mt-10">
              <div className="mb-6 max-w-3xl">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  What your investment <span className="text-accent">returns.</span>
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3">
                  Move the slider — every assumption is set to the conservative end of the
                  research.
                </p>
              </div>
              <RoiCalculator />
            </div>

            <div className="mt-5">
              <Expander
                light
                id="full-model"
                title="How we get there — the full model"
                meta="Every assumption shown, with its source, labeled verified or estimate"
              >
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4">
                  The chain is simple: a person searches for vein care → clicks your ad (you
                  pay for each click) → some of those visitors call or fill out a form (an
                  &ldquo;inquiry&rdquo;) → some inquiries book a consultation → some
                  consultations become treated patients.
                </p>

                <div className="overflow-x-auto mt-5">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-4 py-3">
                          What we assume
                        </th>
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-4 py-3">
                          Conservative
                        </th>
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-accent px-4 py-3">
                          Realistic
                        </th>
                        <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-4 py-3">
                          Strong
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODEL_ROWS.map((r, i) => (
                        <tr
                          key={r.label}
                          className={`border-b border-slate-100 last:border-b-0 ${
                            i === MODEL_ROWS.length - 1 ? "bg-slate-50 font-bold" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5 text-slate-900">{r.label}</td>
                          <td className="px-4 py-3.5 text-slate-700 tabular-nums">{r.c}</td>
                          <td className="px-4 py-3.5 text-accent tabular-nums">{r.r}</td>
                          <td className="px-4 py-3.5 text-slate-700 tabular-nums">{r.s}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mt-4">
                  Scaling in the realistic scenario: $500/month in ads → ~0.9 treated
                  patients per month · $1,000 → ~1.8 · $1,500 → ~2.7.
                </p>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed space-y-3">
                  <p>
                    <strong className="text-slate-900">Where the click costs come from</strong>{" "}
                    <Chip light tone="estimate">
                      Estimate — national, not Atlanta-measured
                    </Chip>
                    <br />
                    The national healthcare average is $5.64 per click (LocaliQ, 3,542
                    campaigns, Oct 2024–Sept 2025); the all-industry average is $5.26–$5.42
                    (WordStream 2025/2026). But vein-specific, high-intent searches run
                    $9–$70 per click, averaging $17.97 across five metros (VT Wyatt,
                    published advertiser data). Our model assumes $7–$15 — deliberately
                    above the national average. Atlanta is a large, competitive metro, so
                    local costs likely trend above national medians; that is a directional
                    estimate, not a measured fact.
                  </p>
                  <p>
                    <strong className="text-slate-900">Clicks that become inquiries</strong>{" "}
                    <Chip light tone="verified">
                      Verified to source — national
                    </Chip>
                    <br />
                    Healthcare benchmarks run 3.36% (Evolve, medical-practice average) to
                    8.09% (LocaliQ healthcare). Our 4–8% range sits inside it.
                  </p>
                  <p>
                    <strong className="text-slate-900">
                      Inquiries → consultations → treated patients
                    </strong>{" "}
                    <Chip light tone="estimate">
                      Directional estimate
                    </Chip>
                    <br />
                    The model&rsquo;s 40–60% consultation-to-treatment assumptions draw on a
                    published 40–70% range from a non-US, non-vein-specific dataset — treat
                    them as directional only.
                  </p>
                  <p>
                    <strong className="text-slate-900">One honest caveat:</strong> the first
                    60–90 days run below these figures. Campaigns are new, and the review
                    base is thin.
                  </p>
                </div>
              </Expander>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-accent/40 bg-white shadow-sm p-6 sm:p-7">
              <p className="text-slate-900 text-base sm:text-lg md:text-xl leading-relaxed font-semibold max-w-4xl">
                We guarantee the work. Patient growth we project honestly, from data — never
                promise.
              </p>
            </div>
          </div>
        </section>

        {/* ============ 6. BUDGET CORRECTION — dark (kept full length) ============ */}
        <section id="budget-correction" className="scroll-mt-24 bg-dark py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/[0.05] p-6 sm:p-8 md:p-10 max-w-4xl">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-300 mb-5">
                A correction on the budget
              </div>
              <div className="space-y-5 text-gray-200 text-base sm:text-lg leading-relaxed">
                <p>
                  <strong className="text-white">
                    When we spoke, I said $500/month in ad spend as a starting point. That
                    was a generic minimum, not an Alpharetta number.
                  </strong>
                </p>
                <p>
                  Since then we researched this specific market — what these searches
                  actually cost, who&rsquo;s bidding on them, and what a new practice is up
                  against here. The honest answer:{" "}
                  <strong className="text-white">
                    $500 is not enough in this corridor.
                  </strong>{" "}
                  It buys too few clicks for the campaigns to learn what works, and it would
                  most likely underperform — not because paid search doesn&rsquo;t work, but
                  because it was underfunded. The risk isn&rsquo;t just wasted money;
                  it&rsquo;s walking away believing the channel failed when it was never
                  given a fair test.
                </p>
                <p>
                  <strong className="text-white">
                    Our recommendation is $1,000/month in ad spend.
                  </strong>{" "}
                  That&rsquo;s the level where the data says this market is winnable.
                  We&rsquo;d rather tell you that now than take the smaller budget and
                  explain the disappointment in ninety days.
                </p>
              </div>
              <p className="mt-6 text-gray-400 text-sm">— Clayton Peterson, Founder</p>
            </div>
          </div>
        </section>

        {/* ============ 7. REGARDLESS — LIGHT ============ */}
        <section className="bg-warm-bg py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              light
              eyebrow="Section — starting now"
              title={
                <>
                  What we&rsquo;re doing regardless —{" "}
                  <span className="text-accent">starting now.</span>
                </>
              }
              subtitle="This starts now, whether or not you upgrade."
            />

            <div className="rounded-2xl border border-emerald-300 bg-white shadow-sm p-6 sm:p-7 max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-300"
                >
                  ✓
                </span>
                <h3 className="text-slate-900 font-extrabold text-lg sm:text-xl leading-tight">
                  Review requests to your treated patients
                </h3>
              </div>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Every patient who leaves happy gets a text and an email inviting feedback.
                Your front desk enters patients manually, or we connect your existing
                automated patient messaging so it happens on its own.
              </p>
            </div>

            <div className="mt-4 max-w-3xl">
              <Expander
                light
                id="why-reviews-first"
                title="Why reviews are the cheapest lever available"
                meta="They work twice — on patients and on your advertising costs"
              >
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4">
                  Reviews raise how often patients choose you when comparing clinics — and
                  they lower what Google charges you for advertising, because Google prices
                  ads partly on how trustworthy the listing behind them looks. Every review
                  collected now makes every future advertising dollar work harder. No other
                  single step does both at once, at essentially no cost.
                </p>
              </Expander>
            </div>
          </div>
        </section>

        {/* ============ 8. ACCOUNTABILITY — dark ============ */}
        <section className="bg-dark py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              eyebrow="Section — accountability"
              title={
                <>
                  What we&rsquo;re{" "}
                  <span className="text-accent-light">accountable for.</span>
                </>
              }
            />

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/[0.05] p-5 sm:p-6">
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-emerald-300 mb-4">
                  What we can move
                </div>
                <ul className="space-y-2.5">
                  {[
                    "How often you appear in search",
                    "Clicks to your site",
                    "Form inquiries",
                    "Your listings and reviews",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-gray-100 text-sm sm:text-base leading-snug"
                    >
                      <span
                        aria-hidden
                        className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/40"
                      >
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5 sm:p-6">
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400 mb-4">
                  What we can&rsquo;t move
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Whether the phone gets answered",
                    "How a consultation goes",
                    "Insurance approvals",
                    "Referrals from local physicians",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-gray-200 text-sm sm:text-base leading-snug"
                    >
                      <span
                        aria-hidden
                        className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-gray-400 text-xs font-bold border border-white/20"
                      >
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                We&rsquo;ll report on our half every month, in numbers. Your team owns the
                other half — and we&rsquo;re glad to help think through the referral side
                separately.
              </p>
            </div>
          </div>
        </section>

        {/* ============ 9. CTA — LIGHT ============ */}
        <section className="bg-warm-bg py-16 sm:py-24 no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border-2 border-accent/40 bg-white shadow-sm p-6 sm:p-8 md:p-10 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Ready to move forward.
              </h2>
              <a
                href="/get-started"
                className="inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent-light transition-colors px-8 py-4 text-white font-bold text-base sm:text-lg shadow-[0_0_24px_rgba(45,108,223,0.35)]"
              >
                Book a time with Clayton
                <span aria-hidden>→</span>
              </a>
              <p className="mt-5 text-slate-600 text-sm sm:text-base">
                Questions first? Reply to the email or call{" "}
                <a
                  href="tel:+18005976912"
                  className="text-slate-900 font-semibold hover:text-accent transition-colors"
                >
                  (800) 597-6912
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ============ 10. FOOTER — dark ============ */}
      <footer className="border-t border-white/10 bg-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-sm text-gray-400">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">
                Prepared by
              </div>
              <div className="text-white font-bold">Clayton Peterson</div>
              <div>Founder, InflowMD</div>
              <div className="mt-2 space-y-1">
                <div>
                  <a href="tel:+18005976912" className="hover:text-white transition-colors">
                    (800) 597-6912
                  </a>
                </div>
                <div>
                  <a
                    href="mailto:clayton@inflowmd.com"
                    className="hover:text-white transition-colors"
                  >
                    clayton@inflowmd.com
                  </a>
                </div>
                <div>
                  <a
                    href="https://www.inflowmd.com"
                    className="text-accent-light underline decoration-white/20 hover:decoration-accent-light"
                  >
                    inflowmd.com
                  </a>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">
                Methodology
              </div>
              <p className="leading-relaxed">
                Market research conducted July 2026. Patient value figures from the CY2026
                Medicare physician fee schedule. Advertising cost figures are industry
                benchmarks, not Atlanta-measured — labeled throughout.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
