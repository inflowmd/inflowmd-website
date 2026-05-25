import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";

// Pin baseURL and apiKey explicitly. Some shells set ANTHROPIC_BASE_URL or
// blank ANTHROPIC_API_KEY which would otherwise be picked up automatically.
const anthropic = createAnthropic({
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.ANTHROPIC_API_KEY,
});
import { z } from "zod";
import { readTasks } from "@/lib/tasksRepo";

export const maxDuration = 30;
export const runtime = "nodejs";

const MAX_MESSAGES = 50;

const TaskSchema = z.object({
  icon: z.enum(["you", "bot", "wait", "note"]),
  txt: z.string(),
  done: z.boolean().optional(),
});

const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  pri: z.enum(["high", "med", "low"]),
  tags: z.array(z.string()),
  tasks: z.array(TaskSchema),
});

const SectionSchema = z.object({
  section: z.string(),
  clients: z.array(ClientSchema),
});

const TasksDataSchema = z.object({
  lastUpdated: z.string(),
  sections: z.array(SectionSchema),
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: `Conversation too long (max ${MAX_MESSAGES} messages). Start a new chat.` }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  // Load the current task data fresh on every request so the model is never stale.
  const { data: currentTasks } = await readTasks();

  const today = new Date().toISOString().slice(0, 10);

  const systemBase = `You are an assistant embedded in Clayton's internal InflowMD task board. Today is ${today}.

You help him think through his client work, answer questions about his task list, and — when explicitly asked — propose updates to the task data.

Style:
- Conversational and concise. No fluff.
- Reference clients by name, not by ID, when talking to Clayton.
- When listing tasks, use short bullets.
- Don't quote the full JSON unless he asks.

When proposing changes:
- Use the propose_tasks_update tool with the ENTIRE updated tasks object (not a diff).
- Preserve the existing structure exactly. Only change what was requested.
- Always set lastUpdated to today's date (${today}) on any change.
- After calling the tool, briefly summarize what you changed in plain English.
- Do not call the tool unless Clayton has clearly asked for a change. For questions, planning, or analysis, just respond conversationally.

Task completion:
- Tasks have an optional \`done: boolean\` field. To "mark a task as done", set done: true on it. To "unmark" or "reopen", set done: false (or omit the field).
- DO NOT remove a task when asked to mark it done. Removal is only for tasks that were entered by mistake or are no longer relevant.
- Completed tasks stay in the list (struck through) so Clayton has a running record.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    stopWhen: stepCountIs(5),
    messages: [
      {
        role: "system",
        content: systemBase,
      },
      {
        role: "system",
        content: `Current tasks.json:\n\n${JSON.stringify(currentTasks, null, 2)}`,
        // Cache the (large, slow-changing) tasks payload so follow-ups in the same
        // 5-min window are essentially free on the input side.
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      ...(await convertToModelMessages(messages)),
    ],
    tools: {
      propose_tasks_update: tool({
        description:
          "Propose a complete updated tasks.json. The user will review and click Apply or Reject. Only call this when the user has clearly asked for a change. Pass the FULL new tasks object, not a diff.",
        inputSchema: z.object({
          summary: z
            .string()
            .describe("One-sentence plain-English description of the change (shown on the Apply card)."),
          newTasks: TasksDataSchema.describe("The complete updated tasks.json content."),
        }),
        // No execute function — this is a client-confirmed tool.
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
