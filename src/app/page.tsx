import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganizationSchema from "@/components/OrganizationSchema";
import HomeEngine from "./_home/HomeEngine";
import { MARKUP } from "./_home/markup";
import "./_home/home.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

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
