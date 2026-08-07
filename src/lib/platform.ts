import type { PlatformInfo } from "@/types/audit";
import { getMetaAll, stripComments } from "@/lib/checks/html";

/**
 * Platform, vendor and page-builder detection.
 *
 * Informational only — nothing here is scored or graded. It exists to answer
 * "what is this practice actually built on, and who built it?" before a
 * conversation, not to hand out a verdict.
 */

const EMPTY: PlatformInfo = {
  platform: null,
  version: null,
  vendor: null,
  builders: [],
  evidence: [],
};

/** Asset-path fingerprints, checked when the generator meta tag is absent. */
const PLATFORM_MARKERS: Array<{ platform: string; needles: string[] }> = [
  { platform: "WordPress", needles: ["/wp-content/", "/wp-includes/", "wp-json"] },
  { platform: "Wix", needles: ["static.parastorage.com", "wixstatic.com", "_wixCssStates"] },
  {
    platform: "Squarespace",
    needles: ["squarespace-cdn", "static1.squarespace.com", "squarespace.com/universal"],
  },
  { platform: "Duda", needles: ["irp.cdn-website.com", "static.cdn-website.com", "d1a3f4spazzrp4"] },
  { platform: "Joomla", needles: ["/media/jui/", "/components/com_content/", "joomla.javascript"] },
  { platform: "Webflow", needles: ["assets.website-files.com", "webflow.js", "uploads-ssl.webflow.com"] },
  { platform: "Shopify", needles: ["cdn.shopify.com", "shopifycloud"] },
  { platform: "HubSpot", needles: ["hs-scripts.com", "hubspotusercontent"] },
];

/** Medical-web vendors, matched in script srcs, comments or footer text. */
const VENDOR_MARKERS: Array<{ vendor: string; needles: string[] }> = [
  { vendor: "Officite", needles: ["officite", "officite.com"] },
  { vendor: "iHealthSpot", needles: ["ihealthspot", "ihealthspot.com"] },
  { vendor: "Vital", needles: ["vitalpractice", "vital.design", "getvital.io"] },
  { vendor: "PatientPop", needles: ["patientpop", "patientpop.com"] },
  { vendor: "Tebra", needles: ["tebra.com", "tebra "] },
  { vendor: "Sesame", needles: ["sesamecommunications", "sesame.com/dental", "sesamehub"] },
  { vendor: "Baystate", needles: ["baystateinteractive", "baystate interactive"] },
  { vendor: "MedNet", needles: ["mednet-tech", "mednettechnologies", "mednet technologies"] },
  { vendor: "ProSites", needles: ["prosites", "prosites.com"] },
  { vendor: "Einstein Medical", needles: ["einsteinmedical", "einstein medical"] },
  { vendor: "Optimized360", needles: ["optimized360", "o360.us", "opt360"] },
];

/** Page builders — these show up in class names and enqueued script handles. */
const BUILDER_MARKERS: Array<{ builder: string; needles: string[] }> = [
  {
    builder: "Elementor",
    needles: ["elementor-", "/elementor/assets", "elementor-frontend", "data-elementor-type"],
  },
  { builder: "Divi", needles: ["et_pb_", "/themes/divi/", "et-core", "et_divi"] },
  { builder: "WPBakery", needles: ["vc_row", "js_composer", "wpb_wrapper", "vc_column"] },
  {
    builder: "Beaver Builder",
    needles: ["fl-builder", "fl-node-", "/bb-plugin/", "fl-row-content"],
  },
  { builder: "Avada", needles: ["fusion-builder", "avada", "fusion-row", "/themes/avada/"] },
];

const KNOWN_GENERATORS: Array<[string, string]> = [
  ["wordpress", "WordPress"],
  ["wix", "Wix"],
  ["squarespace", "Squarespace"],
  ["duda", "Duda"],
  ["joomla", "Joomla"],
  ["drupal", "Drupal"],
  ["webflow", "Webflow"],
  ["shopify", "Shopify"],
  ["hubspot", "HubSpot"],
  ["craft cms", "Craft CMS"],
  ["ghost", "Ghost"],
  ["typo3", "TYPO3"],
  ["bigcommerce", "BigCommerce"],
  ["godaddy website builder", "GoDaddy Website Builder"],
];

/**
 * Generator values emitted by plugins and themes rather than the CMS itself.
 * Treating one of these as the platform is how "Elementor" ends up reported as
 * the CMS of a WordPress site.
 */
const PLUGIN_GENERATORS = [
  "elementor",
  "wp rocket",
  "wp-rocket",
  "seomatic",
  "yoast",
  "woocommerce",
  "divi",
  "wpbakery",
  "all in one seo",
  "rank math",
  "rankmath",
  "jetpack",
  "gtranslate",
  "site kit",
  "slider revolution",
  "powered by",
  "avada",
  "fusion",
];

/**
 * Reads every `generator` meta tag and returns the first that names a platform
 * we actually recognise. Unknown or plugin-authored values return null rather
 * than a guess.
 */
function fromGenerator(
  html: string
): { platform: string; version: string | null; raw: string } | null {
  const values = getMetaAll(html, "generator");
  for (const value of values) {
    const lower = value.toLowerCase();
    for (const [needle, platform] of KNOWN_GENERATORS) {
      if (lower.includes(needle)) {
        // Pull the version that follows the platform name, not the first
        // number anywhere in the string.
        const after = value.slice(lower.indexOf(needle) + needle.length);
        const version = after.match(/\s*v?(\d+(?:\.\d+)*)/)?.[1] ?? null;
        return { platform, version, raw: value.trim() };
      }
    }
  }
  return null;
}

/** Last resort: a generator value that is not a known plugin or theme. */
function unknownGenerator(html: string): string | null {
  for (const value of getMetaAll(html, "generator")) {
    const lower = value.toLowerCase();
    if (PLUGIN_GENERATORS.some((p) => lower.includes(p))) continue;
    return value.trim();
  }
  return null;
}

/**
 * @param html Raw page HTML. Returns an empty result when the page could not
 *   be read — we do not guess at a platform we never saw.
 */
export function detectPlatform(html: string, htmlOk: boolean): PlatformInfo {
  if (!htmlOk || !html.trim()) return { ...EMPTY };

  const doc = stripComments(html);
  // Comments are stripped for markup matching, but vendor credits often live
  // *in* comments, so vendor detection runs against the original document.
  const haystack = doc.toLowerCase();
  const vendorHaystack = html.toLowerCase();
  const evidence: string[] = [];

  let platform: string | null = null;
  let version: string | null = null;

  // 1. A generator tag naming a platform we recognise.
  const generator = fromGenerator(doc);
  if (generator) {
    platform = generator.platform;
    version = generator.version;
    evidence.push(`generator meta: "${generator.raw}"`);
  }

  // 2. Asset-path fingerprints. These are harder to fake than a meta tag and
  //    are the authority when the generator tags only name plugins.
  const assetHit = PLATFORM_MARKERS.map(({ platform: name, needles }) => {
    const hit = needles.find((n) => haystack.includes(n));
    return hit ? { name, hit } : null;
  }).find(Boolean);

  if (assetHit) {
    if (!platform) platform = assetHit.name;
    evidence.push(`asset path: ${assetHit.hit}`);
  }

  // 3. Last resort: an unrecognised generator value that is not a plugin.
  if (!platform) {
    const raw = unknownGenerator(doc);
    if (raw) {
      platform = raw.split(/[\s,;]/)[0] || raw;
      evidence.push(`generator meta: "${raw}"`);
    }
  }

  let vendor: string | null = null;
  for (const { vendor: name, needles } of VENDOR_MARKERS) {
    const hit = needles.find((n) => vendorHaystack.includes(n));
    if (hit) {
      vendor = name;
      evidence.push(`vendor marker: ${hit}`);
      break;
    }
  }

  const builders: string[] = [];
  for (const { builder, needles } of BUILDER_MARKERS) {
    const hit = needles.find((n) => haystack.includes(n));
    if (hit) {
      builders.push(builder);
      evidence.push(`builder marker: ${hit}`);
    }
  }

  return { platform, version, vendor, builders, evidence };
}

/** One-line summary for logs, e.g. "WordPress 6.5 + Elementor (Officite)". */
export function describePlatform(info: PlatformInfo): string {
  if (!info.platform && !info.vendor && info.builders.length === 0) return "unknown platform";
  const parts: string[] = [];
  if (info.platform) parts.push(info.version ? `${info.platform} ${info.version}` : info.platform);
  if (info.builders.length > 0) parts.push(`+ ${info.builders.join(", ")}`);
  const base = parts.join(" ") || "unknown platform";
  return info.vendor ? `${base} (${info.vendor})` : base;
}
