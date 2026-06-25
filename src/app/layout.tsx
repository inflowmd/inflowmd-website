import type { Metadata } from "next";
import { Outfit, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const SITE_URL = "https://inflowmd.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InflowMD | Medical Practice Marketing Agency",
    template: "%s | InflowMD",
  },
  description:
    "AI-powered digital marketing built for medical practices. SEO, web design, Google Ads, and reputation management that drives real patient growth.",
  keywords: [
    "medical practice marketing",
    "healthcare SEO",
    "doctor marketing agency",
    "medical website design",
    "healthcare digital marketing",
    "patient acquisition",
    "medical Google Ads",
    "physician marketing",
    "healthcare reputation management",
    "medical practice growth",
  ],
  authors: [{ name: "InflowMD" }],
  creator: "InflowMD",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "InflowMD",
    title: "InflowMD | Medical Practice Marketing Agency",
    description:
      "AI-powered healthcare marketing that delivers measurable patient growth. SEO, web design, Google Ads & reputation management.",
    images: [
      {
        url: `${SITE_URL}/inflowmd-final.png`,
        width: 1200,
        height: 630,
        alt: "InflowMD - Medical Practice Marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InflowMD | Medical Practice Marketing Agency",
    description:
      "AI-powered healthcare marketing that delivers measurable patient growth.",
    images: [`${SITE_URL}/inflowmd-final.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${outfit.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {/* Calendly script moved to /get-started only — it was previously
            loaded on every route, including the homepage where no widget
            is mounted. Loading it globally caused mobile Safari to
            allocate the widget runtime + pending iframe for nothing,
            which contributed to OOM crashes ("A problem repeatedly
            occurred"). It's now loaded inside GetStartedClient.tsx. */}
      </body>
    </html>
  );
}
