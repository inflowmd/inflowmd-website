import type { PerformanceResult } from "@/types/audit";

/**
 * PageSpeed Insights API v5 client (mobile strategy, performance category).
 *
 * Never throws — returns a typed result carrying an `error` string instead, so
 * a PageSpeed outage can never take down the rest of the audit.
 */

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/**
 * Total budget for ALL attempts, not per attempt.
 *
 * This ceiling is the whole point. An earlier version ran up to two 45s
 * attempts inside a 60s function, so a slow PageSpeed run was killed
 * mid-retry and the caller got a dead connection instead of a report. Retries
 * now share one deadline: each attempt is bounded by whatever remains, and a
 * retry is only started when there is real budget left for it. Worst case the
 * caller waits the same 55s it always did.
 */
export const TOTAL_BUDGET_MS = 55_000;

/**
 * Backoff between attempts, on server errors only.
 *
 * 500s from this API are transient — a Lighthouse run that fell over, not a
 * verdict about the page. In the 58-site pre-warm every one of them succeeded
 * on a later attempt. Timeouts are NOT retried: a page slow enough to exhaust
 * the budget will be slow again, and spending the remainder proving it costs
 * the caller the partial report it could have had.
 */
export const RETRY_DELAYS_MS = [2_000, 5_000];

/** Below this much remaining budget, starting another attempt is pointless. */
const MIN_ATTEMPT_MS = 3_000;

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

/** Turns a non-5xx response into a result. 5xx never reaches here — it retries. */
function parseResponse(status: number, body: Json | null): PerformanceResult {
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
}

export interface PageSpeedOptions {
  /** Override the shared deadline. Exists so tests need not burn real seconds. */
  totalBudgetMs?: number;
  /** Override the backoff schedule. Same reason. */
  retryDelaysMs?: number[];
}

/**
 * Runs PageSpeed, retrying server errors with exponential backoff inside a
 * single 55s budget shared by every attempt.
 *
 * Never throws. On a timeout, an exhausted retry budget, or a non-retryable
 * error it returns `available: false` with an explanatory message, so the
 * caller can still assemble a partial report from the HTML-derived checks.
 *
 * @param url Fully-qualified URL to test.
 */
export async function runPageSpeed(
  url: string,
  options: PageSpeedOptions = {}
): Promise<PerformanceResult> {
  const totalBudgetMs = options.totalBudgetMs ?? TOTAL_BUDGET_MS;
  const delays = options.retryDelaysMs ?? RETRY_DELAYS_MS;
  const minAttemptMs = Math.min(MIN_ATTEMPT_MS, Math.floor(totalBudgetMs / 4));

  const deadline = Date.now() + totalBudgetMs;
  let lastServerError: string | null = null;

  for (let attempt = 0; ; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining < minAttemptMs) break;

    let serverError: string | null = null;

    const controller = new AbortController();
    // Each attempt is capped by the budget that is actually left, so the
    // sequence can never outlast the ceiling.
    const timer = setTimeout(() => controller.abort(), remaining);
    try {
      const { status, body } = await requestOnce(url, controller.signal);
      if (status < 500) return parseResponse(status, body);
      serverError = `PageSpeed returned a server error (${status}).`;
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      // A timeout is a partial result, not a failed request: the HTML checks
      // ran in parallel and are still worth returning.
      return emptyResult(
        aborted
          ? "PageSpeed did not finish measuring this page in time."
          : err instanceof Error
            ? err.message
            : "PageSpeed request failed."
      );
    } finally {
      clearTimeout(timer);
    }

    lastServerError = serverError;

    const delay = delays[attempt];
    if (delay === undefined) break; // retries exhausted
    // Only back off when there is room for the wait AND a real attempt after it.
    if (deadline - Date.now() < delay + minAttemptMs) break;

    console.warn(
      `${serverError} Retrying ${url} in ${delay / 1000}s ` +
        `(attempt ${attempt + 2} of ${delays.length + 1}).`
    );
    await sleep(delay);
  }

  return emptyResult(lastServerError ?? "PageSpeed request failed.");
}
