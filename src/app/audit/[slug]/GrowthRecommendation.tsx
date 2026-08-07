import type { RecommendationData } from "../data/recommendation";
import OrganicPaidTabs from "./OrganicPaidTabs";
import RoiSlider from "./RoiSlider";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-accent font-semibold text-[11px] sm:text-xs tracking-[0.24em] uppercase">
      {children}
    </p>
  );
}

function Chip({ tone, children }: { tone: "verified" | "estimate"; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full border ${
        tone === "verified"
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40"
          : "bg-amber-500/15 text-amber-300 border-amber-400/40"
      }`}
    >
      {children}
    </span>
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
          className={`text-base sm:text-lg leading-relaxed mt-4 ${
            light ? "text-slate-600" : "text-gray-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 text-gray-200 text-sm sm:text-base leading-snug"
        >
          <span
            aria-hidden
            className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/40"
          >
            ✓
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Expander({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden"
    >
      <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 flex items-center gap-3 min-h-[56px]">
        <h3 className="flex-1 text-white font-bold text-sm sm:text-base leading-snug">{title}</h3>
        <span
          aria-hidden
          className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform text-lg"
        >
          ▾
        </span>
      </summary>
      <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-white/5">{children}</div>
    </details>
  );
}

/* ---- visual step-flow (shared by both sub-tabs) ---- */

const flowIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-6 h-6",
  "aria-hidden": true,
};

function IconSearch() {
  return (
    <svg {...flowIconProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg {...flowIconProps}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}
function IconBulb() {
  return (
    <svg {...flowIconProps}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg {...flowIconProps}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg {...flowIconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconRocket() {
  return (
    <svg {...flowIconProps}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg {...flowIconProps}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
function IconTrendingUp() {
  return (
    <svg {...flowIconProps}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

type FlowStep = {
  icon: React.ReactNode;
  label: string;
  detail: string;
  tone?: "gold" | "green";
  done?: boolean;
};

const ORGANIC_STEPS: FlowStep[] = [
  { icon: <IconSearch />, label: "They search", detail: "“why do my legs ache”" },
  { icon: <IconDoc />, label: "They read", detail: "your educational article" },
  { icon: <IconBulb />, label: "They learn", detail: "it’s a treatable condition worth an evaluation" },
  { icon: <IconPhone />, label: "They book", detail: "an appointment at your office", tone: "green" },
];

const PAID_STEPS: FlowStep[] = [
  { icon: <IconSearch />, label: "Research", detail: "We identify what your patients are searching for", done: true },
  { icon: <IconEdit />, label: "Build", detail: "We create the ads and the landing pages they point to" },
  { icon: <IconRocket />, label: "Launch", detail: "We run targeted campaigns to those pages" },
  { icon: <IconChart />, label: "Track", detail: "We measure calls and results" },
  { icon: <IconTrendingUp />, label: "Optimize", detail: "We sharpen the campaign around what’s working", tone: "green" },
];

function StepFlow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start">
      {steps.map((s, i) => {
        const green = s.tone === "green";
        const circle = green
          ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
          : "bg-amber-500/15 border-amber-400/40 text-amber-300";
        const nextGreen = steps[i + 1]?.tone === "green";
        const connColor = nextGreen ? "text-emerald-400/70" : "text-amber-400/70";
        return (
          <div key={s.label} className="contents">
            <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3 sm:flex-1 py-1 sm:py-0">
              <div
                className={`relative shrink-0 w-14 h-14 rounded-full border flex items-center justify-center ${circle}`}
              >
                {s.icon}
                {s.done && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold border-2 border-dark">
                    ✓
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm sm:text-base leading-tight">
                  {s.label}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm leading-snug mt-0.5">
                  {s.detail}
                </div>
                {s.done && (
                  <div className="mt-1.5">
                    <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      Done
                    </span>
                  </div>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className={`flex items-center shrink-0 pl-[27px] sm:pl-0 sm:px-2 sm:pt-4 sm:self-start ${connColor}`}
              >
                <span className="hidden sm:inline text-2xl">→</span>
                <span className="sm:hidden text-xl leading-none py-0.5">↓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- sub-tab panels ---- */

function OrganicPanel() {
  return (
    <div>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-5">
        Content that turns searches into{" "}
        <span className="text-accent-light">patients.</span>
      </h3>
      <Bullets
        items={[
          "We write patient-focused articles targeting the conditions above — venous insufficiency, leg pain, swelling, restless legs.",
          "2 SEO-optimized blog posts per month.",
          "Content ranks in search and keeps working over time — it doesn’t stop when you stop paying.",
          "Weighted toward medical, insurance-covered conditions — where patient value is highest.",
        ]}
      />
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 sm:p-7">
        <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-300 mb-6">
          How a search becomes a patient
        </div>
        <StepFlow steps={ORGANIC_STEPS} />
      </div>
    </div>
  );
}

function PaidPanel() {
  return (
    <div>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-5">
        Targeted ads that point to your{" "}
        <span className="text-accent-light">content.</span>
      </h3>
      <Bullets
        items={[
          "We run ads on symptom and condition searches, pointing to your educational pages.",
          "A dedicated tracking phone number captures and measures every call from your ads.",
          "You control the ad budget — raise or lower it anytime.",
        ]}
      />

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 sm:p-7">
        <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-300 mb-6">
          Our process
        </div>
        <StepFlow steps={PAID_STEPS} />
      </div>

      <div className="mt-6 rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/[0.12] to-transparent p-5 sm:p-7">
        <h4 className="text-white font-extrabold text-lg sm:text-xl mb-5">How we run your ads</h4>
        <div className="space-y-4">
          <div>
            <div className="text-accent-light font-bold text-sm sm:text-base">
              We don&rsquo;t guess. We measure.
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-snug mt-0.5">
              Anyone can sell you a forecast. We track every call from your ads with a dedicated
              number — so you see real patients, not projections.
            </p>
          </div>
          <div>
            <div className="text-accent-light font-bold text-sm sm:text-base">
              We build, then we prove it.
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-snug mt-0.5">
              The first months show us what works. We read the real numbers with you and sharpen
              the campaign around them.
            </p>
          </div>
        </div>
        <p className="mt-5 pt-5 border-t border-white/10 text-white text-base sm:text-lg font-extrabold leading-snug">
          We don&rsquo;t sell promises. We build a system that brings in patients — and we prove
          it with your own numbers.
        </p>
      </div>

      <div className="mt-5">
        <Expander id="rec-tracking" title="How we’ll track results">
          <ul className="mt-3 space-y-2 text-gray-300 text-sm sm:text-base leading-snug">
            <li>A dedicated phone number runs on the ads.</li>
            <li>Every call is tied back to the campaign — real calls from real patients, not just clicks.</li>
          </ul>
        </Expander>
      </div>
    </div>
  );
}

export default function GrowthRecommendation({ data }: { data: RecommendationData }) {
  return (
    <div className="bg-dark text-white">
      {/* ============ A. INTRO ============ */}
      <section className="relative bg-dark pt-16 sm:pt-20 md:pt-24 pb-14 md:pb-16 overflow-hidden">
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
          </div>

          <Eyebrow>Growth Recommendation — Prepared for Vein-ity</Eyebrow>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-5xl">
            How we&rsquo;ll grow your patient volume —{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              and what it costs.
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
            Two approaches, working together — here&rsquo;s the plan and the numbers behind it.
          </p>
        </div>
      </section>

      {/* ============ B. DEMAND (shared) ============ */}
      <section className="bg-warm-bg py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            light
            eyebrow="The demand is real"
            title={
              <>
                There&rsquo;s real demand{" "}
                <span className="text-accent">in your market.</span>
              </>
            }
            subtitle="People near you are searching for these conditions every month:"
          />

          <div className="flex items-center gap-3 mb-4">
            <Chip tone="verified">Verified</Chip>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Local searches / month · your 7-city metro
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {data.searchInterest.map((s) => (
              <div
                key={s.term}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
                  {s.volume.replace(" / month", "").replace(" combined", "")}
                </div>
                <div className="mt-2 text-sm text-slate-700 font-medium leading-snug">
                  {s.term}
                </div>
                <div className="mt-2">
                  <span
                    className={`text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded border ${
                      s.kind === "condition"
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {s.kind}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-slate-600 text-sm sm:text-base leading-snug max-w-3xl">
            This is search interest, not a guarantee of patients — but it&rsquo;s real, ongoing
            demand around the conditions you treat.
          </p>
        </div>
      </section>

      {/* ============ C. ORGANIC / PAID SUB-TABS ============ */}
      <section className="bg-dark py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            eyebrow="The two approaches"
            title={
              <>
                Two ways in —{" "}
                <span className="text-accent-light">both point to your content.</span>
              </>
            }
          />
          <OrganicPaidTabs organic={<OrganicPanel />} paid={<PaidPanel />} />
        </div>
      </section>

      {/* ============ D. INVESTMENT (shared) ============ */}
      <section className="bg-warm-bg py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            light
            eyebrow="Your investment"
            title={
              <>
                What it{" "}
                <span className="text-accent">costs.</span>
              </>
            }
          />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-2xl">
            <table className="w-full text-sm sm:text-base">
              <tbody>
                {data.costRows.map((r) => (
                  <tr
                    key={r.label}
                    className={`border-b border-slate-100 last:border-b-0 ${
                      r.total ? "bg-slate-50" : ""
                    }`}
                  >
                    <td
                      className={`px-5 sm:px-6 py-4 ${
                        r.total ? "font-extrabold text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {r.label}
                    </td>
                    <td
                      className={`px-5 sm:px-6 py-4 text-right whitespace-nowrap tabular-nums ${
                        r.total
                          ? "font-extrabold text-slate-900 text-lg sm:text-xl"
                          : "font-bold text-slate-900"
                      }`}
                    >
                      {r.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-5 space-y-2.5 max-w-2xl">
            <li className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-snug">
              <span
                aria-hidden
                className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30"
              >
                ✓
              </span>
              <span>
                The $500 ad budget goes directly to Google, not to us — adjustable anytime. Our
                fee covers content, ad management, tracking, and reporting.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ============ E. ROI CALCULATOR (shared) ============ */}
      <section className="bg-warm-bg pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            light
            eyebrow="The return"
            title={
              <>
                See how it{" "}
                <span className="text-accent">adds up.</span>
              </>
            }
            subtitle="Drag the slider to see the return at different patient levels. This is an illustration, not a prediction."
          />
          <RoiSlider />
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            This is an illustration of how the economics work — not a prediction or guarantee.
            Actual patient volume depends on many factors, and early months run slower while
            content builds and ads gather data. We track real inquiries from day one and evaluate
            actual results together.
          </p>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-warm-bg py-16 sm:py-24 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border-2 border-accent/40 bg-white shadow-sm p-6 sm:p-8 md:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Let&rsquo;s get started.
            </h2>
            <a
              href={data.ctaUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent-light transition-colors px-8 py-4 text-white font-bold text-base sm:text-lg shadow-[0_0_24px_rgba(45,108,223,0.35)]"
            >
              Book a time
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
