"use client";

/**
 * Circular score gauge, Google PageSpeed color conventions.
 * Shared by the audit tool and the /pitch presentation deck.
 */

/** 0–49 red, 50–89 amber, 90–100 green — exactly the bands PSI uses. */
export function gaugeColor(score: number | null): string {
  if (score === null) return "rgba(255,255,255,0.3)";
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

export function Gauge({
  score,
  label,
  verified,
  total,
  size = 110,
  valueClass = "text-3xl",
  showValue = true,
  srLabel,
  source,
}: {
  score: number | null;
  label?: string;
  verified?: number;
  total?: number;
  /** Ring diameter. A string passes a CSS length straight through, which is
   *  how /pitch hands it a viewport-dependent variable. */
  size?: number | string;
  valueClass?: string;
  /** False renders the ring alone — the color zone carries the message. */
  showValue?: boolean;
  /** Accessible description for label-less rings (e.g. the /pitch deck). */
  srLabel?: string;
  /** Who measured this number. Only the Lighthouse gauge may credit Google. */
  source?: string;
}) {
  const color = gaugeColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = score === null ? circumference : circumference * (1 - score / 100);
  return (
    <div
      className="flex flex-col items-center min-w-0"
      role={srLabel ? "img" : undefined}
      aria-label={srLabel}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="8"
            stroke={score === null ? "rgba(255,255,255,0.12)" : `${color}29`}
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="8"
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-extrabold tabular-nums ${valueClass}`}
              style={{ color: score === null ? "rgba(255,255,255,0.4)" : color }}
            >
              {score === null ? "—" : score}
            </span>
          </div>
        )}
      </div>
      {label && (
        <div className="text-[11px] uppercase tracking-wider text-white/55 mt-2 text-center leading-snug">
          {label}
        </div>
      )}
      {typeof verified === "number" && typeof total === "number" && (
        <div className="text-[11px] text-white/35 mt-0.5 tabular-nums">
          {verified} of {total} verified
        </div>
      )}
      {source && (
        <div className="text-[10px] text-white/30 mt-1 text-center leading-tight">{source}</div>
      )}
    </div>
  );
}
