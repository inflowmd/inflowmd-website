/**
 * Live audit counter for the booth poster.
 *
 * Counts UNIQUE domains audited live during the event. Not a hit counter: the
 * same practice scanning twice is one practice, and the 58 pre-warmed results
 * are not in here at all — the pre-warm script calls runAudit() directly and
 * never touches the API route this records from.
 *
 * WHY A GIST. The count has to survive a deploy, so it cannot live in memory,
 * and Vercel's filesystem is read-only outside /tmp. This project already
 * talks to GitHub with GITHUB_TOKEN (see tasksRepo.ts), but that module writes
 * a file on `main` and, in its own words, "commits trigger a Vercel redeploy
 * automatically". That is fine for an internal task board and completely wrong
 * here: a booth audit every couple of minutes would mean a production rebuild
 * every couple of minutes, all conference. A secret gist is the same
 * durability and the same credential with none of that — nothing watches a
 * gist, so nothing rebuilds.
 *
 * The gist is found by its description and created on first write, so there is
 * no ID to configure. The token needs `gist` scope.
 */

const GIST_DESCRIPTION = "InflowMD booth audit counter — do not delete";
const GIST_FILENAME = "booth-audit-counter.json";

/**
 * Domains that are ours, not prospects'. inflowmd.com is audited live by the
 * result screen's comparison block every time someone opens a report, so
 * without this list the counter would mostly be counting us.
 */
export const NON_COUNTED_DOMAINS: readonly string[] = [
  "inflowmd.com",
  "thebluffs.com",
  "vercel.app",
  "localhost",
];

/** Registrable host, lowercased, with "www." removed. Null when unparseable. */
export function normalizeDomain(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

/**
 * True when a domain must not be counted. Matches the host itself and any
 * subdomain of it, so preview.inflowmd.com and inflowmd-xyz.vercel.app are
 * both excluded — deploy previews audit themselves during testing.
 */
export function isCountable(url: string): boolean {
  const host = normalizeDomain(url);
  if (!host) return false;
  return !NON_COUNTED_DOMAINS.some(
    (excluded) => host === excluded || host.endsWith(`.${excluded}`)
  );
}

interface CounterFile {
  domains: string[];
  updatedAt: string;
}

/** Cached per lambda instance so a poll does not list gists every time. */
let cachedGistId: string | null = null;

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "inflowmd-booth-counter",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 160)}`);
  }
  return (await res.json()) as T;
}

async function findGistId(): Promise<string | null> {
  if (cachedGistId) return cachedGistId;
  const gists = await gh<Array<{ id: string; description: string | null }>>(
    "/gists?per_page=100"
  );
  const found = gists.find((g) => g.description === GIST_DESCRIPTION);
  cachedGistId = found?.id ?? null;
  return cachedGistId;
}

async function readFile(): Promise<{ id: string; data: CounterFile } | null> {
  const id = await findGistId();
  if (!id) return null;
  const gist = await gh<{ files: Record<string, { content?: string }> }>(`/gists/${id}`);
  const raw = gist.files?.[GIST_FILENAME]?.content;
  if (!raw) return { id, data: { domains: [], updatedAt: "" } };
  try {
    const parsed = JSON.parse(raw) as Partial<CounterFile>;
    return {
      id,
      data: {
        domains: Array.isArray(parsed.domains) ? parsed.domains.filter((d) => typeof d === "string") : [],
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      },
    };
  } catch {
    // Never wipe a corrupt file — report empty and let a write repair it.
    return { id, data: { domains: [], updatedAt: "" } };
  }
}

async function writeFileContent(id: string | null, data: CounterFile): Promise<void> {
  const files = { [GIST_FILENAME]: { content: `${JSON.stringify(data, null, 2)}\n` } };
  if (id) {
    await gh(`/gists/${id}`, { method: "PATCH", body: JSON.stringify({ files }) });
    return;
  }
  const created = await gh<{ id: string }>("/gists", {
    method: "POST",
    body: JSON.stringify({ description: GIST_DESCRIPTION, public: false, files }),
  });
  cachedGistId = created.id;
}

/**
 * Records one live audit. Returns quietly on every failure path — a counter
 * for a poster must never be able to break, slow, or fail an audit.
 */
export async function recordAudit(url: string): Promise<void> {
  if (!isCountable(url)) return;
  const domain = normalizeDomain(url);
  if (!domain) return;

  try {
    const existing = await readFile();
    if (existing?.data.domains.includes(domain)) return; // already counted
    const domains = [...(existing?.data.domains ?? []), domain];
    await writeFileContent(existing?.id ?? null, {
      domains,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`[BOOTH-COUNTER] could not record ${domain}: ${(err as Error).message}`);
  }
}

/** Unique live-audited domains, or null when the store cannot be read. */
export async function getAuditCount(): Promise<number | null> {
  try {
    const existing = await readFile();
    return existing ? existing.data.domains.length : 0;
  } catch (err) {
    console.warn(`[BOOTH-COUNTER] could not read the count: ${(err as Error).message}`);
    return null;
  }
}
