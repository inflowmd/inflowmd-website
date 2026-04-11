"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSchema from "@/components/ServiceSchema";

export default function SEOClient() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://inflowmd.vercel.app" },
          { name: "SEO & AI Visibility", url: "https://inflowmd.vercel.app/services/seo" },
        ]}
      />
      <ServiceSchema
        name="Healthcare SEO & AI Visibility"
        description="Rank higher on Google and get found by AI assistants. Medical practice SEO that drives organic patient growth with proven results."
        url="https://inflowmd.vercel.app/services/seo"
      />
      <Navbar />
      <main>
        <ServicePageTemplate
          label="SEO & AI Visibility"
          title="Rank on Google. Get found by AI."
          subtitle="Patients are searching for care online — and increasingly through AI assistants like ChatGPT and Gemini. We make sure they find you first."
          problemHeading="Invisible online means empty waiting rooms"
          problemHighlight="Invisible"
          problemText="Most medical practices invest in a website but never show up where patients actually search. If you're not on page one of Google — and now in AI-generated answers — you're losing patients to competitors every single day."
          problemPoints={[
            "Your website doesn't appear in Google's top 10 results for key procedures",
            "AI assistants like ChatGPT and Gemini never mention your practice",
            "Competitors are outranking you for the exact services you offer",
            "You're spending money on a website that generates almost no organic leads",
          ]}
          features={[
            { title: "Technical SEO Audit", description: "Full crawl analysis, Core Web Vitals optimization, schema markup, and site architecture fixes to ensure Google can find and index every page.", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            { title: "Keyword Research", description: "Data-driven analysis of what your ideal patients are searching for — from conditions and treatments to 'near me' and insurance queries.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
            { title: "Content Strategy", description: "Monthly blog posts, procedure pages, and FAQ content that answers patient questions and builds topical authority in your specialty.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
            { title: "On-Page Optimization", description: "Title tags, meta descriptions, header structure, internal linking, and image optimization for every key page on your site.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { title: "GEO / AI Optimization", description: "Structured data, citation building, and content formatting that ensures your practice appears in AI-generated search results.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { title: "Monthly Reporting", description: "Transparent monthly reports showing keyword rankings, organic traffic growth, lead attribution, and strategic recommendations.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
          ]}
          steps={[
            { num: "01", title: "Audit & Research", description: "We analyze your current rankings, technical health, competitor landscape, and AI visibility gaps to build a data-driven roadmap." },
            { num: "02", title: "Optimize & Create", description: "Our team implements technical fixes, optimizes existing pages, and creates new high-value content targeting your most profitable keywords." },
            { num: "03", title: "Monitor & Scale", description: "We track rankings weekly, report monthly, and continuously refine your strategy based on real performance data and algorithm updates." },
          ]}
          stats={[
            { value: "147%", label: "Avg. Organic Traffic Increase" },
            { value: "Top 3", label: "Google Rankings Achieved" },
            { value: "60+", label: "Keywords Tracked Monthly" },
            { value: "8x", label: "Return on SEO Investment" },
          ]}
          faqs={[
            { q: "How long does it take to see SEO results?", a: "Most practices see measurable improvement in 60-90 days, with significant rankings gains within 4-6 months. SEO is a long-term investment that compounds over time — the longer you invest, the stronger your results." },
            { q: "What is AI visibility and why does it matter?", a: "AI assistants like ChatGPT, Google Gemini, and Perplexity are increasingly how patients find providers. GEO (Generative Engine Optimization) ensures your practice appears in these AI-generated recommendations, not just traditional search results." },
            { q: "Do you write the content or do we need to provide it?", a: "We handle everything. Our medical content team writes all blog posts, procedure pages, and FAQ content. We may occasionally ask for a quick review to ensure clinical accuracy, but the heavy lifting is on us." },
            { q: "How do you report on SEO performance?", a: "You'll receive a monthly report with keyword rankings, organic traffic trends, lead attribution data, and strategic recommendations. Plus, you'll have access to a live dashboard you can check anytime." },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
