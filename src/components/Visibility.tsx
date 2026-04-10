"use client";

import FadeIn from "./FadeIn";

const channels = [
  {
    title: "Google Search",
    description: "Rank on page one for high-intent keywords patients are searching right now.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "AI Search (GEO)",
    description: "Get recommended by ChatGPT, Gemini, and other AI tools when patients ask for providers.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 014 4c0 1.95-2 4-4 7-2-3-4-5.05-4-7a4 4 0 014-4z" />
        <path d="M12 13v9" />
        <path d="M8 18h8" />
        <circle cx="12" cy="6" r="1" />
      </svg>
    ),
  },
  {
    title: "Local Directories",
    description: "Consistent NAP data across 60+ directories, maps, and listing platforms.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Review Platforms",
    description: "Build and manage your reputation on Google, Healthgrades, Vitals, and Yelp.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Google Ads",
    description: "Capture high-intent patients at the exact moment they're searching for care.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 3h-8l-2 4h12z" />
        <path d="M12 11v6m-3-3h6" />
      </svg>
    ),
  },
];

export default function Visibility() {
  return (
    <section className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
              Omnichannel Visibility
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Be found everywhere patients are searching
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your patients are searching across multiple platforms. We make sure
              you show up — everywhere.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.slice(0, 3).map((ch, i) => (
            <FadeIn key={ch.title} delay={i * 0.1}>
              <div className="bg-dark-card border border-white/10 rounded-xl p-5 sm:p-7 card-hover h-full">
                <div className="w-14 h-14 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-5">
                  {ch.icon}
                </div>
                <h3 className="text-white text-lg font-bold mb-2">
                  {ch.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {ch.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-6 max-w-2xl mx-auto lg:max-w-none lg:grid-cols-2 lg:px-[16.67%]">
          {channels.slice(3).map((ch, i) => (
            <FadeIn key={ch.title} delay={(i + 3) * 0.1}>
              <div className="bg-dark-card border border-white/10 rounded-xl p-5 sm:p-7 card-hover h-full">
                <div className="w-14 h-14 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-5">
                  {ch.icon}
                </div>
                <h3 className="text-white text-lg font-bold mb-2">
                  {ch.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {ch.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
