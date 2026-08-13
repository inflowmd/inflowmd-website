import type { Metadata } from "next";
import MediaUploadClient from "./MediaUploadClient";

export const metadata: Metadata = {
  title: "Media Upload | InflowMD",
  description: "Upload photos, logos, and video for your InflowMD project. Send us the media for your practice website and we will handle sizing, format, and placement.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.inflowmd.com/media-upload" },
};

export default function MediaUploadPage() {
  return <MediaUploadClient />;
}
