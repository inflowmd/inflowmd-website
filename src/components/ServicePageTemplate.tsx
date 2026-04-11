"use client";

import FadeIn from "./FadeIn";
import FAQSchema from "./FAQSchema";

interface ServiceFeature {
  title: string;
  description: string;
  icon: string;
}

interface Step {
  num: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface ServicePageProps {
  label: string;
  title: string;
  subtitle: string;
  problemHeading: string;
  problemHighlight?: string;
  problemText: string;
  problemPoints: string[];
  features: ServiceFeature[];
  steps: Step[];
  stats: Stat[];
  faqs: FAQ[];
}

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  return (
    <FadeIn delay={index * 0.08}>
      <details className="group border border-gray-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
          <span className="text-dark font-semibold text-sm sm:text-base pr-4">{faq.q}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400 shrink-0 transition-transform group-open:rotate-180"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-500 text-sm leading-relaxed bg-white">
          {faq.a}
        </div>
      </details>
    </FadeIn>
  );
}

export default function ServicePageTemplate({
  label,
  title,
  subtitle,
  problemHeading,
  problemHighlight,
  problemText,
  problemPoints,
  features,
  steps,
  stats,
  faqs,
}: ServicePageProps) {
  const offsets = [0, 20, 40, 20];

  function renderHeading() {
    if (!problemHighlight) return problemHeading;
    const parts = problemHeading.split(problemHighlight);
    if (parts.length < 2) return problemHeading;
    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-white via-red-300 to-red-400 bg-clip-text text-transparent">
          {problemHighlight}
        </span>
        {parts[1]}
      </>
    );
  }
  return (
    <>
      <FAQSchema faqs={faqs} />
      {/* Hero */}
      <section className="relative bg-dark pt-[100px] md:pt-[120px] pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-[#1a2a6c]/50 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-[#2D6CDF]/20 blur-[140px]" />
          <div className="absolute inset-0 bg-dark/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-4">
              {label}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              {title}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              {subtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <a
              href="/get-started"
              className="inline-block px-7 py-3 bg-accent text-white font-semibold rounded-lg glow-blue hover:bg-accent-light transition-colors"
            >
              Book a Strategy Call
            </a>
          </FadeIn>
        </div>
      </section>

      {/* The Problem — Bold & Confrontational */}
      <section className="py-16 sm:py-24 bg-[#0c0c1d] relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-red-400 font-bold text-sm tracking-[0.2em] uppercase mb-6">
                Wake Up Call
              </p>
              <div className="relative inline-block">
                {/* Red glow behind heading */}
                <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />
                <h2 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight">
                  {renderHeading()}
                </h2>
              </div>
              <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mt-6">
                {problemText}
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {problemPoints.map((point, i) => (
              <FadeIn key={i} delay={0.15 + i * 0.12}>
                <div
                  className="relative rounded-xl p-5 sm:p-6 backdrop-blur-md border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.3)] h-full"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  {/* Counter number */}
                  <span className="absolute top-3 right-4 sm:right-6 text-4xl sm:text-5xl font-extrabold font-mono text-white/[0.04] select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-start gap-3 sm:gap-4 relative z-[1]">
                    {/* Gradient accent dot */}
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-orange-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    <p className="text-white text-base sm:text-lg md:text-xl font-bold leading-snug">
                      {point}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 sm:py-20 bg-warm-bg-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
                What&apos;s Included
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark">
                Everything you need to grow
              </h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="group relative bg-white rounded-xl p-5 sm:p-6 border border-gray-200/80 h-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(45,108,223,0.12)]">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                  <div className="w-11 h-11 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-dark font-extrabold mb-1.5">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
                How It Works
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                Simple, proven process
              </h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.15}>
                <div className="relative bg-dark-card border border-white/10 rounded-xl p-5 sm:p-7 h-full">
                  <span className="text-accent font-bold text-3xl sm:text-4xl font-mono opacity-30 absolute top-4 right-5">
                    {step.num}
                  </span>
                  <div className="relative z-[1]">
                    <h3 className="text-white text-lg font-bold mb-2 mt-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Results/Stats */}
      <section className="py-14 sm:py-16 bg-[#1A1A2E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-warm-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
                FAQ
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark">
                Common questions
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-16 sm:py-20 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.15)_0%,_transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Ready to grow your practice?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Book a free strategy call and discover how we can help you attract more patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-started"
                className="px-8 py-3.5 bg-accent text-white font-semibold rounded-lg text-lg glow-blue hover:bg-accent-light transition-colors"
              >
                Book a Strategy Call
              </a>
              <a
                href="/"
                className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-lg text-lg hover:border-white/40 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
