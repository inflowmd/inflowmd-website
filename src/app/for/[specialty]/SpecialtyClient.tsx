"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import SpecialtyPageTemplate from "@/components/SpecialtyPageTemplate";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSchema from "@/components/ServiceSchema";
import type { SpecialtyData } from "@/lib/specialties";

const SITE_URL = "https://inflowmd.vercel.app";

export default function SpecialtyClient({ data }: { data: SpecialtyData }) {
  const pageUrl = `${SITE_URL}/for/${data.slug}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: data.label, url: pageUrl },
        ]}
      />
      <ServiceSchema
        name={data.meta.title}
        description={data.meta.description}
        url={pageUrl}
        audienceType={data.specialty}
      />
      <Navbar />
      <main>
        <SpecialtyPageTemplate data={data} />
      </main>
      <CTA />
      <Footer />
    </>
  );
}
