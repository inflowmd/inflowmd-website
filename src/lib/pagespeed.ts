import type { PerformanceResult } from "@/types/audit";

/**
 * PageSpeed Insights API v5 client (mobile strategy, performance category).
 *
 * Never throws — returns a typed result carrying an `error` string instead, so
 * a PageSpeed outage can never take down the rest of the audit.
 */

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const TIMEOUT_MS = 45_000;

function emptyResult(error?: string): PerformanceResult {
  return {
    available: false,
    lighthouseScore: null,
    lcp: null,
    cls: null,
    tbt: null,
    speedIndex: null,
    fieldDataAvailable: false,
    fieldLcp: null,
    ...(error ? { error } : {}),
  };
}

/** Lighthouse numericValue for timing audits is milliseconds. */
function msToSeconds(ms: unknown): number | null {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return null;
  return Math.round((ms / 1000) * 100) / 100;
}

function numeric(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

type Json = Record<string, unknown>;

function asObject(value: unknown): Json | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : null;
}

function auditValue(audits: Json | null, id: string): unknown {
  const audit = asObject(audits?.[id]);
  return audit?.numericValue;
}

/**
 * The API works unauthenticated at a low quota. Sending a placeholder value
 * from a checked-in .env would hard-fail every request with "API key not
 * valid", so we treat obvious placeholders as absent.
 */
function resolveApiKey(): string | null {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  if (!key) return null;
  if (/^(your_|placeholder|changeme|xxx|<)/i.test(key)) return null;
  return key;
}

async function requestOnce(
  url: string,
  signal: AbortSignal
): Promise<{ status: number; body: Json | null }> {
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    category: "performance",
  });
  const key = resolveApiKey();
  if (key) params.set("key", key);

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  let body: Json | null = null;
  try {
    body = asObject(await res.json());
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

/**
 * Runs PageSpeed with a 45s ceiling and a single retry on timeout or 5xx.
 * @param url Fully-qualified URL to test.
 */
export async function runPageSpeed(url: string): Promise<PerformanceResult> {
  let lastError = "PageSpeed did not return a result.";

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const { status, body } = await requestOnce(url, controller.signal);

      // Retry once on server-side failures; client errors are terminal.
      if (status >= 500) {
        lastError = `PageSpeed returned a server error (${status}).`;
        continue;
      }
      if (status !== 200 || !body) {
        const apiError = asObject(body?.error);
        const message =
          typeof apiError?.message === "string"
            ? apiError.message
            : `PageSpeed returned status ${status}.`;
        return emptyResult(message);
      }

      const lighthouse = asObject(body.lighthouseResult);
      if (!lighthouse) {
        return emptyResult("PageSpeed returned no Lighthouse data for this page.");
      }

      const categories = asObject(lighthouse.categories);
      const perfCategory = asObject(categories?.performance);
      const rawScore = numeric(perfCategory?.score);
      const audits = asObject(lighthouse.audits);

      // Chrome UX Report field data — absent for low-traffic sites, which is
      // normal and must not be treated as an error.
      const loadingExperience = asObject(body.loadingExperience);
      const fieldMetrics = asObject(loadingExperience?.metrics);
      const fieldLcpMetric = asObject(fieldMetrics?.LARGEST_CONTENTFUL_PAINT_MS);
      const fieldLcpMs = numeric(fieldLcpMetric?.percentile);

      return {
        available: true,
        lighthouseScore: rawScore === null ? null : Math.round(rawScore * 100),
        lcp: msToSeconds(auditValue(audits, "largest-contentful-paint")),
        cls: (() => {
          const raw = numeric(auditValue(audits, "cumulative-layout-shift"));
          return raw === null ? null : Math.round(raw * 1000) / 1000;
        })(),
        tbt: (() => {
          const raw = numeric(auditValue(audits, "total-blocking-time"));
          return raw === null ? null : Math.round(raw);
        })(),
        speedIndex: msToSeconds(auditValue(audits, "speed-index")),
        fieldDataAvailable: fieldLcpMs !== null,
        fieldLcp: fieldLcpMs === null ? null : Math.round((fieldLcpMs / 1000) * 100) / 100,
      };
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      lastError = aborted
        ? "PageSpeed timed out before returning a score."
        : err instanceof Error
          ? err.message
          : "PageSpeed request failed.";
      // Timeouts and network faults get one retry.
    } finally {
      clearTimeout(timer);
    }
  }

  return emptyResult(lastError);
}
