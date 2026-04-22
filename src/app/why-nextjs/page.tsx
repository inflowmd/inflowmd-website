import type { Metadata } from "next";
import WhyNextjsClient from "./WhyNextjsClient";

export const metadata: Metadata = {
  title: "Why We Build Different | InflowMD",
  description: "The technology behind your new website — and why it matters for your practice.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://inflowmd.vercel.app/why-nextjs" },
};

export default function WhyNextjsPage() {
  return <WhyNextjsClient />;
}
