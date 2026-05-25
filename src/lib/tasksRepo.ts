/**
 * Read and write src/data/tasks.json via the GitHub Contents API.
 * Commits trigger a Vercel redeploy automatically.
 */

const OWNER = "inflowmd";
const REPO = "inflowmd-website";
const BRANCH = "main";
const PATH = "src/data/tasks.json";

interface GhContentResponse {
  content: string; // base64
  sha: string;
}

async function gh<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "inflowmd-tasks-bot",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function readTasks(): Promise<{ data: unknown; sha: string }> {
  const r = await gh<GhContentResponse>(
    `/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`
  );
  const json = Buffer.from(r.content, "base64").toString("utf-8");
  return { data: JSON.parse(json), sha: r.sha };
}

export async function writeTasks(
  newData: unknown,
  commitMessage: string,
  sha: string
): Promise<void> {
  const content = Buffer.from(
    JSON.stringify(newData, null, 2) + "\n",
    "utf-8"
  ).toString("base64");
  await gh(`/repos/${OWNER}/${REPO}/contents/${PATH}`, {
    method: "PUT",
    body: JSON.stringify({
      message: commitMessage,
      content,
      sha,
      branch: BRANCH,
      committer: {
        name: "InflowMD Tasks Bot",
        email: "tasks-bot@inflowmd.com",
      },
    }),
  });
}
