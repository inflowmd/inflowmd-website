import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";
import { readTasks, writeOperation, type Operation } from "@/lib/tasksRepo";

export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_MESSAGES = 50;

const anthropic = createAnthropic({
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const IconEnum = z.enum(["you", "bot", "wait", "note"]);
const PriorityEnum = z.enum(["high", "med", "low"]);

async function runOp(op: Operation, summary: string) {
  try {
    await writeOperation(op, summary);
    return { ok: true as const, operation: op, summary };
  } catch (e) {
    return {
      ok: false as const,
      operation: op,
      summary,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: `Conversation too long (max ${MAX_MESSAGES} messages). Start a new chat.` }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const { data: currentTasks } = await readTasks();
  const today = new Date().toISOString().slice(0, 10);

  const systemBase = `You are an assistant embedded in Clayton's internal InflowMD task board. Today is ${today}.

You help him think through his client work, answer questions about his task list, and execute updates when asked.

Style:
- Conversational and concise. No fluff.
- Reference clients by name, not by ID, when talking to Clayton.
- When listing tasks, use short bullets.

Tool usage rules:
- When Clayton asks for a change, call the matching tool(s). Tools execute immediately — there is no approval step.
- Use the EXACT clientId (string, lowercase) and the zero-based taskIndex from the current data.
- After calling tools, give a one-line confirmation in plain English.
- For questions, planning, or analysis: do NOT call tools — just respond conversationally.
- Be careful with destructive operations (remove_task, sweeping changes). When in doubt for ambiguous requests, ASK before acting.

Task model:
- Tasks are { icon, txt, done? }. icon is one of: 'you' (manual work), 'bot' (Cowork agent), 'wait' (waiting on someone), 'note' (informational).
- "Mark as done" means set done: true, NOT remove. Completed tasks stay in the list (struck through) as a running record.
- Use remove_task only for tasks that were a mistake or are truly no longer relevant.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    stopWhen: stepCountIs(5),
    system: systemBase,
    messages: [
      {
        role: "system",
        content: `Current tasks.json:\n\n${JSON.stringify(currentTasks, null, 2)}`,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      ...(await convertToModelMessages(messages)),
    ],
    tools: {
      mark_task_done: tool({
        description: "Mark a task as done (sets done: true). Use when the user reports finishing a task. Executes immediately.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          summary: z.string().describe("Short plain-English description of this change for the commit message and UI."),
        }),
        execute: async ({ clientId, taskIndex, summary }) =>
          runOp({ op: "mark_task_done", clientId, taskIndex }, summary),
      }),
      unmark_task_done: tool({
        description: "Reopen a previously-done task (sets done: false). Executes immediately.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          summary: z.string().describe("Short plain-English description of this change."),
        }),
        execute: async ({ clientId, taskIndex, summary }) =>
          runOp({ op: "unmark_task_done", clientId, taskIndex }, summary),
      }),
      add_task: tool({
        description: "Add a new task to a client's task list. Executes immediately.",
        inputSchema: z.object({
          clientId: z.string(),
          text: z.string().min(1).max(500),
          icon: IconEnum,
          summary: z.string().describe("Short plain-English description of this change."),
        }),
        execute: async ({ clientId, text, icon, summary }) =>
          runOp({ op: "add_task", clientId, text, icon }, summary),
      }),
      remove_task: tool({
        description: "Remove a task entirely. Only use for mistakes or no-longer-relevant items. For finished work use mark_task_done. Executes immediately.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          summary: z.string().describe("Short plain-English description of this change."),
        }),
        execute: async ({ clientId, taskIndex, summary }) =>
          runOp({ op: "remove_task", clientId, taskIndex }, summary),
      }),
      update_task: tool({
        description: "Edit a task's text and/or icon. Provide only the fields to change. Executes immediately.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          text: z.string().min(1).max(500).optional(),
          icon: IconEnum.optional(),
          summary: z.string().describe("Short plain-English description of this change."),
        }),
        execute: async ({ clientId, taskIndex, text, icon, summary }) =>
          runOp({ op: "update_task", clientId, taskIndex, text, icon }, summary),
      }),
      set_client_priority: tool({
        description: "Change a client's priority level (high, med, low). Executes immediately.",
        inputSchema: z.object({
          clientId: z.string(),
          priority: PriorityEnum,
          summary: z.string().describe("Short plain-English description of this change."),
        }),
        execute: async ({ clientId, priority, summary }) =>
          runOp({ op: "set_client_priority", clientId, priority }, summary),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
