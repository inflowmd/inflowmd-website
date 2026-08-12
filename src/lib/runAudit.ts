import type { AuditResult, HtmlFetchResult, PerformanceResult } from "@/types/audit";
import { runPageSpeed } from "@/lib/pagespeed";
import { fetchHtml } from "@/lib/fetchHtml";
import { assertSafeUrl, type GuardVerdict } from "@/lib/ssrfGuard";
import { detectPlatform } from "@/lib/platform";
import { runSeoChecks } from "@/lib/checks/seo";
import { runSchemaChecks } from "@/lib/checks/schema";
import { fetchAiSignals, runAiReadinessChecks, type AiSignals } from "@/lib/checks/aiReadiness";
import { deriveScores } from "@/lib/categories";

/**
 * The full audit, shared by the API route and the pre-warm batch script so
 * both produce byte-identical results.
 */

// Re-exported so existing server-side callers (the API route, the pre-warm
// script) don't need a second import — but the implementation lives in a
// Node-import-free module so client components can use it too.
export { normalizeUrl } from "@/lib/normalizeUrl";

export interface RedirectResolution {
  /** Final destination after following the chain (normalized, no trailing slash). */
  finalUrl: string;
  /** Every URL in order, starting with the requested one. */
  chain: string[];
  hops: number;
  /** True when we confirmed a non-redirect terminal response. */
  resolved: boolean;
  /** True when a hop was refused by the SSRF guard. */
  blocked: boolean;
}

const RESOLVE_TIMEOUT_MS = 6_000;
const MAX_RESOLVE_HOPS = 5;

const RESOLVE_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
};

function tidy(url: string): string {
  return url.replace(/\/+$/, "").replace(/^(https?:\/\/[^/]+)$/, "$1");
}

/**
 * Follows a URL's redirect chain to its final destination so measurement runs
 * against what a browser actually ends up loading — Lighthouse counts redirect
 * time in paint metrics, so auditing the redirecting URL penalizes the site
 * ~0.7s per hop and disagrees with what PSI's own site shows for the final URL.
 *
 * Every hop is validated by the SSRF guard before it is contacted. Never throws.
 *
 * @param url Normalized starting URL.
 * @param guard Overridable for tests.
 */
export async function resolveRedirectChain(
  url: string,
  guard: (u: string) => Promise<GuardVerdict> = assertSafeUrl
): Promise<RedirectResolution> {
  const chain = [url];
  let current = url;

  for (let hop = 0; hop <= MAX_RESOLVE_HOPS; hop++) {
    const verdict = await guard(current);
    if (!verdict.ok) {
      return { finalUrl: current, chain, hops: chain.length - 1, resolved: false, blocked: true };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        method: "HEAD",
        redirect: "manual",
        headers: RESOLVE_HEADERS,
        signal: controller.signal,
        cache: "no-store",
      });
      // Some servers reject HEAD outright — retry the hop with GET.
      if (res.status === 405 || res.status === 501) {
        res = await fetch(current, {
          method: "GET",
          redirect: "manual",
          headers: RESOLVE_HEADERS,
          signal: controller.signal,
          cache: "no-store",
        });
        try {
          await res.body?.cancel();
        } catch {
          /* body already consumed or absent */
        }
      }
    } catch {
      // Unreachable — let the real fetch surface the failure downstream.
      return { finalUrl: current, chain, hops: chain.length - 1, resolved: false, blocked: false };
    } finally {
      clearTimeout(timer);
    }

    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      if (hop === MAX_RESOLVE_HOPS) break;
      current = tidy(new URL(location, current).toString());
      chain.push(current);
      continue;
    }
    return { finalUrl: current, chain, hops: chain.length - 1, resolved: true, blocked: false };
  }

  return { finalUrl: current, chain, hops: chain.length - 1, resolved: false, blocked: false };
}

function failedPerformance(reason: string): PerformanceResult {
  return {
    available: false,
    lighthouseScore: null,
    lcp: null,
    fcp: null,
    cls: null,
    tbt: null,
    speedIndex: null,
    fieldDataAvailable: false,
    fieldLcp: null,
    error: reason,
  };
}

const NO_SIGNALS: AiSignals = {
  robots: { fetched: false, absent: false, text: "", error: "Not reached." },
  llms: { fetched: false, present: false, error: "Not reached." },
};

/**
 * @param url A normalized, fully-qualified URL.
 * @param options.skipPageSpeed Skips the PSI call (useful when its quota is spent).
 */
export async function runAudit(
  url: string,
  options: { skipPageSpeed?: boolean } = {}
): Promise<AuditResult> {
  // Measure the FINAL destination, not the redirecting alias: Lighthouse
  // counts redirect time in paint metrics, so auditing "inflowmd.com" instead
  // of "www.inflowmd.com" penalizes the site ~0.7s and disagrees with PSI web.
  const resolution = await resolveRedirectChain(url);
  const target = resolution.blocked ? url : resolution.finalUrl;

  // PageSpeed, the page fetch and the robots/llms probes run together; a
  // failure in any one must not take the others down with it.
  const [performanceSettled, htmlSettled, signalsSettled] = await Promise.allSettled([
    options.skipPageSpeed || resolution.blocked
      ? Promise.resolve(failedPerformance("Performance test skipped."))
      : runPageSpeed(target),
    fetchHtml(target),
    fetchAiSignals(target),
  ]);

  const performance: PerformanceResult =
    performanceSettled.status === "fulfilled"
      ? performanceSettled.value
      : failedPerformance("The performance test did not complete.");

  const htmlResult =
    htmlSettled.status === "fulfilled"
      ? htmlSettled.value
      : {
          ok: false,
          statusCode: null,
          blocked: false,
          html: "",
          finalUrl: null,
          error: "The request to the site did not complete.",
        };

  const signals: AiSignals =
    signalsSettled.status === "fulfilled" ? signalsSettled.value : NO_SIGNALS;

  const htmlFetch: HtmlFetchResult = {
    ok: htmlResult.ok,
    statusCode: htmlResult.statusCode,
    blocked: htmlResult.blocked,
    ...(htmlResult.error ? { error: htmlResult.error } : {}),
  };

  // Every HTML-derived check receives `htmlOk`; when it is false those checks
  // return `could_not_verify` rather than accusing the site of a gap.
  const { checks: seo, headings } = runSeoChecks({
    url: target,
    html: htmlResult.html,
    htmlOk: htmlResult.ok,
    redirects: resolution,
  });
  const schema = runSchemaChecks({ html: htmlResult.html, htmlOk: htmlResult.ok });
  const aiReadiness = runAiReadinessChecks({
    html: htmlResult.html,
    htmlOk: htmlResult.ok,
    signals,
    headings,
  });

  // Scores are derived from the raw checks by the shared category table, so the
  // server and the booth UI can never disagree about a number.
  return {
    url: target,
    ...(target !== url ? { requestedUrl: url } : {}),
    fetchedAt: new Date().toISOString(),
    fromCache: false,
    performance,
    htmlFetch,
    platform: detectPlatform(htmlResult.html, htmlResult.ok),
    seo,
    schema,
    aiReadiness,
    scores: deriveScores({ seo, schema, aiReadiness, performance }),
  };
}
