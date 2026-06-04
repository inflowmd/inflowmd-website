import type { Metadata } from "next";
import MediaUploadClient from "./MediaUploadClient";

export const metadata: Metadata = {
  title: "Media Upload | InflowMD",
  description: "Upload media files for your InflowMD project.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://inflowmd.vercel.app/media-upload" },
};

export default function MediaUploadPage() {
  return <MediaUploadClient />;
}
