"use client";

import FadeIn from "./FadeIn";

type Specialty = { name: string; href?: string };

const specialties: Specialty[] = [
  { name: "Cardiology" },
  { name: "Vein & Vascular", href: "/for/varicose-vein-doctors" },
  { name: "Med Spa & Aesthetics" },
  { name: "Longevity Medicine" },
  { name: "Wound Care" },
  { name: "Dermatology" },
  { name: "Podiatry" },
  { name: "Weight Loss & Wellness" },
  { name: "Interventional Radiology" },
  { name: "Diabetes & Endocrinology" },
  { name: "Primary Care" },
  { name: "Pain Management" },
  { name: "Pediatric Urgent Care" },
  { name: "Surgical Specialists" },
  { name: "Obstetrics & Gynecology" },
  { name: "Behavioral Health" },
  { name: "Chiropractic" },
  { name: "Psychiatry" },
  { name: "Gastroenterology" },
];

const pillBase =
  "px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-dark hover:bg-accent hover:border-accent hover:text-white transition-all duration-200";

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
            {specialties.map(({ name, href }) =>
              href ? (
                <a key={name} href={href} className={pillBase}>
                  {name}
                </a>
              ) : (
                <span key={name} className={`${pillBase} cursor-default`}>
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
