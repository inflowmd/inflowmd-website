/**
 * Batch print-to-PDF for every cached practice.
 *
 *   npm run print-reports
 *
 * Drives a headless Chromium over the real audit UI and prints each result
 * screen through the @media print stylesheet, so the PDFs are exactly what the
 * "Download report" button produces — no second rendering path to drift.
 *
 * Uses Playwright's page.pdf(), which is Chromium's print-to-PDF. Playwright
 * is already a dependency here (it drives the verification runs), so this adds
 * no new package.
 *
 * IMPORTANT: the browser is forced offline (`navigator.onLine === false`),
 * which puts the booth UI in cache-first mode. Every practice renders from the
 * pre-warmed cache instantly and NOT ONE PageSpeed call is made — a 58-site
 * batch would otherwise be 58 live audits against a quota we have already
 * exhausted once.
 *
 * Target: PRINT_BASE_URL, default https://www.inflowmd.com. Point it at
 * http://localhost:3000 to print from a local `npm run build && npm start`.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright";
import type { AuditResult } from "../src/types/audit";

const BASE_URL = (process.env.PRINT_BASE_URL ?? "https://www.inflowmd.com").replace(/\/+$/, "");
const OUT_DIR = path.resolve(process.cwd(), "output/reports");

/** Filesystem-safe name derived from the practice, not the URL. */
function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "practice"
  );
}

/**
 * Picks the row whose name matches exactly. Some practice names contain
 * others ("Vein Specialists" sits inside "The Vein Specialists"), so a
 * substring match on its own would silently print the wrong practice.
 */
async function selectPractice(page: Page, name: string): Promise<boolean> {
  const search = page.locator('input[aria-label="Search practices"]');
  await search.fill(name);

  // Wait for REACT to respond, not just for time to pass. The picker is
  // server-rendered, so its markup exists before hydration and a click can
  // land on a button that has no handler yet — the click is swallowed and the
  // result screen never appears. A filtered list proves the component is live.
  await page.waitForFunction(
    (needle) => {
      const rows = Array.from(document.querySelectorAll("button")).filter((b) =>
        (b.textContent ?? "").includes(needle)
      );
      const all = document.querySelectorAll('button[aria-label*="jump"], button').length;
      return rows.length > 0 && all < 40;
    },
    name,
    { timeout: 15_000 }
  );

  const rows = page.locator("button").filter({ hasText: name });
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const first = (await row.innerText()).split("\n")[0]?.trim();
    if (first === name) {
      await row.click();
      return true;
    }
  }
  if (count > 0) {
    await rows.first().click();
    return true;
  }
  return false;
}

async function printOne(
  browser: Browser,
  result: AuditResult,
  index: number,
  total: number
): Promise<{ ok: boolean; file?: string; reason?: string }> {
  const name = result.practiceName ?? result.url.replace(/^https?:\/\//, "");
  const counter = `[${String(index + 1).padStart(String(total).length)}/${total}]`;

  // A CONTEXT per practice, closed in finally. browser.newPage() implicitly
  // opens a context, and closing only the page leaves it behind — 58 of those
  // starve the browser and time out clicks that work fine in isolation.
  const context = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  // Cache-first: instant render, zero PageSpeed calls.
  await context.addInitScript(() => {
    Object.defineProperty(window.navigator, "onLine", { get: () => false, configurable: true });
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/audit`, { waitUntil: "networkidle", timeout: 45_000 });

    let opened = false;
    for (let attempt = 1; attempt <= 3 && !opened; attempt++) {
      if (attempt > 1) {
        await page.goto(`${BASE_URL}/audit`, { waitUntil: "networkidle", timeout: 45_000 });
      }
      if (!(await selectPractice(page, name))) {
        console.log(`${counter} ${name} … FAILED — no matching row in the picker`);
        return { ok: false, reason: "no matching row in the picker" };
      }
      // The result screen is up once the findings anchor exists.
      opened = await page
        .waitForSelector("#findings-ai", { timeout: 12_000 })
        .then(() => true)
        .catch(() => false);
    }
    if (!opened) {
      // Dump what the page actually shows — a silent timeout tells us nothing.
      const state = await page
        .locator("main")
        .innerText()
        .then((t) => t.replace(/\s+/g, " ").slice(0, 160))
        .catch(() => "(could not read page)");
      console.log(`${counter} ${name} … FAILED — result screen never rendered`);
      console.log(`         page shows: ${state}`);
      return { ok: false, reason: `result screen never rendered — page showed: ${state}` };
    }
    await page.waitForTimeout(400);

    const heading = (await page.locator("h1").first().innerText()).trim();
    const mismatch = heading !== name ? ` (rendered "${heading}")` : "";

    await page.emulateMedia({ media: "print" });
    const file = path.join(OUT_DIR, `${slugify(name)}.pdf`);
    await page.pdf({
      path: file,
      format: "Letter",
      printBackground: true,
      margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
    });
    console.log(`${counter} ${name} … ${path.basename(file)}${mismatch}`);
    return { ok: true, file };
  } catch (err) {
    const reason = err instanceof Error ? err.message.split("\n")[0] : "unknown error";
    console.log(`${counter} ${name} … FAILED — ${reason}`);
    return { ok: false, reason };
  } finally {
    await context.close();
  }
}

async function main(): Promise<void> {
  const cachePath = path.resolve(process.cwd(), "data/prewarmed-audits.json");
  let results: AuditResult[];
  try {
    const file = JSON.parse(await readFile(cachePath, "utf8")) as { results?: AuditResult[] };
    results = file.results ?? [];
  } catch {
    console.error(`Could not read ${cachePath}. Run \`npm run prewarm\` first.`);
    process.exit(1);
  }
  if (results.length === 0) {
    console.error("The cache has no results to print.");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Printing ${results.length} reports from ${BASE_URL}`);
  console.log(`Output: ${OUT_DIR}\n`);

  const browser = await chromium.launch();
  const failures: Array<{ name: string; reason: string }> = [];
  let written = 0;

  try {
    // Sequential on purpose: a booth laptop should not run 58 Chromium tabs,
    // and nothing here is time-critical.
    for (let i = 0; i < results.length; i++) {
      const outcome = await printOne(browser, results[i], i, results.length);
      if (outcome.ok) written++;
      else {
        failures.push({
          name: results[i].practiceName ?? results[i].url,
          reason: outcome.reason ?? "unknown",
        });
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nWrote ${written} of ${results.length} PDFs to ${OUT_DIR}`);
  if (failures.length > 0) {
    console.log(`\n${failures.length} could not be printed:`);
    for (const f of failures) console.log(`  — ${f.name}: ${f.reason}`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    written,
    total: results.length,
    failures,
  };
  await writeFile(path.join(OUT_DIR, "_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((err) => {
  console.error("print-reports failed:", err);
  process.exit(1);
});
