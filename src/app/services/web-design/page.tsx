import type { Metadata } from "next";
import WebDesignClient from "./WebDesignClient";

export const metadata: Metadata = {
  title: "Medical Website Design & Development",
  description:
    "High-converting, mobile-first medical websites. ADA compliant, HIPAA-aware forms, and blazing fast performance for healthcare practices.",
  alternates: { canonical: "https://www.inflowmd.com/services/web-design" },
  openGraph: {
    title: "Medical Website Design & Development | InflowMD",
    description:
      "High-converting, mobile-first medical websites. ADA compliant, HIPAA-aware forms, and blazing fast performance for healthcare practices.",
    url: "https://www.inflowmd.com/services/web-design",
  },
};

export default function WebDesignPage() {
  return <WebDesignClient />;
}
