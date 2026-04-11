import type { Metadata } from "next";
import LocalPresenceClient from "./LocalPresenceClient";

export const metadata: Metadata = {
  title: "Local SEO & Maps for Medical Practices",
  description:
    "Dominate Google Maps and local search. 60+ directory listings, citation management, and NAP consistency for healthcare practices.",
  alternates: { canonical: "https://inflowmd.vercel.app/services/local-presence" },
  openGraph: {
    title: "Local SEO & Maps for Medical Practices | InflowMD",
    description:
      "Dominate Google Maps and local search. 60+ directory listings, citation management, and NAP consistency for healthcare practices.",
    url: "https://inflowmd.vercel.app/services/local-presence",
  },
};

export default function LocalPresencePage() {
  return <LocalPresenceClient />;
}
