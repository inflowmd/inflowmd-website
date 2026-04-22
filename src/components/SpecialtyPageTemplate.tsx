"use client";

import FadeIn from "./FadeIn";
import FAQSchema from "./FAQSchema";
import { DEFAULT_STEPS, type SpecialtyData, type FAQ } from "@/lib/specialties";

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

export default function SpecialtyPageTemplate({ data }: { data: SpecialtyData }) {
  const steps = data.steps ?? DEFAULT_STEPS;
  const { hero, problem, solutions, proof, faqs, label } = data;

  function renderProblemHeading() {
    if (!problem.highlight) return problem.heading;
    const parts = problem.heading.split(problem.highlight);
    if (parts.length < 2) return problem.heading;
    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-white via-red-300 to-red-400 bg-clip-text text-transparent">
          {problem.highlight}
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
              {hero.title}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              {hero.subtitle}
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

      {/* Problem — Wake Up Call */}
      <section className="py-16 sm:py-24 bg-[#0c0c1d] relative overflow-hidden">
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
                <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />
                <h2 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight">
                  {renderProblemHeading()}
                </h2>
              </div>
              <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mt-6">
                {problem.text}
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {problem.points.map((point, i) => (
              <FadeIn key={i} delay={0.15 + i * 0.12}>
                <div
                  className="relative rounded-xl p-5 sm:p-6 backdrop-blur-md border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.3)] h-full"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <span className="absolute top-3 right-4 sm:right-6 text-4xl sm:text-5xl font-extrabold font-mono text-white/[0.04] select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-start gap-3 sm:gap-4 relative z-[1]">
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

      {/* Solutions — How We Solve It */}
      <section className="py-16 sm:py-20 bg-warm-bg-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
                How We Solve It
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-dark">
                Built around how patients actually choose you
              </h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {solutions.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08}>
                <div className="group relative bg-white rounded-xl p-5 sm:p-6 border border-gray-200/80 h-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(45,108,223,0.12)]">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                  <div className="w-11 h-11 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  <h3 className="text-dark font-extrabold mb-1.5">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
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

      {/* Proof — Stats + optional case study */}
      <section className="py-14 sm:py-16 bg-[#1A1A2E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {proof.stats.map((stat, i) => (
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

          {proof.disclaimer && (
            <FadeIn delay={0.4}>
              <p className="mt-6 text-center text-white/50 text-xs italic">
                {proof.disclaimer}
              </p>
            </FadeIn>
          )}

          {proof.caseStudy && (
            <FadeIn delay={0.2}>
              <div className="mt-12 sm:mt-14 max-w-3xl mx-auto">
                <div className="relative bg-dark-card border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-accent to-accent-light" />
                  <svg
                    className="text-accent/30 mb-4"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7.17 6A4.17 4.17 0 003 10.17v7.66h7.66V10.17H6.5c0-.92.75-1.67 1.67-1.67h1V6H7.17zm9 0a4.17 4.17 0 00-4.17 4.17v7.66h7.66V10.17H15.5c0-.92.75-1.67 1.67-1.67h1V6h-2z" />
                  </svg>
                  <p className="text-white/90 text-lg sm:text-xl leading-relaxed italic mb-5">
                    {proof.caseStudy.quote}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-white/10">
                    <p className="text-gray-400 text-sm">{proof.caseStudy.attribution}</p>
                    {proof.caseStudy.metric && (
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                          {proof.caseStudy.metric.value}
                        </p>
                        <p className="text-white/60 text-xs">
                          {proof.caseStudy.metric.label}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
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
    </>
  );
}
