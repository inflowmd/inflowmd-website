"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const expectations = [
  {
    title: "15-Minute Call",
    description:
      "Quick, focused, no fluff. We respect your time.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Free AI Audit",
    description:
      "We\u2019ll show you exactly where your online presence stands with a live audit.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
      </svg>
    ),
  },
  {
    title: "Custom Roadmap",
    description:
      "You\u2019ll leave with a clear plan\u00a0\u2014 whether you work with us or not.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 16l4-8 4 5 5-9" />
      </svg>
    ),
  },
];

export default function GetStartedClient() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://inflowmd.vercel.app" },
          { name: "Get Started", url: "https://inflowmd.vercel.app/get-started" },
        ]}
      />
      <Navbar />
      <main>

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,108,223,0.12)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-accent font-semibold text-sm tracking-[0.15em] uppercase mb-4">
              Get Started
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              Let&apos;s Grow{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Your Practice
              </span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Book a free strategy call. We&apos;ll review your online presence,
              identify opportunities, and show you exactly how we&apos;d help.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Two-column: Calendly + What to Expect */}
      <section className="py-16 sm:py-24 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — Calendly */}
            <FadeIn>
              <div
                className="calendly-inline-widget rounded-2xl overflow-hidden border border-gray-200 bg-white"
                data-url="https://calendly.com/inflowmd/strategy-call"
                style={{ minWidth: "320px", height: "1100px" }}
              />
            </FadeIn>

            {/* Right — What to Expect */}
            <div>
              <FadeIn delay={0.1}>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                  What to expect
                </h2>
              </FadeIn>

              <div className="space-y-6">
                {expectations.map((item, i) => (
                  <FadeIn key={item.title} delay={0.15 + i * 0.1}>
                    <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-200">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.5}>
                <p className="mt-8 text-gray-500 text-sm">
                  Questions? Email us at{" "}
                  <a
                    href="mailto:inflowmd@gmail.com"
                    className="text-accent hover:underline font-medium"
                  >
                    inflowmd@gmail.com
                  </a>
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 bg-warm-bg-alt">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
              No contracts to start. No pressure. Just a conversation about
              growing your practice.
            </p>
          </FadeIn>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
