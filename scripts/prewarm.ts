/**
 * Pre-warm batch. Runs the full audit against every URL in
 * data/hps-practices.json and writes data/prewarmed-audits.json.
 *
 * Local Node script, not a route handler — no serverless timeout applies, so
 * it can take as long as it needs. Run with: npm run prewarm
 *
 * --only-missing-speed: re-audits ONLY cached entries whose performance
 * data is missing (a prior PSI timeout or API error), leaving every good
 * entry untouched — no network call, no delay, carried forward as-is.
 * Sanity bounds (history comparison, outlier retry, stale-value keep) stay
 * active for whatever DOES get re-audited. A PSI failure that recurs after
 * a second attempt is kept as an honest partial and listed at the end —
 * never silently dropped, never faked.
 *   npm run prewarm -- --only-missing-speed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditResult } from "../src/types/audit";
import { normalizeUrl, runAudit } from "../src/lib/runAudit";
import { cacheKey, writeCache } from "../src/lib/cache";
import { withDerivedScores } from "../src/lib/categories";
import { resolveApiKey } from "../src/lib/pagespeed";
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

  // A measurement we HAD and no longer have is a regression, not an update.
  // PSI times out on slow sites often enough that a full re-warm would
  // otherwise trade good data for nothing — silently, since a null trips no
  // other rule here. Treating it as anomalous routes it through the same
  // retry-then-keep-prior path as a wild value, so the booth never loses a
  // number it already had. (This is what cost 11 entries their speed data on
  // the 2026-08-13 re-warm.)
  if (newScore === null && oldScore !== null) {
    return `PageSpeed returned no score for a site previously measured at ${oldScore}`;
  }

  if (newScore !== null && oldScore !== null && Math.abs(newScore - oldScore) > 25) {
    return `performance swung ${oldScore} → ${newScore} (more than 25 points)`;
  }
  return null;
}

interface Attendee {
  name: string;
  city: string;
  state: string;
  /** Empty string when no website could be found for this attendee. */
  url: string;
}

/** One URL to audit, carrying every attendee name that maps to it. */
interface Target {
  normalized: string;
  names: string[];
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
      fcp: null,
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
      ai: null,
      aiVerified: 0,
      aiTotal: 0,
      patientsFind: null,
      patientsFindVerified: 0,
      patientsFindTotal: 0,
    },
    error: message,
  };
}

/**
 * Runs one target through the audit + sanity-bounds anomaly check (and its
 * own retry-once-on-suspect dance), returning the final result and any
 * anomaly note to log. Shared by the normal pass and the targeted
 * --only-missing-speed retry so the anomaly logic never has to be
 * duplicated. Throws only if runAudit itself throws.
 */
async function auditWithAnomalyCheck(
  target: Target,
  displayName: string,
  display: string,
  baseline: Record<string, HistoryEntry>,
  priorFull: Map<string, AuditResult>
): Promise<{ result: AuditResult; anomaly: string | null }> {
  let result = await runAudit(target.normalized);
  result.practiceName = displayName;

  const key = cacheKey(result.url);
  const prior = baseline[key];
  const reason = anomalyReason(result, prior);
  let anomaly: string | null = null;

  if (reason) {
    console.log(`SUSPECT — ${reason}. Retrying in ${RETRY_DELAY_MS / 1000}s…`);
    await sleep(RETRY_DELAY_MS);
    process.stdout.write(`   (retry) … `);
    const retry = await runAudit(target.normalized);
    retry.practiceName = displayName;
    const retryReason = anomalyReason(retry, prior);

    if (!retryReason) {
      result = retry;
    } else {
      // Twice anomalous: never silently ship an outlier. Keep the prior
      // result, marked stale, with both values on the record.
      const kept = priorFull.get(key);
      if (kept) {
        anomaly =
          `${displayName || display}: fresh measurement rejected twice (${retryReason}). ` +
          `Cache keeps the prior result (perf ${kept.scores.performance}, LCP ${kept.performance.lcp}s); ` +
          `rejected: perf ${retry.scores.performance}, LCP ${retry.performance.lcp}s.`;
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
        anomaly =
          `${displayName || display}: measurement looks anomalous (${retryReason}) ` +
          `and there is NO prior result to keep. Shipped as measured — verify by hand.`;
        result = retry;
      }
    }
  }

  return { result, anomaly };
}

async function main(): Promise<void> {
  // HARD REQUIREMENT, checked before anything else runs.
  //
  // A keyless batch is the worst possible way to discover a missing key: this
  // script makes one PageSpeed call per site, so a full run would fire ~58
  // anonymous requests into Google's small shared public quota and burn it —
  // potentially the morning of the conference. There is no scenario where
  // running this unauthenticated is the right outcome, so it refuses rather
  // than degrading.
  if (!resolveApiKey()) {
    console.error(
      "\nREFUSING TO RUN — PAGESPEED_API_KEY is missing or is a placeholder.\n\n" +
        "  This script makes one PageSpeed call per site. Without a key those calls go\n" +
        "  out anonymously into Google's small shared public quota and will exhaust it,\n" +
        "  taking the booth's live audits down with them.\n\n" +
        "  Fix: put a real key in .env.local as\n" +
        "      PAGESPEED_API_KEY=...\n" +
        "  and run `npm run prewarm` again (the script loads .env.local itself).\n"
    );
    process.exit(1);
  }

  const attendeesPath = path.resolve(process.cwd(), "data/hps-practices.json");

  let attendees: Attendee[];
  try {
    attendees = JSON.parse(await readFile(attendeesPath, "utf8")) as Attendee[];
  } catch {
    console.error(`Could not read ${attendeesPath}. Expected an array of {name, city, state, url}.`);
    process.exit(1);
  }

  // Report lines are both printed live AND written to a file — the run
  // report is what gates whether the cache ships.
  const reportLines: string[] = [];
  const log = (line: string = "") => {
    console.log(line);
    reportLines.push(line);
  };

  const historyPath = path.resolve(process.cwd(), "data/prewarm-history.json");
  let history: HistoryFile = { generatedAt: null, previous: null, current: null };
  try {
    history = JSON.parse(await readFile(historyPath, "utf8")) as HistoryFile;
  } catch {
    /* first run — no history yet */
  }
  // Baseline for comparison: the last run if recorded, else the shipped cache.
  const baseline: Record<string, HistoryEntry> = history.current ?? {};
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

  const onlyMissingSpeed = process.argv.includes("--only-missing-speed");

  const noWebsite = attendees.filter((a) => !a.url.trim());
  const withUrl = attendees.filter((a) => a.url.trim());

  // Multiple attendee names MAY share one URL (e.g. Salcedo Medical Center /
  // Salcedo Medical Center And Vein Institute). The cache stays URL-keyed —
  // a shared domain is audited exactly once, all its names are logged.
  const targetsByKey = new Map<string, Target>();
  const invalid: Attendee[] = [];
  for (const a of withUrl) {
    const normalized = normalizeUrl(a.url);
    if (!normalized) {
      invalid.push(a);
      continue;
    }
    const key = cacheKey(normalized);
    const existing = targetsByKey.get(key);
    if (existing) existing.names.push(a.name);
    else targetsByKey.set(key, { normalized, names: [a.name] });
  }
  const allTargets = [...targetsByKey.values()];

  // --only-missing-speed narrows the work to targets whose CACHED result has
  // no performance data (or has no cached result at all yet). Everything
  // else is carried forward untouched — no network call, no delay.
  const targets = onlyMissingSpeed
    ? allTargets.filter((t) => {
        const prior = priorFull.get(cacheKey(t.normalized));
        return !prior || !prior.performance.available;
      })
    : allTargets;
  const skipped = onlyMissingSpeed ? allTargets.filter((t) => !targets.includes(t)) : [];

  if (onlyMissingSpeed) {
    log(
      `Re-auditing ${targets.length} of ${allTargets.length} unique sites — ` +
        `${skipped.length} already have complete speed data and are untouched.\n`
    );
  } else {
    log(
      `Pre-warming ${targets.length} unique site${targets.length === 1 ? "" : "s"} ` +
        `(${withUrl.length} attendees with a URL, ${noWebsite.length} with no website found)\n`
    );
  }

  const results: AuditResult[] = [];
  const newHistory: Record<string, HistoryEntry> = {};
  const anomalies: string[] = [];
  const stillMissingSpeed: Array<{ name: string; url: string; error: string }> = [];
  let failures = 0;

  // Carry forward every skipped (already-complete) entry. Measurements are
  // untouched — only `scores` is recomputed, so an entry written before a
  // category change is re-scored on the current table without re-auditing.
  for (const t of skipped) {
    const key = cacheKey(t.normalized);
    const prior = priorFull.get(key);
    if (!prior) continue; // filtered out above whenever prior is missing
    const normalized = withDerivedScores(prior);
    results.push(normalized);
    newHistory[key] = toHistoryEntry(normalized);
  }

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const displayName = target.names[0];
    const sharedNote =
      target.names.length > 1 ? ` [shared by: ${target.names.join(", ")}]` : "";
    const counter = `[${String(i + 1).padStart(String(targets.length).length, " ")}/${targets.length}]`;
    const display = target.normalized.replace(/^https?:\/\//, "");

    process.stdout.write(`${counter} ${display} … `);

    try {
      const first = await auditWithAnomalyCheck(target, displayName, display, baseline, priorFull);
      let result = first.result;
      if (first.anomaly) anomalies.push(first.anomaly);

      // Targeted mode: a PSI failure is often transient. One more full
      // attempt (with its own anomaly check) before accepting the gap.
      if (onlyMissingSpeed && !result.performance.available) {
        console.log(
          `perf still missing (${result.performance.error ?? "unknown"}) — retrying once ` +
            `in ${RETRY_DELAY_MS / 1000}s…`
        );
        await sleep(RETRY_DELAY_MS);
        process.stdout.write(`${counter} ${display} (speed retry) … `);
        const retryOutcome = await auditWithAnomalyCheck(
          target,
          displayName,
          display,
          baseline,
          priorFull
        );
        result = retryOutcome.result;
        if (retryOutcome.anomaly) anomalies.push(retryOutcome.anomaly);
        if (!result.performance.available) {
          stillMissingSpeed.push({
            name: displayName,
            url: target.normalized,
            error: result.performance.error ?? "unknown",
          });
        }
      }

      // Record what this run actually measured (even when the cache keeps prior).
      const key = cacheKey(result.url);
      newHistory[key] = toHistoryEntry(result);
      results.push(result);

      const s = result.scores;
      const platform = describePlatform(result.platform);
      const fetchNote = result.htmlFetch.ok
        ? ""
        : ` | FETCH FAILED: ${result.htmlFetch.error ?? "unknown"}`;
      const staleNote = result.stale ? " | STALE — prior kept" : "";
      const status = !result.htmlFetch.ok
        ? "failed"
        : result.htmlFetch.blocked
          ? "blocked"
          : "ok";

      log(
        `${counter} ${display} … [${status}] speed ${fmtScore(s.performance)} | ai ${fmtScore(
          s.ai
        )} | patients-find ${fmtScore(s.patientsFind)} | ${platform}${fetchNote}${staleNote}${sharedNote}`
      );
    } catch (err) {
      // One bad URL must never kill the run.
      failures++;
      const message = err instanceof Error ? err.message : "Audit threw an unknown error.";
      const timedOut = /timed out|timeout/i.test(message);
      results.push({ ...erroredResult(target.normalized, message), practiceName: displayName });
      log(`${counter} ${display} … [${timedOut ? "timeout" : "failed"}] ERROR — ${message}${sharedNote}`);
    }

    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  // No-website attendees never touch the network — they still belong in the
  // report so nobody wonders where they went.
  if (noWebsite.length > 0) {
    log(`\nNo website on file (${noWebsite.length}):`);
    for (const a of noWebsite) {
      log(`  — ${a.name} (${a.city}, ${a.state}) … [no website]`);
    }
  }
  if (invalid.length > 0) {
    log(`\nURL present but would not normalize (${invalid.length}):`);
    for (const a of invalid) {
      log(`  — ${a.name}: "${a.url}"`);
    }
  }
  if (stillMissingSpeed.length > 0) {
    log(`\nSpeed data still missing after retry (${stillMissingSpeed.length}):`);
    for (const m of stillMissingSpeed) {
      log(`  — ${m.name} (${m.url.replace(/^https?:\/\//, "")}) … ${m.error}`);
    }
  }

  const outPath = await writeCache(results);
  log(`\nWrote ${results.length} results to ${outPath}`);
  if (failures > 0) {
    log(`${failures} site${failures === 1 ? "" : "s"} could not be audited.`);
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
  log(`History updated at ${historyPath}`);

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
    log(`\nCHANGED SINCE LAST RUN (±10 or more):`);
    for (const line of drift) log(line);
  } else {
    log(`\nNo score moved ±10 or more since the last run.`);
  }

  if (anomalies.length > 0) {
    log(`\n${"!".repeat(64)}`);
    log(`ANOMALIES — ${anomalies.length} result${anomalies.length === 1 ? "" : "s"} needed intervention:`);
    for (const a of anomalies) log(`  !! ${a}`);
    log(`${"!".repeat(64)}`);
  }

  // Status summary — the gate for "does this report look safe to ship".
  const statusCounts = { ok: 0, blocked: 0, failed: 0 };
  for (const r of results) {
    if (!r.htmlFetch.ok) statusCounts.failed++;
    else if (r.htmlFetch.blocked) statusCounts.blocked++;
    else statusCounts.ok++;
  }
  const speedComplete = results.filter((r) => r.performance.available).length;
  log(
    `\nSTATUS SUMMARY: ${statusCounts.ok} ok, ${statusCounts.blocked} blocked, ` +
      `${statusCounts.failed} failed, ${noWebsite.length} no website ` +
      `(${targets.length} unique sites audited for ${withUrl.length} attendees)`
  );
  log(`Speed data: ${speedComplete} of ${results.length} cache entries have complete performance data.`);

  log("\nRun `npm run summarize` for the aggregate picture.");

  const reportPath = path.resolve(process.cwd(), "data/prewarm-report.txt");
  await writeFile(reportPath, `${reportLines.join("\n")}\n`, "utf8");
  console.log(`\nReport written to ${reportPath}`);
}

main().catch((err) => {
  console.error("Pre-warm failed:", err);
  process.exit(1);
});
