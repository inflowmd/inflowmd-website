import type { Metadata } from "next";
import ReputationClient from "./ReputationClient";

export const metadata: Metadata = {
  title: "Doctor Reputation Management",
  description:
    "Monitor, grow, and protect your online reviews. Automated review generation, sentiment analysis, and competitor tracking for medical practices.",
  alternates: { canonical: "https://inflowmd.vercel.app/services/reputation-management" },
  openGraph: {
    title: "Doctor Reputation Management | InflowMD",
    description:
      "Monitor, grow, and protect your online reviews. Automated review generation, sentiment analysis, and competitor tracking for medical practices.",
    url: "https://inflowmd.vercel.app/services/reputation-management",
  },
};

export default function ReputationManagementPage() {
  return <ReputationClient />;
}
