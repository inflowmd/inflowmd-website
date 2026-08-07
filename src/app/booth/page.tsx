import type { Metadata } from "next";
import type { AuditResult } from "@/types/audit";
import prewarmed from "../../../data/prewarmed-audits.json";
import BoothClient from "./BoothClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: "Site Audit — InflowMD",
  description: "Live website audit.",
  alternates: { canonical: "https://www.inflowmd.com/booth" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

interface PrewarmedFile {
  generatedAt: string | null;
  count: number;
  results: AuditResult[];
}

export default function BoothPage() {
  const file = prewarmed as unknown as PrewarmedFile;
  // The full cached results are embedded so a picker selection renders with
  // no network round trip — conference wifi is exactly what we cannot rely on.
  return <BoothClient practices={file.results ?? []} />;
}
