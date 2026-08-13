"use client";

const SITE_URL = "https://www.inflowmd.com";

/**
 * Site-wide identity, as a @graph so the Organization node and the
 * ProfessionalService node describe the same entity rather than competing.
 *
 * Deliberately NOT MedicalBusiness, Physician, or MedicalOrganization:
 * InflowMD is a marketing agency, not a medical practice. Claiming a medical
 * type would win points in our own audit by lying about what this company is.
 *
 * `address` and `sameAs` are omitted rather than guessed. There is no postal
 * address anywhere in this codebase, and the footer's social icons still point
 * at "#", so there are no profile URLs to assert. An invented address or a
 * placeholder profile is false business data published to search engines —
 * worse than an absent field. Add them here once they are real.
 */
export default function OrganizationSchema() {
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "InflowMD",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/inflowmd-final.png`,
      width: 1200,
      height: 630,
    },
    description:
      "AI-powered digital marketing agency built exclusively for medical practices. SEO, web design, Google Ads, and reputation management that drives real patient growth.",
    email: "clayton@inflowmd.com",
    telephone: "+1-800-597-6912",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: "+1-800-597-6912",
        email: "clayton@inflowmd.com",
        areaServed: "US",
        availableLanguage: "English",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    knowsAbout: [
      "Healthcare SEO",
      "Medical website design",
      "Google Ads for medical practices",
      "Local SEO for physicians",
      "Online reputation management",
      "AI search visibility",
    ],
  };

  const service = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    name: "InflowMD",
    url: SITE_URL,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    provider: { "@id": `${SITE_URL}/#organization` },
    description:
      "Digital marketing services for medical practices: SEO and AI visibility, website design, Google Ads, local presence, reputation management, and reporting.",
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

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "InflowMD",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [organization, service, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
