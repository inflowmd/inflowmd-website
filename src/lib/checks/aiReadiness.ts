import type { Check } from "@/types/audit";
import { fetchText } from "@/lib/fetchHtml";
import { findHeadingSkip, getContentWordCount, stripComments, type Heading } from "./html";

/**
 * AI-readiness checks: can ChatGPT, Claude, Perplexity and Google's AI features
 * actually read and cite this practice?
 *
 * robots.txt and llms.txt are fetched independently of the page itself, each
 * with its own failure state — a blocked homepage does not stop us verifying
 * robots.txt, and a missing robots.txt does not invalidate the page checks.
 */

/** The crawlers that feed today's AI answers. */
const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"] as const;

const THIN_CONTENT_WORDS = 300;
const VERY_THIN_CONTENT_WORDS = 100;

interface RobotsGroup {
  agents: string[];
  disallows: string[];
  allows: string[];
}

export interface AiSignals {
  robots: {
    fetched: boolean;
    /** True when the server explicitly said 404 — meaning "no restrictions". */
    absent: boolean;
    text: string;
    error?: string;
  };
  llms: {
    fetched: boolean;
    present: boolean;
    error?: string;
  };
}

/**
 * Fetches /robots.txt and /llms.txt. Each has its own try/catch so one failing
 * never suppresses the other. Never throws.
 */
export async function fetchAiSignals(url: string): Promise<AiSignals> {
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return {
      robots: { fetched: false, absent: false, text: "", error: "Invalid URL." },
      llms: { fetched: false, present: false, error: "Invalid URL." },
    };
  }

  const [robotsResult, llmsResult] = await Promise.allSettled([
    fetchText(`${origin}/robots.txt`, 6_000),
    fetchText(`${origin}/llms.txt`, 6_000),
  ]);

  const robots: AiSignals["robots"] =
    robotsResult.status === "fulfilled"
      ? robotsResult.value.statusCode === null
        ? {
            fetched: false,
            absent: false,
            text: "",
            error: robotsResult.value.error ?? "Could not reach robots.txt.",
          }
        : robotsResult.value.ok && robotsResult.value.text.trim()
          ? { fetched: true, absent: false, text: robotsResult.value.text }
          : { fetched: true, absent: true, text: "" }
      : {
          fetched: false,
          absent: false,
          text: "",
          error: "Could not reach robots.txt.",
        };

  const llms: AiSignals["llms"] =
    llmsResult.status === "fulfilled"
      ? llmsResult.value.statusCode === null
        ? {
            fetched: false,
            present: false,
            error: llmsResult.value.error ?? "Could not reach llms.txt.",
          }
        : {
            fetched: true,
            present: llmsResult.value.ok && llmsResult.value.text.trim().length > 0,
          }
      : { fetched: false, present: false, error: "Could not reach llms.txt." };

  return { robots, llms };
}

/** Splits robots.txt into user-agent groups. */
function parseRobots(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastLineWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      if (!current || !lastLineWasAgent) {
        current = { agents: [], disallows: [], allows: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastLineWasAgent = true;
      continue;
    }

    if (!current) continue;
    if (field === "disallow") current.disallows.push(value);
    else if (field === "allow") current.allows.push(value);
    lastLineWasAgent = false;
  }

  return groups;
}

/** Finds the group governing a bot: exact match wins, else the wildcard group. */
function groupFor(groups: RobotsGroup[], bot: string): RobotsGroup | null {
  const needle = bot.toLowerCase();
  const exact = groups.find((g) => g.agents.includes(needle));
  if (exact) return exact;
  return groups.find((g) => g.agents.includes("*")) ?? null;
}

/** A blanket `Disallow: /` with no overriding `Allow: /` blocks the whole site. */
function isBlocked(group: RobotsGroup | null): boolean {
  if (!group) return false;
  const blanketDisallow = group.disallows.some((d) => d === "/");
  if (!blanketDisallow) return false;
  const blanketAllow = group.allows.some((a) => a === "/");
  return !blanketAllow;
}

export interface AiReadinessInput {
  html: string;
  htmlOk: boolean;
  signals: AiSignals;
  /** Headings already parsed by the SEO pass, so we parse once. */
  headings: Heading[];
}

export function runAiReadinessChecks({
  html,
  htmlOk,
  signals,
  headings,
}: AiReadinessInput): Check[] {
  const checks: Check[] = [];

  // --- robots.txt reachability ---------------------------------------------
  if (!signals.robots.fetched) {
    checks.push({
      id: "ai.robots-file",
      label: "Crawler instructions file",
      status: "could_not_verify",
      detail:
        "We could not reach your robots.txt file, so we did not check what it allows. It may well be fine.",
    });
    checks.push({
      id: "ai.crawler-access",
      label: "AI assistant access",
      status: "could_not_verify",
      detail:
        "We could not read your crawler instructions, so we cannot say whether AI assistants are allowed to read your site.",
    });
  } else if (signals.robots.absent) {
    // No robots.txt means no restrictions — that is a pass, not a failure.
    checks.push({
      id: "ai.robots-file",
      label: "Crawler instructions file",
      status: "warn",
      detail:
        "Your site has no robots.txt file. Nothing is blocked, which is fine, but you also have no control over what crawlers do.",
    });
    checks.push({
      id: "ai.crawler-access",
      label: "AI assistant access",
      status: "pass",
      detail:
        "Nothing on your site blocks AI assistants such as ChatGPT, Claude or Perplexity from reading and citing your pages.",
      evidence: "No robots.txt restrictions found",
    });
  } else {
    const groups = parseRobots(signals.robots.text);
    const blockedBots = AI_CRAWLERS.filter((bot) => isBlocked(groupFor(groups, bot)));
    const allowedBots = AI_CRAWLERS.filter((bot) => !blockedBots.includes(bot));

    checks.push({
      id: "ai.robots-file",
      label: "Crawler instructions file",
      status: "pass",
      detail: "Your site publishes crawler instructions, so you control what search engines and AI tools may read.",
      evidence: "robots.txt found",
    });

    if (blockedBots.length === 0) {
      checks.push({
        id: "ai.crawler-access",
        label: "AI assistant access",
        status: "pass",
        detail:
          "AI assistants such as ChatGPT, Claude and Perplexity are all allowed to read your site, so they can cite you when patients ask about your treatments.",
        evidence: `Allowed: ${allowedBots.join(", ")}`,
      });
    } else if (blockedBots.length === AI_CRAWLERS.length) {
      checks.push({
        id: "ai.crawler-access",
        label: "AI assistant access",
        status: "fail",
        detail:
          "Your site blocks every major AI assistant, so ChatGPT, Claude and Perplexity cannot read or recommend your practice when patients ask.",
        evidence: `Blocked: ${blockedBots.join(", ")}`,
      });
    } else {
      checks.push({
        id: "ai.crawler-access",
        label: "AI assistant access",
        status: "warn",
        detail: `${blockedBots.length} of the 4 major AI assistants are blocked from reading your site, so they cannot cite your practice.`,
        evidence: `Blocked: ${blockedBots.join(", ")} · Allowed: ${allowedBots.join(", ") || "none"}`,
      });
    }
  }

  // --- llms.txt -------------------------------------------------------------
  if (!signals.llms.fetched) {
    checks.push({
      id: "ai.llms-txt",
      label: "AI content guide",
      status: "could_not_verify",
      detail: "We could not check for an AI content guide on your site.",
    });
  } else if (signals.llms.present) {
    checks.push({
      id: "ai.llms-txt",
      label: "AI content guide",
      status: "pass",
      detail:
        "Your site publishes a guide telling AI assistants what it is about and which pages matter most.",
      evidence: "llms.txt found",
    });
  } else {
    checks.push({
      id: "ai.llms-txt",
      label: "AI content guide",
      status: "warn",
      detail:
        "Your site has no AI content guide — an emerging standard that tells AI assistants which of your pages matter most. Few practices have one yet, so adding it is an easy edge.",
    });
  }

  // --- Page structure -------------------------------------------------------
  if (!htmlOk) {
    checks.push({
      id: "ai.semantic-structure",
      label: "Page structure for AI",
      status: "could_not_verify",
      detail: "We could not read this page, so we did not check its structure. It may well be fine.",
    });
    checks.push({
      id: "ai.content-depth",
      label: "Content depth",
      status: "could_not_verify",
      detail: "We could not read this page, so we did not measure how much content it has.",
    });
    return checks;
  }

  const skip = findHeadingSkip(headings);
  if (headings.length === 0) {
    // Consistent with the SEO pass: no headings at any level reads as a
    // reader failure, not a site with no structure.
    checks.push({
      id: "ai.semantic-structure",
      label: "Page structure for AI",
      status: "could_not_verify",
      detail:
        "We could not identify any headings on this page, which usually means our reader could not interpret the markup rather than that headings are missing.",
    });
  } else if (skip) {
    checks.push({
      id: "ai.semantic-structure",
      label: "Page structure for AI",
      status: "warn",
      detail:
        "Your headings skip a level, which makes it harder for AI assistants to work out how the sections relate.",
      evidence: `Jumps from a level ${skip.fromLevel} heading to a level ${skip.toLevel} heading`,
    });
  } else {
    checks.push({
      id: "ai.semantic-structure",
      label: "Page structure for AI",
      status: "pass",
      detail:
        "Your headings form a clean outline, which is how AI assistants find the passage that answers a patient's question.",
      evidence: `${headings.length} headings, in order`,
    });
  }

  // --- Content depth --------------------------------------------------------
  const words = getContentWordCount(stripComments(html));
  const evidence = `${words.toLocaleString()} words of page content`;
  if (words === 0) {
    // A page that fetched successfully but yields no words at all is a reader
    // failure (JS-rendered content, unusual markup), not an empty page.
    checks.push({
      id: "ai.content-depth",
      label: "Content depth",
      status: "could_not_verify",
      detail:
        "We could not extract any readable text from this page, which usually means the content is assembled in the browser rather than that the page is empty.",
    });
  } else if (words >= THIN_CONTENT_WORDS) {
    checks.push({
      id: "ai.content-depth",
      label: "Content depth",
      status: "pass",
      detail:
        "This page has enough written content for search engines and AI assistants to understand and quote it.",
      evidence,
    });
  } else if (words >= VERY_THIN_CONTENT_WORDS) {
    checks.push({
      id: "ai.content-depth",
      label: "Content depth",
      status: "warn",
      detail: `This page has only ${words} words. Pages under 300 words rarely give an AI assistant enough to quote when a patient asks about a condition.`,
      evidence,
    });
  } else {
    checks.push({
      id: "ai.content-depth",
      label: "Content depth",
      status: "fail",
      detail: `This page has only ${words} words of readable content, which is too little for search engines or AI assistants to draw an answer from.`,
      evidence,
    });
  }

  return checks;
}
