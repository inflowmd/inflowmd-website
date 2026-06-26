import type { Metadata } from "next";
import ReactClient from "./ReactClient";

export const metadata: Metadata = {
  title: "Why We Build on React (and Next.js) | InflowMD",
  description:
    "Why InflowMD builds every medical practice website on React and Next.js — speed, security, AI-search readiness, and the foundation patient-acquisition runs on in 2026.",
  alternates: { canonical: "https://www.inflowmd.com/react" },
  openGraph: {
    title: "Why We Build on React | InflowMD",
    description:
      "Speed, security, AI-search readiness, and the foundation patient-acquisition runs on in 2026.",
    url: "https://www.inflowmd.com/react",
  },
};

export default function ReactPage() {
  return <ReactClient />;
}
