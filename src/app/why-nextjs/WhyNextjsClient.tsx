"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

/* ============================================================
   HERO
   ============================================================ */
function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-black overflow-hidden px-4 sm:px-6">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-[#2D6CDF]/30 blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#1a2a6c]/40 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-accent font-semibold tracking-[0.25em] uppercase text-xs sm:text-sm mb-6"
        >
          A Technology Briefing
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.02] tracking-tight mb-8"
        >
          Why We Build{" "}
          <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
            Different
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-gray-300 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
        >
          The technology behind your new website — and why it matters for your practice.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 text-gray-500 text-sm tracking-widest uppercase"
        >
          ↓ Scroll to continue
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   COMPARISON TABLE (WordPress vs Next.js)
   ============================================================ */
function ComparisonTable() {
  const wp = [
    "30+ plugins to maintain and update",
    "Constant security vulnerabilities (hacked sites, malware)",
    "Slow page load (3–6 seconds average)",
    "$200–500/yr in security plugins & monitoring",
    "Monthly plugin updates break things",
    "Shared hosting = slow for everyone",
    "Page builders (WPBakery, Elementor) add bloat",
    "Database-dependent = single point of failure",
  ];
  const nx = [
    "Zero plugins. Everything is built-in.",
    "No database, no login system, nothing to hack",
    "Sub-1-second page loads",
    "SSL, security, DDoS protection included free",
    "No updates to break your site",
    "Global CDN = fast everywhere",
    "Clean code = fast, accessible, SEO-optimized",
    "Static files = virtually unhackable",
  ];
  return (
    <section className="relative py-24 sm:py-32 bg-[#07070f] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,108,223,0.06)_0%,_transparent_60%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-red-400 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            The Problem
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            WordPress is a{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              house of cards
            </span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5 md:gap-8">
          {/* WP */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl p-7 sm:p-9 border border-red-500/20 bg-gradient-to-br from-red-950/40 to-red-900/10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-xl font-bold">
                ✕
              </div>
              <h3 className="text-white text-2xl font-extrabold">WordPress</h3>
            </div>
            <ul className="space-y-4">
              {wp.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className="flex items-start gap-3 text-gray-300 text-sm sm:text-base"
                >
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          {/* NX */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl p-7 sm:p-9 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-emerald-900/10 backdrop-blur-sm shadow-[0_0_60px_rgba(16,185,129,0.08)]"
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                ✓
              </div>
              <h3 className="text-white text-2xl font-extrabold">Next.js</h3>
            </div>
            <ul className="space-y-4">
              {nx.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className="flex items-start gap-3 text-gray-200 text-sm sm:text-base"
                >
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SPEED RACE ANIMATION
   ============================================================ */
function BrowserFrame({
  label,
  color,
  children,
}: {
  label: string;
  color: "red" | "green";
  children: React.ReactNode;
}) {
  const colorCls = color === "red" ? "text-red-400" : "text-emerald-400";
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a24] border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className={`ml-3 text-xs font-mono font-bold ${colorCls}`}>{label}</div>
      </div>
      <div className="relative h-[280px] sm:h-[320px] bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SpeedRace() {
  const [key, setKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (inView) setPlaying(true);
  }, [inView]);

  const replay = () => {
    setPlaying(false);
    setKey((k) => k + 1);
    // small delay to let animations reset
    setTimeout(() => setPlaying(true), 50);
  };

  return (
    <section ref={ref} className="relative py-24 sm:py-32 bg-black overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            Speed Race
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Watch them load{" "}
            <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              side by side
            </span>
          </h2>
        </motion.div>

        <div key={key} className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* WordPress */}
          <div>
            <BrowserFrame label="wordpress-medical-site.com" color="red">
              {playing && <WPLoad />}
            </BrowserFrame>
            <div className="mt-4 flex items-center justify-between px-2">
              <span className="text-gray-400 text-sm font-semibold">WordPress</span>
              {playing && <Timestamp ms={3800} color="red" />}
            </div>
          </div>
          {/* Next.js */}
          <div>
            <BrowserFrame label="inflowmd.vercel.app" color="green">
              {playing && <NXLoad />}
            </BrowserFrame>
            <div className="mt-4 flex items-center justify-between px-2">
              <span className="text-gray-400 text-sm font-semibold">Next.js on Vercel</span>
              {playing && <Timestamp ms={400} color="green" />}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={replay}
            className="px-7 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition-colors shadow-lg shadow-accent/30"
          >
            ↻ Race again
          </button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-400 text-base sm:text-lg mt-10 max-w-2xl mx-auto"
        >
          Every second of load time ={" "}
          <span className="text-white font-bold">7% drop in conversions</span>{" "}
          <span className="text-gray-500">(Google)</span>
        </motion.p>
      </div>
    </section>
  );
}

function Timestamp({ ms, color }: { ms: number; color: "red" | "green" }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0.00s");
  useEffect(() => {
    const controls = animate(mv, ms / 1000, {
      duration: ms / 1000,
      ease: "linear",
      onUpdate: (v) => setDisplay(`${v.toFixed(2)}s`),
    });
    return () => controls.stop();
  }, [mv, ms]);
  return (
    <span
      className={`font-mono font-bold text-lg sm:text-xl ${
        color === "red" ? "text-red-400" : "text-emerald-400"
      }`}
    >
      {display}
    </span>
  );
}

function WPLoad() {
  // Progress bar crawls to 100% over 3.8s with layout-shifted skeletons popping in
  return (
    <>
      {/* top loading bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 3.8, ease: "linear" }}
        className="absolute top-0 left-0 h-1 bg-red-500/80 z-10"
      />
      {/* spinner */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.4, duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-10 h-10 border-4 border-red-300/30 border-t-red-500 rounded-full animate-spin" />
      </motion.div>
      {/* jumpy, laggy content */}
      <div className="absolute inset-0 p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.2 }}
          className="h-6 w-3/5 bg-gray-300 rounded mb-3"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.2 }}
          className="h-3 w-4/5 bg-gray-200 rounded mb-2"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.2 }}
          className="h-3 w-3/4 bg-gray-200 rounded mb-2"
        />
        {/* layout shift — image pushes content */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 80 }}
          transition={{ delay: 2.9, duration: 0.3 }}
          className="bg-gray-300 rounded my-3 w-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.2 }}
          className="h-3 w-2/3 bg-gray-200 rounded mb-2"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.7, duration: 0.2 }}
          className="h-8 w-28 bg-red-400 rounded"
        />
      </div>
    </>
  );
}

function NXLoad() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className="absolute inset-0 p-5"
    >
      <div className="h-6 w-3/5 bg-gradient-to-r from-[#2D6CDF] to-[#4F8EF7] rounded mb-3" />
      <div className="h-3 w-4/5 bg-gray-300 rounded mb-2" />
      <div className="h-3 w-3/4 bg-gray-300 rounded mb-2" />
      <div className="bg-gradient-to-br from-[#2D6CDF]/20 to-[#4F8EF7]/10 rounded my-3 w-full h-20" />
      <div className="h-3 w-2/3 bg-gray-300 rounded mb-2" />
      <div className="h-8 w-28 bg-[#2D6CDF] rounded" />
    </motion.div>
  );
}

/* ============================================================
   SECURITY SPLIT SCREEN
   ============================================================ */
function SecuritySplit() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const alerts = [
    { icon: "⚠️", text: "12 plugin updates available" },
    { icon: "🔴", text: "Wordfence Alert: Brute force attack blocked" },
    { icon: "⚠️", text: "PHP version outdated" },
    { icon: "🔴", text: "Sucuri: Malware detected in /wp-content" },
    { icon: "⚠️", text: "Your SSL certificate expires in 3 days" },
    { icon: "🔴", text: "WPBakery requires update — site may break" },
  ];
  return (
    <section ref={ref} className="relative py-24 sm:py-32 bg-[#07070f] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            Security
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            One is a <span className="text-red-400">ticking bomb</span>.{" "}
            <br className="hidden md:block" />
            The other is <span className="text-emerald-400">quiet</span>.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* WordPress - chaos */}
          <div className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-red-950/50 to-black border border-red-500/20 min-h-[480px]">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-300 text-xs font-mono font-bold tracking-wider">
                WORDPRESS — LIVE ALERTS
              </span>
            </div>
            <div className="space-y-3">
              {inView &&
                alerts.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.35, duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm"
                  >
                    <span className="text-lg">{a.icon}</span>
                    <span className="text-red-100 text-sm font-medium">{a.text}</span>
                  </motion.div>
                ))}
            </div>
          </div>
          {/* Next.js - calm */}
          <div className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-emerald-950/50 to-black border border-emerald-500/30 min-h-[480px] flex flex-col items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.1)]">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
              className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="text-white text-2xl sm:text-3xl font-extrabold text-center mb-2"
            >
              0 vulnerabilities.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.85 }}
              className="text-emerald-200 text-lg font-semibold text-center mb-8"
            >
              0 plugins. 0 worries.
            </motion.p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["SSL Auto-Renewed", "DDoS Protected", "Zero Attack Surface"].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold rounded-full"
                >
                  ✓ {t}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   COST CALCULATOR
   ============================================================ */
function AnimatedNumber({
  to,
  prefix = "$",
  suffix = "",
  duration = 1.4,
  delay = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, delay]);
  return (
    <span ref={ref} className="font-mono tabular-nums">
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

function CostCalculator() {
  const wpRows = [
    { label: "Hosting", value: 300 },
    { label: "Security monitoring", value: 200 },
    { label: "SSL certificate", value: 100 },
    { label: "Plugin licenses", value: 150 },
    { label: "Maintenance & fixes", value: 200 },
  ];
  const nxRows = [
    { label: "Hosting" },
    { label: "Security" },
    { label: "SSL" },
    { label: "Plugins" },
    { label: "Maintenance" },
  ];
  return (
    <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.06)_0%,_transparent_70%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            The Bill
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            What it{" "}
            <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              actually costs
            </span>{" "}
            to run
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* WP */}
          <div className="rounded-2xl p-7 sm:p-10 bg-gradient-to-br from-red-950/40 to-black border border-red-500/20">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-red-500/20">
              <span className="w-8 h-8 rounded-md bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                ✕
              </span>
              <h3 className="text-white text-xl font-extrabold">WordPress — annual</h3>
            </div>
            <ul className="space-y-4 mb-7">
              {wpRows.map((r, i) => (
                <li key={r.label} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm sm:text-base">{r.label}</span>
                  <span className="text-red-400 text-lg font-bold">
                    <AnimatedNumber to={r.value} suffix="/yr" delay={0.1 * i} />
                  </span>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-red-500/20 flex items-center justify-between">
              <span className="text-white text-lg font-extrabold uppercase tracking-wider">Total</span>
              <span className="text-red-400 text-3xl sm:text-4xl font-extrabold">
                <AnimatedNumber to={950} suffix="/yr" duration={2} delay={0.6} />
              </span>
            </div>
          </div>
          {/* NX */}
          <div className="rounded-2xl p-7 sm:p-10 bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-emerald-500/20">
              <span className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                ✓
              </span>
              <h3 className="text-white text-xl font-extrabold">Next.js — annual</h3>
            </div>
            <ul className="space-y-4 mb-7">
              {nxRows.map((r) => (
                <li key={r.label} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm sm:text-base">{r.label}</span>
                  <span className="text-emerald-400 text-lg font-bold font-mono">$0</span>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-emerald-500/20 flex items-center justify-between">
              <span className="text-white text-lg font-extrabold uppercase tracking-wider">Total</span>
              <span className="text-emerald-400 text-3xl sm:text-4xl font-extrabold font-mono">
                $0/yr
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STACK TOWER
   ============================================================ */
function StackTower() {
  const wpStack = [
    "14 More Plugins…",
    "Analytics Plugin",
    "SSL Plugin",
    "Forms Plugin",
    "Backup Plugin",
    "Cache Plugin",
    "Wordfence",
    "Yoast SEO",
    "WPBakery",
    "Theme",
    "WordPress Core",
    "PHP 8.x",
    "MySQL Database",
    "Shared Hosting",
  ];
  return (
    <section className="relative py-24 sm:py-32 bg-[#07070f] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            The Stack
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Complexity vs.{" "}
            <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              clarity
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-end">
          {/* WP wobbly tower */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: [-0.8, 0.8, -0.8] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col-reverse gap-1.5 w-full max-w-sm origin-bottom"
            >
              {wpStack.map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: -20, x: 0 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    x: (i % 2 === 0 ? -1 : 1) * (2 + (i % 3)),
                  }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                  className="relative rounded-md px-4 py-2.5 bg-gradient-to-r from-red-900/50 to-red-800/30 border border-red-500/30 text-red-100 text-xs sm:text-sm font-mono font-semibold text-center shadow-md"
                  style={{
                    transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (0.3 + (i % 3) * 0.2)}deg)`,
                  }}
                >
                  {label}
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-6 text-center">
              <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-1">
                WordPress
              </p>
              <p className="text-gray-500 text-xs">14+ moving parts. One failure = site down.</p>
            </div>
          </div>
          {/* NX clean block */}
          <div className="flex flex-col items-center justify-end h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
              className="relative w-full max-w-sm rounded-2xl px-8 py-14 bg-gradient-to-br from-[#1a2a6c] to-[#2D6CDF] border border-accent/40 shadow-[0_0_80px_rgba(45,108,223,0.3)]"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/0 via-white/5 to-white/10 pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="text-white text-2xl sm:text-3xl font-extrabold mb-2">
                  Next.js + Vercel
                </div>
                <div className="text-accent-light text-sm font-mono tracking-widest">
                  ONE LAYER
                </div>
              </div>
            </motion.div>
            <div className="mt-6 text-center">
              <p className="text-accent-light font-bold text-sm uppercase tracking-widest mb-1">
                Next.js
              </p>
              <p className="text-gray-400 text-xs font-semibold tracking-wider">
                Code · CDN · Done
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PAGESPEED GAUGE
   ============================================================ */
function Gauge({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: "red" | "green";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const pv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = useTransform(pv, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    if (!inView) return;
    const c = animate(pv, score, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => c.stop();
  }, [inView, pv, score]);

  const stroke = color === "red" ? "#ef4444" : "#10b981";
  const textColor = color === "red" ? "text-red-400" : "text-emerald-400";

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative w-[220px] h-[220px]">
        <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
          <circle
            cx="110"
            cy="110"
            r={radius}
            strokeWidth="14"
            stroke="rgba(255,255,255,0.08)"
            fill="none"
          />
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            strokeWidth="14"
            stroke={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 10px ${stroke}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl sm:text-6xl font-extrabold font-mono ${textColor}`}>
            {display}
          </span>
          <span className="text-gray-500 text-sm font-semibold mt-1">/ 100</span>
        </div>
      </div>
      <p className="text-white text-base sm:text-lg font-semibold mt-5 text-center max-w-[260px]">
        {label}
      </p>
    </div>
  );
}

function PageSpeedSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            Google PageSpeed
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            The score Google{" "}
            <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              actually sees
            </span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Gauge score={47} label="Typical WordPress Medical Site" color="red" />
          <Gauge score={96} label="Next.js on Vercel" color="green" />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 text-base sm:text-lg mt-14 max-w-2xl mx-auto leading-relaxed"
        >
          Google uses page speed as a ranking factor.{" "}
          <span className="text-white font-bold">
            Faster site = higher rankings = more patients.
          </span>
        </motion.p>
      </div>
    </section>
  );
}

/* ============================================================
   WHAT THIS MEANS — 4 CARDS
   ============================================================ */
function MeaningCards() {
  const cards = [
    {
      title: "More Patients Find You",
      body: "Faster sites rank higher on Google. Period.",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    },
    {
      title: "Zero Maintenance Headaches",
      body: "No plugin updates, no security patches, no downtime surprises.",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
    {
      title: "Lower Costs",
      body: "No hosting fees, no security subscriptions, no plugin licenses.",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m0-8a4 4 0 00-4 4H8",
    },
    {
      title: "Future-Proof",
      body: "Built for Google, AI search engines, and whatever comes next.",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
  ];
  return (
    <section className="relative py-24 sm:py-32 bg-[#07070f] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4">
            What this means for your practice
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Real results.{" "}
            <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              No jargon.
            </span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative rounded-2xl p-6 sm:p-7 bg-white/[0.03] border border-white/10 hover:border-accent/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(45,108,223,0.15)]"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-5 group-hover:bg-accent/25 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={c.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-extrabold mb-2 leading-tight">{c.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   AI SEARCH
   ============================================================ */
function AISearch() {
  return (
    <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#2D6CDF]/10 blur-[180px]" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-accent font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4"
        >
          Built for what&apos;s next
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6"
        >
          Optimized for{" "}
          <span className="bg-gradient-to-r from-accent-light via-white to-accent-light bg-clip-text text-transparent">
            AI search
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-12"
        >
          Next.js sites with structured schema and <code className="px-2 py-0.5 rounded bg-white/10 text-accent-light font-mono text-base">llms.txt</code> are
          natively optimized for ChatGPT, Gemini, Perplexity, and Google&apos;s AI Overviews.{" "}
          <span className="text-white font-semibold">
            WordPress can&apos;t do this out of the box.
          </span>
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {["ChatGPT", "Gemini", "Perplexity", "AI Overviews"].map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="px-4 py-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 transition-colors"
            >
              <p className="text-white font-bold text-sm sm:text-base">{name}</p>
              <p className="text-emerald-400 text-xs mt-1">✓ Indexed</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SELF-REFERENTIAL CALLOUT
   ============================================================ */
function SelfCallout() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#07070f] overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-8 sm:p-14 border border-accent/30 bg-gradient-to-br from-[#0a1226] via-[#0f1a3a] to-[#0a1226] shadow-[0_0_80px_rgba(45,108,223,0.2)]"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
          <p className="text-accent font-bold text-xs tracking-[0.3em] uppercase mb-5 text-center">
            Proof of concept
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center leading-tight mb-6">
            This page you&apos;re looking at{" "}
            <span className="bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
              right now?
            </span>
          </h2>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { v: "<0.5s", l: "Load time" },
              { v: "0", l: "Plugins" },
              { v: "0", l: "Databases" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-accent-light to-white bg-clip-text text-transparent">
                  {s.v}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm uppercase tracking-wider mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-300 text-base sm:text-lg text-center max-w-xl mx-auto leading-relaxed">
            No WordPress. No plugins. No bloat.{" "}
            <span className="text-white font-semibold">
              Just clean, fast, secure code.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA
   ============================================================ */
function CTA() {
  return (
    <section className="relative py-24 sm:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,108,223,0.2)_0%,_transparent_65%)]" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6"
        >
          Ready to upgrade?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg sm:text-xl mb-10"
        >
          Let&apos;s talk.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          href="/get-started"
          className="inline-block px-10 py-4 bg-accent text-white text-lg font-semibold rounded-xl hover:bg-accent-light transition-colors shadow-[0_0_40px_rgba(45,108,223,0.5)]"
        >
          Book a Strategy Call →
        </motion.a>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function WhyNextjsClient() {
  return (
    <main className="bg-black">
      <Hero />
      <ComparisonTable />
      <SpeedRace />
      <SecuritySplit />
      <CostCalculator />
      <StackTower />
      <PageSpeedSection />
      <MeaningCards />
      <AISearch />
      <SelfCallout />
      <CTA />
    </main>
  );
}
