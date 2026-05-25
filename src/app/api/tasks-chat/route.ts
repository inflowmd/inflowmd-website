import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";
import { readTasks } from "@/lib/tasksRepo";

export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_MESSAGES = 50;

const anthropic = createAnthropic({
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const IconEnum = z.enum(["you", "bot", "wait", "note"]);
const PriorityEnum = z.enum(["high", "med", "low"]);

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

You help him think through his client work, answer questions about his task list, and — when explicitly asked — propose updates by calling tools.

Style:
- Conversational and concise. No fluff.
- Reference clients by name, not by ID, when talking to Clayton.
- When listing tasks, use short bullets.

Tool usage rules:
- When Clayton asks for a change, call the matching granular tool(s). You may call multiple tools in one turn (e.g. mark two tasks done at once).
- Each tool call surfaces as an Apply/Reject card for Clayton. He approves each one.
- Use the EXACT clientId (string, lowercase) and the zero-based taskIndex from the current data.
- After calling tools, give a brief one-line confirmation in plain English.
- For questions, planning, or analysis: do NOT call tools — just respond conversationally.

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
        description: "Mark a task as done (sets done: true). Use when the user reports finishing a task.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
        }),
      }),
      unmark_task_done: tool({
        description: "Reopen a previously-done task (sets done: false).",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
        }),
      }),
      add_task: tool({
        description: "Add a new task to a client's task list.",
        inputSchema: z.object({
          clientId: z.string(),
          text: z.string().min(1).max(500),
          icon: IconEnum,
        }),
      }),
      remove_task: tool({
        description: "Remove a task entirely. Only use for mistakes or no-longer-relevant items. For finished work use mark_task_done.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
        }),
      }),
      update_task: tool({
        description: "Edit a task's text and/or icon. Provide only the fields to change.",
        inputSchema: z.object({
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          text: z.string().min(1).max(500).optional(),
          icon: IconEnum.optional(),
        }),
      }),
      set_client_priority: tool({
        description: "Change a client's priority level (high, med, low).",
        inputSchema: z.object({
          clientId: z.string(),
          priority: PriorityEnum,
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
