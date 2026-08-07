"use client";

import { useEffect, useState } from "react";

type Tab = "recommendation" | "audit";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative min-h-[48px] px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold tracking-wide transition-colors ${
        active
          ? "text-white"
          : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {children}
      <span
        aria-hidden
        className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-full transition-colors ${
          active ? "bg-accent" : "bg-transparent"
        }`}
      />
    </button>
  );
}

export default function TabbedReport({
  recommendation,
  audit,
}: {
  recommendation: React.ReactNode;
  audit: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("recommendation");

  // Deep-link support: #audit / #recommendation. Default (no hash) = recommendation.
  useEffect(() => {
    const h = window.location.hash;
    if (h === "#audit") setTab("audit");
    else if (h === "#recommendation") setTab("recommendation");
  }, []);

  const select = (t: Tab) => {
    setTab(t);
    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#${t}`);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div className="min-h-screen bg-dark text-white audit-page">
      {/* Tab switcher — sticky, always reachable */}
      <div className="sticky top-0 z-50 bg-dark/90 backdrop-blur border-b border-white/10 no-print">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 flex items-center gap-1 sm:gap-3">
          <TabButton active={tab === "recommendation"} onClick={() => select("recommendation")}>
            Growth Recommendation
          </TabButton>
          <TabButton active={tab === "audit"} onClick={() => select("audit")}>
            Website Audit
          </TabButton>
        </div>
      </div>

      {/* Both panels stay mounted; inactive one is display:none so switching is instant. */}
      <div className={tab === "recommendation" ? "" : "hidden"}>{recommendation}</div>
      <div className={tab === "audit" ? "" : "hidden"}>{audit}</div>
    </div>
  );
}
