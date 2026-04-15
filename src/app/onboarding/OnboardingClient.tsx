"use client";

import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export default function OnboardingClient() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-dark pt-[100px] md:pt-[120px] pb-12 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-[#1a2a6c]/50 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-[#2D6CDF]/20 blur-[140px]" />
            <div className="absolute inset-0 bg-dark/50" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <FadeIn>
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-4">
                Welcome Aboard
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                Let&apos;s get your practice set up
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Fill out the onboarding form below so we can tailor your growth strategy. It takes about 10 minutes.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Form Embed */}
        <section className="py-12 sm:py-16 bg-warm-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <iframe
                  src="https://www.cognitoforms.com/f/_uaaiFEytEy94LxTIBfO1w/44"
                  title="InflowMD Onboarding Form"
                  allow="payment"
                  height={799}
                  style={{ border: 0, width: "100%" }}
                />
                <Script
                  src="https://www.cognitoforms.com/f/iframe.js"
                  strategy="afterInteractive"
                />
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
