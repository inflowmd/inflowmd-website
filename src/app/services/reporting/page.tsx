"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicePageTemplate from "@/components/ServicePageTemplate";

export default function ReportingPage() {
  return (
    <>
      <Navbar />
      <ServicePageTemplate
        label="Reporting & Analytics"
        title="Know exactly what's working — and what's not"
        subtitle="AI-powered dashboards and monthly reports that tie every marketing dollar to real patient inquiries. No vanity metrics, no guesswork."
        problemHeading="Marketing without data is just guessing"
        problemHighlight="just guessing"
        problemText="Most practices have no idea which marketing channels are actually driving patients. Without proper tracking and reporting, you're making decisions in the dark — and wasting budget on what isn't working."
        problemPoints={[
          "You can't tell which marketing efforts are generating actual patient calls",
          "Monthly reports from your current agency are full of vanity metrics that don't matter",
          "You have no call tracking, so you don't know which ads or pages drive phone calls",
          "You're making budget decisions based on gut feeling instead of data",
        ]}
        features={[
          { title: "Google Analytics Setup", description: "Proper GA4 configuration with custom events, goals, and attribution modeling tailored to patient acquisition funnels.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
          { title: "Search Console Monitoring", description: "Weekly monitoring of your search performance — impressions, clicks, rankings, and indexing issues — with alerts for any drops.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          { title: "Call Tracking", description: "Dedicated tracking numbers for each marketing channel so you know exactly which campaigns are driving phone calls to your office.", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
          { title: "Lead Attribution", description: "Multi-touch attribution showing the full patient journey — from first website visit to booked appointment — across all marketing channels.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
          { title: "Custom Dashboards", description: "Real-time dashboards showing the KPIs that matter most to your practice — accessible anytime from any device.", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
          { title: "Monthly Strategy Reviews", description: "Data-driven recommendations each month on where to invest more, what to cut, and what to test next — not just a data dump.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
        ]}
        steps={[
          { num: "01", title: "Tracking Setup", description: "We audit your current analytics, set up proper tracking across all channels, and configure call tracking and form attribution." },
          { num: "02", title: "Dashboard Build", description: "We create custom real-time dashboards showing the metrics that matter — patient leads, cost per lead, channel performance, and ROI." },
          { num: "03", title: "Monthly Reviews", description: "Each month we deliver a clear report with performance analysis, trend insights, and strategic recommendations for the month ahead." },
        ]}
        stats={[
          { value: "100%", label: "Lead Source Attribution" },
          { value: "24/7", label: "Real-Time Dashboard Access" },
          { value: "3x", label: "Better Budget Allocation" },
          { value: "$0", label: "Wasted on Vanity Metrics" },
        ]}
        faqs={[
          { q: "What analytics tools do you use?", a: "We use Google Analytics 4, Google Search Console, call tracking platforms, and custom-built dashboards. Everything integrates to give you a single source of truth." },
          { q: "Can I access the dashboards anytime?", a: "Yes. Your custom dashboard is live 24/7 and accessible from any device. You'll also receive a formatted monthly report with analysis and recommendations." },
          { q: "What if we're already using Google Analytics?", a: "We'll audit your current setup, fix any configuration issues, and enhance it with proper event tracking, goal setup, and attribution modeling. Most practices have GA installed but not configured correctly." },
        ]}
      />
      <Footer />
    </>
  );
}
