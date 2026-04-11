import type { Metadata } from "next";
import GoogleAdsClient from "./GoogleAdsClient";

export const metadata: Metadata = {
  title: "Google Ads for Medical Practices",
  description:
    "AI-optimized Google Ads campaigns for doctors. Drive qualified patient leads while minimizing wasted ad spend. Every dollar tracked.",
  alternates: { canonical: "https://inflowmd.vercel.app/services/google-ads" },
  openGraph: {
    title: "Google Ads for Medical Practices | InflowMD",
    description:
      "AI-optimized Google Ads campaigns for doctors. Drive qualified patient leads while minimizing wasted ad spend. Every dollar tracked.",
    url: "https://inflowmd.vercel.app/services/google-ads",
  },
};

export default function GoogleAdsPage() {
  return <GoogleAdsClient />;
}
