/**
 * Persistent "memory" for the tasks chat assistant.
 * Stored as src/data/memory.json in the repo so it survives across sessions
 * and is version-controlled.
 */

import { randomBytes } from "crypto";

const OWNER = "inflowmd";
const REPO = "inflowmd-website";
const BRANCH = "main";
const PATH = "src/data/memory.json";

interface GhContentResponse {
  content: string;
  sha: string;
}

class GhConflictError extends Error {}

async function gh<T = unknown>(path: string, init?: RequestInit): Promise<T> {
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
    if (res.status === 409) throw new GhConflictError(`GitHub 409: ${body.slice(0, 200)}`);
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export interface MemoryNote {
  id: string;
  text: string;
  added: string; // ISO date
}

export interface MemoryData {
  lastUpdated: string;
  notes: MemoryNote[];
}

export type MemoryOperation =
  | { op: "add_memory"; text: string }
  | { op: "remove_memory"; id: string }
  | { op: "update_memory"; id: string; text: string };

async function readMemoryFromGh(): Promise<{ data: MemoryData; sha: string }> {
  const r = await gh<GhContentResponse>(
    `/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`
  );
  const json = Buffer.from(r.content, "base64").toString("utf-8");
  return { data: JSON.parse(json), sha: r.sha };
}

async function writeMemoryToGh(
  newData: MemoryData,
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

export async function readMemory(): Promise<MemoryData> {
  try {
    const { data } = await readMemoryFromGh();
    return data;
  } catch (e) {
    // First-run safety: if file doesn't exist yet, return an empty memory.
    if (e instanceof Error && e.message.includes("404")) {
      return { lastUpdated: new Date().toISOString().slice(0, 10), notes: [] };
    }
    throw e;
  }
}

function newId(): string {
  return randomBytes(4).toString("hex");
}

function applyMemoryOperation(data: MemoryData, op: MemoryOperation): MemoryData {
  const today = new Date().toISOString().slice(0, 10);
  const next: MemoryData = JSON.parse(JSON.stringify(data));
  next.lastUpdated = today;
  switch (op.op) {
    case "add_memory":
      next.notes.push({ id: newId(), text: op.text, added: today });
      return next;
    case "remove_memory":
      next.notes = next.notes.filter((n) => n.id !== op.id);
      return next;
    case "update_memory": {
      const n = next.notes.find((n) => n.id === op.id);
      if (!n) throw new Error(`Memory note not found: ${op.id}`);
      n.text = op.text;
      return next;
    }
  }
}

export async function writeMemoryOperation(
  op: MemoryOperation,
  summary: string
): Promise<MemoryData> {
  const MAX_ATTEMPTS = 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, sha } = await readMemoryFromGh();
      const next = applyMemoryOperation(data, op);
      await writeMemoryToGh(next, `memory: ${summary}\n\nApplied via /tasks chat assistant`, sha);
      return next;
    } catch (e) {
      lastErr = e;
      if (e instanceof GhConflictError && attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 200));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
