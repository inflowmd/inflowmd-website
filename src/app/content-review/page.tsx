import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";

/**
 * Client content-approval page.
 *
 * Unlisted by design: no navbar entry, no footer link, absent from
 * sitemap.ts (which is an explicit list, not a crawl), and noindex. The only
 * way here is the link we send.
 *
 * The page has exactly one job — read the copy, approve it or ask for edits —
 * so there is deliberately no navigation and no second call to action.
 */

const CANONICAL = "https://www.inflowmd.com/content-review";
const PHONE_DISPLAY = "(800) 597-6912";
const PHONE_HREF = "tel:+18005976912";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inflowmd.com"),
  title: "Content Review",
  description:
    "Review the website copy we have drafted for your practice, approve what works, and tell us what you would like changed before we publish.",
  alternates: { canonical: CANONICAL },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function ContentReviewPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-foreground flex flex-col">
      <main className="flex-1">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          {/* The practice's own light-ground lockup — gold mark, dark wordmark,
              on transparency — so it sits directly on the background with no
              plaque. The brand kit's other lockups are all built for dark
              grounds and are baked onto solid black rectangles; any of those
              would have shown up here as a black box. */}
          <div className="flex justify-center">
            <Image
              src="/veinity-logo.png"
              alt="Vein-ity Vein Care Centers of Kansas"
              width={582}
              height={188}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>

          <header className="mt-10 sm:mt-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Content Review
            </h1>
            <p className="mt-4 text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto">
              Review the copy below and let us know what works and what you&rsquo;d like
              changed.
            </p>
          </header>

          {/* Full-bleed within the container. overflow-hidden is the guard: if
              the embed ever reports a width wider than its column, the page
              must not scroll sideways on a phone.

              The vertical padding is inside the card so the form breathes
              against its own edges as well as against the heading and footer:
              32px on a phone, 56px from the sm breakpoint up. */}
          <div className="mt-10 sm:mt-14 mb-10 sm:mb-14 overflow-hidden rounded-2xl bg-white border border-black/[0.07] shadow-sm py-8 sm:py-14">
            <iframe
              src="https://www.cognitoforms.com/f/_uaaiFEytEy94LxTIBfO1w/274"
              allow="payment"
              title="Content review and approval form"
              style={{ border: 0, width: "100%" }}
              height={1161}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-8 text-center text-sm text-foreground/60">
          Questions? Reply to the email or call{" "}
          <a
            href={PHONE_HREF}
            className="font-semibold text-foreground/80 hover:text-accent transition-colors whitespace-nowrap"
          >
            {PHONE_DISPLAY}
          </a>
          .
        </div>
      </footer>

      {/* Cognito's resize script. afterInteractive so it runs once the page is
          interactive — it finds the iframe and keeps its height in step with
          the form's content, which is what stops a fixed 1161px from either
          clipping the form or leaving dead space under it. */}
      <Script src="https://www.cognitoforms.com/f/iframe.js" strategy="afterInteractive" />
    </div>
  );
}
