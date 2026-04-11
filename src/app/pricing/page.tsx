import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Medical Marketing Pricing Plans",
  description:
    "Transparent pricing for healthcare marketing. Website, SEO, Google Ads, and reputation management plans starting at $350/mo.",
  alternates: { canonical: "https://inflowmd.vercel.app/pricing" },
  openGraph: {
    title: "Medical Marketing Pricing Plans | InflowMD",
    description:
      "Transparent pricing for healthcare marketing. Website, SEO, Google Ads, and reputation management plans starting at $350/mo.",
    url: "https://inflowmd.vercel.app/pricing",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
