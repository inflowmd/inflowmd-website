import type { Metadata } from "next";
import WhyNextjsClient from "./WhyNextjsClient";

/**
 * The third piece, after the deck and the audit: why the numbers in a
 * practice's report are a property of how the site is built rather than a
 * list of things to fix. Reached from the report's own button, and shared
 * by hand — hence still noindex.
 */
export const metadata: Metadata = {
  title: "Why the scores are structural | InflowMD",
  description:
    "The architecture behind your audit: when the page gets made, where it lives, why AI can read it, and why there is less to break.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.inflowmd.com/why-nextjs" },
};

export default function WhyNextjsPage() {
  return <WhyNextjsClient />;
}
