import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const CANONICAL = "https://www.inflowmd.com/pay";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: "Update Your Payment Method",
  description:
    "Securely update the card on file for your InflowMD service. Payments are processed by Cognito Forms.",
  alternates: { canonical: CANONICAL },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    title: "Update Your Payment Method — InflowMD",
    description: "Client-only payment update form.",
    url: CANONICAL,
    siteName: "InflowMD",
  },
};

export default function PayPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-foreground flex flex-col">
      <header className="border-b border-black/10 bg-warm-bg">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-extrabold tracking-tight text-lg sm:text-xl text-foreground"
          >
            Inflow<span className="text-accent">MD</span>
          </Link>
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-foreground/60">
            Client billing
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
            Update your payment method
          </h1>
          <p className="mt-4 text-base sm:text-lg text-foreground/70 leading-relaxed">
            Enter your new card details below. Payments are processed securely by
            Cognito Forms — card information never touches our servers.
          </p>

          <div className="mt-8 sm:mt-10 rounded-2xl bg-dark p-4 sm:p-6 shadow-xl" style={{ minHeight: 340 }}>
            <iframe
              src="https://www.cognitoforms.com/f/_uaaiFEytEy94LxTIBfO1w/94"
              allow="payment"
              style={{ border: 0, width: "100%", background: "transparent" }}
              height={312}
              title="InflowMD — Update Payment Method"
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10 bg-warm-bg">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/60">
          <span>© {new Date().getFullYear()} InflowMD</span>
          <a
            href="mailto:clayton@inflowmd.com"
            className="hover:text-foreground transition-colors"
          >
            clayton@inflowmd.com
          </a>
        </div>
      </footer>

      <Script
        src="https://www.cognitoforms.com/f/iframe.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
