"use client";

import { useState } from "react";

const PATIENT_VALUE = 2500; // conservative anchor
const ANNUAL_COST = 12000; // $1,000/mo

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function RoiSlider() {
  const [perMonth, setPerMonth] = useState(1);

  const perYear = perMonth * 12;
  const annualRevenue = perYear * PATIENT_VALUE;
  const annualNet = annualRevenue - ANNUAL_COST;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Input */}
      <div className="p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <label
            htmlFor="roi-patients"
            className="text-slate-900 font-semibold text-base sm:text-lg leading-snug"
          >
            New patients per month
          </label>
          <span className="text-accent font-extrabold text-3xl sm:text-4xl tabular-nums whitespace-nowrap">
            {perMonth}
          </span>
        </div>
        <input
          id="roi-patients"
          type="range"
          min={0}
          max={10}
          step={1}
          value={perMonth}
          onChange={(e) => setPerMonth(Number(e.target.value))}
          className="roi-slider"
          aria-label="New patients per month"
        />
        <p className="mt-4 text-slate-600 text-xs sm:text-sm leading-relaxed">
          Assumes $2,500 per patient (conservative — a full treatment course runs
          $2,000–$6,000). Your cost is $1,000 / month.
        </p>
      </div>

      {/* Outputs */}
      <div className="p-5 sm:p-7 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
              {perYear}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              New patients / year
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
              {usd(annualRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              Annual revenue
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
              {usd(ANNUAL_COST)}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 leading-snug">
              Your annual investment
            </div>
          </div>
        </div>

        {/* Headline output — annual net */}
        <div
          className={`mt-3 rounded-xl border-2 p-5 sm:p-6 ${
            annualNet >= 0 ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50"
          }`}
        >
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div
              className={`text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tabular-nums ${
                annualNet >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {annualNet >= 0 ? "+" : "−"}
              {usd(Math.abs(annualNet))}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">
              Illustrative annual net
            </div>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-slate-600">
            Break-even: about 5 patients per year — you clear it well before one new patient a
            month.
          </div>
        </div>
      </div>
    </div>
  );
}
