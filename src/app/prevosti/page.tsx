import type { Metadata } from "next";
import PrevostiClient from "./PrevostiClient";

export const metadata: Metadata = {
  title: "Audit Report: Prevosti Vein Center | InflowMD",
  description:
    "Private SEO / GEO / market audit prepared by InflowMD for Dr. Louis Prevosti and Prevosti Vein Center.",
  robots: { index: false, follow: false },
};

// Private single-reader audit page — never cache at the edge.
// force-dynamic disables static prerendering; revalidate=0 disables ISR.
// Cache-Control no-store is also set via next.config.ts headers() rule.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function PrevostiPage() {
  return <PrevostiClient />;
}
