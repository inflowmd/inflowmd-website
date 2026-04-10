"use client";

import FadeIn from "./FadeIn";

const stats = [
  { value: "147%", label: "Avg. Increase in Patient Inquiries" },
  { value: "60-120%", label: "Monthly Growth in Patient Leads" },
  { value: "30-90", label: "Days to See Initial Lead Growth" },
  { value: "4.9★", label: "Average Client Rating" },
];

export default function Stats() {
  return (
    <section id="results" className="py-16 bg-[#1A1A2E]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold mb-1 bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
