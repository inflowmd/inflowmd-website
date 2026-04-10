"use client";

import FadeIn from "./FadeIn";

const specialties = [
  "Cardiology",
  "Vein & Vascular",
  "Med Spa & Aesthetics",
  "Longevity Medicine",
  "Wound Care",
  "Dermatology",
  "Podiatry",
  "Weight Loss & Wellness",
  "Interventional Radiology",
  "Diabetes & Endocrinology",
  "Primary Care",
  "Pain Management",
  "Pediatric Urgent Care",
  "Surgical Specialists",
  "Obstetrics & Gynecology",
  "Behavioral Health",
  "Chiropractic",
  "Psychiatry",
  "Gastroenterology",
];

export default function Specialties() {
  return (
    <section className="py-16 bg-warm-bg">
      <FadeIn>
        <div className="text-center mb-10 px-6">
          <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
            Built for Healthcare
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">
            Specialties We Serve
          </h2>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map((name) => (
              <span
                key={name}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-dark cursor-default hover:bg-accent hover:border-accent hover:text-white transition-all duration-200"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
