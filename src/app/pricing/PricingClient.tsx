"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";

/* ───────────────────────── Data ───────────────────────── */

interface Tier {
  name: string;
  tagline: string;
  monthlyPrice: number;
  setupFee: number;
  popular: boolean;
  features: string[];
  includesFrom: string | null;
}

const tiers: Tier[] = [
  {
    name: "Essentials",
    tagline: "Fast, secure & compliant website",
    monthlyPrice: 500,
    setupFee: 500,
    popular: false,
    features: [
      "Responsive website development (mobile-friendly & patient-focused)",
      "Ultimate website hosting (maximum performance & speed)",
      "Website security (malware scans, firewall, SSL, backups)",
      "Google Business Profile setup / optimization",
      "HIPAA-compliant appointment request forms",
      "Domain registration (managed renewals & DNS support)",
    ],
    includesFrom: null,
  },
  {
    name: "Visibility",
    tagline: "Reviews + local visibility",
    monthlyPrice: 900,
    setupFee: 1000,
    popular: false,
    features: [
      "Google Business Profile updates (posts, photos, services)",
      "Reputation management (dashboard + review requests)",
      "Local SEO targeted to your city & specialty",
    ],
    includesFrom: "Essentials",
  },
  {
    name: "Growth",
    tagline: "Enhanced visibility + content engine",
    monthlyPrice: 1500,
    setupFee: 1500,
    popular: true,
    features: [
      "Keyword optimization for core service pages & local targets",
      "2 SEO blog posts per month (patient-focused content)",
      "Enhanced citation management across major directories",
      "Monthly SEO insights with rankings, analytics, and next steps",
    ],
    includesFrom: "Visibility",
  },
  {
    name: "Full Engine",
    tagline: "SEO + Ads + everything, fully managed",
    monthlyPrice: 2500,
    setupFee: 2000,
    popular: false,
    features: [
      "Google Ads setup & ongoing management (targeted for ROI)",
      "Conversion tracking (calls, forms, leads)",
      "Landing page optimization for ad performance",
      "Quarterly strategy review with actionable guidance",
    ],
    includesFrom: "Growth",
  },
];

const faqs = [
  {
    q: "Are there any setup fees?",
    a: "Yes — a one-time setup fee that scales by plan, ranging from $500 to $2,000. We waive it entirely on annual (12-month) commitments.",
  },
  {
    q: "What’s the contract commitment?",
    a: "Two options: monthly is no-commitment, month-to-month, and includes the setup fee. Annual is a 12-month commitment billed monthly at the same rate — with the setup fee waived and two months free.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Absolutely. You can move up to a higher tier at any time. We’ll apply the new services immediately and adjust your billing.",
  },
  {
    q: "What happens if I cancel?",
    a: "On a monthly plan you can cancel any time with 30 days written notice. On an annual plan you can cancel at the end of your 12-month term, also with 30 days notice. Your data and content remain accessible through the end of your billing period.",
  },
  {
    q: "Do I own my website?",
    a: "Your content, copy, and images are always yours. The custom Next.js build runs on our managed platform as part of your plan — that’s how we keep it fast, secure, and continuously optimized while you’re with us. If you ever leave, we provide a full backup of your original site, and the custom build can be licensed for a one-time buyout if you want to take it with you.",
  },
];

const specialties: Record<string, { revenue: number; cost: number }> = {
  "Vein & Vascular": { revenue: 3000, cost: 800 },
  "Med Spa": { revenue: 1200, cost: 400 },
  Cardiology: { revenue: 2500, cost: 700 },
  Dermatology: { revenue: 800, cost: 250 },
  "Primary Care": { revenue: 350, cost: 120 },
  "Weight Loss": { revenue: 1500, cost: 400 },
  "Pain Management": { revenue: 2000, cost: 600 },
  "General/Other": { revenue: 1500, cost: 500 },
};

/* ───────────────────────── Component ───────────────────────── */

export default function PricingClient() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://inflowmd.vercel.app" },
          { name: "Pricing", url: "https://inflowmd.vercel.app/pricing" },
        ]}
      />
      <FAQSchema faqs={faqs} />
      <Navbar />
      <main>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 sm:pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,108,223,0.12)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-accent font-semibold text-sm tracking-[0.15em] uppercase mb-4">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              Transparent Pricing,{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Real Results
              </span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Every plan we build is designed to grow your practice. Choose the
              level that fits where you are today.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Pricing Grid ── */}
      <section className="py-16 sm:py-24 bg-warm-bg relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Toggle */}
          <FadeIn>
            <BillingToggle annual={annual} setAnnual={setAnnual} />
          </FadeIn>

          {/* Website + platform callout */}
          <FadeIn delay={0.05}>
            <div className="mt-10 max-w-4xl mx-auto rounded-2xl border border-accent/20 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                </div>
                <div className="text-sm sm:text-base text-foreground leading-relaxed">
                  <span className="font-semibold">Every plan includes a fast, modern, AI-ready website built on Next.js</span>
                  {" "}— engineered for performance, search visibility, and built to scale as your practice grows.
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={0.08 * i}>
                <PricingCard tier={tier} annual={annual} />
              </FadeIn>
            ))}
          </div>

          {/* Platform / leasing transparency */}
          <FadeIn delay={0.1}>
            <p className="mt-8 max-w-3xl mx-auto text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
              Your website is built and hosted on our managed platform as part of your plan. If you ever leave, we provide your original site backup, and your custom build can be licensed for a one-time buyout. This keeps your site fast, secure, and continuously optimized while you&rsquo;re with us.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-24 bg-warm-bg-alt">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Common Questions
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={0.06 * i}>
                <FAQItem question={faq.q} answer={faq.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="py-16 sm:py-24 bg-warm-bg">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
                ROI Calculator
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                See Your ROI
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Punch in your own numbers. Nothing is pre-filled until you tell
                us about your practice.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ROICalculator />
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.15)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
              Not sure which plan is right?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Let&apos;s talk through your goals and find the perfect fit for
              your practice.
            </p>
            <a
              href="/get-started"
              className="inline-block px-8 py-3.5 bg-accent text-white font-semibold rounded-lg glow-blue hover:bg-accent-light transition-colors text-lg"
            >
              Book a Strategy Call
            </a>
          </FadeIn>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}

/* ───────────────────────── Billing Toggle ───────────────────────── */

function BillingToggle({
  annual,
  setAnnual,
}: {
  annual: boolean;
  setAnnual: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-4">
        <span
          className={`text-sm font-medium ${!annual ? "text-foreground" : "text-gray-400"}`}
        >
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-accent" : "bg-gray-300"}`}
          aria-label="Toggle billing period"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-7" : ""}`}
          />
        </button>
        <span
          className={`text-sm font-medium ${annual ? "text-foreground" : "text-gray-400"}`}
        >
          Annual (12-mo)
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 text-center max-w-md">
        {annual ? (
          <>
            <span className="inline-block text-[10px] font-bold tracking-[0.18em] uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mr-2">
              Setup waived + 2 months free
            </span>
            12-month commitment, billed monthly.
          </>
        ) : (
          <>Month-to-month, no commitment. Full setup fee applies.</>
        )}
      </p>
    </div>
  );
}

/* ───────────────────────── Pricing Card ───────────────────────── */

function PricingCard({
  tier,
  annual,
}: {
  tier: Tier;
  annual: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all h-full ${
        tier.popular
          ? "ring-2 ring-accent shadow-[0_0_30px_rgba(45,108,223,0.2)]"
          : "border border-gray-200"
      }`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute top-0 left-0 right-0 bg-accent text-white text-xs font-bold text-center py-1 tracking-wide uppercase">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div
        className={`px-6 pb-6 text-center bg-gradient-to-b from-[#1A1A2E] to-[#232340] ${tier.popular ? "pt-10" : "pt-6"}`}
      >
        <h3 className="text-white font-bold text-lg mb-1">{tier.name}</h3>
        <p className="text-gray-400 text-sm mb-4 min-h-[2.5rem]">{tier.tagline}</p>
        <div className="flex items-end justify-center gap-1">
          <span className="text-white text-4xl font-extrabold">
            ${tier.monthlyPrice.toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm mb-1">/mo</span>
        </div>

        {/* Setup fee + commitment line */}
        <div className="mt-3 text-xs leading-relaxed min-h-[2.75rem]">
          {annual ? (
            <>
              <p className="text-gray-400">
                <span className="line-through text-gray-500">
                  ${tier.setupFee.toLocaleString()} setup
                </span>{" "}
                <span className="text-emerald-300 font-semibold">WAIVED</span>
              </p>
              <p className="text-emerald-300 font-semibold">+ 2 months free</p>
              <p className="text-gray-500 mt-0.5">
                12-month commitment, billed monthly
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-300">
                <span className="font-semibold text-white">
                  ${tier.setupFee.toLocaleString()}
                </span>{" "}
                one-time setup
              </p>
              <p className="text-gray-500 mt-0.5">
                Month-to-month, no commitment
              </p>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 bg-white px-6 py-6">
        {tier.includesFrom && (
          <p className="text-sm font-semibold text-accent mb-3">
            Everything in {tier.includesFrom}, plus:
          </p>
        )}
        <ul className="space-y-3">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                className="w-4 h-4 text-accent shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="bg-white px-6 pb-6">
        <a
          href="/get-started"
          className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
            tier.popular
              ? "bg-accent text-white hover:bg-accent-light glow-blue-sm"
              : "bg-gray-100 text-foreground hover:bg-gray-200"
          }`}
        >
          Get Started
        </a>
      </div>
    </div>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── ROI Calculator ───────────────────────── */

function ROICalculator() {
  const specialtyKeys = Object.keys(specialties);
  const [specialty, setSpecialty] = useState<string>(""); // no preset
  const [revenue, setRevenue] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [patients, setPatients] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ltv, setLtv] = useState<number>(1);

  /* When specialty changes, optionally pre-fill revenue & cost as a helper */
  const handleSpecialty = (key: string) => {
    setSpecialty(key);
    if (key && specialties[key]) {
      setRevenue(specialties[key].revenue);
      setCost(specialties[key].cost);
    }
  };

  const calc = useMemo(() => {
    const profitPerPatient = (revenue - cost) * ltv;
    const monthlyProfit = profitPerPatient * patients;
    const netProfit = monthlyProfit - fee;
    const roiPct = fee > 0 ? ((monthlyProfit - fee) / fee) * 100 : 0;
    const roiMultiple = fee > 0 ? monthlyProfit / fee : 0;
    const breakEven =
      profitPerPatient > 0 ? Math.ceil(fee / profitPerPatient) : 0;

    return {
      profitPerPatient,
      monthlyProfit,
      netProfit,
      roiPct,
      roiMultiple,
      breakEven,
    };
  }, [revenue, cost, fee, patients, ltv]);

  const ready = revenue > 0 && cost >= 0 && fee > 0 && patients > 0;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* LEFT — Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-5">
        {/* Specialty */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Specialty
          </label>
          <select
            value={specialty}
            onChange={(e) => handleSpecialty(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Select your specialty (optional preset)</option>
            {specialtyKeys.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Picking a specialty pre-fills revenue and cost as a starting point. Adjust freely.
          </p>
        </div>

        <InputField
          label="Average revenue per patient"
          value={revenue}
          onChange={setRevenue}
          prefix="$"
        />
        <InputField
          label="Average cost per patient"
          value={cost}
          onChange={setCost}
          prefix="$"
        />
        <InputField
          label="Monthly marketing fee"
          value={fee}
          onChange={setFee}
          prefix="$"
        />
        <InputField
          label="New patients / month from marketing"
          value={patients}
          onChange={setPatients}
        />

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-accent text-sm font-medium hover:underline"
        >
          {showAdvanced ? "Hide" : "Show"} advanced
        </button>

        {showAdvanced && (
          <InputField
            label="Lifetime value multiplier"
            value={ltv}
            onChange={setLtv}
            step={0.1}
          />
        )}
      </div>

      {/* RIGHT — Results */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#232340] rounded-2xl p-6 sm:p-8 text-white">
        <h3 className="text-lg font-bold mb-6">Your Projected ROI</h3>

        {/* Big number */}
        <div className="mb-8 text-center">
          <p className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            {ready ? `${calc.roiMultiple.toFixed(1)}x` : "—"}
          </p>
          <p className="text-gray-400 text-sm mt-1">ROI Multiple</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ResultStat
            label="Net Profit / Month"
            value={ready ? `$${calc.netProfit.toLocaleString()}` : "—"}
            highlight={ready && calc.netProfit > 0}
          />
          <ResultStat
            label="Profit per Patient"
            value={
              ready ? `$${calc.profitPerPatient.toLocaleString()}` : "—"
            }
          />
          <ResultStat
            label="Monthly Patient Profit"
            value={ready ? `$${calc.monthlyProfit.toLocaleString()}` : "—"}
          />
          <ResultStat
            label="ROI"
            value={ready ? `${calc.roiPct.toFixed(0)}%` : "—"}
          />
        </div>

        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-gray-400">
            <span className="text-white font-semibold">Break-even:</span>{" "}
            {ready && calc.breakEven > 0
              ? `${calc.breakEven} patient${calc.breakEven !== 1 ? "s" : ""} / month`
              : "—"}
          </p>
        </div>

        {/* Dynamic summary — only when inputs are meaningful */}
        {ready ? (
          <p className="mt-6 text-sm text-gray-400 leading-relaxed">
            At <span className="text-white font-medium">{patients}</span> new
            patients per month, a{" "}
            <span className="text-white font-medium">
              ${fee.toLocaleString()}/mo
            </span>{" "}
            investment generates{" "}
            <span className="text-white font-medium">
              ${calc.monthlyProfit.toLocaleString()}
            </span>{" "}
            in gross profit &mdash; a{" "}
            <span className="text-accent font-semibold">
              {calc.roiMultiple.toFixed(1)}x return
            </span>
            .{" "}
            {calc.breakEven > 0 && (
              <>
                You break even after{" "}
                <span className="text-white font-medium">{calc.breakEven}</span>{" "}
                patient{calc.breakEven !== 1 && "s"}.
              </>
            )}
          </p>
        ) : (
          <p className="mt-6 text-sm text-gray-500 leading-relaxed italic">
            Enter your numbers on the left to see projected ROI.
          </p>
        )}

        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          Projections based on your inputs &mdash; not guarantees. Actual results vary by market, competition, and patient mix.
        </p>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */

function InputField({
  label,
  value,
  onChange,
  prefix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value === 0 ? "" : value}
          step={step}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full border border-gray-200 rounded-lg py-2.5 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 ${prefix ? "pl-7 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function ResultStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-lg font-bold ${highlight ? "text-green-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
