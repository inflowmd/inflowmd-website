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

class GhConflictError extends Error {}

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
    if (res.status === 409) {
      throw new GhConflictError(`GitHub 409: ${body.slice(0, 200)}`);
    }
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

/* ---------------- Operation types + apply logic ---------------- */

export type Operation =
  | { op: "mark_task_done"; clientId: string; taskIndex: number }
  | { op: "unmark_task_done"; clientId: string; taskIndex: number }
  | { op: "add_task"; clientId: string; text: string; icon: "you" | "bot" | "code" | "wait" | "note" }
  | { op: "remove_task"; clientId: string; taskIndex: number }
  | {
      op: "update_task";
      clientId: string;
      taskIndex: number;
      text?: string;
      icon?: "you" | "bot" | "code" | "wait" | "note";
    }
  | { op: "set_client_priority"; clientId: string; priority: "high" | "med" | "low" };

type Task = { icon: string; txt: string; done?: boolean };
type Client = { id: string; name: string; pri: string; tags: string[]; tasks: Task[] };
type Section = { section: string; clients: Client[] };
type TasksData = { lastUpdated: string; sections: Section[] };

function findClient(data: TasksData, clientId: string): Client | null {
  for (const sec of data.sections) {
    const c = sec.clients.find((c) => c.id === clientId);
    if (c) return c;
  }
  return null;
}

export function applyOperation(data: TasksData, op: Operation): TasksData {
  const today = new Date().toISOString().slice(0, 10);
  const next: TasksData = JSON.parse(JSON.stringify(data));
  next.lastUpdated = today;

  const client = findClient(next, op.clientId);
  if (!client) throw new Error(`Client not found: ${op.clientId}`);

  switch (op.op) {
    case "mark_task_done":
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks[op.taskIndex].done = true;
      break;
    case "unmark_task_done":
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks[op.taskIndex].done = false;
      break;
    case "add_task":
      client.tasks.push({ icon: op.icon, txt: op.text });
      break;
    case "remove_task":
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks.splice(op.taskIndex, 1);
      break;
    case "update_task": {
      const t = client.tasks[op.taskIndex];
      if (!t) throw new Error("Task index out of range");
      if (op.text !== undefined) t.txt = op.text;
      if (op.icon !== undefined) t.icon = op.icon;
      break;
    }
    case "set_client_priority":
      client.pri = op.priority;
      break;
  }
  return next;
}

/**
 * Read current tasks, apply operation, commit. Retries on SHA conflict
 * (another commit landed between our read and write) up to MAX_ATTEMPTS.
 */
export async function writeOperation(
  operation: Operation,
  summary: string
): Promise<TasksData> {
  const MAX_ATTEMPTS = 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, sha } = await readTasks();
      const next = applyOperation(data as TasksData, operation);
      await writeTasks(next, `tasks: ${summary}\n\nApplied via /tasks chat assistant`, sha);
      return next;
    } catch (e) {
      lastErr = e;
      if (e instanceof GhConflictError && attempt < MAX_ATTEMPTS) {
        // 100ms, 300ms backoff
        await new Promise((r) => setTimeout(r, attempt * 200));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
