"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

/* ───────────────────────── Data ───────────────────────── */

const tiers = [
  {
    name: "Web Essentials",
    tagline: "Fast, secure & compliant website",
    monthlyPrice: 400,
    annualPrice: 350,
    popular: false,
    features: [
      "Google Business Profile (Set up / Optimization)",
      "Responsive Website Development (Mobile-friendly & patient-focused)",
      "Ultimate Website Hosting (Maximum performance & speed)",
      "Website Security (Malware scans, firewall, SSL certificate, backups)",
      "HIPAA Compliant Appointment Requests (Secure online patient forms)",
      "Domain Registration (Managed renewals & DNS support)",
    ],
    includesFrom: null,
  },
  {
    name: "Visibility Boost",
    tagline: "Reviews + Local visibility",
    monthlyPrice: 575,
    annualPrice: 500,
    popular: false,
    features: [
      "Google Business Profile Updates (Posts, photos, and service optimizations)",
      "Reputation Management (Dashboard + Review Requests)",
      "Local Search Engine Optimization (Targeted for your city & specialty)",
    ],
    includesFrom: "Essentials",
  },
  {
    name: "Foundational SEO",
    tagline: "Enhanced Online Visibility",
    monthlyPrice: 900,
    annualPrice: 800,
    popular: true,
    features: [
      "Keyword optimization for core services (Core service pages & local targets)",
      "2 SEO blog posts per month (Engaging, patient-focused content)",
      "Enhanced citation management (Professional-grade directory management)",
      "Monthly SEO insights and next steps (Rankings, analytics, and next steps)",
    ],
    includesFrom: "Visibility Boost",
  },
  {
    name: "Growth + Visibility",
    tagline: "SEO + Ads that drive results",
    monthlyPrice: 1350,
    annualPrice: 1200,
    popular: false,
    features: [
      "Google Ads setup & ongoing management (Targeted campaigns built for ROI)",
      "Conversion tracking (Monitor calls, forms, & leads)",
      "Landing page optimization (Boost conversions & ad performance)",
      "Strategy review with actionable insights (Quarterly insights + actionable guidance)",
    ],
    includesFrom: "Foundational SEO",
  },
];

const faqs = [
  {
    q: "Are there any setup fees?",
    a: "No. Your website build, onboarding, and initial optimization are all included in your plan. No surprise invoices.",
  },
  {
    q: "What\u2019s the contract commitment?",
    a: "All plans start with a 12-month term that includes your custom website build and full onboarding. After the initial term, you can continue month-to-month or renew annually at your current rate.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Absolutely. You can move up to a higher tier at any time. We\u2019ll apply the new services immediately and adjust your billing.",
  },
  {
    q: "What happens if I cancel?",
    a: "After your initial 12-month term, you can cancel with 30 days written notice per the terms of your agreement. Your website and all assets remain accessible through the end of your billing period.",
  },
  {
    q: "Do I own my website?",
    a: "Yes. You own all content, images, and copy on your site. If you ever leave, we\u2019ll provide a full export of your site files.",
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

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <Navbar />

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
              Every plan is built to grow your practice&nbsp;&mdash; choose the
              level that fits your goals.
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

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={0.08 * i}>
                <PricingCard tier={tier} annual={annual} />
              </FadeIn>
            ))}
          </div>
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
                Punch in your numbers and see how fast your marketing investment
                pays for itself.
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
        Annual
      </span>
      {annual && (
        <span className="ml-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          Save up to 13%
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── Pricing Card ───────────────────────── */

function PricingCard({
  tier,
  annual,
}: {
  tier: (typeof tiers)[number];
  annual: boolean;
}) {
  const price = annual ? tier.annualPrice : tier.monthlyPrice;
  const savePct = Math.round(
    ((tier.monthlyPrice - tier.annualPrice) / tier.monthlyPrice) * 100,
  );

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
        <p className="text-gray-400 text-sm mb-4">{tier.tagline}</p>
        <div className="flex items-end justify-center gap-1">
          <span className="text-white text-4xl font-extrabold">
            ${price.toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm mb-1">/mo</span>
        </div>
        {annual && (
          <p className="text-gray-500 text-xs mt-1">
            billed annually&nbsp;&middot;&nbsp;
            <span className="text-green-400 font-semibold">
              save {savePct}%
            </span>
          </p>
        )}
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
  const [specialty, setSpecialty] = useState(specialtyKeys[0]);
  const defaults = specialties[specialty];

  const [revenue, setRevenue] = useState(defaults.revenue);
  const [cost, setCost] = useState(defaults.cost);
  const [fee, setFee] = useState(800);
  const [patients, setPatients] = useState(4);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ltv, setLtv] = useState(1);

  /* When specialty changes, update revenue & cost */
  const handleSpecialty = (key: string) => {
    setSpecialty(key);
    setRevenue(specialties[key].revenue);
    setCost(specialties[key].cost);
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
            {specialtyKeys.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Revenue */}
        <InputField
          label="Average revenue per patient"
          value={revenue}
          onChange={setRevenue}
          prefix="$"
        />

        {/* Cost */}
        <InputField
          label="Average cost per patient"
          value={cost}
          onChange={setCost}
          prefix="$"
        />

        {/* Fee */}
        <InputField
          label="Monthly marketing fee"
          value={fee}
          onChange={setFee}
          prefix="$"
        />

        {/* Patients */}
        <InputField
          label="New patients / month from marketing"
          value={patients}
          onChange={setPatients}
        />

        {/* Advanced */}
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
            {calc.roiMultiple.toFixed(1)}x
          </p>
          <p className="text-gray-400 text-sm mt-1">ROI Multiple</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ResultStat
            label="Net Profit / Month"
            value={`$${calc.netProfit.toLocaleString()}`}
            highlight={calc.netProfit > 0}
          />
          <ResultStat
            label="Profit per Patient"
            value={`$${calc.profitPerPatient.toLocaleString()}`}
          />
          <ResultStat
            label="Monthly Patient Profit"
            value={`$${calc.monthlyProfit.toLocaleString()}`}
          />
          <ResultStat label="ROI" value={`${calc.roiPct.toFixed(0)}%`} />
        </div>

        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-gray-400">
            <span className="text-white font-semibold">Break-even:</span>{" "}
            {calc.breakEven} patient{calc.breakEven !== 1 && "s"} / month
          </p>
        </div>

        {/* Summary */}
        <p className="mt-6 text-sm text-gray-400 leading-relaxed">
          At <span className="text-white font-medium">{patients}</span> new
          patients per month, your{" "}
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
          . You break even after just{" "}
          <span className="text-white font-medium">{calc.breakEven}</span>{" "}
          patient{calc.breakEven !== 1 && "s"}.
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
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
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
