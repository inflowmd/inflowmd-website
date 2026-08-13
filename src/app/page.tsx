import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "InflowMD | Medical Practice Marketing Agency",
  description:
    "AI-powered digital marketing built for medical practices. Healthcare SEO, website design, Google Ads, and reputation management that grows patient volume.",
  alternates: { canonical: "https://www.inflowmd.com" },
};

export default function Home() {
  return <HomeClient />;
}
