"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export default function WebDesignPage() {
  return (
    <>
      <Navbar />
      <ServicePageTemplate
        label="Website Design & Development"
        title="Websites that turn visitors into patients"
        subtitle="High-converting, mobile-first websites built specifically for medical practices — with ADA compliance, HIPAA-aware forms, and blazing fast performance."
        problemHeading="Your website is costing you patients"
        problemHighlight="costing you patients"
        problemText="An outdated or generic website doesn't just look bad — it actively drives patients to your competitors. In healthcare, your website is often the first impression, and patients judge your practice by it."
        problemPoints={[
          "Your website looks outdated and doesn't reflect the quality of care you provide",
          "It loads slowly on mobile, where 70%+ of patients are searching",
          "You have no ADA compliance, putting you at legal risk",
          "Online forms aren't HIPAA-aware, creating privacy concerns for patients",
        ]}
        features={[
          { title: "Custom Design", description: "Bespoke designs tailored to your specialty, brand, and patient demographic — no templates, no cookie-cutter layouts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
          { title: "Mobile-First Build", description: "Designed for phones first, then scaled up. Over 70% of healthcare searches happen on mobile — your site must be flawless on every screen.", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
          { title: "ADA Compliance", description: "WCAG 2.1 AA compliant design ensuring your website is accessible to all patients — and protecting you from legal action.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
          { title: "HIPAA-Aware Forms", description: "Secure contact and intake forms that protect patient data with encryption, secure transmission, and proper consent workflows.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
          { title: "Fast Load Times", description: "Optimized images, modern code, edge caching, and Core Web Vitals optimization for sub-2-second page loads.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { title: "SEO-Ready Architecture", description: "Clean URL structure, proper heading hierarchy, schema markup, and crawlable architecture so your site ranks from day one.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
        ]}
        steps={[
          { num: "01", title: "Discovery & Strategy", description: "We learn your practice, patients, and goals. Then we plan the sitemap, wireframes, and conversion strategy before any design work begins." },
          { num: "02", title: "Design & Build", description: "Our designers create custom mockups for approval, then our developers build a pixel-perfect, responsive site with all integrations." },
          { num: "03", title: "Launch & Optimize", description: "After thorough testing, we launch your site and monitor performance, making data-driven adjustments to maximize conversions." },
        ]}
        stats={[
          { value: "3.2x", label: "More Patient Conversions" },
          { value: "<2s", label: "Average Load Time" },
          { value: "100%", label: "ADA Compliant" },
          { value: "4.9★", label: "Client Satisfaction" },
        ]}
        faqs={[
          { q: "How long does a website project take?", a: "Most medical practice websites take 6-8 weeks from kickoff to launch. Complex sites with patient portals or multiple locations may take 8-12 weeks. We keep you updated throughout with a clear project timeline." },
          { q: "Will I be able to edit the website myself?", a: "We handle all updates and changes for you. Just tell us what you need and we'll take care of it — fast." },
          { q: "Do you handle the hosting and maintenance?", a: "Yes. We provide managed hosting with SSL certificates, daily backups, security monitoring, uptime guarantees, and ongoing maintenance so you never have to worry about the technical side." },
          { q: "What about HIPAA compliance for forms?", a: "All patient-facing forms use encrypted transmission and secure storage within our HIPAA-compliant environment. No patient data is stored on the website itself." },
        ]}
      />
      <Footer />
    </>
  );
}
