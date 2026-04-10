"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const serviceLinks = [
  { label: "SEO & AI Visibility", href: "/services/seo" },
  { label: "Website Design", href: "/services/web-design" },
  { label: "Google Ads", href: "/services/google-ads" },
  { label: "Local Presence", href: "/services/local-presence" },
  { label: "Reputation Management", href: "/services/reputation-management" },
  { label: "Reporting & Analytics", href: "/services/reporting" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeServices = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 150);
  };

  return (
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
          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={closeServices}
          >
            <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
              Services
              <svg
                className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#111128]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="py-2">
                    {serviceLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="block px-5 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="/#process"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Process
          </a>
          <a
            href="/#results"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Results
          </a>
          <a
            href="/pricing"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Pricing
          </a>
          <a
            href="/get-started"
            className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg glow-blue-sm hover:bg-accent-light transition-colors"
          >
            Get Started
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#111128] border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {/* Services accordion */}
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium text-left flex items-center justify-between"
              >
                Services
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 flex flex-col gap-3 pb-1">
                      {serviceLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <a
                href="/#process"
                onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Process
              </a>
              <a
                href="/#results"
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
                Pricing
              </a>
              <a
                href="/get-started"
                onClick={() => setMobileOpen(false)}
                className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg text-center glow-blue-sm"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
