"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSchema from "@/components/ServiceSchema";

export default function ReputationClient() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://inflowmd.vercel.app" },
          { name: "Reputation Management", url: "https://inflowmd.vercel.app/services/reputation-management" },
        ]}
      />
      <ServiceSchema
        name="Doctor Reputation Management"
        description="Monitor, grow, and protect your online reviews. Automated review generation, sentiment analysis, and competitor tracking for medical practices."
        url="https://inflowmd.vercel.app/services/reputation-management"
      />
      <Navbar />
      <main>
        <ServicePageTemplate
          label="Reputation Management"
          title="Build trust before patients walk in"
          subtitle="Monitor, grow, and protect your online reviews across Google, Healthgrades, Vitals, and more. Because 84% of patients trust online reviews as much as personal referrals."
          problemHeading="One bad review can cost you thousands"
          problemHighlight="cost you thousands"
          problemText="Patients make decisions based on your online reviews before they ever call your office. A low rating, unanswered negative reviews, or too few reviews can silently drive away dozens of potential patients every month."
          problemPoints={[
            "You have fewer reviews than competitors, making you look less established",
            "Negative reviews sit unanswered, signaling you don't care about patient experience",
            "Happy patients leave without being asked — your best promoters stay silent",
            "You have no system to monitor what patients are saying across platforms",
          ]}
          features={[
            { title: "Review Monitoring", description: "Real-time alerts across Google, Healthgrades, Vitals, Yelp, and 20+ platforms. Never miss a review about your practice again.", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
            { title: "Review Generation", description: "Automated SMS and email campaigns that make it effortless for satisfied patients to leave reviews, timed perfectly after their visit.", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
            { title: "Sentiment Analysis", description: "AI-powered analysis of review trends to identify what patients love and what needs improvement — actionable insights for your practice.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { title: "Competitor Tracking", description: "Monitor competitor review volume, ratings, and sentiment so you always know where you stand in your market.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { title: "Review Dashboard", description: "A single dashboard showing all your reviews across all platforms with ratings trends, response rates, and growth metrics.", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
          ]}
          steps={[
            { num: "01", title: "Audit & Setup", description: "We audit your current online reputation across all platforms, set up monitoring, and configure your automated review generation campaigns." },
            { num: "02", title: "Generate & Respond", description: "Patients receive review requests via text and email after their visit — making it effortless to build your online reputation at scale." },
            { num: "03", title: "Analyze & Improve", description: "Monthly analysis of sentiment trends, competitor benchmarks, and actionable recommendations to continuously strengthen your reputation." },
          ]}
          stats={[
            { value: "+23", label: "Avg. New Reviews Per Month" },
            { value: "4.8★", label: "Avg. Client Rating Achieved" },
            { value: "< 4hr", label: "Average Response Time" },
            { value: "178%", label: "Review Volume Growth" },
          ]}
          faqs={[
            { q: "Can you remove negative reviews?", a: "We can't remove legitimate reviews, but we can help you respond professionally (which builds trust with future patients), report reviews that violate platform policies, and — most importantly — generate enough positive reviews to push your rating up." },
            { q: "Which platforms do you monitor?", a: "We monitor Google, Healthgrades, Vitals, Yelp, RateMDs, Zocdoc, WebMD, Facebook, and any specialty-specific platforms relevant to your practice. All reviews feed into a single dashboard." },
            { q: "How does the automated review generation work?", a: "After a patient visit, they receive a friendly SMS or email asking about their experience. Happy patients are directed to leave a public review. Those with concerns are routed to private feedback so you can resolve issues before they go public." },
            { q: "Will this work for a practice with a low rating?", a: "Yes — practices with lower ratings often see the fastest improvement. By generating a steady stream of new positive reviews and responding professionally to existing ones, most practices reach 4.5+ stars within 3-4 months." },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
