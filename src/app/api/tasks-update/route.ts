import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readTasks, writeTasks } from "@/lib/tasksRepo";

export const runtime = "nodejs";

const IconEnum = z.enum(["you", "bot", "wait", "note"]);
const PriorityEnum = z.enum(["high", "med", "low"]);

const OperationSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("mark_task_done"), clientId: z.string(), taskIndex: z.number().int().min(0) }),
  z.object({ op: z.literal("unmark_task_done"), clientId: z.string(), taskIndex: z.number().int().min(0) }),
  z.object({ op: z.literal("add_task"), clientId: z.string(), text: z.string().min(1).max(500), icon: IconEnum }),
  z.object({ op: z.literal("remove_task"), clientId: z.string(), taskIndex: z.number().int().min(0) }),
  z.object({
    op: z.literal("update_task"),
    clientId: z.string(),
    taskIndex: z.number().int().min(0),
    text: z.string().min(1).max(500).optional(),
    icon: IconEnum.optional(),
  }),
  z.object({ op: z.literal("set_client_priority"), clientId: z.string(), priority: PriorityEnum }),
]);

const RequestSchema = z.object({
  operation: OperationSchema,
  summary: z.string().min(1).max(300),
});

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

function applyOperation(data: TasksData, op: z.infer<typeof OperationSchema>): TasksData {
  const today = new Date().toISOString().slice(0, 10);
  const next: TasksData = JSON.parse(JSON.stringify(data));
  next.lastUpdated = today;

  const client = findClient(next, op.clientId);
  if (!client) throw new Error(`Client not found: ${op.clientId}`);

  switch (op.op) {
    case "mark_task_done": {
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks[op.taskIndex].done = true;
      break;
    }
    case "unmark_task_done": {
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks[op.taskIndex].done = false;
      break;
    }
    case "add_task": {
      client.tasks.push({ icon: op.icon, txt: op.text });
      break;
    }
    case "remove_task": {
      if (!client.tasks[op.taskIndex]) throw new Error("Task index out of range");
      client.tasks.splice(op.taskIndex, 1);
      break;
    }
    case "update_task": {
      const t = client.tasks[op.taskIndex];
      if (!t) throw new Error("Task index out of range");
      if (op.text !== undefined) t.txt = op.text;
      if (op.icon !== undefined) t.icon = op.icon;
      break;
    }
    case "set_client_priority": {
      client.pri = op.priority;
      break;
    }
  }
  return next;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request shape", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { operation, summary } = parsed.data;

  try {
    const { data, sha } = await readTasks();
    const newData = applyOperation(data as TasksData, operation);
    await writeTasks(newData, `tasks: ${summary}\n\nApplied via /tasks chat assistant`, sha);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
