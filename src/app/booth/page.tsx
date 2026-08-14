import type { Metadata, Viewport } from "next";
import AuditCounter from "./AuditCounter";
import RotatingHeadline from "./RotatingHeadline";

/**
 * Conference booth display — a full-screen poster for a propped-up iPad.
 * Nothing on this page is tappable; the only interaction is scanning the
 * QR code with a phone.
 *
 * ONE IDEA ON SCREEN AT A TIME. The poster used to say the same thing three
 * ways at once — a rotating question, a standing "free audit, findings in
 * under a minute" line, a card caption repeating it again, and a permanent
 * census block underneath. Whatever a visitor read first, something else was
 * competing with it. Now there are three zones and only one of them talks:
 * the headline rotates, the QR sits under it, and a single muted line names
 * the address. The census moved into the rotation, where it gets its own
 * beat instead of shouting over the others.
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
      {/* One centred column in both orientations. The landscape two-column
          split is gone: the poster reads top to bottom now, so nothing sits
          beside the headline competing for the same glance. */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[7vmin] px-[6vmin] text-center">
        <div className="flex flex-col items-center">
          <img
            src="/inflowmd-final.png"
            alt="InflowMD"
            draggable={false}
            width={788}
            height={118}
            className="h-[clamp(24px,3.6vmin,40px)] w-auto opacity-90"
          />
          <RotatingHeadline />
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Breathing lime glow. Sits BEHIND the card in its own layer and
                is purely decorative — the card and the QR bitmap never scale,
                blur or animate, so what a phone camera reads is always the
                crisp original. */}
            <div className="booth-qr-glow" aria-hidden />
            <div className="relative rounded-[2.6vmin] bg-white p-[2.6vmin] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <img
                src="/inflowmd-audit-qr.png"
                alt="QR code for a free website audit at inflowmd.com/audit"
                draggable={false}
                className="block h-[36vmin] w-[36vmin]"
                width={3000}
                height={3000}
              />
            </div>
          </div>

          {/* The only supporting line on the poster. Muted on purpose: the
              headline has already said what this is, so all this line does is
              name the address for anyone who would rather type it. */}
          <p className="mt-[3vmin] text-[clamp(13px,2vmin,22px)] font-light tracking-wide text-slate-400">
            inflowmd.com/audit
          </p>
        </div>
      </div>

      {/* Live counter. Renders nothing until it has a number worth showing,
          so this strip is simply empty for most of the conference's first
          hour — reserved height keeps the zones above it from shifting when
          it does appear. */}
      <div className="flex h-[5vmin] shrink-0 items-center justify-center px-[6vmin]">
        <AuditCounter />
      </div>
    </main>
  );
}
