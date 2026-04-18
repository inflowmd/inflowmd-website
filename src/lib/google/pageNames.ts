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
  "/what-is-chronic-venous-insufficiency/": "Blog: CVI",
  "/heavy-tired-legs/": "Blog: Heavy Legs",
  "/poor-circulation-legs/": "Blog: Poor Circulation",
};

export function friendlyPageName(pageUrl: string): string {
  if (!pageUrl) return "Unknown";
  let path: string;
  try {
    path = new URL(pageUrl).pathname;
  } catch {
    path = pageUrl;
  }
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const trimmed = path.replace(/\/$/, "");
  if (PAGE_NAMES[trimmed]) return PAGE_NAMES[trimmed];
  if (path === "" || path === "/") return "Homepage";
  const slug = trimmed.split("/").filter(Boolean).pop() ?? path;
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
