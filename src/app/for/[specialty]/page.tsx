import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SPECIALTY_SLUGS,
  getSpecialty,
} from "@/lib/specialties";
import SpecialtyClient from "./SpecialtyClient";

const SITE_URL = "https://inflowmd.vercel.app";

export const dynamicParams = false;

export function generateStaticParams() {
  return SPECIALTY_SLUGS.map((specialty) => ({ specialty }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string }>;
}): Promise<Metadata> {
  const { specialty } = await params;
  const data = getSpecialty(specialty);
  if (!data) return {};

  const url = `${SITE_URL}/for/${data.slug}`;
  return {
    title: data.meta.title,
    description: data.meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${data.meta.title} | InflowMD`,
      description: data.meta.description,
      url,
    },
  };
}

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty } = await params;
  const data = getSpecialty(specialty);
  if (!data) notFound();

  return <SpecialtyClient data={data} />;
}
