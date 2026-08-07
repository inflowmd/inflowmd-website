/**
 * Pre-warm batch. Runs the full audit against every URL in data/attendees.csv
 * and writes data/prewarmed-audits.json.
 *
 * Local Node script, not a route handler — no serverless timeout applies, so
 * it can take as long as it needs. Run with: npm run prewarm
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AuditResult } from "../src/types/audit";
import { normalizeUrl, runAudit } from "../src/lib/runAudit";
import { writeCache } from "../src/lib/cache";
import { describePlatform } from "../src/lib/platform";

/** PSI is rate-limited; the batch is small enough that speed is irrelevant. */
const DELAY_MS = 2_000;

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

  const rows = parseCsv(csv).filter((r) => r.url);
  if (rows.length === 0) {
    console.error("No rows with a 'url' column found in data/attendees.csv");
    process.exit(1);
  }

  console.log(`Pre-warming ${rows.length} site${rows.length === 1 ? "" : "s"}\n`);

  const results: AuditResult[] = [];
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
      const result = await runAudit(normalized);
      // Carry the practice name through so the booth picker can search on it.
      if (row.practice_name) result.practiceName = row.practice_name;
      results.push(result);

      const s = result.scores;
      const platform = describePlatform(result.platform);
      const fetchNote = result.htmlFetch.ok
        ? ""
        : ` | FETCH FAILED: ${result.htmlFetch.error ?? "unknown"}`;

      console.log(
        `perf ${fmtScore(s.performance)} | seo ${fmtScore(s.seo)} | schema ${fmtScore(
          s.schema
        )} | ai ${fmtScore(s.aiReadiness)} | ${platform}${fetchNote}`
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
  console.log("Run `npm run summarize` for the aggregate picture.");
}

main().catch((err) => {
  console.error("Pre-warm failed:", err);
  process.exit(1);
});
