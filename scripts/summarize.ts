/**
 * Reads data/prewarmed-audits.json and prints the aggregate picture:
 * what the room actually looks like before you walk into it.
 *
 * Run with: npm run summarize
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditResult, Check } from "../src/types/audit";

interface PrewarmedFile {
  generatedAt: string | null;
  count: number;
  results: AuditResult[];
}

function tally(values: (string | null)[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = v ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function printTally(title: string, entries: Array<[string, number]>, total: number): void {
  console.log(`\n${title}`);
  if (entries.length === 0) {
    console.log("  (none)");
    return;
  }
  const width = Math.max(...entries.map(([label]) => label.length));
  for (const [label, count] of entries) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    console.log(`  ${label.padEnd(width)}  ${String(count).padStart(3)}  (${pct}%)`);
  }
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function printScoreStats(
  title: string,
  results: AuditResult[],
  pick: (r: AuditResult) => number | null
): void {
  const values = results.map(pick).filter((v): v is number => v !== null);
  const missing = results.length - values.length;
  if (values.length === 0) {
    console.log(`  ${title.padEnd(14)} no scores available (${missing} unscored)`);
    return;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  console.log(
    `  ${title.padEnd(14)} median ${String(median(values)).padStart(3)}   range ${min}–${max}   ` +
      `(scored ${values.length}/${results.length}${missing > 0 ? `, ${missing} unscored` : ""})`
  );
}

function hasStatus(checks: Check[], id: string, statuses: Check["status"][]): boolean {
  const check = checks.find((c) => c.id === id);
  return check ? statuses.includes(check.status) : false;
}

/** Buckets a failed fetch by cause so the reasons are actionable. */
function failureReason(result: AuditResult): string | null {
  if (result.htmlFetch.ok) return null;
  if (result.htmlFetch.blocked) {
    return result.htmlFetch.statusCode === 403 || result.htmlFetch.statusCode === 429
      ? `blocked (${result.htmlFetch.statusCode})`
      : "blocked (bot challenge)";
  }
  const error = (result.htmlFetch.error ?? "").toLowerCase();
  if (error.includes("did not respond") || error.includes("timed out")) return "timeout";
  if (
    error.includes("enotfound") ||
    error.includes("getaddrinfo") ||
    error.includes("dns") ||
    error.includes("fetch failed")
  ) {
    return "DNS / unreachable";
  }
  if (result.htmlFetch.statusCode) return `HTTP ${result.htmlFetch.statusCode}`;
  return "other";
}

async function main(): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/prewarmed-audits.json");
  let file: PrewarmedFile;
  try {
    file = JSON.parse(await readFile(filePath, "utf8")) as PrewarmedFile;
  } catch {
    console.error(`Could not read ${filePath}. Run \`npm run prewarm\` first.`);
    process.exit(1);
  }

  const results = file.results ?? [];
  const total = results.length;
  if (total === 0) {
    console.log("No results in the cache file yet. Run `npm run prewarm` first.");
    return;
  }

  console.log("=".repeat(64));
  console.log(`AUDIT SUMMARY — ${total} site${total === 1 ? "" : "s"}`);
  if (file.generatedAt) console.log(`Generated ${file.generatedAt}`);
  console.log("=".repeat(64));

  // --- Platform / vendor / builders ----------------------------------------
  printTally("PLATFORM", tally(results.map((r) => r.platform?.platform ?? null)), total);
  printTally(
    "MEDICAL WEB VENDOR",
    tally(results.map((r) => r.platform?.vendor ?? null)),
    total
  );

  const builderCounts = new Map<string, number>();
  for (const r of results) {
    for (const b of r.platform?.builders ?? []) {
      builderCounts.set(b, (builderCounts.get(b) ?? 0) + 1);
    }
  }
  const noBuilder = results.filter((r) => (r.platform?.builders ?? []).length === 0).length;
  printTally(
    "PAGE BUILDER",
    [
      ...[...builderCounts.entries()].sort((a, b) => b[1] - a[1]),
      ["(none detected)", noBuilder] as [string, number],
    ],
    total
  );

  // --- Scores ---------------------------------------------------------------
  console.log("\nSCORES");
  printScoreStats("performance", results, (r) => r.scores.performance);
  printScoreStats("seo", results, (r) => r.scores.seo);
  printScoreStats("schema", results, (r) => r.scores.schema);
  printScoreStats("ai readiness", results, (r) => r.scores.aiReadiness);

  // --- Headline findings ----------------------------------------------------
  const readable = results.filter((r) => r.htmlFetch.ok);
  const withMedicalSchema = readable.filter((r) =>
    hasStatus(r.schema, "schema.medical", ["pass"])
  ).length;
  const zeroH1 = readable.filter((r) => hasStatus(r.seo, "seo.h1", ["fail"])).length;
  const blockingAi = results.filter((r) =>
    hasStatus(r.aiReadiness, "ai.crawler-access", ["fail", "warn"])
  ).length;

  console.log("\nFINDINGS");
  console.log(
    `  Medical schema present     ${String(withMedicalSchema).padStart(3)} of ${readable.length} readable sites`
  );
  console.log(
    `  No H1 heading              ${String(zeroH1).padStart(3)} of ${readable.length} readable sites`
  );
  console.log(
    `  Blocking an AI crawler     ${String(blockingAi).padStart(3)} of ${total} sites`
  );

  // --- Platform clustering ---------------------------------------------------
  // Whether attending practices cluster on shared templates: same platform,
  // same builder combination, same vendor — a signature a template vendor
  // would recognize instantly. Console AND data/platform-summary.txt.
  const clusterLines: string[] = [];
  const clog = (line: string = "") => {
    console.log(line);
    clusterLines.push(line);
  };

  function siteLabel(r: AuditResult): string {
    return (r.practiceName ?? r.url.replace(/^https?:\/\//, "")).slice(0, 44);
  }

  function printCluster(
    title: string,
    keyOf: (r: AuditResult) => string
  ): void {
    const groups = new Map<string, AuditResult[]>();
    for (const r of results) {
      const key = keyOf(r);
      const list = groups.get(key) ?? [];
      list.push(r);
      groups.set(key, list);
    }
    const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    clog(`\n${title}`);
    for (const [key, members] of sorted) {
      const pct = total > 0 ? Math.round((members.length / total) * 100) : 0;
      clog(`  ${key.padEnd(46)} ${String(members.length).padStart(3)}  (${pct}%)`);
      if (members.length > 1) {
        for (const m of members) clog(`      · ${siteLabel(m)}`);
      }
    }
  }

  clog("=".repeat(64));
  clog(`PLATFORM CLUSTERING — ${total} attending practice site${total === 1 ? "" : "s"}`);
  if (file.generatedAt) clog(`Generated ${file.generatedAt}`);
  clog("=".repeat(64));

  printCluster("BY PLATFORM", (r) => r.platform?.platform ?? "unknown");
  printCluster(
    "BY PAGE BUILDER",
    (r) => {
      const builders = r.platform?.builders ?? [];
      return builders.length > 0 ? [...builders].sort().join(" + ") : "(none detected)";
    }
  );
  printCluster("BY MEDICAL WEB VENDOR", (r) => r.platform?.vendor ?? "unknown");
  printCluster("BY EXACT TEMPLATE SIGNATURE (platform + builders + vendor)", (r) => {
    const platform = r.platform?.platform ?? "unknown";
    const builders = r.platform?.builders ?? [];
    const builderPart = builders.length > 0 ? [...builders].sort().join("+") : "no-builder";
    const vendor = r.platform?.vendor ?? "no-vendor";
    return `${platform} / ${builderPart} / ${vendor}`;
  });

  const platformSummaryPath = path.resolve(process.cwd(), "data/platform-summary.txt");
  await writeFile(platformSummaryPath, `${clusterLines.join("\n")}\n`, "utf8");
  console.log(`\nPlatform summary written to ${platformSummaryPath}`);

  // --- Drift + stale entries ------------------------------------------------
  try {
    const hist = JSON.parse(
      await readFile(path.resolve(process.cwd(), "data/prewarm-history.json"), "utf8")
    ) as {
      previous: Record<string, { practiceName?: string; url: string; score: number | null }> | null;
      current: Record<string, { practiceName?: string; url: string; score: number | null }> | null;
    };
    if (hist.previous && hist.current) {
      const moved: string[] = [];
      for (const [key, now] of Object.entries(hist.current)) {
        const before = hist.previous[key];
        if (!before || before.score === null || now.score === null) continue;
        const delta = now.score - before.score;
        if (Math.abs(delta) >= 10) {
          moved.push(
            `  ${(now.practiceName ?? now.url).slice(0, 40).padEnd(42)} ${before.score} → ${now.score} (${delta > 0 ? "+" : ""}${delta})`
          );
        }
      }
      console.log(`\nCHANGED SINCE LAST RUN (±10 or more)`);
      if (moved.length === 0) console.log("  (no score moved ±10)");
      for (const line of moved) console.log(line);
    }
  } catch {
    /* no history yet */
  }

  const stale = results.filter((r) => r.stale);
  if (stale.length > 0) {
    console.log(`\n${"!".repeat(64)}`);
    console.log(`STALE ENTRIES — the cache is serving PRIOR results for:`);
    for (const r of stale) {
      console.log(`  !! ${(r.practiceName ?? r.url).slice(0, 44)}`);
      if (r.staleNote) console.log(`     ${r.staleNote}`);
    }
    console.log(`${"!".repeat(64)}`);
  }

  // --- Fetch failures -------------------------------------------------------
  const failed = results.filter((r) => !r.htmlFetch.ok);
  console.log(
    `\nFETCH FAILURES — ${failed.length} of ${total} site${total === 1 ? "" : "s"}`
  );
  if (failed.length > 0) {
    printTally("  by cause", tally(failed.map(failureReason)), failed.length);
    console.log("\n  affected sites:");
    for (const r of failed) {
      console.log(`    ${r.url.replace(/^https?:\/\//, "")} — ${failureReason(r)}`);
    }
  }

  console.log("");
}

main().catch((err) => {
  console.error("Summarize failed:", err);
  process.exit(1);
});
