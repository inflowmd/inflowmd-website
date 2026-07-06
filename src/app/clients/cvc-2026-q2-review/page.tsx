import type { Metadata } from "next";
import CvcReviewClient from "./CvcReviewClient";

export const metadata: Metadata = {
  title: "Q2 2026 Performance Review — Comprehensive Vein Care",
  description:
    "Private digital performance review prepared by InflowMD for Comprehensive Vein Care.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return <CvcReviewClient />;
}
