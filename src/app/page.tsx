import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganizationSchema from "@/components/OrganizationSchema";
import HomeEngine from "./_home/HomeEngine";
import { MARKUP } from "./_home/markup";
import "./_home/home.css";

// Self-hosted (OFL) so the build never depends on fetching these from Google.
const geist = localFont({
  src: "./_home/fonts/Geist-latin.woff2",
  weight: "400 700",
  variable: "--font-geist",
  display: "swap",
});
const geistMono = localFont({
  src: "./_home/fonts/GeistMono-latin.woff2",
  weight: "400 500",
  variable: "--font-geist-mono",
  display: "swap",
});
const instrument = localFont({
  src: [
    { path: "./_home/fonts/InstrumentSerif-latin.woff2", weight: "400", style: "normal" },
    { path: "./_home/fonts/InstrumentSerif-Italic-latin.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InflowMD | Medical Practice Marketing Agency",
  description:
    "AI-powered digital marketing built for medical practices. Healthcare SEO, website design, Google Ads, and reputation management that grows patient volume.",
  alternates: { canonical: "https://www.inflowmd.com" },
};

export default function Home() {
  return (
    <>
      <OrganizationSchema />
      <Navbar />
      <div
        className={`ifx ${geist.variable} ${geistMono.variable} ${instrument.variable}`}
        dangerouslySetInnerHTML={{ __html: MARKUP }}
      />
      <HomeEngine />
      <Footer />
    </>
  );
}
