import type { Metadata } from "next";
import SEOClient from "./SEOClient";

export const metadata: Metadata = {
  title: "Healthcare SEO & AI Visibility",
  description:
    "Rank higher on Google and get found by AI assistants. Medical practice SEO that drives organic patient growth with proven results.",
  alternates: { canonical: "https://www.inflowmd.com/services/seo" },
  openGraph: {
    title: "Healthcare SEO & AI Visibility | InflowMD",
    description:
      "Rank higher on Google and get found by AI assistants. Medical practice SEO that drives organic patient growth.",
    url: "https://www.inflowmd.com/services/seo",
  },
};

export default function SEOPage() {
  return <SEOClient />;
}
