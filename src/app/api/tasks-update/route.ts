import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeOperation, type Operation } from "@/lib/tasksRepo";

export const runtime = "nodejs";

const IconEnum = z.enum(["you", "bot", "code", "wait", "note"]);
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
  z.object({
    op: z.literal("reorder_tasks"),
    clientId: z.string(),
    order: z.array(z.number().int().min(0)).max(200),
  }),
  z.object({
    op: z.literal("reorder_clients"),
    sectionName: z.string(),
    order: z.array(z.string()).max(100),
  }),
  z.object({
    op: z.literal("reorder_sections"),
    order: z.array(z.string()).max(50),
  }),
  z.object({ op: z.literal("add_to_today"), taskId: z.string().min(1).max(64) }),
  z.object({ op: z.literal("remove_from_today"), taskId: z.string().min(1).max(64) }),
  z.object({ op: z.literal("clear_today") }),
]);

const RequestSchema = z.object({
  operation: OperationSchema,
  summary: z.string().min(1).max(300),
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

  try {
    await writeOperation(parsed.data.operation as Operation, parsed.data.summary);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
