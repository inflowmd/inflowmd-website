import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "InflowMD - AI-Powered Digital Marketing for Medical Practices",
  description:
    "InflowMD is an AI-powered digital marketing agency built exclusively for medical practices. SEO, web design, Google Ads, and reputation management that drives real patient growth.",
  openGraph: {
    title: "InflowMD - AI-Powered Digital Marketing for Medical Practices",
    description:
      "Smarter growth for your practice. AI-driven healthcare marketing that delivers measurable results.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
