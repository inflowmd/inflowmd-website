/**
 * Cache key: lowercase, no protocol, no `www.`, no trailing slash.
 * So `HTTPS://WWW.Example.com/` and `example.com` collapse to one entry.
 *
 * No Node-only imports — safe from client components (the picker needs it
 * to look up a pre-warmed result by an attendee's URL) as well as server
 * code (the cache module, the pre-warm script).
 */
export function cacheKey(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}
