import type { Metadata } from "next";
import HomeClient from "../HomeClient";

// The previous homepage, kept for reference. Hidden from search: noindex,
// nofollow here, an X-Robots-Tag header in next.config.ts, and left out of
// the sitemap and the nav.
export const metadata: Metadata = {
  title: { absolute: "InflowMD | Previous homepage" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: null },
};

export default function OldHome() {
  return <HomeClient />;
}
