import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./home-v2.css";
import Motion from "./Motion";
import Shot from "./Shot";
import {
  coda,
  education,
  footer,
  hero,
  meta as pageMeta,
  nav,
  performance as perf,
  shots,
  visibility,
} from "./content";

/**
 * InflowMD /home-v2 — unlisted visual-first concept route.
 *
 * ISOLATION. Everything is in this directory plus public/home-v2/. No shared
 * component, root layout, global stylesheet, navigation, sitemap, config or
 * dependency is touched. Deleting the two directories removes the page.
 *
 * NOT THE HOMEPAGE. `/` is untouched. This route stays noindex/nofollow,
 * absent from the sitemap, and linked from nowhere.
 *
 * THE IMAGERY IS THE ARGUMENT. All six screens are real captures — a
 * launched practice site and the live InflowMD auditor — verified by sha256
 * against the controller's provenance manifest. Nothing here is a mock-up, a
 * placeholder or an invented interface, and the two Magnant preview files in
 * the source directory are deliberately not referenced.
 *
 * WHAT THE PAGE DOES NOT SAY. No score, statistic, elapsed time, benchmark,
 * testimonial or guarantee. Scene 3 draws how a visit unfolds and says in
 * words that it is a drawing. Scene 2 shows real schema types without
 * claiming any assistant has read or recommended anything.
 */

/* Scoped to this route: Outfit is already the site's --font-sans from the
   root layout, and re-declaring it here keeps this page self-contained
   without touching the layout. */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hv2",
  display: "swap",
});

const ROUTE_URL = "https://www.inflowmd.com/home-v2";

/** Concept-labelled social copy. Neutral by design: this page must not carry
    the root layout's marketing claim into a share card. */
const SOCIAL_TITLE = "Homepage concept · For review | InflowMD";
const SOCIAL_DESCRIPTION =
  "An unlisted homepage concept for review, exploring visibility, website performance and patient education.";

export const metadata: Metadata = {
  title: pageMeta.title,
  description: pageMeta.description,

  /* Self-referential. The root layout pins its canonical to the site root,
     and because metadata is shallowly merged this route inherited it --
     pointing every sharer and crawler at the homepage instead of here. */
  alternates: { canonical: ROUTE_URL },

  /* openGraph and twitter are REPLACED wholesale by the last segment that
     defines them, not deep-merged. So every field that should survive is
     restated here: dropping `images` would silently remove the share image
     rather than inherit it. The logo file itself is unchanged -- only its
     alt text is relabelled, because the inherited alt described the agency
     rather than this concept page. */
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "InflowMD",
    url: ROUTE_URL,
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        url: "/inflowmd-final.png",
        width: 1200,
        height: 630,
        alt: "InflowMD homepage concept — an unlisted page for review",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: ["/inflowmd-final.png"],
  },

  /* Route-scoped override of the root layout's index/follow. Unchanged. */
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

const ROOT_ID = "hv2-root";

/* Display widths, used for `sizes` so the browser picks the smaller variant
   on phones and never downloads a 2x asset it cannot use. */
const PHONE_SIZES = "(min-width: 1024px) 16rem, 72vw";
const HERO_PHONE_SIZES = "(min-width: 1024px) 15.5rem, 44vw";
const TABLET_SIZES = "(min-width: 1024px) 34rem, 86vw";

export default function HomeV2Page() {
  return (
    <div id={ROOT_ID} className={`hv2 ${outfit.variable}`}>
      <Motion rootId={ROOT_ID} />

      {/* ============ header ============ */}
      <header className="hv2-header">
        <div className="hv2-wrap hv2-header-in">
          {/* The existing logo asset, unmodified, on a consistently dark bar. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={nav.logoSrc} alt={nav.logoAlt} className="hv2-logo" width={788} height={118} />
          <span className="hv2-tag">{pageMeta.reviewLabel}</span>
          <nav className="hv2-header-links" aria-label="Concept page">
            <a href={nav.audit.href}>{nav.audit.label}</a>
            <a href={nav.call.href}>{nav.call.label}</a>
          </nav>
        </div>
      </header>

      <main>
        {/* ============ 01 · HERO ============ */}
        <section className="hv2-hero" data-hero>
          {/* Decorative: conceptual technology plane, no interface, no data. */}
          <div className="hv2-backdrop">
            <Shot
              base={shots.backdrop.base}
              widths={shots.backdrop.widths}
              ratio={shots.backdrop.ratio}
              alt={shots.backdrop.alt}
              sizes="100vw"
              priority
            />
          </div>

          <div className="hv2-wrap hv2-hero-in">
            <div className="hv2-hero-head">
              <p className="hv2-eyebrow">{hero.eyebrow}</p>
              <h1 className="hv2-h1">
                {hero.h1Lead} <span className="hv2-k">{hero.h1Accent}</span>
              </h1>
            </div>

            <div className="hv2-hero-art">
              <div className="hv2-cluster">
                <div className="hv2-cluster-tab" data-hero-tablet>
                  <div className="hv2-dev hv2-dev-tablet">
                    <div className="hv2-screen">
                      <Shot
                        base={shots.auditorTablet.base}
                        widths={shots.auditorTablet.widths}
                        ratio={shots.auditorTablet.ratio}
                        alt={shots.auditorTablet.alt}
                        sizes={TABLET_SIZES}
                        priority
                      />
                    </div>
                  </div>
                </div>
                <div className="hv2-cluster-ph" data-hero-phone>
                  <div className="hv2-dev">
                    <div className="hv2-screen">
                      <Shot
                        base={shots.practiceHome.base}
                        widths={shots.practiceHome.widths}
                        ratio={shots.practiceHome.ratio}
                        alt={shots.practiceHome.alt}
                        sizes={HERO_PHONE_SIZES}
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hv2-hero-rest">
              <p className="hv2-cap">{hero.caption}</p>
              <div className="hv2-ctas">
                <a className="hv2-btn hv2-btn-primary" href={hero.primary.href}>
                  {hero.primary.label}
                </a>
                <a className="hv2-btn hv2-btn-ghost" href={hero.secondary.href}>
                  {hero.secondary.label}
                </a>
              </div>
              <p className="hv2-micro">{hero.micro}</p>
            </div>
          </div>
        </section>

        {/* ============ 02 · VISIBILITY ============ */}
        <section className="hv2-scene hv2-scene-navy hv2-pin-s2" data-scene="visibility">
          <div className="hv2-stage">
            <div className="hv2-wrap hv2-split hv2-split-traced">
              {/* Four traces out of the device's LEFT edge, across the column
                  gap, ending on the schema rail. Proportional coordinates
                  (viewBox 0 0 100 100, preserveAspectRatio="none") keep the
                  endpoints on the rail from 1024px up, because the device's
                  left edge stays at 62.9-65.1% of the padding box the overlay is
                  positioned against, and the rail ends at 46.9-47.4%.
                  Decorative, so hidden from assistive tech. */}
              <svg
                className="hv2-traces"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M65 33 C 59 34, 54 35.5, 48.5 37" />
                <path d="M65 44 C 59.5 44.5, 54 45.5, 48.5 46" />
                <path d="M65 56 C 59.5 55.5, 54 54.5, 48.5 54" />
                <path d="M65 67 C 59 66, 54 64.5, 48.5 63" />
              </svg>

              <div>
                <p className="hv2-eyebrow">{visibility.eyebrow}</p>
                <h2 className="hv2-h2">
                  {visibility.h2Lead} <span className="hv2-k">{visibility.h2Accent}</span>
                </h2>
                <p className="hv2-cap">{visibility.caption}</p>
                <ul className="hv2-types">
                  {visibility.types.map((t) => (
                    <li key={t} className="hv2-type">
                      <span className="hv2-dot" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="hv2-types-note">{visibility.typesNote}</p>
              </div>

              <div className="hv2-field">
                <div className="hv2-dev">
                  <div className="hv2-screen">
                    <Shot
                      base={shots.practiceHome.base}
                      widths={shots.practiceHome.widths}
                      ratio={shots.practiceHome.ratio}
                      alt={shots.practiceHome.alt}
                      sizes={PHONE_SIZES}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 03 · PERFORMANCE ============ */}
        <section className="hv2-scene hv2-pin-s3" data-scene="performance">
          <div className="hv2-stage">
            <div className="hv2-wrap hv2-split">
              <div>
                <p className="hv2-eyebrow">{perf.eyebrow}</p>
                <h2 className="hv2-h2">
                  {perf.h2Lead} <span className="hv2-k">{perf.h2Accent}</span>
                </h2>
                <p className="hv2-cap">{perf.caption}</p>
                <div className="hv2-filament" aria-hidden="true">
                  <i />
                </div>
                <div className="hv2-stages" aria-hidden="true">
                  {perf.stages.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                {/* Stated in words, not only implied by styling. */}
                <p className="hv2-note">{perf.disclaimer}</p>
              </div>

              <div className="hv2-paint">
                <div className="hv2-dev">
                  <div className="hv2-screen">
                    <Shot
                      base={shots.practiceHome.base}
                      widths={shots.practiceHome.widths}
                      ratio={shots.practiceHome.ratio}
                      alt={shots.practiceHome.alt}
                      sizes={PHONE_SIZES}
                      className="hv2-paint-img"
                    />
                    {/* Quiet loading surface. Transparent unless motion runs,
                        so this is never a blank box on mobile or no-JS. */}
                    <div className="hv2-load" aria-hidden="true">
                      <i style={{ width: "62%" }} />
                      <i style={{ width: "88%" }} />
                      <i style={{ width: "44%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 04 · EDUCATION → INQUIRY ============ */}
        <section className="hv2-scene hv2-scene-navy hv2-pin-s4" data-scene="education">
          <div className="hv2-stage">
            <div className="hv2-wrap hv2-split">
              <div>
                <p className="hv2-eyebrow">{education.eyebrow}</p>
                <h2 className="hv2-h2">
                  {education.h2Lead} <span className="hv2-k">{education.h2Accent}</span>
                </h2>
                <p className="hv2-cap">{education.caption}</p>
                <ul className="hv2-rail">
                  {education.steps.map((s, i) => (
                    <li key={s.key} data-rail-index={i}>
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {/* All three real screens are in the DOM at every width. On a
                    phone this is a native horizontal snap sequence; with
                    motion on a wide screen it becomes a stacked crossfade. */}
                <div
                  className="hv2-film"
                  tabIndex={0}
                  role="group"
                  aria-label="Three screens from one practice site: learn, check, request"
                >
                  <div className="hv2-frame">
                    <div className="hv2-dev">
                      <div className="hv2-screen">
                        <Shot
                          base={shots.practiceStages.base}
                          widths={shots.practiceStages.widths}
                          ratio={shots.practiceStages.ratio}
                          alt={shots.practiceStages.alt}
                          sizes={PHONE_SIZES}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="hv2-frame">
                    <div className="hv2-dev">
                      <div className="hv2-screen">
                        <Shot
                          base={shots.practiceChecker.base}
                          widths={shots.practiceChecker.widths}
                          ratio={shots.practiceChecker.ratio}
                          alt={shots.practiceChecker.alt}
                          sizes={PHONE_SIZES}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="hv2-frame">
                    <div className="hv2-dev">
                      <div className="hv2-screen">
                        <Shot
                          base={shots.practiceRequest.base}
                          widths={shots.practiceRequest.widths}
                          ratio={shots.practiceRequest.ratio}
                          alt={shots.practiceRequest.alt}
                          sizes={PHONE_SIZES}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hv2-film-ctrl">
                  <button type="button" data-film-prev>
                    {education.prev}
                  </button>
                  <button type="button" data-film-next>
                    {education.next}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 05 · WHITE CODA ============ */}
        <section className="hv2-scene hv2-coda">
          <div className="hv2-wrap hv2-split" style={{ paddingBlock: "4rem" }}>
            <div>
              <p className="hv2-eyebrow">{coda.eyebrow}</p>
              <h2 className="hv2-h2">{coda.h2}</h2>
              <p className="hv2-cap">{coda.caption}</p>
              <div className="hv2-ctas">
                <a className="hv2-btn hv2-btn-primary" href={coda.primary.href}>
                  {coda.primary.label}
                </a>
                <a className="hv2-btn hv2-btn-ghost" href={coda.secondary.href}>
                  {coda.secondary.label}
                </a>
              </div>
              <p className="hv2-coda-limits">{coda.limits}</p>
            </div>

            <div className="hv2-coda-art">
              <div className="hv2-only-wide">
                <div className="hv2-dev hv2-dev-tablet">
                  <div className="hv2-screen">
                    <Shot
                      base={shots.auditorTablet.base}
                      widths={shots.auditorTablet.widths}
                      ratio={shots.auditorTablet.ratio}
                      alt={shots.auditorTablet.alt}
                      sizes={TABLET_SIZES}
                    />
                  </div>
                </div>
              </div>
              <div className="hv2-only-narrow">
                <div className="hv2-dev hv2-dev-phone">
                  <div className="hv2-screen">
                    <Shot
                      base={shots.auditorPhone.base}
                      widths={shots.auditorPhone.widths}
                      ratio={shots.auditorPhone.ratio}
                      alt={shots.auditorPhone.alt}
                      sizes={PHONE_SIZES}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ footer ============ */}
      <footer className="hv2-footer">
        <div className="hv2-wrap">
          <div className="hv2-footer-row">
            <span style={{ fontWeight: 700 }}>{footer.brand}</span>
            <a href={`mailto:${footer.email}`}>{footer.email}</a>
          </div>
          <p className="hv2-footer-note">{footer.note}</p>
        </div>
      </footer>
    </div>
  );
}
