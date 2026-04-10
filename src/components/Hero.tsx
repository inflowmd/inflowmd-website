"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const chartData = [28, 35, 32, 45, 42, 55, 52, 65, 60, 72, 68, 82];
const words = ["practice", "patients", "revenue", "rankings", "reputation"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, 500);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-block align-bottom relative min-w-[180px] sm:min-w-[300px]"
      style={{ height: "1.2em" }}
    >
      <span
        className="absolute left-0 top-0 bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent"
        style={{
          transition: "opacity 0.5s ease-in-out",
          opacity: visible ? 1 : 0,
        }}
      >
        {words[index]}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen md:h-screen overflow-hidden bg-dark pt-[100px] md:pt-[72px]">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="mesh-blob-1 absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-[#1a2a6c]/60 blur-[120px]" />
        <div className="mesh-blob-2 absolute top-1/3 right-1/4 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full bg-[#2D6CDF]/30 blur-[140px]" />
        <div className="mesh-blob-3 absolute bottom-1/4 left-1/3 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-[#4338ca]/40 blur-[100px]" />
        <div className="absolute inset-0 bg-dark/40" />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-0 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          {/* Left - Copy */}
          <div>
            <FadeIn>
              <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-4">
                AI-Powered Healthcare Marketing
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Smarter growth
                <br />
                for your <RotatingWord />
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
                We combine AI-driven strategy with deep healthcare expertise to
                help medical practices attract more patients, rank higher, and
                grow predictably — without the guesswork.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href="#cta"
                  className="px-7 py-3 bg-accent text-white font-semibold rounded-lg glow-blue hover:bg-accent-light transition-colors text-center"
                >
                  Book a Strategy Call
                </a>
                <a
                  href="#process"
                  className="px-7 py-3 border border-white/20 text-white font-semibold rounded-lg hover:border-white/40 transition-colors text-center"
                >
                  See Our Process
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right - Dashboard Mockup */}
          <FadeIn delay={0.4} direction="left">
            <div className="relative max-w-[90vw] sm:max-w-none mx-auto">
              {/* Dashboard Card */}
              <div className="bg-dark-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 dashboard-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Patient Inquiries</p>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-2xl sm:text-3xl font-bold">312</span>
                      <span className="text-green-400 text-xs sm:text-sm font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">
                        +147%
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">Last 30 days</div>
                </div>

                {/* Chart */}
                <div className="h-24 sm:h-32 flex items-end gap-1 sm:gap-1.5 mb-4 sm:mb-6">
                  {chartData.map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-accent/60 to-accent"
                    />
                  ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-dark-surface/60 rounded-lg p-2 sm:p-3">
                    <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Organic Traffic</p>
                    <p className="text-white font-bold text-sm sm:text-lg">12.4K</p>
                  </div>
                  <div className="bg-dark-surface/60 rounded-lg p-2 sm:p-3">
                    <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Conversion Rate</p>
                    <p className="text-white font-bold text-sm sm:text-lg">4.8%</p>
                  </div>
                  <div className="bg-dark-surface/60 rounded-lg p-2 sm:p-3">
                    <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Cost Per Lead</p>
                    <p className="text-white font-bold text-sm sm:text-lg">$18</p>
                  </div>
                </div>
              </div>

              {/* Floating AI Audit Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute -bottom-10 sm:-bottom-14 -left-2 sm:-left-4 bg-dark-card/95 backdrop-blur-xl border border-amber-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  >
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-xs sm:text-sm font-semibold">
                    AI Audit Complete
                  </p>
                  <p className="text-amber-400 text-[10px] sm:text-xs font-medium">
                    Score: 63/100
                  </p>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
