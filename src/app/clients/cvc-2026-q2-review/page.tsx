import type { Metadata } from "next";
import CvcReviewClient from "./CvcReviewClient";

const canonical = "https://www.inflowmd.com/clients/cvc-2026-q2-review";
const title = "Q2 2026 Performance Review — Comprehensive Vein Care";
const description =
  "Private digital performance review prepared by InflowMD for Comprehensive Vein Care.";

export const metadata: Metadata = {
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

export default function Page() {
  return <CvcReviewClient />;
}
