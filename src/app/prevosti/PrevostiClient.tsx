"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import FadeIn from "@/components/FadeIn";

/* ============================================================
   Shared atoms
   ============================================================ */

function Eyebrow({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "muted" }) {
  return (
    <p
      className={`font-semibold text-xs sm:text-sm tracking-[0.22em] uppercase mb-3 ${
        tone === "accent" ? "text-accent" : "text-gray-400"
      }`}
    >
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  invert = false,
  centered = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  invert?: boolean;
  centered?: boolean;
}) {
  return (
    <div className={`${centered ? "text-center mx-auto" : ""} max-w-3xl mb-10 sm:mb-14`}>
      <FadeIn>
        <Eyebrow tone={invert ? "muted" : "accent"}>{eyebrow}</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.06}>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] ${
            invert ? "text-white" : "text-dark"
          }`}
        >
          {title}
        </h2>
      </FadeIn>
      {subtitle && (
        <FadeIn delay={0.12}>
          <p
            className={`text-base sm:text-lg leading-relaxed mt-5 ${
              invert ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {subtitle}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

function HonestCallout({
  label = "What most agencies won’t tell you",
  children,
  tone = "amber",
}: {
  label?: string;
  children: React.ReactNode;
  tone?: "amber" | "blue";
}) {
  const colors =
    tone === "amber"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-blue-200 bg-blue-50 text-blue-900";
  const eyebrowColor = tone === "amber" ? "text-amber-700" : "text-blue-700";
  return (
    <div className={`rounded-2xl border ${colors} p-5 sm:p-6 md:p-7`}>
      <div className={`text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase mb-2 ${eyebrowColor}`}>
        {label}
      </div>
      <div className="text-sm sm:text-base leading-relaxed">{children}</div>
    </div>
  );
}

/**
 * Reliable count-up: starts at target value (so it's correct even if the
 * intersection observer never fires), then if/when the element enters the
 * viewport it briefly resets to 0 and animates up. Suffix is a string
 * (e.g. "k", "%"). Decimals controls how many digits after the point.
 */
function CountUpStat({
  to,
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [v, setV] = useState<number>(to); // safe default — shows the real number on render
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current) return;
    animated.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setV(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  const formatted =
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}

function AnimatedNumber({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
  format = (v: number) => v.toLocaleString(),
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => c.stop();
  }, [inView, mv, to, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {format(display)}
      {suffix}
    </span>
  );
}

/* ============================================================
   HERO
   ============================================================ */

function Hero() {
  return (
    <section className="relative bg-dark pt-[100px] md:pt-[120px] pb-20 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[360px] h-[360px] md:w-[560px] md:h-[560px] rounded-full bg-[#1a2a6c]/50 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] md:w-[520px] md:h-[520px] rounded-full bg-[#2D6CDF]/20 blur-[160px]" />
        <div className="absolute inset-0 bg-dark/40" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 text-xs sm:text-sm">
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 backdrop-blur">
              Private audit
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 backdrop-blur">
              Prepared by InflowMD
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 backdrop-blur">
              June 2026
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-accent font-semibold text-sm tracking-[0.22em] uppercase mb-5">
            Audit Report · Prevosti Vein Center
          </p>
        </FadeIn>
        <FadeIn delay={0.16}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 max-w-5xl">
            A flawless reputation{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              almost nobody can find yet
            </span>
            .
          </h1>
        </FadeIn>
        <FadeIn delay={0.24}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed mb-10">
            Dr. Prevosti, this report is honest by design. You have an excellent clinical
            foundation and a strong website. What&apos;s missing is the local-search
            infrastructure under your new identity — and that gap is the entire opportunity.
          </p>
        </FadeIn>

        {/* Headline metric strip */}
        <FadeIn delay={0.32}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12">
            {[
              { v: "5.0★", l: "Google rating" },
              { v: "15", l: "Reviews (new identity)" },
              { v: "B / B−", l: "On-site audit grade" },
              { v: "~1.2s", l: "Site full-load" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur p-4 sm:p-5 text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">{s.v}</div>
                <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 1 — Core finding (one-paragraph thesis + jump nav)
   ============================================================ */

const SECTIONS = [
  { id: "audit", label: "On-site audit" },
  { id: "offsite", label: "Off-site gap" },
  { id: "compete", label: "Competitive" },
  { id: "market", label: "Market" },
  { id: "paid", label: "Paid-search reality" },
  { id: "plan", label: "Plan & target" },
  { id: "calc", label: "ROI calculator" },
];

function Thesis() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <FadeIn>
              <Eyebrow>The core finding</Eyebrow>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark tracking-tight leading-tight mb-5">
                You don&apos;t have a website problem.
                <br className="hidden sm:block" />
                You have a{" "}
                <span className="text-accent">discoverability problem</span>.
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Your site loads in ~1.2 seconds, your content depth on conditions is genuinely
                strong, your credentials are best-in-class. But under your new identity,
                Prevosti Vein Center has near-zero local-search infrastructure. Google doesn&apos;t
                yet know who you are in Canton — and most patients searching today never see you.
              </p>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mt-4">
                The path to more patients here is{" "}
                <span className="font-semibold text-dark">discoverability</span>: Google Business
                Profile, reviews, the Map Pack, and owning the chronic-venous-insufficiency
                conversation organically. It&apos;s not a flood of paid ads — local volume
                won&apos;t support that, and we&apos;ll show you why on page seven.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <nav className="md:sticky md:top-6 rounded-2xl border border-gray-200 bg-warm-bg-alt p-5 sm:p-6">
              <p className="text-xs font-bold tracking-[0.22em] uppercase text-gray-500 mb-3">
                Jump to
              </p>
              <ul className="space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-sm font-medium text-dark hover:text-accent transition-colors"
                    >
                      → {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 2 — On-site audit (Working / Fixable toggle)
   ============================================================ */

const AUDIT_WORKING = [
  "Core Web Vitals near-perfect: TTFB ~104ms, LCP ~200ms, CLS 0",
  "Full page load ~1.2s — faster than 90%+ of medical sites",
  "Original, substantial condition pages (1,700–2,800 words each)",
  "Clear credential surfacing throughout",
  "Server-rendered HTML, HTTPS, working 404s",
  "Solid titles and meta descriptions on the primary pages",
  "Zocdoc booking integrated and visible",
  "Correct canonicalization on key pages",
];

const AUDIT_FIXABLE = [
  "No JSON-LD schema on 27 of 28 pages (search engines fly blind)",
  "Zero FAQ content or FAQPage schema anywhere — the single biggest GEO/AI gap",
  "No sitemap.xml (returns 404) — crawlers must guess your structure",
  "Empty robots.txt — no signals to crawlers",
  "Missing canonical tags on several secondary pages",
  "A handful of thin or duplicate <title> values",
  "Missing image alt text site-wide (accessibility + image SEO)",
];

function OnSiteAudit() {
  const [tab, setTab] = useState<"working" | "fixable">("working");
  return (
    <section id="audit" className="bg-warm-bg-alt py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="On-site audit"
          title={
            <>
              An <span className="text-accent">A-grade foundation</span>, capped by{" "}
              fixable hygiene.
            </>
          }
          subtitle="Grade: B / B−. The good stuff is the hard stuff — speed, content depth, credentials. The gaps are quick to close."
        />

        <FadeIn delay={0.1}>
          <div className="flex gap-2 justify-center mb-8">
            {(["working", "fixable"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  tab === t
                    ? "bg-dark text-white shadow-md"
                    : "bg-white text-gray-600 hover:text-dark border border-gray-200"
                }`}
              >
                {t === "working" ? `✓ What's working (${AUDIT_WORKING.length})` : `⚠ What's fixable (${AUDIT_FIXABLE.length})`}
              </button>
            ))}
          </div>
        </FadeIn>

        <motion.ul
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {(tab === "working" ? AUDIT_WORKING : AUDIT_FIXABLE).map((item, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 bg-white rounded-xl p-4 sm:p-5 border ${
                tab === "working" ? "border-emerald-100" : "border-amber-100"
              }`}
            >
              <span
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  tab === "working"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {tab === "working" ? "✓" : "!"}
              </span>
              <span className="text-dark text-sm sm:text-base leading-relaxed">{item}</span>
            </li>
          ))}
        </motion.ul>

        <FadeIn delay={0.2}>
          <div className="max-w-3xl mx-auto mt-10">
            <HonestCallout label="The honest framing">
              The on-site fixes are <em>table-stakes hygiene</em>. They&apos;ll lift you
              steadily, but they will <strong>not</strong> produce a dramatic spike on
              their own. The big lever is off-site — which is the next section.
            </HonestCallout>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 3 — Off-site gap
   ============================================================ */

function OffSiteGap() {
  const cards = [
    {
      title: "Google Business Profile",
      stat: "Needs verification",
      body:
        "We couldn't find a fully-optimized Google Business Profile linked from your website. GBP is the #1 entry point for local patients searching today — confirming and optimizing it is the first thing we'd check together. If it's already claimed, we build from there.",
      tone: "warn" as const,
    },
    {
      title: "Reviews — fragmented across identities",
      stat: "15 / 5.0★",
      body:
        "Your career reputation (77+ reviews, 4.7★ on Healthgrades) is attached to the wrong identity — Healthgrades miscategorizes you as Thoracic/Cardiovascular Surgery, not vein care. The 4.6★/188-review entity online belongs to your former Vein Atlanta practice.",
      tone: "warn" as const,
    },
    {
      title: "NAP inconsistency",
      stat: "3+ phone numbers",
      body:
        "Your website lists (470) 873-8115. Your treatments page lists (470) 567-9047. Old listings still show Atlanta/Sandy Springs numbers. Google penalizes practices when name/address/phone don't agree across the web.",
      tone: "warn" as const,
    },
    {
      title: "Entity confusion",
      stat: "4 identities",
      body:
        "The web currently shows four distinct \"Dr. Prevosti\" entities — Vein Atlanta, the Center for Vein Restoration affiliation, a Sandy Springs cardiothoracic surgeon, and the new Canton practice. Google and AI don't yet know that Prevosti Vein Center is the vein specialist in Canton.",
      tone: "warn" as const,
    },
  ];
  return (
    <section id="offsite" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Off-site gap"
          title={
            <>
              This is where the{" "}
              <span className="text-accent">real story</span> is.
            </>
          }
          subtitle="Four interlocking gaps. Each is fixable. Together they are the reason patients in Canton can't find you yet."
        />
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {cards.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.08}>
              <div className="h-full bg-warm-bg-alt rounded-2xl p-6 sm:p-7 border border-amber-100">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-dark font-extrabold text-lg sm:text-xl">{c.title}</h3>
                  <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {c.stat}
                  </span>
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{c.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 4 — Competitive landscape (animated bar chart + cards)
   ============================================================ */

const COMPETITORS = [
  {
    id: "ngva",
    name: "North GA Vein & Aesthetics",
    location: "Canton satellite",
    reviews: 57,
    rating: 4.9,
    strength: "Strong local SEO",
    weakness: "Diluted focus (vein + aesthetics + HRT); not a surgeon",
  },
  {
    id: "cvr",
    name: "Center for Vein Restoration",
    location: "Canton",
    reviews: 70,
    rating: 4.7,
    strength: "National chain, strong SEO, online booking",
    weakness: "Corporate feel; physician is internal-medicine-trained, not a surgeon",
  },
  {
    id: "gmtc",
    name: "Georgia Medical Treatment Center",
    location: "Canton area",
    reviews: 109,
    rating: 4.3,
    strength: "High review volume",
    weakness: "Multi-service clinic, not a vein specialist",
  },
  {
    id: "vsa",
    name: "Vascular Surgical Associates",
    location: "Canton",
    reviews: 6,
    rating: 2.7,
    strength: "Hospital-affiliated",
    weakness: "Poor reviews; veins are a sideline",
  },
];

const PREVOSTI = {
  id: "prev",
  name: "Prevosti Vein Center",
  location: "Canton (you)",
  reviews: 15,
  rating: 5.0,
  strength: "Best content depth, true pure-vein focus, surgeon-led continuity",
  weakness: "Review count — the single biggest measurable deficit",
};

function ReviewGapChart() {
  const all = [...COMPETITORS, PREVOSTI].sort((a, b) => b.reviews - a.reviews);
  const max = Math.max(...all.map((c) => c.reviews));
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-dark font-bold text-lg sm:text-xl">Google review counts</h3>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Canton area · June 2026</span>
      </div>
      <ul className="space-y-3">
        {all.map((c) => {
          const isYou = c.id === "prev";
          const pct = (c.reviews / max) * 100;
          return (
            <li key={c.id} className="flex items-center gap-3 sm:gap-4">
              <div className={`w-44 sm:w-56 text-sm sm:text-base shrink-0 ${isYou ? "font-bold text-dark" : "text-gray-700"}`}>
                {c.name}
                {isYou && <span className="ml-1.5 text-accent">●</span>}
              </div>
              <div className="flex-1 h-7 sm:h-8 bg-gray-100 rounded-md overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : { width: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`h-full ${
                    isYou
                      ? "bg-gradient-to-r from-accent to-accent-light"
                      : "bg-gray-300"
                  }`}
                />
                <span className={`absolute inset-y-0 right-2 flex items-center text-xs sm:text-sm font-bold ${isYou ? "text-white" : "text-gray-700"}`}>
                  {c.reviews}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs sm:text-sm text-gray-500 mt-5">
        Closing the review gap from 15 → 50+ is the highest-leverage move on this page.
      </p>
      <p className="text-xs text-gray-400 mt-2 italic">
        Competitor counts are approximate (aggregated, June 2026); your 15 and Vascular
        Surgical&apos;s 6 are confirmed. We&apos;ll verify all live before any work begins.
      </p>
    </div>
  );
}

function CompetitorCards() {
  const [open, setOpen] = useState<string | null>(PREVOSTI.id);
  const all = [PREVOSTI, ...COMPETITORS];
  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
      {all.map((c) => {
        const isYou = c.id === "prev";
        const isOpen = open === c.id;
        return (
          <div
            key={c.id}
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isYou
                ? "border-accent/40 bg-gradient-to-br from-blue-50 to-white"
                : "border-gray-200 bg-white"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : c.id)}
              className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isYou && (
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent">
                      You
                    </span>
                  )}
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{c.location}</span>
                </div>
                <h3 className="text-dark font-extrabold text-base sm:text-lg leading-tight">
                  {c.name}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="font-bold text-dark">{c.rating.toFixed(1)}★</span>
                  <span>·</span>
                  <span>{c.reviews} reviews</span>
                </div>
              </div>
              <span className={`text-gray-400 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 sm:px-6 pb-6 border-t border-gray-100 pt-4 space-y-3"
              >
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-emerald-700 mb-1">
                    Strength
                  </div>
                  <div className="text-sm sm:text-base text-dark">{c.strength}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-700 mb-1">
                    Weakness
                  </div>
                  <div className="text-sm sm:text-base text-gray-700">{c.weakness}</div>
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Competitive() {
  return (
    <section id="compete" className="bg-warm-bg py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Competitive landscape"
          title={
            <>
              They hold the Map Pack.{" "}
              <span className="text-accent">You hold the substance.</span>
            </>
          }
          subtitle="Every competitor in Canton has more reviews than you. You have more authority, better content, and the strongest credential in the market. The gap is fixable — and it's the single biggest lever."
        />
        <div className="space-y-8">
          <FadeIn>
            <ReviewGapChart />
          </FadeIn>
          <FadeIn delay={0.1}>
            <CompetitorCards />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 5 — Market opportunity
   ============================================================ */

const COUNTIES = ["Cherokee", "Pickens", "Dawson", "Forsyth", "Gilmer", "Lumpkin", "Fannin"];
const EXTRA_AREAS = ["Alpharetta", "Milton"];

function Market() {
  return (
    <section id="market" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Market opportunity"
          title={
            <>
              The territory is{" "}
              <span className="text-accent">structurally favorable</span>.
            </>
          }
          subtitle="Older demographic, higher-than-average income, high CVI prevalence. The constraint here is discoverability — not demand."
        />

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Territory */}
          <div className="lg:col-span-3">
            <FadeIn>
              <div className="rounded-2xl border border-gray-200 bg-warm-bg-alt p-6 sm:p-8 h-full">
                <Eyebrow tone="muted">Permitted service area</Eyebrow>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-dark mb-2">
                  North of Marietta only
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Per your legal non-compete. We do not target Atlanta or south-metro in any
                  recommendation that follows.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {COUNTIES.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-semibold"
                    >
                      {c} County
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {EXTRA_AREAS.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-full bg-white text-dark border border-gray-300 text-sm font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <FadeIn delay={0.08}>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 h-full">
                <div className="text-3xl sm:text-4xl font-extrabold text-dark tabular-nums">
                  <CountUpStat to={293} suffix="k" />
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  Cherokee Co. population
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.14}>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 h-full">
                <div className="text-3xl sm:text-4xl font-extrabold text-dark tabular-nums">
                  <CountUpStat to={41} />
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  Median age (older skew)
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 h-full">
                <div className="text-3xl sm:text-4xl font-extrabold text-dark tabular-nums">
                  $<CountUpStat to={116.5} decimals={1} />k
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  Median household (~1.4× US)
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.26}>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 h-full">
                <div className="text-3xl sm:text-4xl font-extrabold text-dark">
                  10–35%
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  Adult CVI prevalence
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 6 — Paid search reality
   ============================================================ */

const KEYWORDS = [
  { term: "chronic venous insufficiency", vol: 590, bid: "—" },
  { term: "venous insufficiency", vol: 260, bid: "$0.14–$3.39" },
  { term: "VenaSeal", vol: 10, bid: "$0.55–$11.31" },
  { term: "restless legs at night", vol: 10, bid: "—" },
  { term: "heavy tired legs", vol: 10, bid: "—" },
];

function PaidSearch() {
  return (
    <section id="paid" className="bg-dark text-white py-20 sm:py-28 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.10)_0%,_transparent_70%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          invert
          eyebrow="Paid search reality"
          title={
            <>
              Local volume is{" "}
              <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                thinner than agencies admit
              </span>
              .
            </>
          }
          subtitle="Real Google Keyword Planner data for your permitted 7-county territory. We're showing you the unflattering numbers because they're what matter."
        />

        <FadeIn>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table className="w-full text-left">
              <thead className="bg-white/[0.04] border-b border-white/10">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider uppercase text-gray-400">
                    Keyword
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider uppercase text-gray-400">
                    Avg monthly searches
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider uppercase text-gray-400">
                    Top-of-page bid
                  </th>
                </tr>
              </thead>
              <tbody>
                {KEYWORDS.map((k, i) => (
                  <tr
                    key={k.term}
                    className={`border-b border-white/5 last:border-b-0 ${i === 0 ? "bg-accent/[0.06]" : ""}`}
                  >
                    <td className="px-5 py-4 font-semibold text-white">{k.term}</td>
                    <td className="px-5 py-4 font-mono text-accent-light">{k.vol.toLocaleString()}</td>
                    <td className="px-5 py-4 text-gray-300">{k.bid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-gray-400 text-xs sm:text-sm mt-4 max-w-3xl leading-relaxed">
            Procedure terms (sclerotherapy, RFA, Varithena), &ldquo;near me&rdquo; terms, and cost
            terms fell below Google&apos;s local reporting threshold in the permitted 7-county
            territory — there isn&apos;t enough local search volume to register them. That thin
            volume is itself the finding.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-8 max-w-3xl mx-auto">
            <HonestCallout label="The honest conclusion" tone="amber">
              Paid search here is a <strong>small, precise CVI-focused bridge</strong> —
              an estimated <strong>2–5 new patients per month</strong> at a modest budget,
              a modeled <strong>~$417 cost-per-patient</strong> and a projected{" "}
              <strong>~4.3× ROAS</strong>. It is <strong>not a volume play</strong>. The real
              engine is GBP + reviews + Map Pack + organic CVI content.
            </HonestCallout>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 7 — Plan & realistic target
   ============================================================ */

const PLAN = [
  {
    n: "01",
    title: "Claim + fully optimize Google Business Profile",
    impact: "Highest",
    effort: "Low",
    body:
      "Category: Vein clinic. Photos, hours, services, posts, Q&A. The single best ROI move on this list.",
  },
  {
    n: "02",
    title: "Review generation system",
    impact: "High",
    effort: "Med",
    body:
      "Lift you from 15 reviews to 50+ — parity with competitors. Post-procedure prompts, follow-up cadence, easy review link.",
  },
  {
    n: "03",
    title: "NAP / citation cleanup + entity consolidation",
    impact: "High",
    effort: "Med",
    body:
      "One phone number everywhere. Fix the Healthgrades miscategorization. Unwind the Vein Atlanta confusion. Teach Google who you are now.",
  },
  {
    n: "04",
    title: "Own \"chronic venous insufficiency\" organically",
    impact: "High",
    effort: "Med",
    body:
      "Content hub + schema + AI-citation-ready Q&A. Your surgeon credentials = maximum authority on CVI in your market.",
  },
  {
    n: "05",
    title: "Small, CVI-focused paid search bridge",
    impact: "Medium",
    effort: "Low",
    body:
      "Tightly targeted to the CVI cluster while organic compounds. Capped by local volume — see calculator below.",
  },
  {
    n: "06",
    title: "On-site fixes (schema, FAQ, sitemap, canonicals)",
    impact: "Incremental",
    effort: "Low",
    body:
      "Quick hygiene wins. Important, but not dramatic — these compound with everything above.",
  },
];

function PlanTimeline() {
  return (
    <section id="plan" className="bg-warm-bg-alt py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Plan & realistic target"
          title={
            <>
              Six moves, ranked by{" "}
              <span className="text-accent">honest impact</span>.
            </>
          }
          subtitle="In rough order of leverage. The first three are the engine; the last three compound it."
        />
        <div className="space-y-4 sm:space-y-5">
          {PLAN.map((p, i) => (
            <FadeIn key={p.n} delay={i * 0.06}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 flex flex-col md:flex-row md:items-start gap-5 hover:border-accent/40 transition-colors">
                <div className="flex md:flex-col items-baseline md:items-center md:justify-center md:w-28 shrink-0 gap-3 md:gap-1">
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-accent">{p.n}</div>
                  <div className="md:text-center">
                    <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400">Impact</div>
                    <div className="text-sm font-bold text-dark">{p.impact}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-dark font-extrabold text-lg sm:text-xl mb-2">{p.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{p.body}</p>
                </div>
                <div className="md:w-24 md:text-right">
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400">Effort</div>
                  <div className="text-sm font-bold text-dark">{p.effort}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Realistic target callout */}
        <FadeIn delay={0.1}>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-dark to-[#0b1633] text-white p-7 sm:p-9">
              <Eyebrow tone="muted">Realistic 1–2 quarter target</Eyebrow>
              <div className="text-5xl sm:text-6xl font-extrabold mb-3">
                <span className="text-gray-400">8</span>
                <span className="mx-3 text-gray-500">→</span>
                <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                  15–20
                </span>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                New vein patients per month, driven by discoverability — not ad spend. This
                compounds over 1–2 quarters as GBP authority, reviews, and organic CVI content
                gain traction.
              </p>
            </div>
            <div>
              <HonestCallout label="The economics caveat" tone="blue">
                Per-patient economics in vein care have shifted: Medicare RFA reimbursement is
                down ~40% since 2010 (now ~$990). Volume and mix matter more than ever, which
                is why this plan focuses on patients who present with CVI severity that
                supports a full course of care — not chasing every cosmetic spider-vein lead.
              </HonestCallout>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   ROI Calculator
   ============================================================ */

function RoiCalculator() {
  const [spend, setSpend] = useState(2000);
  const [rev, setRev] = useState(1800);

  const m = useMemo(() => {
    const cpc = 4.5;
    const clicks = spend / cpc;
    const leads = clicks * 0.04;
    const consults = leads * 0.45;
    const patients = consults * 0.6;
    const revenue = patients * rev;
    const cpp = patients > 0 ? spend / patients : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    return {
      clicks: Math.round(clicks),
      leads: Math.round(leads * 10) / 10,
      consults: Math.round(consults * 10) / 10,
      patients: Math.round(patients * 10) / 10,
      revenue: Math.round(revenue),
      cpp: Math.round(cpp),
      roas: Math.round(roas * 10) / 10,
    };
  }, [spend, rev]);

  return (
    <section id="calc" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="ROI calculator"
          title={
            <>
              Move the sliders.{" "}
              <span className="text-accent">See the math.</span>
            </>
          }
          subtitle="Same model assumptions we used above: blended CPC $4.50, click→lead 4%, lead→consult 45%, consult→patient 60%."
        />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Controls */}
          <div className="bg-warm-bg-alt rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="space-y-8">
              <div>
                <label className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-600">
                    Monthly ad spend
                  </span>
                  <span className="text-2xl font-extrabold text-dark tabular-nums">
                    ${spend.toLocaleString()}
                  </span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={4000}
                  step={100}
                  value={spend}
                  onChange={(e) => setSpend(Number(e.target.value))}
                  className="w-full accent-[#2D6CDF]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$500</span>
                  <span>$4,000</span>
                </div>
              </div>
              <div>
                <label className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-600">
                    Avg revenue per patient
                  </span>
                  <span className="text-2xl font-extrabold text-dark tabular-nums">
                    ${rev.toLocaleString()}
                  </span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={50}
                  value={rev}
                  onChange={(e) => setRev(Number(e.target.value))}
                  className="w-full accent-[#2D6CDF]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$500</span>
                  <span>$5,000</span>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <HonestCallout label="Volume disclaimer" tone="amber">
                Local search volume in your permitted 7-county territory caps achievable
                spend. We&apos;d expect a budget above ~$3–4k/mo to start running into
                impression-share ceilings, not patient ceilings — the math will say
                otherwise, but the market won&apos;t cooperate.
              </HonestCallout>
            </div>
          </div>

          {/* Outputs */}
          <div className="bg-gradient-to-br from-dark to-[#0b1633] rounded-2xl p-6 sm:p-8 text-white">
            {spend > 3000 && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3">
                <span className="text-amber-300 text-lg leading-none mt-0.5">⚠</span>
                <p className="text-amber-100 text-sm leading-relaxed">
                  Above ~$3k/mo, local search volume likely can&apos;t supply enough clicks to
                  hit these numbers — the model shows the math, but the market caps the
                  impressions.
                </p>
              </div>
            )}
            <Eyebrow tone="muted">Estimated monthly outcome</Eyebrow>
            <div className="text-5xl sm:text-6xl font-extrabold mb-2 bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              {m.patients.toFixed(1)}
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-8">
              New patients / month
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { l: "Clicks", v: m.clicks.toLocaleString() },
                { l: "Leads", v: m.leads.toFixed(1) },
                { l: "Consults", v: m.consults.toFixed(1) },
                { l: "Revenue", v: `$${m.revenue.toLocaleString()}` },
                { l: "Cost per patient", v: `$${m.cpp.toLocaleString()}` },
                { l: "ROAS", v: `${m.roas.toFixed(1)}×` },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-gray-400 mb-1">
                    {s.l}
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold tabular-nums">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ENGAGEMENT & INVESTMENT
   ============================================================ */

interface PhaseCardProps {
  tag: string;
  title: string;
  price: React.ReactNode;
  priceNote?: string;
  description: string;
  bullets: React.ReactNode[];
  featured?: boolean;
}

function PhaseCard({ tag, title, price, priceNote, description, bullets, featured }: PhaseCardProps) {
  return (
    <div
      className={`relative h-full rounded-2xl p-6 sm:p-7 flex flex-col ${
        featured
          ? "bg-gradient-to-br from-[#0b1633] to-dark text-white border border-accent/40 shadow-[0_0_40px_rgba(45,108,223,0.18)]"
          : "bg-white text-dark border border-gray-200"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold tracking-[0.22em] uppercase shadow">
          Core engine
        </span>
      )}
      <div
        className={`text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase mb-3 ${
          featured ? "text-accent-light" : "text-accent"
        }`}
      >
        {tag}
      </div>
      <h3
        className={`text-xl sm:text-2xl font-extrabold tracking-tight mb-4 ${
          featured ? "text-white" : "text-dark"
        }`}
      >
        {title}
      </h3>
      <div className="mb-4">
        <div
          className={`text-4xl sm:text-5xl font-extrabold tabular-nums ${
            featured ? "text-white" : "text-dark"
          }`}
        >
          {price}
        </div>
        {priceNote && (
          <div
            className={`text-xs sm:text-sm mt-1 ${
              featured ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {priceNote}
          </div>
        )}
      </div>
      <p
        className={`text-sm sm:text-base leading-relaxed mb-5 ${
          featured ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {description}
      </p>
      <ul className="space-y-2.5 mt-auto">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                featured ? "bg-accent-light" : "bg-accent"
              }`}
            />
            <span
              className={`text-sm leading-relaxed ${
                featured ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {b}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Engagement() {
  return (
    <section id="engagement" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Engagement & Investment"
          title={
            <>
              Exactly what I&apos;d do. Exactly{" "}
              <span className="text-accent">what it costs</span>.
            </>
          }
          subtitle="No packages-within-packages, no surprise fees. The work that actually moves your patient numbers, priced to be a clear value against what premium agencies in your space charge."
        />

        {/* Phase cards */}
        <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 mt-8 lg:mt-12 items-stretch">
          <FadeIn delay={0.0}>
            <PhaseCard
              tag="One-time · First 30–45 days"
              title="Foundation Sprint"
              price="$2,000"
              priceNote="one-time"
              description="The fixable gaps, fixed. Everything that's currently capping your visibility — corrected once, properly."
              bullets={[
                "Google Business Profile claim + full optimization (category, services, photos, posts, Q&A, booking)",
                "NAP standardization across the web — lock one canonical phone/address everywhere",
                "Build accurate listings on 20+ major directories where you're currently missing",
                "Fix the Healthgrades miscategorization + claim Yelp, Vitals, Sharecare",
                "Entity consolidation — teach Google that Prevosti Vein Center is THE vein specialist in Canton",
                "On-site technical: schema suite, FAQ + FAQPage, sitemap, robots.txt, canonicals",
                <>
                  Website migration to a modern Next.js platform (details below) —{" "}
                  <em>included, no separate fee</em>
                </>,
              ]}
            />
          </FadeIn>
          <FadeIn delay={0.08}>
            <PhaseCard
              featured
              tag="Monthly · Ongoing"
              title="Growth Engine"
              price="$1,800"
              priceNote="per month"
              description="The compounding work that drives 8 → 15–20. This replaces a traditional agency retainer — and does the local-search work most aren't doing."
              bullets={[
                "Managed listings subscription (real-time sync, stays accurate everywhere)",
                "Review generation system — systematic growth from 15 toward 50+",
                "Google Business Profile management (posts, Q&A, photos, monitoring)",
                "Organic content that owns \"chronic venous insufficiency\" in your market",
                "Full website management on the new platform — fast, complete changes on demand",
                "Monthly reporting: Map Pack rank, review growth, GBP insights, new-patient attribution",
              ]}
            />
          </FadeIn>
          <FadeIn delay={0.16}>
            <PhaseCard
              tag="Monthly · Included"
              title="Paid Search Bridge"
              price="$500"
              priceNote="per month management + ad spend"
              description="The fast bridge while organic compounds. A small, precise CVI-focused campaign — see the calculator above for the realistic math."
              bullets={[
                "CVI-focused Google Ads campaign (tightly geo-targeted to your permitted territory)",
                "HIPAA-aware conversion + call tracking",
                "Ongoing optimization and reporting",
                <span key="adspend" className="text-xs sm:text-sm text-gray-500">
                  <strong className="text-dark">Note:</strong> Ad spend is paid directly to
                  Google — typically <strong className="text-dark">$1,000–2,000/mo</strong> —
                  and is separate from this management fee. You control the budget; it never
                  flows through InflowMD as markup.
                </span>,
              ]}
            />
          </FadeIn>
        </div>

        {/* Investment summary */}
        <FadeIn delay={0.12}>
          <div className="mt-10 sm:mt-14 rounded-2xl border border-gray-200 bg-warm-bg-alt p-6 sm:p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
              <div>
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">
                  First month
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-dark tabular-nums">
                  $4,300
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                  $2,000 setup + $1,800 engine + $500 paid management
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-2">
                  Ongoing monthly
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-dark tabular-nums">
                  $2,300<span className="text-base text-gray-500 font-bold">/mo</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                  + ad spend (paid directly to Google)
                </div>
              </div>
              <div className="md:border-l md:border-gray-300 md:pl-8">
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-2">
                  The framing
                </div>
                <p className="text-dark text-sm sm:text-base leading-relaxed font-medium">
                  Meaningfully less than the premium-agency tier — with the discoverability
                  work that actually moves your numbers built in.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Website migration callout — softer, reassuring */}
        <FadeIn delay={0.16}>
          <div className="mt-10 sm:mt-14 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8 md:p-10">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-blue-700 mb-3">
              About your website
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-5 leading-tight">
              You keep everything.
            </h3>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed max-w-3xl">
              <p>
                Your website is strong and you just built it. You&apos;re not losing it.
                Here&apos;s what I&apos;d do: keep your design and content exactly as they
                are, back up your current Webflow site so it&apos;s always yours, and move
                the engine underneath to a modern Next.js platform.
              </p>
              <p>
                Why? Not because your site is slow — it isn&apos;t. Because this gives us
                direct control: faster, deeper changes on demand instead of working within
                template limits. And it&apos;s built for where search is heading — AI-native,
                schema-rich, and ready to expand into new location pages the moment your
                non-compete lifts and you grow into new markets.
              </p>
              <p>
                This migration is{" "}
                <strong className="text-dark">included in your engagement</strong> — there&apos;s
                no separate website fee.{" "}
                <span className="text-gray-600">
                  (If you&apos;d prefer I simply manage your existing Webflow site as-is,
                  I can — though honestly that&apos;s the slower, more expensive option for
                  both of us.)
                </span>
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   CLOSING / CTA
   ============================================================ */

function Closing() {
  return (
    <section className="relative bg-dark py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.18)_0%,_transparent_65%)]" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <Eyebrow tone="muted">Where this goes</Eyebrow>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
            Your clinical reputation is{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              already excellent
            </span>
            . Let&apos;s teach Canton.
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Six moves, executed in the right order over 1–2 quarters, lift Prevosti Vein
            Center from invisible to the obvious choice in your permitted territory. We&apos;d
            love to walk you through the execution plan.
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="mailto:inflowmd@gmail.com?subject=Prevosti%20audit%20follow-up"
              className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-lg text-base sm:text-lg glow-blue hover:bg-accent-light transition-colors"
            >
              Let&apos;s talk about the plan →
            </a>
            <a
              href="/get-started"
              className="inline-block px-8 py-4 border border-white/20 text-white font-semibold rounded-lg text-base sm:text-lg hover:border-white/40 transition-colors"
            >
              Book a 15-minute call
            </a>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="text-gray-500 text-xs sm:text-sm mt-10 max-w-xl mx-auto">
            Audit prepared by InflowMD · June 2026 · Private document for Dr. Louis Prevosti and
            the team at Prevosti Vein Center.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function PrevostiClient() {
  return (
    <main className="bg-white">
      <Hero />
      <Thesis />
      <OnSiteAudit />
      <OffSiteGap />
      <Competitive />
      <Market />
      <PaidSearch />
      <PlanTimeline />
      <RoiCalculator />
      <Engagement />
      <Closing />
    </main>
  );
}
