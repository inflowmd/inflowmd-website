import type { Check } from "@/types/audit";
import {
  findHeadingSkip,
  getHeadings,
  getImageAltStats,
  getLinkHref,
  getMeta,
  getTitle,
  stripComments,
  type Heading,
} from "./html";

/**
 * Search-visibility checks, written for a practice owner rather than a
 * developer. Every check that depends on reading the page returns
 * `could_not_verify` when the fetch failed.
 */

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 158;

export interface SeoCheckInput {
  url: string;
  html: string;
  /** False when the page could not be read — forces could_not_verify. */
  htmlOk: boolean;
}

export interface SeoCheckOutput {
  checks: Check[];
  /** Reused by the AI-readiness module so headings are parsed once. */
  headings: Heading[];
}

function unverified(id: string, label: string, reason: string): Check {
  return {
    id,
    label,
    status: "could_not_verify",
    detail: reason,
  };
}

export function runSeoChecks({ url, html, htmlOk }: SeoCheckInput): SeoCheckOutput {
  // HTTPS is derived from the URL itself, so it stands even when the page
  // could not be read.
  const isHttps = url.toLowerCase().startsWith("https://");
  const httpsCheck: Check = isHttps
    ? {
        id: "seo.https",
        label: "Secure connection",
        status: "pass",
        detail:
          "Your site loads over a secure connection, which patients' browsers and Google both expect.",
        evidence: "https://",
      }
    : {
        id: "seo.https",
        label: "Secure connection",
        status: "fail",
        detail:
          "Your site is not using a secure connection, so browsers may warn patients before they ever see the page.",
        evidence: "http://",
      };

  if (!htmlOk) {
    const reason =
      "We could not read this page, so we did not check this. It may well be fine.";
    return {
      headings: [],
      checks: [
        httpsCheck,
        unverified("seo.title", "Page title", reason),
        unverified("seo.meta-description", "Search result description", reason),
        unverified("seo.h1", "Main page heading", reason),
        unverified("seo.heading-order", "Heading structure", reason),
        unverified("seo.viewport", "Mobile display setting", reason),
        unverified("seo.canonical", "Preferred page address", reason),
        unverified("seo.open-graph", "Social sharing preview", reason),
        unverified("seo.image-alt", "Image descriptions", reason),
      ],
    };
  }

  const doc = stripComments(html);
  const checks: Check[] = [httpsCheck];

  // --- Page title -----------------------------------------------------------
  const title = getTitle(doc);
  if (!title) {
    checks.push({
      id: "seo.title",
      label: "Page title",
      status: "fail",
      detail:
        "This page has no title, so search engines have no headline to show patients in results.",
    });
  } else if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    checks.push({
      id: "seo.title",
      label: "Page title",
      status: "warn",
      detail:
        title.length > TITLE_MAX
          ? `Your page title is ${title.length} characters, so Google will likely cut it off in search results.`
          : `Your page title is only ${title.length} characters — there is room to say more about what you treat and where.`,
      evidence: title,
    });
  } else {
    checks.push({
      id: "seo.title",
      label: "Page title",
      status: "pass",
      detail: `Your page title is ${title.length} characters — a good length to display in full.`,
      evidence: title,
    });
  }

  // --- Meta description -----------------------------------------------------
  const description = getMeta(doc, "description");
  if (!description) {
    checks.push({
      id: "seo.meta-description",
      label: "Search result description",
      status: "fail",
      detail:
        "This page has no description, so Google will invent one from whatever text it finds — often the wrong text.",
    });
  } else if (description.length < DESC_MIN || description.length > DESC_MAX) {
    checks.push({
      id: "seo.meta-description",
      label: "Search result description",
      status: "warn",
      detail:
        description.length > DESC_MAX
          ? `Your search description is ${description.length} characters and will be trimmed mid-sentence in results.`
          : `Your search description is only ${description.length} characters — short descriptions waste the space you get to persuade a patient to click.`,
      evidence: description,
    });
  } else {
    checks.push({
      id: "seo.meta-description",
      label: "Search result description",
      status: "pass",
      detail: `Your search description is ${description.length} characters — the right length to display in full.`,
      evidence: description,
    });
  }

  // --- Headings -------------------------------------------------------------
  const headings = getHeadings(doc);
  const h1s = headings.filter((h) => h.level === 1);

  // A real page essentially always has at least one heading somewhere. Zero
  // matches across all six levels is far likelier to be our reader failing
  // than a site with no headings at all — so we decline to judge it.
  if (headings.length === 0) {
    const reason =
      "We could not identify any headings on this page, which usually means our reader could not interpret the markup rather than that headings are missing.";
    checks.push({
      id: "seo.h1",
      label: "Main page heading",
      status: "could_not_verify",
      detail: reason,
    });
    checks.push({
      id: "seo.heading-order",
      label: "Heading structure",
      status: "could_not_verify",
      detail: reason,
    });
  } else if (h1s.length === 1) {
    checks.push({
      id: "seo.h1",
      label: "Main page heading",
      status: "pass",
      detail: "This page has one clear main heading, which tells search engines what it is about.",
      evidence: h1s[0].text || undefined,
    });
  } else if (h1s.length === 0) {
    checks.push({
      id: "seo.h1",
      label: "Main page heading",
      status: "fail",
      detail:
        "This page has no main heading, so search engines have to guess what the page is about.",
    });
  } else {
    checks.push({
      id: "seo.h1",
      label: "Main page heading",
      status: "warn",
      detail: `This page has ${h1s.length} main headings competing with each other, which muddies what it is about.`,
      evidence: h1s.map((h) => h.text).filter(Boolean).slice(0, 3).join(" · ") || undefined,
    });
  }

  // The zero-heading case is handled above as could_not_verify.
  if (headings.length > 0) {
    const skip = findHeadingSkip(headings);
    checks.push(
      skip
        ? {
            id: "seo.heading-order",
            label: "Heading structure",
            status: "warn",
            detail:
              "Your headings skip a level, which makes the page harder to follow for screen readers and search engines.",
            evidence: `Jumps from a level ${skip.fromLevel} heading to a level ${skip.toLevel} heading`,
          }
        : {
            id: "seo.heading-order",
            label: "Heading structure",
            status: "pass",
            detail: "Your headings step down in order, so the page reads as a clear outline.",
            evidence: `${headings.length} headings, in order`,
          }
    );
  }

  // --- Viewport -------------------------------------------------------------
  const viewport = getMeta(doc, "viewport");
  checks.push(
    viewport
      ? {
          id: "seo.viewport",
          label: "Mobile display setting",
          status: "pass",
          detail: "This page is set up to resize properly on phones.",
          evidence: viewport,
        }
      : {
          id: "seo.viewport",
          label: "Mobile display setting",
          status: "fail",
          detail:
            "This page is missing its mobile display setting, so it may render at desktop width and force patients to pinch and zoom.",
        }
  );

  // --- Canonical ------------------------------------------------------------
  const canonical = getLinkHref(doc, "canonical");
  checks.push(
    canonical
      ? {
          id: "seo.canonical",
          label: "Preferred page address",
          status: "pass",
          detail:
            "This page tells search engines which web address is the official one, which prevents duplicate versions competing with each other.",
          evidence: canonical,
        }
      : {
          id: "seo.canonical",
          label: "Preferred page address",
          status: "warn",
          detail:
            "This page does not declare an official web address, so search engines may treat variations of it as separate competing pages.",
        }
  );

  // --- Open Graph -----------------------------------------------------------
  const ogTitle = getMeta(doc, "og:title");
  const ogDescription = getMeta(doc, "og:description");
  const ogImage = getMeta(doc, "og:image");
  const ogPresent = [
    ogTitle ? "title" : null,
    ogDescription ? "description" : null,
    ogImage ? "image" : null,
  ].filter(Boolean) as string[];

  if (ogPresent.length === 3) {
    checks.push({
      id: "seo.open-graph",
      label: "Social sharing preview",
      status: "pass",
      detail:
        "When someone shares your page in a text or on social media, it will show a proper title, description and image.",
      evidence: "og:title, og:description, og:image all present",
    });
  } else if (ogPresent.length === 0) {
    checks.push({
      id: "seo.open-graph",
      label: "Social sharing preview",
      status: "fail",
      detail:
        "When someone shares your page, it will appear as a bare link with no title, description or image.",
    });
  } else {
    checks.push({
      id: "seo.open-graph",
      label: "Social sharing preview",
      status: "warn",
      detail:
        "Your shared-link preview is incomplete, so posts and texts linking to you will look half-finished.",
      evidence: `Found only: ${ogPresent.join(", ")}`,
    });
  }

  // --- Image alt text -------------------------------------------------------
  const alt = getImageAltStats(doc);
  if (alt.total === 0) {
    checks.push({
      id: "seo.image-alt",
      label: "Image descriptions",
      status: "pass",
      detail: "This page has no images that would need written descriptions.",
      evidence: "0 images found",
    });
  } else {
    const coverage = alt.withAlt / alt.total;
    const evidence = `${alt.withAlt} of ${alt.total} images have alt text`;
    checks.push({
      id: "seo.image-alt",
      label: "Image descriptions",
      status: coverage === 1 ? "pass" : coverage >= 0.8 ? "warn" : "fail",
      detail:
        coverage === 1
          ? "Every image has a written description, which helps both search engines and patients using screen readers."
          : `${alt.total - alt.withAlt} of your ${alt.total} images have no written description, so search engines and screen readers cannot tell what they show.`,
      evidence,
    });
  }

  return { checks, headings };
}
