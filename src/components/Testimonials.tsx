"use client";

import FadeIn from "./FadeIn";

const testimonials = [
  {
    quote:
      "InflowMD transformed our online presence. Within 90 days, our patient inquiries increased by 180% and we had to hire two additional staff members to handle the volume. Their AI-driven approach is unlike anything I've seen in healthcare marketing.",
    name: "Dr. James Mitchell",
    role: "Vascular Surgeon",
    stars: 5,
  },
  {
    quote:
      "As a med spa owner, I was skeptical of marketing agencies — we'd been burned before. InflowMD actually delivered. Our Google rankings went from page three to the top five results, and our cost per lead dropped by 60%. They truly understand the aesthetics space.",
    name: "Dr. Rachel Torres",
    role: "Medical Spa Owner",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark">
              Trusted by leading practices
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.15}>
              <div className="bg-white rounded-xl p-5 sm:p-8 border border-gray-100 shadow-sm h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <svg
                      key={j}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="#f59e0b"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-gray-600 leading-relaxed mb-6 flex-1 font-serif italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div>
                  <p className="font-bold text-dark">{t.name}</p>
                  <p className="text-gray-400 text-sm">{t.role}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
