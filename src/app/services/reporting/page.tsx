import type { Metadata } from "next";
import ReportingClient from "./ReportingClient";

export const metadata: Metadata = {
  title: "Medical Marketing Analytics",
  description:
    "AI-powered dashboards and monthly reports that tie every marketing dollar to real patient inquiries. Full attribution, no vanity metrics.",
  alternates: { canonical: "https://inflowmd.vercel.app/services/reporting" },
  openGraph: {
    title: "Medical Marketing Analytics | InflowMD",
    description:
      "AI-powered dashboards and monthly reports that tie every marketing dollar to real patient inquiries. Full attribution, no vanity metrics.",
    url: "https://inflowmd.vercel.app/services/reporting",
  },
};

export default function ReportingPage() {
  return <ReportingClient />;
}
