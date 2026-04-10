"use client";

import FadeIn from "./FadeIn";

const steps = [
  {
    num: "01",
    title: "AI-Powered Audit",
    description:
      "We analyze your digital presence, competitors, and market opportunity using proprietary AI tools — uncovering exactly where you're losing patients online.",
    side: "left" as const,
  },
  {
    num: "02",
    title: "Custom Strategy",
    description:
      "Based on your audit results, specialty, and goals, we build a tailored growth plan with clear KPIs, timelines, and expected outcomes.",
    side: "right" as const,
  },
  {
    num: "03",
    title: "Execute & Optimize",
    description:
      "Our team implements your strategy across all channels — continuously optimizing with AI-driven insights and real-time performance data.",
    side: "left" as const,
  },
  {
    num: "04",
    title: "Report & Scale",
    description:
      "Transparent monthly reporting ties every dollar to results. As we prove ROI, we scale what works to accelerate your growth.",
    side: "right" as const,
  },
];

export default function Process() {
  return (
    <section id="process" className="py-20 bg-dark relative overflow-hidden">
      {/* Subtle background radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.08)_0%,_transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              From audit to growth
            </h2>
          </div>
        </FadeIn>

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 timeline-line hidden md:block" />

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => (
              <FadeIn
                key={step.num}
                delay={i * 0.15}
                direction={step.side === "left" ? "right" : "left"}
              >
                <div
                  className={`md:flex items-center gap-8 ${
                    step.side === "right" ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Card */}
                  <div className="md:w-[calc(50%-2rem)] bg-dark-card border border-white/10 rounded-xl p-7">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-accent font-bold text-2xl font-mono">
                        {step.num}
                      </span>
                      <h3 className="text-white text-lg font-bold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex items-center justify-center w-16">
                    <div className="w-4 h-4 rounded-full bg-accent glow-blue-sm border-2 border-dark" />
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
