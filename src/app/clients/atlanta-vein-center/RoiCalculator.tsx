"use client";

import { useState } from "react";

// Fixed engine constants — researched values, nothing user-editable but the budget.
const COST_PER_CLICK = 10;
const CLICK_TO_INQUIRY = 0.06;
const INQUIRY_TO_CONSULT = 0.6;
const CONSULT_TO_TREATED = 0.4; // conservative end of the research range
const PATIENT_VALUE = 2500; // mid-range of the verified $2,000–$6,000 course value
const OVERHEAD = 1000; // $500 management + $500 existing plan

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function RoiCalculator() {
  const [budget, setBudget] = useState(1000);

  const clicks = budget / COST_PER_CLICK;
  const inquiries = clicks * CLICK_TO_INQUIRY;
  const consultations = inquiries * INQUIRY_TO_CONSULT;
  const patients = consultations * CONSULT_TO_TREATED;
  const revenue = patients * PATIENT_VALUE;
  const totalInvestment = budget + OVERHEAD;
  const net = revenue - totalInvestment;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Input */}
      <div className="p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <label
            htmlFor="roi-budget"
            className="text-slate-900 font-semibold text-base sm:text-lg leading-snug"
          >
            Monthly ad budget
          </label>
          <span className="text-accent font-extrabold text-2xl sm:text-3xl tabular-nums whitespace-nowrap">
            {usd(budget)}
          </span>
        </div>
        <input
          id="roi-budget"
          type="range"
          min={500}
          max={2500}
          step={250}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="roi-slider"
          aria-label="Monthly ad budget"
        />
        {budget <= 500 && (
          <p className="mt-3 text-amber-800 text-xs sm:text-sm font-semibold leading-relaxed">
            At $500, campaigns don&rsquo;t get enough data to improve.{" "}
            <a
              href="#budget-correction"
              className="underline decoration-amber-400 hover:decoration-amber-700"
            >
              See the budget note below.
            </a>
          </p>
        )}
        <p className="mt-4 text-slate-600 text-xs sm:text-sm leading-relaxed">
          Assumes: $2,500 average value per treated patient (Medicare-based, full treatment
          course) · $10 average cost per click · 6% of visitors inquire · 60% of inquiries
          book a consultation · 40% of consultations proceed to treatment.
        </p>
      </div>

      {/* Results — four numbers, then the annual line */}
      <div className="p-5 sm:p-7 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
              {patients.toFixed(1)}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              Estimated new patients / month
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
              {usd(revenue)}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              Estimated monthly revenue
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
              {usd(totalInvestment)}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              Your total monthly investment
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Ad budget + $1,000</div>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              net >= 0
                ? "border-emerald-300 bg-emerald-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div
              className={`text-2xl sm:text-3xl font-extrabold leading-none tabular-nums ${
                net >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {net >= 0 ? "+" : "−"}
              {usd(Math.abs(net))}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              Estimated net / month
            </div>
          </div>
        </div>

        {/* Annual — the payoff line */}
        <div
          className={`mt-4 rounded-xl border-2 p-5 sm:p-6 ${
            net >= 0 ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50"
          }`}
        >
          <div className="text-sm text-slate-600">Over twelve months:</div>
          <div
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tabular-nums mt-2 ${
              net >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {net >= 0 ? "+" : "−"}
            {usd(Math.abs(net * 12))}
          </div>
          <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2">
            Projected annual net
          </div>
        </div>
      </div>

      {/* Honesty guardrail — always visible */}
      <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50">
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          This is a projection, not a promise. It uses industry benchmarks, not
          Atlanta-measured figures, and the first 60–90 days will run below these numbers
          while campaigns are new and your review count is low.
        </p>
      </div>
    </div>
  );
}
