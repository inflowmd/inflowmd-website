import type { Metadata } from "next";
import PrevostiClient from "./PrevostiClient";

export const metadata: Metadata = {
  title: "Audit Report: Prevosti Vein Center | InflowMD",
  description:
    "Private SEO / GEO / market audit prepared by InflowMD for Dr. Louis Prevosti and Prevosti Vein Center.",
  robots: { index: false, follow: false },
};

export default function PrevostiPage() {
  return <PrevostiClient />;
}
