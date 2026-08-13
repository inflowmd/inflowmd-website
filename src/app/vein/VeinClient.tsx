"use client";

import FadeIn from "@/components/FadeIn";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ============================================================
   Reusable bits (kept local — match the existing site language)
   ============================================================ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-accent font-semibold text-xs sm:text-sm tracking-[0.22em] uppercase mb-3">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
  invert = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  invert?: boolean;
}) {
  return (
    <div className={`${centered ? "text-center mx-auto" : ""} max-w-3xl mb-12 sm:mb-16`}>
      <FadeIn>
        <Eyebrow>{eyebrow}</Eyebrow>
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
              invert ? "text-gray-400" : "text-gray-500"
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
        <div className="absolute top-1/4 left-1/4 w-[320px] h-[320px] md:w-[520px] md:h-[520px] rounded-full bg-[#1a2a6c]/50 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] md:w-[520px] md:h-[520px] rounded-full bg-[#2D6CDF]/20 blur-[140px]" />
        <div className="absolute inset-0 bg-dark/40" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <p className="text-accent font-semibold text-sm tracking-[0.22em] uppercase mb-4">
            What We Build
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-7">
            Patient-acquisition systems for{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              vein &amp; vascular
            </span>{" "}
            practices.
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-9">
            Most vein clinic websites are generic brochures that fail to build trust, communicate
            urgency, or convert. We build something different — and here&apos;s exactly how.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <a
            href="#contact"
            className="inline-block px-7 py-3.5 bg-accent text-white font-semibold rounded-lg text-base sm:text-lg glow-blue hover:bg-accent-light transition-colors"
          >
            Start a Conversation
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 1 — TECHNOLOGY
   ============================================================ */

const TECH_POINTS = [
  {
    title: "Lightning Speed",
    body:
      "Pages load near-instantly. Slow sites lose patients before they read a word, and speed directly affects Google ranking.",
    icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  },
  {
    title: "Found by AI Search",
    body:
      "The site renders fully server-side, so ChatGPT, Perplexity, and Google AI can read and recommend the practice. Most WordPress vein sites are invisible to AI search.",
    icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  },
  {
    title: "Secure & Reliable",
    body:
      "No plugins to hack, no updates that break the site. WordPress is the most-hacked platform on the web.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "Built to Scale",
    body: "New locations, services, and content add cleanly without rebuilding.",
    icon: "M3 12h4l3-9 4 18 3-9h4",
  },
];

function Technology() {
  return (
    <section className="relative py-20 sm:py-28 bg-warm-bg-alt">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Foundation"
          title={
            <>
              Built on the technology behind Netflix and Nike —{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                not WordPress
              </span>
              .
            </>
          }
          subtitle="The platform isn't a technicality. It directly affects how many patients find and trust the practice."
        />

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {TECH_POINTS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <div className="group relative bg-white rounded-xl p-6 sm:p-7 border border-gray-200/80 h-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(45,108,223,0.12)]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                </div>
                <h3 className="text-dark font-extrabold text-lg mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{p.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 2 — STRATEGY
   ============================================================ */

const STORY = [
  { num: "01", title: "Authority", body: "Establish the doctor as the expert." },
  { num: "02", title: "The Problem", body: "Varicose veins aren't cosmetic — they're progressive." },
  { num: "03", title: "The Progression", body: "Show patients where they are, and where it leads." },
  { num: "04", title: "The Stakes", body: "What happens if they wait: swelling, skin damage, ulcers." },
  { num: "05", title: "The Relief", body: "The turn: outpatient, 30 minutes, no surgery." },
  { num: "06", title: "The Proof", body: "Real results, real credentials." },
  { num: "07", title: "The First Step", body: "Remove friction to booking." },
];

function Strategy() {
  return (
    <section className="relative py-20 sm:py-28 bg-dark overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.08)_0%,_transparent_70%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          invert
          eyebrow="The Approach"
          title={
            <>
              We structure the site around the patient&apos;s journey —{" "}
              <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                not a list of services
              </span>
              .
            </>
          }
          subtitle="This narrative arc creates recognition, urgency, and relief — the three things that move a patient to call."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {STORY.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.07}>
              <div className="relative bg-dark-card border border-white/10 rounded-xl p-6 sm:p-7 h-full hover:border-accent/40 transition-colors">
                <span className="text-accent font-bold text-3xl sm:text-4xl font-mono opacity-30 absolute top-4 right-5">
                  {s.num}
                </span>
                <div className="relative z-[1]">
                  <h3 className="text-white text-lg sm:text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{s.body}</p>
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
   SECTION 3 — DESIGN
   ============================================================ */

const DESIGN_POINTS = [
  "Clean, clinical, calm aesthetic — not a strip-mall vein clinic.",
  "Custom interactive elements no competitor has.",
  "A consistent brand system that feels like a major medical center.",
  "Flawless on mobile, where most patients arrive — booking one tap away.",
];

function Design() {
  return (
    <section className="py-20 sm:py-28 bg-warm-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Craft"
          title={
            <>
              Patients equate the quality of your website with{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                the quality of your care
              </span>
              .
            </>
          }
        />
        <ul className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {DESIGN_POINTS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <li className="flex items-start gap-3 bg-white rounded-xl p-5 sm:p-6 border border-gray-200/80">
                <span className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" />
                <span className="text-dark text-sm sm:text-base leading-relaxed font-medium">
                  {p}
                </span>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 4 — INTERACTIVE TOOLS
   ============================================================ */

const TOOLS = [
  {
    label: "Symptom Checker Quiz",
    body:
      "Patients get a personalized risk assessment and a clear next step. Self-qualifies leads and creates urgency.",
    icon: "M9 11.5l2 2 4-4M5 12a7 7 0 1014 0 7 7 0 00-14 0z",
  },
  {
    label: "Vein Disease Stage Finder",
    body:
      "Helps patients locate themselves in the progression, driving the “I need to act now” moment.",
    icon: "M3 12h3l3-8 4 16 3-8h5",
  },
  {
    label: "Interactive Before & After",
    body:
      "Real outcomes as drag sliders that make the transformation tangible.",
    icon: "M8 12h8M12 8v8M3 12a9 9 0 1018 0 9 9 0 00-18 0z",
  },
];

function Tools() {
  return (
    <section className="relative py-20 sm:py-28 bg-dark overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.10)_0%,_transparent_70%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          invert
          eyebrow="Conversion"
          title={
            <>
              Passive websites inform.{" "}
              <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                Ours convert.
              </span>
            </>
          }
        />
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {TOOLS.map((t, i) => (
            <FadeIn key={t.label} delay={i * 0.1}>
              <div className="group relative bg-dark-card border border-white/10 rounded-xl p-6 sm:p-7 h-full overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(45,108,223,0.15)]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-lg bg-accent/15 text-accent-light flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={t.icon} />
                  </svg>
                </div>
                <h3 className="text-white font-extrabold text-lg sm:text-xl mb-2">{t.label}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 5 — IMAGERY & LANGUAGE
   ============================================================ */

const DETAIL_POINTS = [
  "Real clinical imagery and manufacturer-grade medical assets — not generic stock.",
  "Confident clinical language that respects the patient and creates urgency.",
  "Every credential and claim surfaced where it builds the most trust.",
];

function Details() {
  return (
    <section className="py-20 sm:py-28 bg-warm-bg-alt">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Details"
          title={
            <>
              Every image and every word{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                earns its place
              </span>
              .
            </>
          }
        />
        <ul className="space-y-4 max-w-3xl mx-auto">
          {DETAIL_POINTS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <li className="flex items-start gap-4 bg-white rounded-xl p-5 sm:p-6 border border-gray-200/80">
                <span className="mt-0.5 text-accent text-xl leading-none">✓</span>
                <span className="text-dark text-sm sm:text-base leading-relaxed">{p}</span>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 6 — SEO & AI
   ============================================================ */

const SEO_POINTS = [
  {
    title: "Complete technical SEO",
    body: "Structured data, metadata, semantic markup — everything Google needs to rank the practice.",
  },
  {
    title: "Medical schema",
    body: "Tells search engines exactly what the practice does, who it serves, and which procedures it offers.",
  },
  {
    title: "AI-citation-ready content",
    body: "Q&A built into condition pages so ChatGPT, Perplexity, and Google AI recommend the practice when patients ask.",
  },
];

function SEO() {
  return (
    <section className="relative py-20 sm:py-28 bg-dark overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.08)_0%,_transparent_70%)]" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          invert
          eyebrow="Get Found"
          title={
            <>
              Engineered to be found by Google —{" "}
              <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                and by AI
              </span>
              .
            </>
          }
        />
        <div className="space-y-4 max-w-3xl mx-auto">
          {SEO_POINTS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <div className="bg-dark-card border border-white/10 rounded-xl p-5 sm:p-6 hover:border-accent/40 transition-colors">
                <h3 className="text-white font-bold text-base sm:text-lg mb-1">{p.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{p.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CLOSING / CONTACT
   ============================================================ */

function Closing() {
  return (
    <section
      id="contact"
      className="relative py-20 sm:py-28 bg-dark overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.18)_0%,_transparent_65%)]" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <Eyebrow>The Bottom Line</Eyebrow>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
            We don&apos;t build websites. We build{" "}
            <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
              patient-acquisition systems
            </span>
            .
          </h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            Exceptional design, instant load times, modern search visibility, and tools that turn
            visitors into booked appointments — purpose-built for vein and vascular practices.
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <a
            href="mailto:clayton@inflowmd.com?subject=Vein%20practice%20website"
            className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-lg text-base sm:text-lg glow-blue hover:bg-accent-light transition-colors"
          >
            Start a Conversation →
          </a>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="text-gray-500 text-xs sm:text-sm mt-8">
            See a live example:{" "}
            <a
              href="https://floridavascularcare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Florida Vascular Care
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function VeinClient() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Technology />
        <Strategy />
        <Design />
        <Tools />
        <Details />
        <SEO />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
