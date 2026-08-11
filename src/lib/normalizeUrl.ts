/**
 * Pure URL normalization — no Node-only imports, so it's safe to import from
 * client components (the picker validates attendee URLs) as well as server
 * code (runAudit, the API route, the pre-warm script).
 */

/** Adds https:// when missing, drops a trailing slash, validates the result. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname.includes(".")) return null;

  const path = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${path}${parsed.search}`;
}
