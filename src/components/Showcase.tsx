"use client";

import Image from "next/image";
import FadeIn from "./FadeIn";
import PhoneMockup from "./PhoneMockup";

function BrowserMockup() {
  return (
    <div className="relative">
      {/* Floating stat badge with bob animation */}
      <div className="absolute -top-5 -right-5 z-10 rounded-2xl px-6 py-4 shadow-xl animate-float-bob backdrop-blur-md border border-accent/30" style={{ backgroundColor: "rgba(26, 26, 46, 0.85)", boxShadow: "0 0 20px rgba(45, 108, 223, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)" }}>
        <p className="text-2xl font-bold text-accent">+147%</p>
        <p className="text-xs text-gray-400">Patient Inquiries</p>
      </div>

      {/* Reflection/shadow under browser */}
      <div className="absolute -bottom-8 left-4 right-4 h-12 bg-accent/8 blur-2xl rounded-full" />

      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        {/* Blue gradient shine sweep across frame */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl">
          <div className="animate-shine-sweep absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-accent/[0.07] to-transparent -translate-x-full" />
        </div>

        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 relative z-[1]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 max-w-xs">
              premiervascularcenter.com
            </div>
          </div>
        </div>

        {/* Website preview - scrolling container */}
        <div className="relative overflow-hidden" style={{ height: 400 }}>
          <div className="animate-mockup-scroll">

            {/* === WARM MEDICAL PRACTICE WEBSITE === */}

            {/* Navigation */}
            <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D6CDF" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span className="text-[9px] font-bold text-gray-800">Premier Vascular Center</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-gray-500 text-[7px]">Conditions</span>
                <span className="text-gray-500 text-[7px]">Treatments</span>
                <span className="text-gray-500 text-[7px]">Our Doctors</span>
                <span className="text-gray-500 text-[7px]">Locations</span>
                <span className="text-gray-500 text-[7px]">Patient Portal</span>
                <span className="text-[7px] bg-[#2D6CDF] text-white px-2 py-1 rounded-full font-semibold">
                  Request Appointment
                </span>
              </div>
            </div>

            {/* Hero Section - Warm & Calming with background image */}
            <div className="relative px-5 pt-7 pb-6 overflow-hidden">
              <Image
                src="/mockup-doctor-hero.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="500px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/85 via-[#0a1628]/70 to-[#0a1628]/40" />

              <div className="relative z-[1]">
                <p className="text-[#7db4f7] text-[7px] font-semibold uppercase tracking-wider mb-2">Board-Certified Vascular Specialists</p>
                <h3 className="text-white text-[16px] font-bold leading-snug mb-1">
                  Compassionate Vein Care
                </h3>
                <h3 className="text-white text-[16px] font-bold leading-snug mb-2">
                  for <span className="text-[#7db4f7]">Lasting Results</span>
                </h3>
                <p className="text-gray-300 text-[8px] leading-relaxed mb-4 max-w-[260px]">
                  Board-certified vascular specialists serving the Phoenix metro area since 2012. Minimally invasive treatments with compassionate, patient-first care.
                </p>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-[#2D6CDF] text-white text-[8px] font-semibold rounded-full">
                    Request Appointment
                  </div>
                  <div className="px-3 py-1.5 border border-white/40 text-white text-[8px] font-semibold rounded-full">
                    Call (480) 555-0123
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="bg-[#2D6CDF] px-4 py-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Board Certified Physicians" },
                  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "5,000+ Patients Treated" },
                  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", label: "3 Convenient Locations" },
                  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Most Insurance Accepted" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center text-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="mb-1 opacity-90">
                      <path d={item.icon} />
                    </svg>
                    <span className="text-white/90 text-[6.5px] font-medium leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Section - Clean White */}
            <div className="bg-white px-5 py-5">
              <p className="text-[#2D6CDF] text-[7px] font-semibold uppercase tracking-wider mb-1">Our Treatments</p>
              <p className="text-gray-900 text-[11px] font-bold mb-3">Specialized Vascular Care</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: "Spider Vein Treatment", desc: "Sclerotherapy & laser options", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                  { title: "Varicose Vein Care", desc: "Minimally invasive solutions", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                  { title: "Vascular Screening", desc: "Comprehensive diagnostics", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                ].map((svc) => (
                  <div key={svc.title} className="bg-[#f8fafc] rounded-lg p-2.5 border border-gray-100 shadow-sm">
                    <div className="w-6 h-6 rounded-md bg-[#2D6CDF]/10 flex items-center justify-center mb-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D6CDF" strokeWidth="1.5">
                        <path d={svc.icon} />
                      </svg>
                    </div>
                    <p className="text-gray-900 text-[8px] font-semibold leading-tight mb-0.5">{svc.title}</p>
                    <p className="text-gray-400 text-[6.5px] leading-tight">{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stages of Vein Disease */}
            <div className="bg-[#f8fafc] px-5 py-5 border-y border-gray-100">
              <p className="text-[#2D6CDF] text-[7px] font-semibold uppercase tracking-wider mb-1 text-center">Understanding Your Condition</p>
              <p className="text-gray-900 text-[10px] font-bold mb-3 text-center">The Stages of Venous Disease</p>
              <div className="flex items-start gap-0">
                {[
                  { stage: 1, name: "Spider Veins", desc: "Small, visible veins beneath the skin", color: "#7db4f7" },
                  { stage: 2, name: "Varicose Veins", desc: "Bulging, twisted veins causing discomfort", color: "#2D6CDF" },
                  { stage: 3, name: "Skin Changes", desc: "Swelling, discoloration around ankles", color: "#f59e0b" },
                  { stage: 4, name: "Venous Ulcers", desc: "Open wounds requiring immediate care", color: "#ef4444" },
                ].map((item, i) => (
                  <div key={item.stage} className="flex items-start flex-1">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold mb-1"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.stage}
                      </div>
                      <p className="text-gray-900 text-[7px] font-semibold leading-tight mb-0.5">{item.name}</p>
                      <p className="text-gray-400 text-[5.5px] leading-tight px-0.5">{item.desc}</p>
                    </div>
                    {i < 3 && (
                      <div className="flex items-center pt-2.5 px-0.5 text-gray-300">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Spotlight - Horizontal Card */}
            <div className="bg-white px-5 py-5">
              <p className="text-[#2D6CDF] text-[7px] font-semibold uppercase tracking-wider mb-2.5 text-center">Meet Your Doctor</p>
              <div className="flex gap-3 rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-[#f8fafc] max-w-[300px] mx-auto">
                <div className="w-[80px] h-[100px] shrink-0 relative">
                  <Image
                    src="/mockup-doctor.jpg"
                    alt="Dr. Sarah Chen"
                    width={80}
                    height={100}
                    className="object-cover object-top w-full h-full"
                  />
                </div>
                <div className="py-2.5 pr-3">
                  <p className="text-gray-900 text-[10px] font-bold">Dr. Sarah Chen, MD, FACS</p>
                  <p className="text-[#2D6CDF] text-[7px] font-medium mb-1">Board-Certified Vascular Surgeon</p>
                  <p className="text-gray-500 text-[6.5px] leading-relaxed">
                    Over 15 years of experience in minimally invasive vein treatments. Fellowship trained at Johns Hopkins with compassionate, patient-first care.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial - Light Background */}
            <div className="bg-white px-5 py-5">
              <div className="bg-[#f8fafc] rounded-lg p-4 border border-gray-100">
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-[8px] leading-relaxed mb-2 italic">
                  &ldquo;Dr. Chen and her team made me feel so comfortable. After years of hiding my legs, the spider vein treatment was quick, painless, and the results are amazing. I wish I had done this sooner!&rdquo;
                </p>
                <p className="text-gray-800 text-[8px] font-semibold">— Margaret Williams</p>
                <p className="text-gray-400 text-[7px]">Verified Patient &middot; Scottsdale, AZ</p>
              </div>
            </div>

            {/* CTA Banner - Calming Blue */}
            <div className="bg-gradient-to-r from-[#2D6CDF] to-[#4A8AF4] px-5 py-5 text-center">
              <p className="text-white text-[11px] font-bold mb-1">Schedule Your Free Vein Screening</p>
              <p className="text-white/80 text-[8px] mb-3">Take the first step toward healthier, pain-free legs.</p>
              <div className="inline-block px-4 py-1.5 bg-white text-[#2D6CDF] text-[8px] font-semibold rounded-full shadow-sm">
                Book Your Screening →
              </div>
            </div>

            {/* Footer - Clean Gray */}
            <div className="bg-[#f1f5f9] px-5 py-4 border-t border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-gray-700 text-[8px] font-bold mb-1">Premier Vascular Center</p>
                  <p className="text-gray-400 text-[6.5px]">4821 N. Scottsdale Rd, Suite 100</p>
                  <p className="text-gray-400 text-[6.5px]">Scottsdale, AZ 85251</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[6.5px]">Mon–Fri: 8am–5pm</p>
                  <p className="text-gray-400 text-[6.5px]">Sat: 9am–1pm</p>
                  <p className="text-[#2D6CDF] text-[7px] font-semibold">(480) 555-0123</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <p className="text-gray-300 text-[6px]">© 2026 Premier Vascular Center. All rights reserved.</p>
                <div className="flex gap-2">
                  <span className="text-gray-400 text-[6px]">Privacy Policy</span>
                  <span className="text-gray-400 text-[6px]">Terms</span>
                  <span className="text-gray-400 text-[6px]">Accessibility</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function Showcase() {
  return (
    <section className="py-20 bg-warm-bg-alt">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-wide uppercase mb-2">
              What We Build
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              More patients in your office, less time chasing them
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              We build systems that turn online searches into booked
              appointments — so you can focus on care, not marketing. Every
              page, every listing, every review is optimized to bring the right
              patients through your door.
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Browser Mockup */}
          <FadeIn delay={0.1}>
            <BrowserMockup />
          </FadeIn>

          {/* Phone Mockup - Reputation Dashboard */}
          <FadeIn delay={0.2}>
            <PhoneMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
