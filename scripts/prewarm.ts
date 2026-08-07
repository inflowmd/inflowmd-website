/**
 * Pre-warm batch. Runs the full audit against every URL in data/attendees.csv
 * and writes data/prewarmed-audits.json.
 *
 * Local Node script, not a route handler — no serverless timeout applies, so
 * it can take as long as it needs. Run with: npm run prewarm
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditResult } from "../src/types/audit";
import { normalizeUrl, runAudit } from "../src/lib/runAudit";
import { cacheKey, writeCache } from "../src/lib/cache";
import { describePlatform } from "../src/lib/platform";

/** PSI is rate-limited; the batch is small enough that speed is irrelevant. */
const DELAY_MS = 2_000;

/** Wait before re-measuring a result that tripped an anomaly rule. */
const RETRY_DELAY_MS = 30_000;

/* ============================================================
   Sanity bounds. PSI occasionally returns garbage — a challenge page
   measuring 100/0.77s, or a cold-path 66 on a site that is really a 90.
   An outlier must never silently ship to the booth.
   ============================================================ */

interface HistoryEntry {
  practiceName?: string;
  url: string;
  score: number | null;
  lcp: number | null;
  fetchedAt: string;
}

interface HistoryFile {
  generatedAt: string | null;
  /** Snapshot of the run before `current` — what "changed since last run" compares against. */
  previous: Record<string, HistoryEntry> | null;
  current: Record<string, HistoryEntry> | null;
}

function toHistoryEntry(r: AuditResult): HistoryEntry {
  return {
    ...(r.practiceName ? { practiceName: r.practiceName } : {}),
    url: r.url,
    score: r.scores.performance,
    lcp: r.performance.lcp,
    fetchedAt: r.fetchedAt,
  };
}

/**
 * Returns the reason a fresh result looks anomalous against the prior one,
 * or null when it looks sane.
 */
function anomalyReason(fresh: AuditResult, prior: HistoryEntry | undefined): string | null {
  // Our fetcher was served a bot challenge — PSI likely saw the same page.
  if (fresh.htmlFetch.blocked) {
    return "fetcher hit a bot-challenge page";
  }
  if (!prior) return null;

  const newLcp = fresh.performance.lcp;
  const oldLcp = prior.lcp;
  if (newLcp !== null && oldLcp !== null && newLcp < 1.5 && oldLcp > 5) {
    return `LCP ${newLcp}s on a site whose prior LCP was ${oldLcp}s (challenge-page signature)`;
  }

  const newScore = fresh.scores.performance;
  const oldScore = prior.score;
  if (newScore !== null && oldScore !== null && Math.abs(newScore - oldScore) > 25) {
    return `performance swung ${oldScore} → ${newScore} (more than 25 points)`;
  }
  return null;
}

interface AttendeeRow {
  practice_name: string;
  url: string;
  /** Every other column is carried through untouched. */
  [key: string]: string;
}

/** Minimal CSV parser handling quoted fields, embedded commas and newlines. */
function parseCsv(text: string): AttendeeRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim().length > 0));
  if (nonEmpty.length === 0) return [];

  const headers = nonEmpty[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return nonEmpty.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = (cells[idx] ?? "").trim();
    });
    return record as AttendeeRow;
  });
}

function fmtScore(value: number | null): string {
  return value === null ? "  –" : String(value).padStart(3, " ");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A result placeholder for a URL we could not even attempt. */
function erroredResult(url: string, message: string): AuditResult {
  return {
    url,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
    performance: {
      available: false,
      lighthouseScore: null,
      lcp: null,
      cls: null,
      tbt: null,
      speedIndex: null,
      fieldDataAvailable: false,
      fieldLcp: null,
      error: message,
    },
    htmlFetch: { ok: false, statusCode: null, blocked: false, error: message },
    platform: { platform: null, version: null, vendor: null, builders: [], evidence: [] },
    seo: [],
    schema: [],
    aiReadiness: [],
    scores: {
      performance: null,
      seo: null,
      seoVerified: 0,
      seoTotal: 0,
      schema: null,
      schemaVerified: 0,
      schemaTotal: 0,
      aiReadiness: null,
      aiReadinessVerified: 0,
      aiReadinessTotal: 0,
    },
    error: message,
  };
}

async function main(): Promise<void> {
  const csvPath = path.resolve(process.cwd(), "data/attendees.csv");

  let csv: string;
  try {
    csv = await readFile(csvPath, "utf8");
  } catch {
    console.error(`Could not read ${csvPath}. Expected columns: practice_name, url`);
    process.exit(1);
  }

  const historyPath = path.resolve(process.cwd(), "data/prewarm-history.json");
  let history: HistoryFile = { generatedAt: null, previous: null, current: null };
  try {
    history = JSON.parse(await readFile(historyPath, "utf8")) as HistoryFile;
  } catch {
    /* first run — no history yet */
  }
  // Baseline for comparison: the last run if recorded, else the shipped cache.
  let baseline: Record<string, HistoryEntry> = history.current ?? {};
  if (Object.keys(baseline).length === 0) {
    try {
      const prior = JSON.parse(
        await readFile(path.resolve(process.cwd(), "data/prewarmed-audits.json"), "utf8")
      ) as { results?: AuditResult[] };
      for (const r of prior.results ?? []) baseline[cacheKey(r.url)] = toHistoryEntry(r);
    } catch {
      /* no prior cache either */
    }
  }
  // The full prior results, needed when an anomalous entry must keep its predecessor.
  const priorFull = new Map<string, AuditResult>();
  try {
    const prior = JSON.parse(
      await readFile(path.resolve(process.cwd(), "data/prewarmed-audits.json"), "utf8")
    ) as { results?: AuditResult[] };
    for (const r of prior.results ?? []) priorFull.set(cacheKey(r.url), r);
  } catch {
    /* none */
  }

  const rows = parseCsv(csv).filter((r) => r.url);
  if (rows.length === 0) {
    console.error("No rows with a 'url' column found in data/attendees.csv");
    process.exit(1);
  }

  console.log(`Pre-warming ${rows.length} site${rows.length === 1 ? "" : "s"}\n`);

  const results: AuditResult[] = [];
  const newHistory: Record<string, HistoryEntry> = {};
  const anomalies: string[] = [];
  let failures = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const counter = `[${String(i + 1).padStart(String(rows.length).length, " ")}/${rows.length}]`;
    const normalized = normalizeUrl(row.url);
    const display = (normalized ?? row.url).replace(/^https?:\/\//, "");

    if (!normalized) {
      failures++;
      const message = `Invalid URL: "${row.url}"`;
      results.push({ ...erroredResult(row.url, message), practiceName: row.practice_name });
      console.log(`${counter} ${display} … SKIPPED — ${message}`);
      continue;
    }

    process.stdout.write(`${counter} ${display} … `);

    try {
      let result = await runAudit(normalized);
      if (row.practice_name) result.practiceName = row.practice_name;

      const key = cacheKey(result.url);
      const prior = baseline[key];
      const reason = anomalyReason(result, prior);

      if (reason) {
        console.log(`SUSPECT — ${reason}. Retrying in ${RETRY_DELAY_MS / 1000}s…`);
        await sleep(RETRY_DELAY_MS);
        process.stdout.write(`${counter} ${display} (retry) … `);
        const retry = await runAudit(normalized);
        if (row.practice_name) retry.practiceName = row.practice_name;
        const retryReason = anomalyReason(retry, prior);

        if (!retryReason) {
          result = retry;
        } else {
          // Twice anomalous: never silently ship an outlier. Keep the prior
          // result, marked stale, with both values on the record.
          const kept = priorFull.get(key);
          if (kept) {
            anomalies.push(
              `${row.practice_name || display}: fresh measurement rejected twice (${retryReason}). ` +
                `Cache keeps the prior result (perf ${kept.scores.performance}, LCP ${kept.performance.lcp}s); ` +
                `rejected: perf ${retry.scores.performance}, LCP ${retry.performance.lcp}s.`
            );
            result = {
              ...kept,
              stale: true,
              staleNote:
                `Kept prior measurement of ${kept.fetchedAt} (perf ${kept.scores.performance}, ` +
                `LCP ${kept.performance.lcp}s). Fresh run rejected twice: ${retryReason}; ` +
                `rejected values perf ${retry.scores.performance}, LCP ${retry.performance.lcp}s.`,
            };
          } else {
            // No prior to fall back to — ship the fresh one, loudly.
            anomalies.push(
              `${row.practice_name || display}: measurement looks anomalous (${retryReason}) ` +
                `and there is NO prior result to keep. Shipped as measured — verify by hand.`
            );
            result = retry;
          }
        }
      }

      // Record what this run actually measured (even when the cache keeps prior).
      newHistory[key] = toHistoryEntry(result);
      results.push(result);

      const s = result.scores;
      const platform = describePlatform(result.platform);
      const fetchNote = result.htmlFetch.ok
        ? ""
        : ` | FETCH FAILED: ${result.htmlFetch.error ?? "unknown"}`;
      const staleNote = result.stale ? " | STALE — prior kept" : "";

      console.log(
        `perf ${fmtScore(s.performance)} | seo ${fmtScore(s.seo)} | schema ${fmtScore(
          s.schema
        )} | ai ${fmtScore(s.aiReadiness)} | ${platform}${fetchNote}${staleNote}`
      );
    } catch (err) {
      // One bad URL must never kill the run.
      failures++;
      const message = err instanceof Error ? err.message : "Audit threw an unknown error.";
      results.push({ ...erroredResult(normalized, message), practiceName: row.practice_name });
      console.log(`ERROR — ${message}`);
    }

    if (i < rows.length - 1) await sleep(DELAY_MS);
  }

  const outPath = await writeCache(results);
  console.log(`\nWrote ${results.length} results to ${outPath}`);
  if (failures > 0) {
    console.log(`${failures} site${failures === 1 ? "" : "s"} could not be audited.`);
  }

  // Roll the history: last run becomes `previous`, this run becomes `current`.
  await writeFile(
    historyPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        previous: Object.keys(baseline).length > 0 ? baseline : null,
        current: newHistory,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  console.log(`History updated at ${historyPath}`);

  // Drift report: anything that moved ±10 vs the prior run deserves eyes.
  const drift: string[] = [];
  for (const [key, now] of Object.entries(newHistory)) {
    const before = baseline[key];
    if (!before || before.score === null || now.score === null) continue;
    const delta = now.score - before.score;
    if (Math.abs(delta) >= 10) {
      drift.push(
        `  ${(now.practiceName ?? now.url).slice(0, 40)}: ${before.score} → ${now.score} (${
          delta > 0 ? "+" : ""
        }${delta})`
      );
    }
  }
  if (drift.length > 0) {
    console.log(`\nCHANGED SINCE LAST RUN (±10 or more):`);
    for (const line of drift) console.log(line);
  } else {
    console.log(`\nNo score moved ±10 or more since the last run.`);
  }

  if (anomalies.length > 0) {
    console.log(`\n${"!".repeat(64)}`);
    console.log(
      `ANOMALIES — ${anomalies.length} result${anomalies.length === 1 ? "" : "s"} needed intervention:`
    );
    for (const a of anomalies) console.log(`  !! ${a}`);
    console.log(`${"!".repeat(64)}`);
  }

  console.log("\nRun `npm run summarize` for the aggregate picture.");
}

main().catch((err) => {
  console.error("Pre-warm failed:", err);
  process.exit(1);
});
