"use client";

import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
    {/* The nav sits INSIDE a <header> so a page exposes both landmarks:
        <header> says "this is the site header", <nav> says "these are the
        links". Wrapping, not replacing — swapping the nav out would trade
        one landmark for the other. */}
    <header>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#111128]/95 backdrop-blur-md shadow-lg"
          : "bg-[#111128]/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image
            src="/inflowmd-final.png"
            alt="InflowMD"
            width={108}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/solutions"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Solutions
          </a>
          <a
            href="/#services"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            How It Works
          </a>
          <a
            href="/#audit"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Results
          </a>
          <a
            href="/pricing"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Growth Plans
          </a>
          <a
            href="/get-started"
            className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg glow-blue-sm hover:bg-accent-light transition-colors"
          >
            Free Audit
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#111128] border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a
                href="/solutions"
                onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Solutions
              </a>
              <a
                href="/#services"
                onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                How It Works
              </a>
              <a
                href="/#audit"
                onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Results
              </a>
              <a
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Growth Plans
              </a>
              <a
                href="/get-started"
                onClick={() => setMobileOpen(false)}
                className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg text-center glow-blue-sm"
              >
                Free Audit
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
    </header>
    </LazyMotion>
  );
}
