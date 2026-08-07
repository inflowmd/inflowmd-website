import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..");

const URL =
  process.env.REPORT_URL ||
  "https://www.inflowmd.com/clients/cvc-2026-q2-review";

async function capture({ label, width, height, filename }) {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      // A modern iPhone UA for the 390px capture, generic desktop UA for the 1440
      userAgent:
        width <= 500
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
          : "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    });
    const page = await context.newPage();

    console.log(`[${label}] loading ${URL}`);
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });

    // Give Recharts + FadeIn animations a moment
    await page.waitForTimeout(1500);

    // Nudge the page so intersection-observer-triggered animations fire,
    // then scroll back to the top before the full-page capture.
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const step = window.innerHeight * 0.8;
      for (let y = 0; y <= scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });

    await page.waitForTimeout(1500);

    const outPath = path.join(outDir, filename);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`[${label}] wrote ${outPath}`);
    await context.close();
    return outPath;
  } finally {
    await browser.close();
  }
}

(async () => {
  const results = [];
  results.push(
    await capture({
      label: "mobile",
      width: 390,
      height: 844,
      filename: "report-mobile.png",
    })
  );
  results.push(
    await capture({
      label: "desktop",
      width: 1440,
      height: 900,
      filename: "report-desktop.png",
    })
  );
  console.log("");
  console.log("done:");
  results.forEach((p) => console.log("  " + p));
})();
