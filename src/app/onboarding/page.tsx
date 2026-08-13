import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

export const metadata: Metadata = {
  title: "Client Onboarding | InflowMD",
  description: "Welcome to InflowMD. Complete your onboarding form so we can build your website, set up your profiles, and start bringing patients to your practice.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.inflowmd.com/onboarding" },
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
