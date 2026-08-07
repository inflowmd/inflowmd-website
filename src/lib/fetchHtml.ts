/**
 * Fetches a target site's HTML the way a real browser would.
 *
 * Never throws. A failure here must degrade the audit to `could_not_verify`,
 * never to a false accusation — so the caller always gets a result object.
 */

import { assertSafeUrl, type GuardVerdict } from "@/lib/ssrfGuard";

const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 5;

/** Injectable for tests; production always uses the real guard. */
export type UrlGuard = (url: string) => Promise<GuardVerdict>;

/** A current desktop Chrome UA — many sites serve reduced markup to unknown agents. */
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": USER_AGENT,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Upgrade-Insecure-Requests": "1",
};

/** Interstitials that mean "we were challenged", not "the page is empty". */
const CHALLENGE_MARKERS = [
  "cf-browser-verification",
  "just a moment",
  "checking your browser",
  "cf-challenge",
  "attention required! | cloudflare",
  "please enable javascript and cookies",
  "ddos protection by",
  "__cf_chl",
];

export interface FetchHtmlResult {
  ok: boolean;
  statusCode: number | null;
  /** True when we were refused or challenged — distinct from a genuine error. */
  blocked: boolean;
  html: string;
  /** Final URL after redirects, useful for canonical comparisons. */
  finalUrl: string | null;
  error?: string;
}

function detectChallenge(html: string): boolean {
  const haystack = html.slice(0, 20_000).toLowerCase();
  return CHALLENGE_MARKERS.some((marker) => haystack.includes(marker));
}

function blockedResult(url: string): FetchHtmlResult {
  return {
    ok: false,
    statusCode: null,
    blocked: true,
    html: "",
    finalUrl: url,
    error: "That address cannot be audited.",
  };
}

/**
 * @param url Fully-qualified URL to fetch.
 * @param options.guard Overridable for tests. Every redirect hop is checked
 *   with it, not just the initial URL.
 */
export async function fetchHtml(
  url: string,
  options: { guard?: UrlGuard } = {}
): Promise<FetchHtmlResult> {
  const guard = options.guard ?? assertSafeUrl;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Redirects are followed by hand so each destination can be validated —
    // `redirect: "follow"` would hide the hops entirely.
    let current = url;
    let res: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const verdict = await guard(current);
      if (!verdict.ok) {
        clearTimeout(timer);
        return blockedResult(current);
      }

      res = await fetch(current, {
        signal: controller.signal,
        redirect: "manual",
        headers: BROWSER_HEADERS,
        cache: "no-store",
      });

      const isRedirect = res.status >= 300 && res.status < 400;
      const location = res.headers.get("location");
      if (!isRedirect || !location) break;

      if (hop === MAX_REDIRECTS) {
        clearTimeout(timer);
        return {
          ok: false,
          statusCode: res.status,
          blocked: false,
          html: "",
          finalUrl: current,
          error: "The site redirected too many times.",
        };
      }
      // Resolve relative Location headers against the current URL.
      current = new URL(location, current).toString();
    }

    if (!res) {
      clearTimeout(timer);
      return blockedResult(url);
    }

    const status = res.status;
    let html = "";
    try {
      html = await res.text();
    } catch {
      html = "";
    }

    const challenged = detectChallenge(html);
    const refused = status === 403 || status === 429;
    const blocked = refused || challenged;

    if (blocked) {
      return {
        ok: false,
        statusCode: status,
        blocked: true,
        html: "",
        finalUrl: current,
        error: refused
          ? `The site refused our request (status ${status}).`
          : "The site returned a bot-protection challenge instead of the page.",
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        statusCode: status,
        blocked: false,
        html: "",
        finalUrl: current,
        error: `The site returned status ${status}.`,
      };
    }

    if (!html.trim()) {
      return {
        ok: false,
        statusCode: status,
        blocked: false,
        html: "",
        finalUrl: current,
        error: "The site returned an empty response body.",
      };
    }

    return {
      ok: true,
      statusCode: status,
      blocked: false,
      html,
      finalUrl: current,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      statusCode: null,
      blocked: false,
      html: "",
      finalUrl: null,
      error: aborted
        ? "The site did not respond within 8 seconds."
        : err instanceof Error
          ? err.message
          : "The request to the site failed.",
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Fetches a plain-text file (robots.txt, llms.txt). Never throws. */
export async function fetchText(
  url: string,
  timeoutMs = TIMEOUT_MS,
  options: { guard?: UrlGuard } = {}
): Promise<{ ok: boolean; statusCode: number | null; text: string; error?: string }> {
  const guard = options.guard ?? assertSafeUrl;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const verdict = await guard(url);
    if (!verdict.ok) {
      return { ok: false, statusCode: null, text: "", error: "Blocked target." };
    }
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { ...BROWSER_HEADERS, Accept: "text/plain,*/*;q=0.8" },
      cache: "no-store",
    });
    let text = "";
    try {
      text = await res.text();
    } catch {
      text = "";
    }
    return { ok: res.ok, statusCode: res.status, text };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      statusCode: null,
      text: "",
      error: aborted
        ? "Request timed out."
        : err instanceof Error
          ? err.message
          : "Request failed.",
    };
  } finally {
    clearTimeout(timer);
  }
}
