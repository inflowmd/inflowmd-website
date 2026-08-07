import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuditReport from "./AuditReport";
import GrowthRecommendation from "./GrowthRecommendation";
import TabbedReport from "./TabbedReport";
import { getAllAuditSlugs, getAudit, getRecommendation } from "../data";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getAllAuditSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const audit = getAudit(slug);
  if (!audit) {
    return {
      title: "Audit not found",
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    };
  }
  const canonical = `https://www.inflowmd.com/audit/${audit.slug}`;
  const title = `Confidential Technical Audit — Prepared for ${audit.practice.name}`;
  const description = `A page-by-page technical review of ${audit.practice.domain}, prepared July 2026 by InflowMD.`;
  return {
    metadataBase: new URL("https://www.inflowmd.com"),
    title,
    description,
    alternates: { canonical },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "InflowMD",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditSlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const audit = getAudit(slug);
  if (!audit) notFound();
  const recommendation = getRecommendation(slug);
  if (!recommendation) return <AuditReport data={audit} />;
  return (
    <TabbedReport
      recommendation={<GrowthRecommendation data={recommendation} />}
      audit={<AuditReport data={audit} />}
    />
  );
}
