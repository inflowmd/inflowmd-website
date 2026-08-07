import type { AuditResult, HtmlFetchResult, PerformanceResult } from "@/types/audit";
import { runPageSpeed } from "@/lib/pagespeed";
import { fetchHtml } from "@/lib/fetchHtml";
import { detectPlatform } from "@/lib/platform";
import { runSeoChecks } from "@/lib/checks/seo";
import { runSchemaChecks } from "@/lib/checks/schema";
import { fetchAiSignals, runAiReadinessChecks, type AiSignals } from "@/lib/checks/aiReadiness";
import { scoreCategory } from "@/lib/scoring";

/**
 * The full audit, shared by the API route and the pre-warm batch script so
 * both produce byte-identical results.
 */

/** Adds https:// when missing, drops a trailing slash, validates the result. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname.includes(".")) return null;

  const path = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${path}${parsed.search}`;
}

function failedPerformance(reason: string): PerformanceResult {
  return {
    available: false,
    lighthouseScore: null,
    lcp: null,
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
  // PageSpeed, the page fetch and the robots/llms probes run together; a
  // failure in any one must not take the others down with it.
  const [performanceSettled, htmlSettled, signalsSettled] = await Promise.allSettled([
    options.skipPageSpeed
      ? Promise.resolve(failedPerformance("Performance test skipped."))
      : runPageSpeed(url),
    fetchHtml(url),
    fetchAiSignals(url),
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
    url,
    html: htmlResult.html,
    htmlOk: htmlResult.ok,
  });
  const schema = runSchemaChecks({ html: htmlResult.html, htmlOk: htmlResult.ok });
  const aiReadiness = runAiReadinessChecks({
    html: htmlResult.html,
    htmlOk: htmlResult.ok,
    signals,
    headings,
  });

  const seoScore = scoreCategory(seo);
  const schemaScore = scoreCategory(schema);
  const aiScore = scoreCategory(aiReadiness);

  return {
    url,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
    performance,
    htmlFetch,
    platform: detectPlatform(htmlResult.html, htmlResult.ok),
    seo,
    schema,
    aiReadiness,
    scores: {
      performance: performance.available ? performance.lighthouseScore : null,
      seo: seoScore.score,
      seoVerified: seoScore.verified,
      seoTotal: seoScore.total,
      schema: schemaScore.score,
      schemaVerified: schemaScore.verified,
      schemaTotal: schemaScore.total,
      aiReadiness: aiScore.score,
      aiReadinessVerified: aiScore.verified,
      aiReadinessTotal: aiScore.total,
    },
  };
}
