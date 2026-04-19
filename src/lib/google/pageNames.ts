const PAGE_NAMES: Record<string, string> = {
  "/": "Homepage",
  "/about/": "About Dr. Datta",
  "/about": "About Dr. Datta",
  "/chronic-venous-insufficiency-cvi/": "CVI Page",
  "/treatments/": "Treatments",
  "/treatments": "Treatments",
  "/contact-us/": "Contact",
  "/contact-us": "Contact",
  "/contact/": "Contact",
  "/varicose-veins/": "Varicose Veins",
  "/spider-veins/": "Spider Veins",
};

function normalizePath(input: string): string {
  let path: string;
  try {
    path = new URL(input).pathname;
  } catch {
    path = input.split("?")[0];
  }
  return path;
}

// Blog posts live at /{category}/{slug}/ on this WordPress site (e.g.
// /vein-health-education/foo/, /poor-circulation/bar/). Pages are
// single-segment. Anything 2+ segments deep that isn't a WordPress utility
// path counts as a blog post — survives adding new category slugs without
// a code change.
export function isBlogPath(input: string): boolean {
  const path = normalizePath(input);
  if (!path || path === "/") return false;
  if (path.startsWith("/wp-")) return false;
  if (path.startsWith("/feed") || path.startsWith("/category/") || path.startsWith("/tag/")) {
    return false;
  }
  const segments = path.split("/").filter(Boolean);
  return segments.length >= 2;
}

export function friendlyPageName(pageUrl: string): string {
  if (!pageUrl) return "Unknown";
  const path = normalizePath(pageUrl);
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const trimmed = path.replace(/\/$/, "");
  if (PAGE_NAMES[trimmed]) return PAGE_NAMES[trimmed];
  if (path === "" || path === "/") return "Homepage";
  const slug = trimmed.split("/").filter(Boolean).pop() ?? path;
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
