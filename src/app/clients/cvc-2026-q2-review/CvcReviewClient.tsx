"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ============================================================
   Shared atoms
   ============================================================ */

function Eyebrow({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "muted" }) {
  return (
    <p
      className={`font-semibold text-[10px] sm:text-xs tracking-[0.28em] uppercase mb-3 ${
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
  centered = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={`${centered ? "text-center mx-auto" : ""} max-w-3xl mb-12 sm:mb-16`}>
      <FadeIn>
        <Eyebrow tone="muted">{eyebrow}</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.06}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
          {title}
        </h2>
      </FadeIn>
      {subtitle && (
        <FadeIn delay={0.12}>
          <p className="text-base sm:text-lg leading-relaxed mt-5 text-gray-400">
            {subtitle}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

function CountUp({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1600,
  format,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [v, setV] = useState<number>(to); // default to the real value
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

  const shown = format ? format(v) : decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ============================================================
   1 — HERO
   ============================================================ */

function Hero() {
  return (
    <section className="relative bg-dark pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[520px] md:h-[520px] rounded-full bg-[#1a2a6c]/50 blur-[60px] md:blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full bg-[#2D6CDF]/20 blur-[60px] md:blur-[140px]" />
        <div className="absolute inset-0 bg-dark/40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              ● Confidential
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs backdrop-blur">
              Prepared by InflowMD
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] sm:text-xs backdrop-blur">
              July 2026
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-accent font-semibold text-xs sm:text-sm tracking-[0.22em] uppercase mb-5">
            Digital Performance Review — Prepared for Comprehensive Vein Care
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 max-w-5xl">
            Q2 2026:{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              Your growth is underway
            </span>
            .
          </h1>
        </FadeIn>
        <FadeIn delay={0.28}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
            Dr. Subhajit Datta · Marion, Ohio · Prepared July 2026 by InflowMD
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   2A — BASELINE (Where We Started) — visually muted on purpose
   ============================================================ */

const BASELINE_TRAFFIC = [
  { month: "Jul '25", visitors: 743 },
  { month: "Aug '25", visitors: 344 },
  { month: "Sep '25", visitors: 1493 },
  { month: "Oct '25", visitors: 1386 },
  { month: "Nov '25", visitors: 1136 },
  { month: "Dec '25", visitors: 1151 },
  { month: "Jan '26", visitors: 1213 },
];

function Baseline() {
  return (
    <section className="bg-[#0a0a12] py-16 sm:py-20 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-10 sm:mb-12">
            <p className="font-semibold text-[10px] sm:text-xs tracking-[0.28em] uppercase mb-3 text-gray-500">
              Where we started
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.15] text-gray-300">
              Traffic, but no trajectory.
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4 sm:p-6 md:p-8">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-gray-400 font-semibold text-sm sm:text-base">
                Monthly unique visitors
              </h3>
              <span className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wider">
                Jul 2025 – Jan 2026
              </span>
            </div>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={BASELINE_TRAFFIC}
                  margin={{ top: 20, right: 12, left: 12, bottom: 4 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.55)"
                    tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                    tickLine={false}
                  />
                  {/* Y-axis intentionally removed — chart reads as a pure trend sparkline;
                      no absolute numbers, no hover values, no dot labels. */}
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={2}
                    dot={{
                      fill: "rgba(255,255,255,0.4)",
                      r: 4,
                      strokeWidth: 1,
                      stroke: "rgba(255,255,255,0.15)",
                    }}
                    activeDot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-4 italic text-center">
              Pre-upgrade baseline — server log data (the only measurement that existed).
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-2 italic text-center max-w-2xl mx-auto leading-relaxed">
              Server logs count all requests, including significant automated and crawler
              traffic — shown here for trend only, not comparable to the Google-verified
              patient metrics below.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="mt-8 sm:mt-10 max-w-3xl mx-auto text-center text-sm sm:text-base text-gray-400 leading-relaxed">
            Before April 2026, the site had traffic but no trajectory — and no real
            measurement. The service upgrade installed{" "}
            <span className="text-gray-200 font-semibold">
              professional-grade analytics
            </span>{" "}
            (Google Search Console, conversion tracking) and began the growth work.
            Everything below is what&apos;s happened since.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   2 — HEADLINE METRICS
   ============================================================ */

const HEADLINE_METRICS = [
  { v: 85, l: "Phone calls from Google", note: "Feb–Jun 2026" },
  { v: 310, l: "Direction requests", note: "Feb–Jun 2026" },
  {
    v: 120,
    l: "Call growth",
    note: "Feb → Jun",
    special: "pct",
  },
  { v: 33, l: "Click growth in June", note: "vs. May", special: "pct-plus" },
  {
    v: 1,
    l: "Google position",
    note: "“Dr. Datta Marion Ohio”",
    special: "hash",
  },
  { v: 10529, l: "Google impressions", note: "since April" },
];

function HeadlineMetrics() {
  return (
    <section className="bg-dark py-16 sm:py-24 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {HEADLINE_METRICS.map((m, i) => (
            <FadeIn key={m.l} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-none tabular-nums">
                  {m.special === "hash" && <span className="text-accent-light">#</span>}
                  {m.special === "pct-plus" && <span className="text-accent-light">+</span>}
                  <CountUp to={m.v} />
                  {(m.special === "pct" || m.special === "pct-plus") && (
                    <span className="text-accent-light">%</span>
                  )}
                  {m.special === "pct" && m.v === 120 && (
                    <span className="text-accent-light text-2xl sm:text-3xl ml-1">↑</span>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider mt-3 leading-snug">
                  {m.l}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 mt-1">{m.note}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3 — PATIENT ACTIONS (GBP monthly bar chart)
   ============================================================ */

const PATIENT_ACTIONS = [
  { month: "Feb", calls: 10, dirs: 55, web: 18, total: 83 },
  { month: "Mar", calls: 17, dirs: 61, web: 19, total: 97 },
  { month: "Apr", calls: 21, dirs: 69, web: 25, total: 115 },
  { month: "May", calls: 14, dirs: 32, web: 15, total: 61 },
  { month: "Jun", calls: 22, dirs: 92, web: 14, total: 128 },
];

function PatientActionsChart() {
  return (
    <section className="bg-dark py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Google Business Profile · Patient actions"
          title={
            <>
              Patients are finding you —{" "}
              <span className="text-accent-light">and acting.</span>
            </>
          }
          subtitle="Every call, direction request, and website click below is a real patient making a real move — sourced directly from your Google Business Profile insights."
        />

        <FadeIn>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 sm:p-6 md:p-8">
            <div className="h-72 sm:h-80 md:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PATIENT_ACTIONS} margin={{ top: 20, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(11,22,51,0.95)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    cursor={{ fill: "rgba(45,108,223,0.08)" }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      paddingTop: 10,
                    }}
                  />
                  <Bar dataKey="calls" name="Calls" fill="#2D6CDF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dirs" name="Directions" fill="#4F8EF7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="web" name="Website clicks" fill="#93B6FC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Totals row */}
            <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-4 pt-5 border-t border-white/10">
              {PATIENT_ACTIONS.map((r) => (
                <div key={r.month} className="text-center">
                  <div
                    className={`text-lg sm:text-2xl md:text-3xl font-extrabold tabular-nums ${
                      r.month === "Jun" ? "text-accent-light" : "text-white"
                    }`}
                  >
                    {r.total}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                    {r.month} total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="mt-6 rounded-2xl border-2 border-accent/40 bg-accent/[0.06] p-5 sm:p-6 text-center max-w-3xl mx-auto">
            <p className="text-accent-light font-bold text-sm sm:text-base tracking-wide">
              JUNE WAS YOUR BEST MONTH ON RECORD.
            </p>
            <p className="text-gray-300 text-sm sm:text-base mt-2 leading-relaxed">
              128 total patient actions — more than double May, and a new all-time high.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   4 — SEARCH GROWTH (GSC line chart + highlights)
   ============================================================ */

const SEARCH_CLICKS = [
  { month: "Apr", clicks: 39 },
  { month: "May", clicks: 39 },
  { month: "Jun", clicks: 52 },
];

function SearchGrowth() {
  return (
    <section className="bg-[#080814] py-20 sm:py-28 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Google Search Console"
          title={
            <>
              Google is{" "}
              <span className="text-accent-light">responding</span>.
            </>
          }
          subtitle="Click growth accelerating into June — with a much bigger opportunity queued up right behind it."
        />

        <div className="space-y-6 sm:space-y-8">
          {/* Line chart — full width */}
          <FadeIn>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 sm:p-6 md:p-8">
              {/* Header — title on its own line, date range as a small tag below */}
              <div className="mb-5">
                <h3 className="text-white font-bold text-sm sm:text-base leading-snug">
                  Google search clicks / month
                </h3>
                <span className="inline-block mt-1.5 text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
                  Apr–Jun 2026
                </span>
              </div>

              {/* Two-column layout on desktop: BIG chart on the left, stats on the right.
                  Stacks vertically on mobile. Chart gets ~2/3 of the card at lg+, so at
                  the full container width (max-w-6xl) the chart itself is ~700-800px
                  wide — more than half the viewport at any reasonable desktop size. */}
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-2 h-72 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SEARCH_CLICKS} margin={{ top: 12, right: 20, left: 8, bottom: 12 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fontSize: 13, fill: "rgba(255,255,255,0.6)" }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                        tickMargin={12}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                        tickMargin={10}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(11,22,51,0.95)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#4F8EF7"
                        strokeWidth={3}
                        dot={{ fill: "#4F8EF7", r: 6, strokeWidth: 2, stroke: "#0b1633" }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats column — vertical stack, no collisions at any breakpoint */}
                <div className="flex flex-col divide-y divide-white/[0.06] lg:pl-6 lg:border-l lg:border-white/10 lg:divide-y-0 lg:space-y-6">
                  <div className="flex items-baseline justify-between gap-4 py-3 lg:py-0 first:pt-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums leading-none">
                      <CountUp to={10529} />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider text-right">
                      Impressions
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3 lg:py-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums leading-none">
                      <CountUp to={1.3} decimals={1} suffix="%" />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider text-right">
                      Avg CTR
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3 lg:py-0 last:pb-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums leading-none">
                      <CountUp to={133} />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider text-right">
                      Clicks since April
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Highlight cards — 3 across on desktop, stacked on mobile */}
          <div className="grid md:grid-cols-3 gap-4">
            <FadeIn delay={0.08}>
              <div className="rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/[0.12] to-transparent p-5 sm:p-6 h-full">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light">
                    Position
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums leading-none">
                    1.0
                  </span>
                </div>
                <div className="text-white font-semibold text-sm sm:text-base mb-1">
                  &ldquo;dr datta marion ohio&rdquo;
                </div>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Patients searching for you by name find you instantly.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.14}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 h-full">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-400">
                    Position
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums leading-none">
                    2.7
                  </span>
                </div>
                <div className="text-white font-semibold text-sm sm:text-base mb-1">
                  &ldquo;venous insufficiency&rdquo;
                </div>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Ranking on page 1 for the term your ideal patients search.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/[0.06] p-5 sm:p-6 h-full">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-300">
                    Impressions
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums leading-none">
                    4,451
                  </span>
                </div>
                <div className="text-white font-semibold text-sm sm:text-base mb-1">
                  Your &ldquo;heavy legs&rdquo; article
                </div>
                <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                  Currently position 24 — one push from page 1. This is our next lever.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={0.15}>
          <p className="max-w-4xl mx-auto text-center text-xs sm:text-sm text-gray-500 leading-relaxed mt-8 italic">
            Note: measurement tools (Google Search Console) were installed in April 2026 as
            part of the service upgrade — this is the first quarter with true search-visibility
            data. Prior-year server logs showed flat traffic with no growth trend under the
            previous setup.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   5 — ROI SECTION
   ============================================================ */

const ROI_ROWS = [
  { label: "Conservative", calls: 2, low: 6000, high: 16000, accent: false },
  { label: "Realistic", calls: 5, low: 15000, high: 40000, accent: true },
  { label: "Strong", calls: 10, low: 30000, high: 80000, accent: false },
];

function ROI() {
  return (
    <section className="bg-dark py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="What it means in dollars"
          title={
            <>
              What the numbers mean in{" "}
              <span className="text-accent-light">patient value</span>.
            </>
          }
          subtitle="A treated CVI patient represents $3,000–$8,000 in treatment value across a full bilateral course (industry/CMS-based figures)."
        />

        <FadeIn>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden mb-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-0 bg-white/[0.03] px-4 sm:px-6 py-3 border-b border-white/10">
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-400 hidden sm:block">
                Scenario
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                If X of 85 calls
                <br className="sm:hidden" /> become patients
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-400 text-right">
                Low estimate
              </div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-400 text-right">
                High estimate
              </div>
            </div>
            {ROI_ROWS.map((r, i) => (
              <div
                key={r.label}
                className={`grid grid-cols-3 sm:grid-cols-4 gap-0 px-4 sm:px-6 py-4 sm:py-5 items-center ${
                  i < ROI_ROWS.length - 1 ? "border-b border-white/5" : ""
                } ${r.accent ? "bg-accent/[0.08]" : ""}`}
              >
                <div className="hidden sm:block">
                  <div className={`text-[10px] font-bold tracking-[0.22em] uppercase ${r.accent ? "text-accent-light" : "text-gray-400"}`}>
                    {r.label}
                  </div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${r.accent ? "text-white" : "text-white"}`}>
                    {r.calls}
                  </div>
                  <div className="sm:hidden text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                    {r.label}
                  </div>
                </div>
                <div className={`text-lg sm:text-xl md:text-2xl font-extrabold text-right tabular-nums ${r.accent ? "text-accent-light" : "text-gray-200"}`}>
                  ${r.low.toLocaleString()}
                </div>
                <div className={`text-lg sm:text-xl md:text-2xl font-extrabold text-right tabular-nums ${r.accent ? "text-accent-light" : "text-gray-200"}`}>
                  ${r.high.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/[0.10] to-transparent p-5 sm:p-7 text-center">
            <p className="text-white text-base sm:text-lg leading-relaxed">
              <strong className="text-accent-light">
                Even the most conservative scenario covers the annual marketing investment
                several times over.
              </strong>
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed">
              85 calls in 5 months came directly from your Google presence. These are our
              real, measurable, attributable inputs.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   6 — MARKET POSITION
   ============================================================ */

/**
 * Reviews-gap bars — uses the same "default to the target value, animate
 * from 0 → target only when in view" pattern as CountUp and GaugeRing so
 * bars are always populated even if the intersection observer never fires
 * (matches the mobile-safe pattern used elsewhere on this page). Replaces
 * the earlier motion whileInView + negative-margin viewport combo, which
 * was leaving both bars at width: 0.
 */
function ReviewsGapBars() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });

  // Bar widths as % of the shared max (86)
  const YOU_PCT = (10 / 86) * 100;
  const COMP_PCT = 100;

  return (
    <div ref={containerRef} className="space-y-3 mb-5">
      {/* You */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-white text-sm font-semibold">
            Comprehensive Vein Care (you)
          </span>
          <span className="text-white font-extrabold tabular-nums text-sm sm:text-base">
            10
          </span>
        </div>
        <div className="h-6 sm:h-7 rounded bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light origin-left"
            style={{
              width: `${YOU_PCT}%`,
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      {/* Competitors */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-gray-300 text-sm">
            Columbus competitors (up to)
          </span>
          <span className="text-red-300 font-extrabold tabular-nums text-sm sm:text-base">
            86+
          </span>
        </div>
        <div className="h-6 sm:h-7 rounded bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500/60 to-red-400/60 origin-left"
            style={{
              width: `${COMP_PCT}%`,
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MarketPosition() {
  return (
    <section className="bg-[#080814] py-20 sm:py-28 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Market position"
          title={
            <>
              An <span className="text-accent-light">uncontested position</span> —{" "}
              for now.
            </>
          }
          subtitle="You are the only dedicated vein clinic in Marion County. That advantage is real, but it isn't guaranteed to last — and the review gap is the fastest way we lose it."
        />

        {/* Advantage stats */}
        <FadeIn>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                <CountUp to={65000} />
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-2">
                Marion County
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                120–150k
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-2">
                Effective catchment (Morrow, Wyandot, Crawford, Hardin fringes)
              </div>
            </div>
            <div className="rounded-2xl border-2 border-accent/40 bg-accent/[0.06] p-5 sm:p-6">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">
                8,000–13,000
              </div>
              <div className="text-[10px] sm:text-xs text-accent-light uppercase tracking-wider mt-2">
                Adults w/ symptomatic CVI in catchment
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Advantage callout */}
        <FadeIn delay={0.08}>
          <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/[0.06] p-5 sm:p-7 mb-6">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-emerald-300 mb-2">
              Your structural advantage
            </div>
            <p className="text-white text-sm sm:text-base leading-relaxed">
              <strong>Patients can self-refer to you.</strong> OhioHealth requires a PCP
              referral. When a patient searches &ldquo;vein doctor near me&rdquo; on their
              phone and finds you, they can book directly. That&apos;s a real gate the
              competition has to jump through — and you don&apos;t.
            </p>
          </div>
        </FadeIn>

        {/* Threats */}
        <FadeIn delay={0.14}>
          <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/[0.06] p-5 sm:p-7 mb-8">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-300 mb-3">
              The threats we&apos;re watching
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-amber-100 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>
                  <strong className="text-white">OhioHealth&apos;s $8.7M, 12-provider
                  vascular clinic in Marion</strong> opened in 2024. Their PCP-referral
                  requirement slows them but doesn&apos;t stop them.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>
                  <strong className="text-white">Columbus vein chains</strong> (Center for
                  Vein Restoration, Ohio Vein &amp; Vascular) are running &ldquo;free
                  screening&rdquo; funnels at the southern edge of your catchment.
                </span>
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Reviews gap — visual bar comparison */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border-2 border-red-400/40 bg-red-500/[0.06] p-5 sm:p-7">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-red-300 mb-2">
              The reviews gap
            </div>
            <h3 className="text-white font-extrabold text-xl sm:text-2xl mb-5 leading-tight">
              Reviews are the #1 driver of local ranking and call conversion.
            </h3>

            <ReviewsGapBars />


            <div className="text-sm text-gray-300 mb-4">
              <strong className="text-red-300">Zero new reviews in the last 3 months.</strong>{" "}
              This is our highest-impact, lowest-effort lever.
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   7 — 90-DAY PLAN
   ============================================================ */

const PLAN_ITEMS = [
  {
    title: "Automated review generation system",
    body:
      "Post-visit SMS/email requests. Target 4–8 new reviews per month with a 90-day goal of 30+ new reviews.",
    status: "next" as const,
    accent: true,
  },
  {
    title: "Push the “heavy legs” article to page 1",
    body:
      "4,451 impressions currently waiting at position 24. This is the highest-signal keyword ready to move.",
    status: "next" as const,
  },
  {
    title: "Google Business Profile alignment + citation cleanup",
    body:
      "Consistent name, address, and phone across every major directory. Removes contradictions Google penalizes.",
    status: "next" as const,
  },
  {
    title: "Patient-conversion tracking now live",
    body:
      "From this month forward we measure actual patient inquiries — calls and form fills — not just traffic. Every marketing dollar becomes attributable.",
    status: "done" as const,
  },
  {
    title: "Full technical audit completed this week",
    body: "All findings fixed same-day. No open items.",
    status: "done" as const,
  },
];

function NinetyDayPlan() {
  return (
    <section className="bg-dark py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="What happens next"
          title={
            <>
              The <span className="text-accent-light">90-day plan</span>.
            </>
          }
          subtitle="Five moves. Each one moves the needle on a specific metric above."
        />
        <div className="space-y-4">
          {PLAN_ITEMS.map((p, i) => {
            const isDone = p.status === "done";
            return (
              <FadeIn key={p.title} delay={i * 0.06}>
                <div
                  className={`rounded-2xl p-5 sm:p-6 flex items-start gap-4 sm:gap-5 border ${
                    p.accent
                      ? "border-accent/40 bg-gradient-to-br from-accent/[0.10] to-transparent"
                      : isDone
                        ? "border-emerald-400/25 bg-emerald-500/[0.04]"
                        : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-extrabold ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/60"
                        : "bg-transparent text-accent-light border-2 border-accent/50"
                    }`}
                  >
                    {isDone ? "✓" : "○"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug">
                        {p.title}
                      </h3>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full ${
                          isDone
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                            : "bg-accent/15 text-accent-light border border-accent/40"
                        }`}
                      >
                        {isDone ? "Done" : "Next"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8 — MILESTONE TARGETS
   ============================================================ */

const MILESTONES = [
  {
    label: "90 days",
    items: ["30+ reviews", "100+ clicks / mo", "25+ GBP calls / mo"],
  },
  {
    label: "9 months",
    items: [
      "50+ reviews",
      "150–200 clicks / mo",
      "10–15 digital new patients / mo",
    ],
  },
  {
    label: "18 months",
    items: [
      "100+ reviews",
      "300+ clicks / mo",
      "20+ digital new patients / mo",
    ],
  },
];

function Milestones() {
  return (
    <section className="bg-[#080814] py-20 sm:py-28 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Milestone targets"
          title={
            <>
              Where this is{" "}
              <span className="text-accent-light">headed</span>.
            </>
          }
          subtitle="Compounding growth. Each stage builds on the metrics from the one before."
        />

        <div className="relative">
          {/* Center connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30 mx-16" />

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {MILESTONES.map((m, i) => (
              <FadeIn key={m.label} delay={i * 0.1}>
                <div className="relative">
                  {/* Dot */}
                  <div className="hidden md:block absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_16px_rgba(45,108,223,0.6)] ring-4 ring-dark" />
                  </div>
                  <div
                    className={`rounded-2xl border ${
                      i === 1
                        ? "border-accent/40 bg-gradient-to-br from-accent/[0.10] to-transparent"
                        : "border-white/10 bg-white/[0.03]"
                    } p-5 sm:p-6 mt-8 md:mt-6`}
                  >
                    <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light mb-2">
                      {m.label}
                    </div>
                    <ul className="space-y-2">
                      {m.items.map((it) => (
                        <li
                          key={it}
                          className="text-white text-sm sm:text-base font-semibold flex items-start gap-2"
                        >
                          <span className="text-accent-light mt-0.5">→</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   9 — NEXT-LEVEL REBUILD
   ============================================================ */

function GaugeRing({ score, label, tone }: { score: number; label: string; tone: "red" | "emerald" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [display, setDisplay] = useState(score);
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current) return;
    animated.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setDisplay(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, score]);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = display / 100;
  const dashOffset = circumference - pct * circumference;
  const stroke = tone === "red" ? "#ef4444" : "#10b981";
  const textColor = tone === "red" ? "text-red-400" : "text-emerald-400";

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} strokeWidth="10" stroke="rgba(255,255,255,0.08)" fill="none" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="10"
            stroke={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ filter: `drop-shadow(0 0 8px ${stroke}88)`, transition: "stroke-dashoffset 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${textColor}`}>
            {display}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold">/ 100</span>
        </div>
      </div>
      <div className="text-sm sm:text-base text-white font-semibold mt-3 text-center">{label}</div>
    </div>
  );
}

const REBUILD_PROBLEMS = [
  {
    kicker: "Speed",
    problem:
      "Your mobile experience scores 75/100 and takes 4.7 seconds to load — most of your patients are 50+ searching on phones.",
    solution:
      "The rebuild: 95+ scores, ~1 second loads. Same design, modern engine underneath.",
    gauge: true,
  },
  {
    kicker: "Visibility",
    problem:
      "Google currently indexes fewer than half your pages due to how the old platform structures them.",
    solution:
      "The rebuild's architecture makes every page findable and rankable — server-rendered HTML, proper heading hierarchy, clean sitemap.",
  },
  {
    kicker: "AI-search readiness",
    problem:
      "Patients increasingly ask ChatGPT and Google AI “who's the best vein doctor near me.” Your content is good enough to be the answer — but the site lacks the medical structured data AI engines read.",
    solution:
      "The rebuild ships with it natively: your credentials, treatments, and location machine-readable via MedicalClinic, Physician, and FAQ schema.",
  },
];

function NextLevel() {
  return (
    <section className="bg-dark py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="The next chapter"
          title={
            <>
              Removing the ceiling:{" "}
              <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                the next-generation rebuild
              </span>
              .
            </>
          }
          subtitle="Your current WordPress platform has structural limits no amount of optimization removes. Here's what the rebuild changes — and why the growth plan compounds faster on top of it."
        />

        <div className="space-y-6 sm:space-y-8">
          {REBUILD_PROBLEMS.map((r, i) => (
            <FadeIn key={r.kicker} delay={i * 0.08}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 sm:p-8">
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent-light mb-4">
                  {r.kicker}
                </div>

                {r.gauge ? (
                  <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="rounded-xl border border-red-400/30 bg-red-500/[0.06] p-4">
                          <div className="text-[10px] font-bold tracking-wider uppercase text-red-300 mb-1">
                            Current site
                          </div>
                          <p className="text-white text-sm sm:text-base leading-snug">
                            <strong>75/100</strong> mobile · <strong>4.7s</strong> load
                          </p>
                        </div>
                        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/[0.06] p-4">
                          <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-300 mb-1">
                            Rebuilt
                          </div>
                          <p className="text-white text-sm sm:text-base leading-snug">
                            <strong>95+</strong> mobile · <strong>~1s</strong> load
                          </p>
                        </div>
                      </div>
                      <p className="text-white text-sm sm:text-base leading-relaxed mt-4">
                        <strong className="text-white">Speed problem:</strong>{" "}
                        <span className="text-gray-300">{r.problem}</span>
                      </p>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-2">
                        <strong className="text-accent-light">The rebuild:</strong>{" "}
                        {r.solution}
                      </p>
                    </div>
                    <div className="lg:col-span-2 flex items-center justify-around gap-4 pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-6">
                      <GaugeRing score={75} label="Current" tone="red" />
                      <div className="text-gray-500 text-xl">→</div>
                      <GaugeRing score={95} label="Rebuilt" tone="emerald" />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white text-sm sm:text-base leading-relaxed mb-3">
                      <strong>{r.kicker} problem:</strong>{" "}
                      <span className="text-gray-300">{r.problem}</span>
                    </p>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      <strong className="text-accent-light">The rebuild:</strong>{" "}
                      {r.solution}
                    </p>
                  </>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.16}>
          <div className="mt-8 sm:mt-10 rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/[0.10] to-transparent p-6 sm:p-8 text-center">
            <p className="text-white text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              <strong className="text-accent-light">
                The rebuild doesn&apos;t replace the growth plan — it&apos;s what lets the
                growth plan compound.
              </strong>{" "}
              Same content, modern engine, delivered in weeks.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   10 — FOOTER CTA
   ============================================================ */

function FooterCTA() {
  return (
    <section className="relative bg-dark py-20 sm:py-28 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.14)_0%,_transparent_65%)]" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <Eyebrow tone="muted">Where we go from here</Eyebrow>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            Let&apos;s talk through{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              this together
            </span>
            .
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <a
            href="mailto:clayton@inflowmd.com?subject=Q2%20review%20follow-up"
            className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-lg text-base sm:text-lg glow-blue hover:bg-accent-light transition-colors"
          >
            clayton@inflowmd.com
          </a>
        </FadeIn>
        <FadeIn delay={0.24}>
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-col items-center gap-2">
            <p className="text-accent font-bold text-lg sm:text-xl tracking-[0.18em]">
              InflowMD
            </p>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-[0.22em]">
              Prepared exclusively for Comprehensive Vein Care · Confidential
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function CvcReviewClient() {
  return (
    <main className="bg-dark min-h-screen">
      <Hero />
      <Baseline />
      <HeadlineMetrics />
      <PatientActionsChart />
      <SearchGrowth />
      <ROI />
      <MarketPosition />
      <NinetyDayPlan />
      <Milestones />
      <NextLevel />
      <FooterCTA />
    </main>
  );
}
