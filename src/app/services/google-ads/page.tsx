"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export default function GoogleAdsPage() {
  return (
    <>
      <Navbar />
      <ServicePageTemplate
        label="Google Ads Management"
        title="High-intent patients, the moment they search"
        subtitle="AI-optimized pay-per-click campaigns that drive qualified patient leads while minimizing wasted ad spend. Every dollar tracked, every lead attributed."
        problemHeading="You're burning budget on the wrong clicks"
        problemHighlight="burning budget"
        problemText="Most medical practices running Google Ads are wasting 40-60% of their budget on irrelevant clicks, poor targeting, and unoptimized landing pages. Without healthcare-specific expertise, generic PPC agencies simply can't deliver."
        problemPoints={[
          "You're paying for clicks from people who will never become patients",
          "Your landing pages don't convert — visitors leave without booking",
          "No proper conversion tracking means you can't measure real ROI",
          "Generic agencies don't understand medical advertising regulations and restrictions",
        ]}
        features={[
          { title: "Campaign Strategy", description: "Custom campaign architecture built around your highest-value procedures, locations, and patient demographics.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
          { title: "Keyword Targeting", description: "Aggressive negative keyword management and high-intent keyword selection to ensure you only pay for searches that lead to booked appointments.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          { title: "Ad Copy & Creative", description: "Compelling ad copy that complies with Google's healthcare advertising policies while driving maximum click-through rates.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
          { title: "Landing Pages", description: "Custom-built, high-converting landing pages for each campaign — designed to turn clicks into booked consultations.", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
          { title: "Bid Management", description: "AI-powered bid strategies that automatically optimize for conversions, adjusting in real-time based on time of day, device, and location.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { title: "Conversion Tracking", description: "Full-funnel tracking from ad click to phone call to booked appointment. Know exactly what every dollar produces.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
        ]}
        steps={[
          { num: "01", title: "Audit & Strategy", description: "We analyze your market, competitors' ads, and current campaigns (if any) to build a targeting strategy focused on your highest-value procedures." },
          { num: "02", title: "Build & Launch", description: "We create campaigns, write ad copy, build landing pages, and set up conversion tracking before launching with controlled budgets." },
          { num: "03", title: "Optimize & Scale", description: "Weekly optimization of bids, keywords, and ads. Monthly reporting shows exactly how many patients each dollar brings in. We scale what works." },
        ]}
        stats={[
          { value: "$18", label: "Average Cost Per Lead" },
          { value: "4.8%", label: "Average Conversion Rate" },
          { value: "312%", label: "Average Return on Ad Spend" },
          { value: "40%", label: "Lower CPA vs. Industry Avg" },
        ]}
        faqs={[
          { q: "How much should I budget for Google Ads?", a: "Most medical practices see strong results starting at $2,000-5,000/month in ad spend, plus management fees. We'll recommend a budget based on your market competition, target procedures, and growth goals." },
          { q: "How quickly will I see results from Google Ads?", a: "Unlike SEO, Google Ads can drive leads within the first week. However, campaigns typically need 2-4 weeks of data to optimize effectively. By month 2, you should see consistent, cost-effective lead flow." },
          { q: "Do you build the landing pages too?", a: "Yes. Every campaign gets custom landing pages designed to convert. We've found that procedure-specific landing pages convert 2-3x better than sending ad traffic to your homepage." },
          { q: "How do you track which leads come from Google Ads?", a: "We implement call tracking, form tracking, and conversion attribution so every phone call and form submission is tied back to the exact ad and keyword that generated it." },
        ]}
      />
      <Footer />
    </>
  );
}
