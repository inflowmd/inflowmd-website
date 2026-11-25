import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SolutionsEngine from "./SolutionsEngine";
import { MARKUP } from "./markup";
import "./solutions.css";

// Same self-hosted Geist file the homepage uses.
const geist = localFont({
  src: "../_home/fonts/Geist-latin.woff2",
  weight: "400 700",
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "How InflowMD turns searches into booked visits for medical practices: SEO and AI visibility, website design, Google Ads, local presence, reputation and reporting, working as one system.",
  alternates: { canonical: "https://www.inflowmd.com/solutions" },
  openGraph: {
    title: "Solutions | InflowMD",
    description:
      "SEO and AI visibility, websites, Google Ads, local presence, reputation and reporting, working as one patient-growth system.",
    url: "https://www.inflowmd.com/solutions",
  },
};

export default function SolutionsPage() {
  return (
    <>
      <Navbar />
      <div className={`isol ${geist.variable}`} dangerouslySetInnerHTML={{ __html: MARKUP }} />
      <SolutionsEngine />
      <Footer />
    </>
  );
}
