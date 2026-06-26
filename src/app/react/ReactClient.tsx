"use client";

import FadeIn from "@/components/FadeIn";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ============================================================
   Atoms
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
    <div className={`${centered ? "text-center mx-auto" : ""} max-w-3xl mb-12 sm:mb-16`}>
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
              invert ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {subtitle}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */

function Hero() {
  return (
    <section className="relative bg-dark pt-[100px] md:pt-[120px] pb-20 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[320px] h-[320px] md:w-[520px] md:h-[520px] rounded-full bg-[#1a2a6c]/50 blur-[60px] md:blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] md:w-[520px] md:h-[520px] rounded-full bg-[#2D6CDF]/20 blur-[60px] md:blur-[140px]" />
        <div className="absolute inset-0 bg-dark/40" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <p className="text-accent font-semibold text-sm tracking-[0.22em] uppercase mb-4">
            The Foundation
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-7">
            We build on{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              React
            </span>{" "}
            and Next.js.
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-9">
            The same modern framework Netflix, Stripe, Notion, and the world&apos;s fastest
            sites run on. Here&apos;s what that actually means for your practice — in plain
            English, and why it changes how patients find and trust you online.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#why-it-matters"
              className="inline-block px-7 py-3.5 bg-accent text-white font-semibold rounded-lg text-base sm:text-lg glow-blue hover:bg-accent-light transition-colors"
            >
              See why it matters
            </a>
            <a
              href="/get-started"
              className="inline-block px-7 py-3.5 border border-white/20 text-white font-semibold rounded-lg text-base sm:text-lg hover:border-white/40 transition-colors"
            >
              Book a strategy call
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION — What it actually is
   ============================================================ */

function WhatItIs() {
  return (
    <section id="what" className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-5 gap-8 sm:gap-12 items-start">
          <div className="md:col-span-2">
            <FadeIn>
              <Eyebrow>In plain English</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight leading-tight">
                What React and Next.js{" "}
                <span className="text-accent">actually are</span>.
              </h2>
            </FadeIn>
          </div>
          <div className="md:col-span-3 space-y-5">
            <FadeIn delay={0.08}>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                <strong className="text-dark">React</strong> is a programming framework built by
                Meta and used by most of the modern internet — Netflix, Stripe, Notion,
                WhatsApp, Airbnb. It&apos;s the standard for how serious software is built today.
              </p>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                <strong className="text-dark">Next.js</strong> is the framework built on top of
                React, made by Vercel, that handles all the engineering work needed to ship a
                fast, secure, search-engine-ready site. It&apos;s what we use to build every
                practice site we put our name on.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Most medical websites you&apos;ve seen are built on{" "}
                <strong className="text-dark">WordPress, Webflow, Squarespace, or Wix</strong>{" "}
                — page builders designed for ease of editing, not performance or
                discoverability. Those platforms made sense ten years ago. The web has
                moved on.
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION — Why it matters (6 benefit cards)
   ============================================================ */

const BENEFITS = [
  {
    title: "Lightning-fast on every device",
    body:
      "Pages load in under a second on desktop and in 2–3 seconds on mobile — versus 8–15 seconds on a typical Webflow or WordPress site. Speed is the single biggest factor in whether a visitor stays or leaves.",
    stat: "<3s",
    statLabel: "Mobile load",
    icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  },
  {
    title: "Ready for AI search",
    body:
      "Pages render fully server-side with structured data baked in, so ChatGPT, Perplexity, Gemini, and Google AI Overviews can read and recommend your practice. Most older platforms are invisible to AI search.",
    stat: "AI-native",
    statLabel: "Built in, not bolted on",
    icon: "M12 2a4 4 0 014 4c0 1.95-2 4-4 7-2-3-4-5.05-4-7a4 4 0 014-4z M12 13v9 M8 18h8",
  },
  {
    title: "Secure by architecture",
    body:
      "No plugins to hack, no database to breach, no constant security patches to chase. The site is generated as static files served from a global CDN — there&apos;s no live attack surface for a malicious actor to target.",
    stat: "0",
    statLabel: "Plugins to patch",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "SEO-native, not bolted on",
    body:
      "Search engines see fully-rendered HTML with proper headings, schema, and metadata on every request — no JavaScript guesswork, no stale plugins. This is how Google actually wants to index a medical site.",
    stat: "Server-rendered",
    statLabel: "Every page, every time",
    icon: "M21 21l-6-6 m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    title: "Built to scale with your practice",
    body:
      "Adding a new location, a new service line, or a new condition page is a clean add — not a rebuild. The architecture is designed to grow with the practice instead of fighting it.",
    stat: "Unlimited",
    statLabel: "Pages, locations, services",
    icon: "M3 12h4l3-9 4 18 3-9h4",
  },
  {
    title: "Premium feel patients remember",
    body:
      "Smooth interactions, instant page transitions, mobile-first design, and the polish patients associate with serious medical institutions — not a strip-mall website template.",
    stat: "First impression",
    statLabel: "Trust starts here",
    icon: "M5 13l4 4L19 7",
  },
];

function WhyItMatters() {
  return (
    <section id="why-it-matters" className="bg-warm-bg-alt py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why it matters"
          title={
            <>
              Six things this gives your practice —{" "}
              <span className="text-accent">that older platforms can&apos;t</span>.
            </>
          }
          subtitle="None of these are features we paid extra for. They come standard with the framework."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {BENEFITS.map((b, i) => (
            <FadeIn key={b.title} delay={i * 0.08}>
              <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(45,108,223,0.12)]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={b.icon} />
                  </svg>
                </div>
                <h3 className="text-dark font-extrabold text-lg sm:text-xl mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-5">{b.body}</p>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-accent tabular-nums">
                    {b.stat}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {b.statLabel}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION — Old vs new comparison
   ============================================================ */

const COMPARE = [
  {
    dimension: "Mobile load time",
    old: "8–15 seconds",
    ours: "2–3 seconds",
  },
  {
    dimension: "Security maintenance",
    old: "Constant plugin updates, patches, breach risk",
    ours: "No plugins, no database, no live attack surface",
  },
  {
    dimension: "AI-search visibility",
    old: "Largely invisible to ChatGPT, Perplexity, AI Overviews",
    ours: "Server-rendered, structured-data-ready, AI-citable",
  },
  {
    dimension: "Scaling to new locations",
    old: "Manual rebuild for each location",
    ours: "Clean add — designed for it",
  },
  {
    dimension: "Hosting + uptime",
    old: "Shared hosting, slow under traffic spikes",
    ours: "Global CDN, instant everywhere, 99.99% uptime",
  },
  {
    dimension: "Design ceiling",
    old: "Template limits + page-builder constraints",
    ours: "Custom-built — your brand, your terms",
  },
];

function Compare() {
  return (
    <section className="bg-dark text-white py-20 sm:py-28 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.10)_0%,_transparent_70%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          invert
          eyebrow="Old vs. new"
          title={
            <>
              The difference{" "}
              <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                next to each other
              </span>
              .
            </>
          }
          subtitle="WordPress / Webflow / Squarespace / Wix on the left. React + Next.js on the right."
        />

        <FadeIn>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <div className="hidden md:grid md:grid-cols-3 bg-white/[0.04] border-b border-white/10">
              <div className="px-5 py-4 text-xs font-bold tracking-wider uppercase text-gray-400">
                What you&apos;re measuring
              </div>
              <div className="px-5 py-4 text-xs font-bold tracking-wider uppercase text-gray-400">
                Old platforms
              </div>
              <div className="px-5 py-4 text-xs font-bold tracking-wider uppercase text-accent-light">
                React + Next.js
              </div>
            </div>
            {COMPARE.map((c, i) => (
              <div
                key={c.dimension}
                className={`grid md:grid-cols-3 ${i !== COMPARE.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="px-5 py-4 sm:py-5">
                  <div className="md:hidden text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                    Measuring
                  </div>
                  <div className="text-white font-semibold">{c.dimension}</div>
                </div>
                <div className="px-5 py-4 sm:py-5 bg-white/[0.02]">
                  <div className="md:hidden text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                    Old platforms
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">{c.old}</div>
                </div>
                <div className="px-5 py-4 sm:py-5 bg-accent/[0.06]">
                  <div className="md:hidden text-[10px] font-bold tracking-wider uppercase text-accent-light mb-1">
                    React + Next.js
                  </div>
                  <div className="text-white text-sm sm:text-base font-medium">{c.ours}</div>
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
   SECTION — Why this matters NOW
   ============================================================ */

function WhyNow() {
  return (
    <section className="bg-warm-bg py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why now"
          title={
            <>
              Search is changing{" "}
              <span className="text-accent">faster than most practices realize</span>.
            </>
          }
        />
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          <FadeIn delay={0.0}>
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 h-full">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-2">
                Then
              </div>
              <h3 className="text-dark font-extrabold text-lg sm:text-xl mb-3">2015–2022</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Patients searched on Google. Your site loaded eventually. WordPress + a few
                plugins got you on page one. Speed was nice to have.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 h-full">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-2">
                Now
              </div>
              <h3 className="text-dark font-extrabold text-lg sm:text-xl mb-3">2023–2026</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Patients ask ChatGPT, Perplexity, and Google AI Overviews for a recommendation
                before they ever click a link. They search on phones. They leave after 3
                seconds. Speed and AI-readiness are the bar.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.16}>
            <div className="rounded-2xl p-6 sm:p-7 border-2 border-accent/40 bg-gradient-to-br from-blue-50 to-white h-full">
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-2">
                Why this stack
              </div>
              <h3 className="text-dark font-extrabold text-lg sm:text-xl mb-3">
                Built for what&apos;s next
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                React + Next.js is the modern foundation built for this version of the
                internet — not retrofitted from the last one. That&apos;s why we use it for
                every practice we put our name on.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA
   ============================================================ */

function CTA() {
  return (
    <section className="relative bg-dark py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.18)_0%,_transparent_65%)]" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <Eyebrow tone="muted">The bottom line</Eyebrow>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
            We don&apos;t build websites. We build{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              patient-acquisition systems
            </span>{" "}
            on a foundation that&apos;s ready for what&apos;s next.
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            If you want to see the difference in person — including a free PageSpeed
            comparison of your current site — let&apos;s talk.
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="/get-started"
              className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-lg text-base sm:text-lg glow-blue hover:bg-accent-light transition-colors"
            >
              Book a strategy call →
            </a>
            <a
              href="/pricing"
              className="inline-block px-8 py-4 border border-white/20 text-white font-semibold rounded-lg text-base sm:text-lg hover:border-white/40 transition-colors"
            >
              See pricing
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function ReactClient() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhatItIs />
        <WhyItMatters />
        <Compare />
        <WhyNow />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
