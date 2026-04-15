import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

export const metadata: Metadata = {
  title: "Client Onboarding | InflowMD",
  description: "Welcome to InflowMD. Complete your onboarding form to get your medical practice marketing started.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://inflowmd.vercel.app/onboarding" },
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
