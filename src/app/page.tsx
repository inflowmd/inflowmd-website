import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "InflowMD | Medical Practice Marketing Agency",
  description:
    "AI-powered digital marketing built for medical practices. Healthcare SEO, website design, Google Ads, and reputation management that drives real patient growth.",
  alternates: { canonical: "https://inflowmd.vercel.app" },
};

export default function Home() {
  return <HomeClient />;
}
