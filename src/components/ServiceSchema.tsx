"use client";

export default function ServiceSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "ProfessionalService",
      name: "InflowMD",
      url: "https://inflowmd.vercel.app",
    },
    areaServed: "United States",
    audience: {
      "@type": "Audience",
      audienceType: "Medical Practices",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
