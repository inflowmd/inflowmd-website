"use client";

import { useState } from "react";

type Sub = "organic" | "paid";

export default function OrganicPaidTabs({
  organic,
  paid,
}: {
  organic: React.ReactNode;
  paid: React.ReactNode;
}) {
  const [sub, setSub] = useState<Sub>("organic");

  const btn = (key: Sub, label: string) => (
    <button
      type="button"
      onClick={() => setSub(key)}
      aria-current={sub === key ? "true" : undefined}
      className={`flex-1 min-h-[48px] px-4 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-colors ${
        sub === key
          ? "bg-accent text-white shadow-[0_0_20px_rgba(45,108,223,0.35)]"
          : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-3">
        Choose an approach
      </div>
      <div className="flex gap-1.5 p-1.5 rounded-xl border border-white/10 bg-white/[0.03] max-w-md">
        {btn("organic", "Organic (Content)")}
        {btn("paid", "Paid (Google Ads)")}
      </div>

      <div className="mt-6">
        <div className={sub === "organic" ? "" : "hidden"}>{organic}</div>
        <div className={sub === "paid" ? "" : "hidden"}>{paid}</div>
      </div>
    </div>
  );
}
