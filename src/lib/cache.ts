import type { AuditResult } from "@/types/audit";
import prewarmed from "../../data/prewarmed-audits.json";

/**
 * Pre-warmed audit cache.
 *
 * The JSON is imported at build time rather than read from disk at request
 * time, so it ships inside the serverless bundle and works on Vercel where
 * there is no persistent filesystem.
 */

export interface PrewarmedFile {
  generatedAt: string | null;
  count: number;
  results: AuditResult[];
}

const file = prewarmed as unknown as PrewarmedFile;

/**
 * Cache key: lowercase, no protocol, no `www.`, no trailing slash.
 * So `HTTPS://WWW.Example.com/` and `example.com` collapse to one entry.
 */
export function cacheKey(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

const index: Map<string, AuditResult> = (() => {
  const map = new Map<string, AuditResult>();
  for (const result of file.results ?? []) {
    if (result?.url) map.set(cacheKey(result.url), result);
  }
  return map;
})();

/** Returns a pre-warmed result, or null on a miss. */
export function getCached(url: string): AuditResult | null {
  const hit = index.get(cacheKey(url));
  if (!hit) return null;
  // fetchedAt is preserved verbatim so the UI can show when it was measured.
  return { ...hit, fromCache: true };
}

export function getCacheMeta(): { generatedAt: string | null; count: number } {
  return { generatedAt: file.generatedAt ?? null, count: index.size };
}

/**
 * Writes the cache file. Node-only (the pre-warm script) — never called from
 * a request handler, which is why fs is imported lazily.
 */
export async function writeCache(results: AuditResult[]): Promise<string> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");

  const outDir = path.resolve(process.cwd(), "data");
  const outPath = path.join(outDir, "prewarmed-audits.json");

  const payload: PrewarmedFile = {
    generatedAt: new Date().toISOString(),
    count: results.length,
    results,
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return outPath;
}
