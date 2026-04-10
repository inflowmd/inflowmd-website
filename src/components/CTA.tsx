"use client";

import FadeIn from "./FadeIn";

export default function CTA() {
  return (
    <section id="cta" className="py-20 bg-dark relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-3">
            Let&apos;s Get Started
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
            Ready to grow smarter?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Get a free AI readiness audit for your practice. We&apos;ll analyze
            your online presence, competitors, and growth opportunities — no
            strings attached.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#"
              className="px-8 py-3.5 bg-accent text-white font-semibold rounded-lg glow-blue hover:bg-accent-light transition-colors text-lg"
            >
              Get Your Free AI Audit
            </a>
            <a
              href="#"
              className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-lg hover:border-white/40 transition-colors text-lg"
            >
              Schedule a Call
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
