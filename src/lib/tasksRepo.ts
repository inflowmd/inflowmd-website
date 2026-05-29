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
  | { op: "set_client_priority"; clientId: string; priority: "high" | "med" | "low" }
  | { op: "reorder_tasks"; clientId: string; order: number[] }
  | { op: "reorder_clients"; sectionName: string; order: string[] }
  | { op: "reorder_sections"; order: string[] }
  | { op: "add_to_today"; taskId: string }
  | { op: "remove_from_today"; taskId: string }
  | { op: "clear_today" };

type Task = { id: string; icon: string; txt: string; done?: boolean };
type Client = { id: string; name: string; pri: string; tags: string[]; tasks: Task[] };
type Section = { section: string; clients: Client[] };
type TasksData = { lastUpdated: string; today: string[]; sections: Section[] };

import { randomBytes } from "crypto";

function ensureIdsAndToday(data: TasksData): TasksData {
  if (!data.today) data.today = [];
  for (const sec of data.sections) {
    for (const c of sec.clients) {
      for (const t of c.tasks) {
        if (!t.id) t.id = randomBytes(4).toString("hex");
      }
    }
  }
  return data;
}

function findTaskById(data: TasksData, taskId: string): boolean {
  for (const sec of data.sections) {
    for (const c of sec.clients) {
      for (const t of c.tasks) {
        if (t.id === taskId) return true;
      }
    }
  }
  return false;
}

function findClient(data: TasksData, clientId: string): Client | null {
  for (const sec of data.sections) {
    const c = sec.clients.find((c) => c.id === clientId);
    if (c) return c;
  }
  return null;
}

function requireClient(data: TasksData, clientId: string): Client {
  const c = findClient(data, clientId);
  if (!c) throw new Error(`Client not found: ${clientId}`);
  return c;
}

export function applyOperation(data: TasksData, op: Operation): TasksData {
  const todayDate = new Date().toISOString().slice(0, 10);
  let next: TasksData = JSON.parse(JSON.stringify(data));
  next = ensureIdsAndToday(next);
  next.lastUpdated = todayDate;

  switch (op.op) {
    case "mark_task_done": {
      const client = requireClient(next, op.clientId);
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks[op.taskIndex].done = true;
      break;
    }
    case "unmark_task_done": {
      const client = requireClient(next, op.clientId);
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks[op.taskIndex].done = false;
      break;
    }
    case "add_task": {
      const client = requireClient(next, op.clientId);
      client.tasks.push({ id: randomBytes(4).toString("hex"), icon: op.icon, txt: op.text });
      break;
    }
    case "remove_task": {
      const client = requireClient(next, op.clientId);
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks.splice(op.taskIndex, 1);
      break;
    }
    case "update_task": {
      const client = requireClient(next, op.clientId);
      const t = client.tasks[op.taskIndex];
      if (!t) throw new Error("Task index out of range");
      if (op.text !== undefined) t.txt = op.text;
      if (op.icon !== undefined) t.icon = op.icon;
      break;
    }
    case "set_client_priority": {
      const client = requireClient(next, op.clientId);
      client.pri = op.priority;
      break;
    }
    case "reorder_tasks": {
      const client = requireClient(next, op.clientId);
      const { order } = op;
      if (order.length !== client.tasks.length) {
        throw new Error(`reorder_tasks: order length ${order.length} != tasks length ${client.tasks.length}`);
      }
      const seen = new Set<number>();
      for (const i of order) {
        if (i < 0 || i >= client.tasks.length) throw new Error(`reorder_tasks: index out of range: ${i}`);
        if (seen.has(i)) throw new Error(`reorder_tasks: duplicate index: ${i}`);
        seen.add(i);
      }
      client.tasks = order.map((i) => client.tasks[i]);
      break;
    }
    case "reorder_clients": {
      const section = next.sections.find((s) => s.section === op.sectionName);
      if (!section) throw new Error(`Section not found: ${op.sectionName}`);
      if (op.order.length !== section.clients.length) {
        throw new Error(`reorder_clients: order length mismatch`);
      }
      const byId = new Map(section.clients.map((c) => [c.id, c]));
      const reordered: Client[] = [];
      const seen = new Set<string>();
      for (const id of op.order) {
        const c = byId.get(id);
        if (!c) throw new Error(`reorder_clients: unknown client id ${id}`);
        if (seen.has(id)) throw new Error(`reorder_clients: duplicate id ${id}`);
        seen.add(id);
        reordered.push(c);
      }
      section.clients = reordered;
      break;
    }
    case "reorder_sections": {
      if (op.order.length !== next.sections.length) {
        throw new Error(`reorder_sections: order length mismatch`);
      }
      const byName = new Map(next.sections.map((s) => [s.section, s]));
      const reordered: Section[] = [];
      const seen = new Set<string>();
      for (const name of op.order) {
        const s = byName.get(name);
        if (!s) throw new Error(`reorder_sections: unknown section ${name}`);
        if (seen.has(name)) throw new Error(`reorder_sections: duplicate section ${name}`);
        seen.add(name);
        reordered.push(s);
      }
      next.sections = reordered;
      break;
    }
    case "add_to_today": {
      if (!findTaskById(next, op.taskId)) throw new Error(`Task not found: ${op.taskId}`);
      if (!next.today.includes(op.taskId)) next.today.push(op.taskId);
      break;
    }
    case "remove_from_today": {
      next.today = next.today.filter((id) => id !== op.taskId);
      break;
    }
    case "clear_today": {
      next.today = [];
      break;
    }
  }

  // Clean orphaned today entries (e.g. after a task is removed)
  const validIds = new Set<string>();
  for (const sec of next.sections) {
    for (const c of sec.clients) {
      for (const t of c.tasks) validIds.add(t.id);
    }
  }
  next.today = next.today.filter((id) => validIds.has(id));

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
