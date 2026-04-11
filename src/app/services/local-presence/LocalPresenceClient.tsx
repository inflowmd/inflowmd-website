"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSchema from "@/components/ServiceSchema";

export default function LocalPresenceClient() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://inflowmd.vercel.app" },
          { name: "Local SEO & Maps", url: "https://inflowmd.vercel.app/services/local-presence" },
        ]}
      />
      <ServiceSchema
        name="Local SEO & Maps for Medical Practices"
        description="Dominate Google Maps and local search. 60+ directory listings, citation management, and NAP consistency for healthcare practices."
        url="https://inflowmd.vercel.app/services/local-presence"
      />
      <Navbar />
      <main>
        <ServicePageTemplate
          label="Local Presence Management"
          title="Dominate local search and maps"
          subtitle="Ensure your practice shows up accurately everywhere patients look — Google Maps, Apple Maps, and 60+ directories — with consistent NAP data and optimized listings."
          problemHeading="Inconsistent listings are killing your visibility"
          problemHighlight="killing your visibility"
          problemText="When your practice name, address, or phone number varies across directories, search engines lose trust in your business data. The result: you drop in local rankings and patients find your competitors instead."
          problemPoints={[
            "Your Google Business Profile is incomplete or has outdated information",
            "Duplicate listings across directories are confusing search engines",
            "Inconsistent name/address/phone (NAP) data is hurting your local rankings",
            "You're invisible on Apple Maps, Yelp, Healthgrades, and dozens of other directories patients use",
          ]}
          features={[
            { title: "Listings Syndication", description: "We submit and manage your practice information across 60+ directories, data aggregators, and healthcare-specific platforms.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
            { title: "Citation Management", description: "Ongoing monitoring and correction of all citations to ensure your practice data stays accurate and consistent across the web.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            { title: "Duplicate Suppression", description: "We find and suppress duplicate listings that fragment your authority and confuse patients trying to find the right location.", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
            { title: "NAP Consistency", description: "Ensuring your Name, Address, and Phone number are identical across every single listing — the #1 factor in local search rankings.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "Apple Maps Optimization", description: "Full optimization of your Apple Maps listing, which powers Siri and default navigation for all iPhone users in your area.", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
            { title: "Google Business Profile", description: "Complete GBP optimization including categories, services, Q&A, posts, photos, and attributes to maximize your Maps visibility.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          ]}
          steps={[
            { num: "01", title: "Audit & Cleanup", description: "We scan every directory and data aggregator to find inconsistencies, duplicates, and missing listings affecting your local visibility." },
            { num: "02", title: "Optimize & Submit", description: "We correct all errors, suppress duplicates, and submit optimized listings to 60+ directories with consistent NAP data." },
            { num: "03", title: "Monitor & Maintain", description: "Ongoing monitoring ensures your data stays accurate. We catch and fix changes automatically and report on your local visibility monthly." },
          ]}
          stats={[
            { value: "60+", label: "Directories Managed" },
            { value: "3x", label: "More Maps Visibility" },
            { value: "98%", label: "NAP Accuracy Score" },
            { value: "45%", label: "Increase in Local Calls" },
          ]}
          faqs={[
            { q: "Why do directory listings matter for a medical practice?", a: "Google uses data from dozens of directories to verify your practice information. Consistent, accurate listings across the web signal trustworthiness and directly improve your Google Maps and local search rankings." },
            { q: "How many directories do you submit to?", a: "We manage listings across 60+ directories including Google, Apple Maps, Bing, Yelp, Healthgrades, Vitals, WebMD, Zocdoc, and all major data aggregators that feed smaller directories." },
            { q: "What if we have multiple locations?", a: "We manage each location individually with its own optimized listing set. Multi-location practices often see the biggest gains because inconsistencies compound across locations." },
            { q: "How long until we see results from local SEO?", a: "Most practices see improvements in Google Maps visibility within 4-6 weeks. Full citation consistency across all directories typically takes 8-12 weeks as changes propagate through data networks." },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
