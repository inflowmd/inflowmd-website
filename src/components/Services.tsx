"use client";

import FadeIn from "./FadeIn";

const services = [
  {
    title: "SEO & AI Visibility",
    description:
      "Dominate organic search and AI-generated results with strategies built for how patients actually find providers today.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="m8 11 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Website Design & Development",
    description:
      "High-converting, HIPAA-aware websites that look stunning and turn visitors into booked appointments.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </svg>
    ),
  },
  {
    title: "Google Ads Management",
    description:
      "AI-optimized pay-per-click campaigns that drive high-intent patient leads while minimizing wasted ad spend.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M2 12h20" />
        <path d="m4.93 4.93 14.14 14.14M19.07 4.93 4.93 19.07" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "Local Presence Management",
    description:
      "Ensure your practice shows up accurately across Google Maps, directories, and every local search touchpoint.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Reputation Management",
    description:
      "Monitor, respond to, and grow your online reviews to build trust and outrank competitors in your market.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Reporting & Analytics",
    description:
      "Real-time dashboards and monthly reports that tie every marketing dollar back to patient inquiries and ROI.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
              What We Do
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Full-stack growth,{" "}
              <span className="font-serif italic font-semibold">
                powered by AI
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every service is purpose-built for healthcare — no generic
              playbooks, no wasted spend.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.08}>
              <div className="group relative bg-white rounded-xl p-5 sm:p-7 border border-gray-200/80 h-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(45,108,223,0.12)]">
                {/* Gradient swipe line at top */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-5">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
