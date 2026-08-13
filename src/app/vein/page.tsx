import type { Metadata } from "next";
import VeinClient from "./VeinClient";

export const metadata: Metadata = {
  title: "Vein & Vascular Practice Websites | InflowMD",
  description:
    "Patient-acquisition systems for vein and vascular practices: React-based, story-driven websites that outperform generic vein-clinic templates.",
  robots: { index: false, follow: false },
};

export default function VeinPage() {
  return <VeinClient />;
}
