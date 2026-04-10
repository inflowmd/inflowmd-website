"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const reviews = [
  { name: "Sarah M.", text: "Dr. Torres and her team were amazing...", stars: 5, platform: "Google" },
  { name: "Michael R.", text: "Best experience I've ever had at a...", stars: 5, platform: "Healthgrades" },
  { name: "Linda K.", text: "Finally found a doctor who listens...", stars: 5, platform: "Vitals" },
  { name: "James P.", text: "Quick, professional, and caring staff...", stars: 5, platform: "Google" },
  { name: "Angela W.", text: "Life-changing treatment, can't thank...", stars: 5, platform: "Healthgrades" },
  { name: "Robert D.", text: "Top-notch facility with modern equipment...", stars: 5, platform: "Google" },
  { name: "Maria S.", text: "So glad I found this practice, truly...", stars: 4, platform: "Vitals" },
  { name: "David H.", text: "Exceptional care from start to finish...", stars: 5, platform: "Healthgrades" },
];

const barData = [
  { month: "Oct", target: 25 },
  { month: "Nov", target: 38 },
  { month: "Dec", target: 32 },
  { month: "Jan", target: 52 },
  { month: "Feb", target: 68 },
  { month: "Mar", target: 88 },
];

function StarIcon({ size, filled, partial }: { size: number; filled: boolean; partial?: number }) {
  const id = `star-grad-${size}-${partial ?? "full"}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={filled || (partial && partial > 0) ? { filter: "drop-shadow(0 0 3px rgba(245,158,11,0.4))" } : {}}
    >
      {partial !== undefined && partial > 0 && partial < 1 && (
        <defs>
          <linearGradient id={id}>
            <stop offset={`${partial * 100}%`} stopColor="#f59e0b" />
            <stop offset={`${partial * 100}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          filled
            ? "#f59e0b"
            : partial !== undefined && partial > 0 && partial < 1
              ? `url(#${id})`
              : "none"
        }
        stroke="#f59e0b"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function PhoneMockup() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(4.2);
  const [reviewCount, setReviewCount] = useState(180);
  const [newReviewCount, setNewReviewCount] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewTransition, setReviewTransition] = useState<"in" | "out">("in");
  const animationStarted = useRef(false);

  // Intersection Observer
  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationStarted.current) {
          setIsVisible(true);
          animationStarted.current = true;
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate counters when visible
  useEffect(() => {
    if (!isVisible) return;

    const duration = 8000;
    const startTime = performance.now();
    const ratingStart = 4.2, ratingEnd = 4.9;
    const countStart = 180, countEnd = 247;
    const newStart = 0, newEnd = 23;

    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setRating(+(ratingStart + (ratingEnd - ratingStart) * eased).toFixed(1));
      setReviewCount(Math.round(countStart + (countEnd - countStart) * eased));
      setNewReviewCount(Math.round(newStart + (newEnd - newStart) * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isVisible]);

  // Cycling review feed
  const cycleReview = useCallback(() => {
    setReviewTransition("out");
    setTimeout(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % (reviews.length - 1));
      setReviewTransition("in");
    }, 400);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(cycleReview, 3000);
    return () => clearInterval(interval);
  }, [isVisible, cycleReview]);

  // Compute star fill state based on current rating
  const getStarFill = (starIndex: number) => {
    const threshold = starIndex; // star 1 = index 1, fills at rating >= 1
    if (rating >= threshold) return { filled: true };
    if (rating >= threshold - 1) return { filled: false, partial: rating - (threshold - 1) };
    return { filled: false };
  };

  const visibleReviews = [
    reviews[currentReviewIndex],
    reviews[(currentReviewIndex + 1) % reviews.length],
  ];

  return (
    <div className="flex justify-center" ref={phoneRef}>
      <div className="w-[300px] bg-[#0d0d1a] rounded-[2.5rem] p-3 shadow-2xl border border-white/10 relative">
        {/* Blue glow behind phone */}
        <div className="absolute -inset-6 bg-accent/15 rounded-[3rem] blur-3xl pointer-events-none" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-8 right-0 w-36 h-36 bg-[#4a3aff]/15 rounded-full blur-[50px] pointer-events-none" />

        <div className="bg-[#111127] rounded-[2rem] overflow-hidden relative">
          {/* Shimmer sweep animation */}
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[2rem]">
            <div className="animate-phone-shimmer absolute inset-0 w-[300%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full" />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 relative z-[1]">
            <span className="text-white text-xs font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2.5 border border-white/60 rounded-sm relative">
                <div className="absolute inset-0.5 bg-green-400 rounded-xs" />
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="px-5 pb-6 relative z-[1]">
            {/* New reviews badge */}
            <div className="flex items-center gap-2 mb-3 bg-white/5 rounded-full px-3 py-1.5 w-fit border border-white/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="animate-green-pulse relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-white text-[11px] font-medium">
                New reviews this month:{" "}
                <span className="text-green-400 font-bold tabular-nums">
                  +{newReviewCount}
                </span>
              </span>
            </div>

            <h4 className="text-white font-bold text-lg mb-1">Reviews</h4>
            <p className="text-gray-400 text-xs mb-4">Reputation Dashboard</p>

            {/* Overall rating */}
            <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-4 mb-4 text-center border border-accent/15 shadow-[0_0_25px_rgba(45,108,223,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-5xl font-bold text-white mb-1 tabular-nums">
                {rating.toFixed(1)}
              </p>
              <div className="flex justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const fill = getStarFill(s);
                  return (
                    <StarIcon
                      key={s}
                      size={22}
                      filled={fill.filled}
                      partial={fill.partial}
                    />
                  );
                })}
              </div>
              <p className="text-gray-400 text-xs tabular-nums">
                Based on {reviewCount} reviews
              </p>
            </div>

            {/* Review growth chart */}
            <div className="bg-white/[0.06] backdrop-blur-md rounded-xl p-3 mb-4 border border-accent/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-[11px] font-semibold">
                  Review Growth
                </p>
                <p className="text-green-400 text-[9px] font-semibold">+178%</p>
              </div>
              <div style={{ position: "relative", height: "80px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 8px", marginTop: "8px", marginBottom: "4px" }}>
                {[25, 38, 32, 52, 68, 88].map((h, i) => (
                  <div key={i} style={{ width: "14%", height: `${h}%`, backgroundColor: "#2D6CDF", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
                  <span key={m} className="text-gray-500 text-[8px]" style={{ width: "14%", textAlign: "center" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Live review feed */}
            <div className="relative overflow-hidden" style={{ minHeight: 108 }}>
              {visibleReviews.map((review, idx) => (
                <div
                  key={`${review.name}-${currentReviewIndex}-${idx}`}
                  className="bg-white/[0.06] backdrop-blur-md rounded-lg p-3 mb-2 border border-accent/15 shadow-[0_0_12px_rgba(45,108,223,0.06),inset_0_1px_0_rgba(255,255,255,0.05)]"
                  style={{
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: idx === 0
                      ? reviewTransition === "out" ? 0 : 1
                      : 1,
                    transform: idx === 0
                      ? reviewTransition === "out" ? "translateY(-12px)" : "translateY(0)"
                      : "translateY(0)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-xs font-semibold">
                        {review.name}
                      </span>
                      <span className="text-[9px] text-gray-500 bg-white/10 px-1.5 py-0.5 rounded">
                        {review.platform}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <StarIcon key={i} size={12} filled />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">{review.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center">
              <span className="text-accent text-xs font-semibold">
                View All Reviews →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
