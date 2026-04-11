import type { Metadata } from "next";
import GetStartedClient from "./GetStartedClient";

export const metadata: Metadata = {
  title: "Book a Free Strategy Call",
  description:
    "Schedule a free 15-minute strategy call with InflowMD. Get a free AI audit and custom growth roadmap for your medical practice.",
  alternates: { canonical: "https://inflowmd.vercel.app/get-started" },
  openGraph: {
    title: "Book a Free Strategy Call | InflowMD",
    description:
      "Schedule a free 15-minute strategy call with InflowMD. Get a free AI audit and custom growth roadmap for your medical practice.",
    url: "https://inflowmd.vercel.app/get-started",
  },
};

export default function GetStartedPage() {
  return <GetStartedClient />;
}
