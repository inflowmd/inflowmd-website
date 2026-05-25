import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readTasks, writeTasks } from "@/lib/tasksRepo";

export const runtime = "nodejs";

const TaskSchema = z.object({
  icon: z.enum(["you", "bot", "wait", "note"]),
  txt: z.string().min(1).max(500),
  done: z.boolean().optional(),
});

const ClientSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  pri: z.enum(["high", "med", "low"]),
  tags: z.array(z.string()).max(20),
  tasks: z.array(TaskSchema).max(50),
});

const SectionSchema = z.object({
  section: z.string().min(1).max(200),
  clients: z.array(ClientSchema).max(50),
});

const TasksDataSchema = z.object({
  lastUpdated: z.string(),
  sections: z.array(SectionSchema).max(20),
});

const RequestSchema = z.object({
  newTasks: TasksDataSchema,
  summary: z.string().min(1).max(200),
});

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

  const { newTasks, summary } = parsed.data;

  try {
    const { sha } = await readTasks();
    await writeTasks(newTasks, `tasks: ${summary}\n\nApplied via /tasks chat assistant`, sha);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
