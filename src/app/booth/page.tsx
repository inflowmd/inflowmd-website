import type { Metadata, Viewport } from "next";
import AuditCounter from "./AuditCounter";
import RotatingHeadline from "./RotatingHeadline";

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
      {/* Stage and census centre as ONE group. With the stage taking flex-1
          alone, it centred inside its own slack and left a hole between the
          copy and the census band below it. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-[3.5vmin]">
      {/* Stage: column in portrait, row in landscape (see globals.css). */}
      <div className="kiosk-stage min-h-0 px-[5vmin]">
        <div className="kiosk-copy flex flex-col">
          <img
            src="/inflowmd-final.png"
            alt="InflowMD"
            draggable={false}
            width={788}
            height={118}
            className="h-[clamp(28px,4.4vmin,48px)] w-auto"
          />
          <RotatingHeadline />
          <p className="mt-[2.2vmin] max-w-[26em] text-[clamp(16px,2.8vmin,30px)] leading-[1.25]">
            <span className="block font-light text-slate-300">
              Free audit of your practice&rsquo;s site
            </span>
            <span
              className="mt-[0.6vmin] block font-semibold tracking-tight"
              style={{ color: "#84B83B" }}
            >
              Findings in under a minute
            </span>
          </p>
        </div>

        <div className="kiosk-qr flex flex-col items-center">
          <div className="relative">
            {/* Breathing lime glow. Sits BEHIND the card in its own layer and
                is purely decorative — the card and the QR bitmap never scale,
                blur or animate, so what a phone camera reads is always the
                crisp original. */}
            <div className="booth-qr-glow" aria-hidden />
            <div className="relative rounded-[2.6vmin] bg-white p-[2.4vmin] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <img
                src="/inflowmd-audit-qr.png"
                alt="QR code for a free website audit at inflowmd.com/audit"
                draggable={false}
                className="block h-[40vmin] w-[40vmin]"
                width={3000}
                height={3000}
              />
              <p className="mt-[1.4vmin] text-center text-[clamp(13px,1.9vmin,20px)] font-semibold leading-snug text-[#081C34]">
                <span className="block">Scan for your free audit</span>
                <span className="block">inflowmd.com/audit</span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* The census finding, permanent and full width.
          It sat inside the QR column, which is barely 350px wide in landscape
          — that is what squeezed it into four cramped lines. Spanning the
          poster instead, it reads as two, and both orientations get the same
          shape. Both figures are ours: 42 of the 59 attendee URLs run
          WordPress (71%), and 31 of the 56 practices we could score sit below
          75 on AI visibility (56%) — which is what makes "more than half" a
          count rather than a phrase. */}
      <div className="shrink-0 px-[5vmin] pb-[1vmin] text-center">
        <p className="mx-auto max-w-[34em] text-[clamp(20px,3.6vmin,42px)] font-extrabold leading-[1.14] tracking-tight text-white">
          More than half the practices at this conference are{" "}
          <span style={{ color: "#84B83B" }}>invisible to AI</span>.
        </p>
        <p className="mx-auto mt-[1.4vmin] max-w-[44em] text-[clamp(15px,2.6vmin,28px)] font-light leading-snug text-slate-300">
          We audited every attending practice. 71% are on WordPress. 56% score below 75 on
          AI visibility.
        </p>
      </div>

      </div>

      {/* Live counter. Renders nothing until it has a number worth showing,
          so this strip is simply empty for most of the conference's first
          hour — reserved height keeps the stage above it from shifting when
          it does appear. */}
      <div className="flex h-[4vmin] shrink-0 items-center justify-center px-[5vmin]">
        <AuditCounter />
      </div>
    </main>
  );
}
