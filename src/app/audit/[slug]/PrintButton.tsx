"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/10 text-gray-200 text-[11px] font-bold tracking-[0.16em] uppercase transition-colors"
    >
      Print / Save PDF
    </button>
  );
}
