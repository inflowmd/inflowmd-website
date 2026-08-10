import type { Metadata, Viewport } from "next";
import ProofRotator from "./ProofRotator";

/**
 * Conference booth display — a full-screen poster for a propped-up iPad.
 * Nothing on this page is tappable; the only interaction is scanning the
 * QR code with a phone. InflowMD branding (business-card navy + green),
 * no practice branding, no site chrome.
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: "InflowMD — Free Practice Website Audit",
  description: "Scan for a free audit of your practice's website.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  // Home-screen web-app meta. No meta tag can stop the iPad from sleeping —
  // that requires Auto-Lock: Never plus Guided Access in Settings.
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#081C34",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function BoothDisplayPage() {
  return (
    <main className="kiosk-lock fixed inset-0 flex flex-col overflow-hidden bg-[#081C34] text-white">
      {/* Stage: column in portrait, row in landscape (see globals.css). */}
      <div className="kiosk-stage flex-1 min-h-0 px-[6vmin]">
        <div className="kiosk-copy flex flex-col">
          <p className="text-[clamp(14px,2.2vmin,22px)] font-bold uppercase tracking-[0.42em] text-[#84B83B]">
            InflowMD
          </p>
          <h1 className="mt-[2.5vmin] max-w-[16em] text-[clamp(30px,6.4vmin,72px)] font-extrabold leading-[1.06] tracking-tight text-white">
            Is your website costing you patients?
          </h1>
          <p className="mt-[2.5vmin] max-w-[26em] text-[clamp(16px,2.9vmin,30px)] font-light leading-snug text-slate-300">
            Free audit of your practice&rsquo;s site — findings in 48 hours
          </p>
        </div>

        <div className="kiosk-qr flex flex-col items-center">
          <div className="rounded-[3vmin] bg-white p-[3.5vmin] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <img
              src="/inflowmd-audit-qr.png"
              alt="QR code for a free website audit at inflowmd.com/audit"
              draggable={false}
              className="block h-[40vmin] w-[40vmin]"
              width={3000}
              height={3000}
            />
            <p className="mt-[2vmin] text-center text-[clamp(13px,2vmin,20px)] font-semibold leading-snug text-[#081C34]">
              <span className="block">Scan for your free audit</span>
              <span className="block">inflowmd.com/audit</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-[6vmin] pb-[4vmin] pt-[2vmin]">
        <ProofRotator />
      </div>
    </main>
  );
}
