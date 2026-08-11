import type { Metadata, Viewport } from "next";
import PitchClient from "./PitchClient";

/**
 * Booth presentation deck — a keyboard/remote-driven set of full-viewport
 * sections shown on the booth monitor. Runs entirely from local assets so
 * a conference hotspot can't take it down mid-pitch.
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: "InflowMD — Booth Presentation",
  description: "AI-powered marketing for medical practices.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#081C34",
  width: "device-width",
  initialScale: 1,
};

export default function PitchPage() {
  return <PitchClient />;
}
