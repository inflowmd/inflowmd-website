"use client";

import Image from "next/image";

const solutionLinks = [
  { label: "SEO & AI Visibility", href: "/services/seo" },
  { label: "Website Design", href: "/services/web-design" },
  { label: "Google Ads", href: "/services/google-ads" },
  { label: "Local Presence", href: "/services/local-presence" },
  { label: "Reputation Management", href: "/services/reputation-management" },
  { label: "Reporting & Analytics", href: "/services/reporting" },
];

const companyLinks = [
  { label: "How It Works", href: "/#process" },
  { label: "Results", href: "/#results" },
  { label: "Growth Plans", href: "/pricing" },
  { label: "Free Audit", href: "/get-started" },
];

export default function Footer() {
  return (
    <footer className="bg-[#111128] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/inflowmd-final.png"
                alt="InflowMD"
                width={96}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              AI-powered digital marketing built exclusively for medical
              practices. We help you attract more patients, rank higher, and
              grow predictably.
            </p>
            <div className="flex gap-4">
              {/* LinkedIn */}
              <a href="#" className="text-gray-500 hover:text-accent transition-colors" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.47 2H3.53A1.45 1.45 0 002 3.47v17.06A1.45 1.45 0 003.47 22h17.06A1.45 1.45 0 0022 20.53V3.47A1.45 1.45 0 0020.47 2zM8.09 18.74h-3v-9h3v9zM6.59 8.48a1.56 1.56 0 110-3.12 1.56 1.56 0 010 3.12zM18.91 18.74h-3v-4.26c0-1.08-.43-1.58-1.23-1.58-.87 0-1.37.54-1.37 1.58v4.26h-3v-9h3v1.2a3.2 3.2 0 012.7-1.4c1.68 0 2.9 1.02 2.9 3.14v6.06z" />
                </svg>
              </a>
              {/* X/Twitter */}
              <a href="#" className="text-gray-500 hover:text-accent transition-colors" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2.5">
              {solutionLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} InflowMD. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
