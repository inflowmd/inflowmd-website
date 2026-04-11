"use client";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "InflowMD",
    url: "https://inflowmd.vercel.app",
    logo: "https://inflowmd.vercel.app/inflowmd-final.png",
    description:
      "AI-powered digital marketing agency built exclusively for medical practices. SEO, web design, Google Ads, and reputation management that drives real patient growth.",
    areaServed: "United States",
    serviceType: "Digital Marketing for Healthcare",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Medical Marketing Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Healthcare SEO & AI Visibility" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Medical Website Design & Development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google Ads for Medical Practices" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Local SEO & Presence Management" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reputation Management" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reporting & Analytics" } },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
