import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { readTasks, writeOperation } from "@/lib/tasksRepo";
import { readMemory, writeMemoryOperation } from "@/lib/memoryRepo";
import { verifyAccessToken } from "@/lib/oauth";

export const runtime = "nodejs";
export const maxDuration = 60;

const IconEnum = z.enum(["you", "bot", "code", "wait", "note"]);
const PriorityEnum = z.enum(["high", "med", "low"]);

const baseHandler = createMcpHandler(
  (server) => {
    /* -------- READ -------- */

    server.registerTool(
      "list_tasks",
      {
        title: "List all tasks",
        description:
          "Returns the full InflowMD task board: sections, clients, and tasks. Use this first when you need context about Clayton's work.",
        inputSchema: {},
      },
      async () => {
        const { data } = await readTasks();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );

    server.registerTool(
      "read_memory",
      {
        title: "Read memory notes",
        description: "Read all persistent memory notes about Clayton's clients and workflow.",
        inputSchema: {},
      },
      async () => {
        const mem = await readMemory();
        return {
          content: [{ type: "text", text: JSON.stringify(mem, null, 2) }],
        };
      }
    );

    /* -------- WRITE: tasks -------- */

    server.registerTool(
      "mark_task_done",
      {
        title: "Mark a task done",
        description: "Mark a task as done (sets done: true). Task stays in the list, struck through.",
        inputSchema: {
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          summary: z.string().describe("One-line description for the commit message"),
        },
      },
      async ({ clientId, taskIndex, summary }) => {
        await writeOperation({ op: "mark_task_done", clientId, taskIndex }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "unmark_task_done",
      {
        title: "Reopen a task",
        description: "Reopen a previously done task (sets done: false).",
        inputSchema: {
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          summary: z.string(),
        },
      },
      async ({ clientId, taskIndex, summary }) => {
        await writeOperation({ op: "unmark_task_done", clientId, taskIndex }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "add_task",
      {
        title: "Add a task",
        description:
          "Add a new task to a client. Use 'code' for development work, 'bot' for non-code AI workflows, 'you' for manual work, 'wait' for blocked, 'note' for reference.",
        inputSchema: {
          clientId: z.string(),
          text: z.string().min(1).max(500),
          icon: IconEnum,
          summary: z.string(),
        },
      },
      async ({ clientId, text, icon, summary }) => {
        await writeOperation({ op: "add_task", clientId, text, icon }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "remove_task",
      {
        title: "Remove a task",
        description: "Delete a task entirely. Only for mistakes or no-longer-relevant items. For finished work, use mark_task_done.",
        inputSchema: {
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          summary: z.string(),
        },
      },
      async ({ clientId, taskIndex, summary }) => {
        await writeOperation({ op: "remove_task", clientId, taskIndex }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "update_task",
      {
        title: "Edit a task",
        description: "Update a task's text and/or icon.",
        inputSchema: {
          clientId: z.string(),
          taskIndex: z.number().int().min(0),
          text: z.string().min(1).max(500).optional(),
          icon: IconEnum.optional(),
          summary: z.string(),
        },
      },
      async ({ clientId, taskIndex, text, icon, summary }) => {
        await writeOperation(
          { op: "update_task", clientId, taskIndex, text, icon },
          summary
        );
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "set_client_priority",
      {
        title: "Set client priority",
        description: "Change a client's priority: 'high', 'med', or 'low'.",
        inputSchema: {
          clientId: z.string(),
          priority: PriorityEnum,
          summary: z.string(),
        },
      },
      async ({ clientId, priority, summary }) => {
        await writeOperation({ op: "set_client_priority", clientId, priority }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "add_to_today",
      {
        title: "Add to Today list",
        description: "Stage a task on Clayton's daily focus column. Pass the task's id (the stable .id field — NOT the taskIndex).",
        inputSchema: {
          taskId: z.string(),
          summary: z.string(),
        },
      },
      async ({ taskId, summary }) => {
        await writeOperation({ op: "add_to_today", taskId }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "remove_from_today",
      {
        title: "Remove from Today list",
        description: "Unstage a task from the daily focus column (does not mark it done).",
        inputSchema: {
          taskId: z.string(),
          summary: z.string(),
        },
      },
      async ({ taskId, summary }) => {
        await writeOperation({ op: "remove_from_today", taskId }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    server.registerTool(
      "clear_today",
      {
        title: "Clear Today list",
        description: "Empty the daily focus column.",
        inputSchema: {
          summary: z.string(),
        },
      },
      async ({ summary }) => {
        await writeOperation({ op: "clear_today" }, summary);
        return { content: [{ type: "text", text: `✓ ${summary}` }] };
      }
    );

    /* -------- WRITE: memory -------- */

    server.registerTool(
      "add_memory",
      {
        title: "Save a memory note",
        description:
          "Save a terse, factual note to long-term memory. Use for client preferences, response patterns, decisions, ongoing context.",
        inputSchema: {
          text: z.string().min(1).max(500),
        },
      },
      async ({ text }) => {
        await writeMemoryOperation({ op: "add_memory", text }, `add note: ${text.slice(0, 80)}`);
        return { content: [{ type: "text", text: `✓ saved` }] };
      }
    );

    server.registerTool(
      "remove_memory",
      {
        title: "Delete a memory note",
        description: "Delete a memory note by its id.",
        inputSchema: { id: z.string() },
      },
      async ({ id }) => {
        await writeMemoryOperation({ op: "remove_memory", id }, `remove note ${id}`);
        return { content: [{ type: "text", text: `✓ removed` }] };
      }
    );

    server.registerTool(
      "update_memory",
      {
        title: "Edit a memory note",
        description: "Replace the text of an existing memory note.",
        inputSchema: {
          id: z.string(),
          text: z.string().min(1).max(500),
        },
      },
      async ({ id, text }) => {
        await writeMemoryOperation({ op: "update_memory", id, text }, `update note ${id}`);
        return { content: [{ type: "text", text: `✓ updated` }] };
      }
    );
  },
  {
    // server options
    serverInfo: {
      name: "inflowmd-tasks",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api",
    maxDuration: 60,
  }
);

const verifyToken = async (_req: Request, bearerToken?: string) => {
  if (!bearerToken) return undefined;

  // 1) Static long-lived token (Claude Desktop config path)
  const staticToken = process.env.MCP_AUTH_TOKEN;
  if (staticToken && bearerToken === staticToken) {
    return {
      token: bearerToken,
      scopes: ["tasks:read", "tasks:write"],
      clientId: "inflowmd-static",
      extra: { userId: "clayton" },
    };
  }

  // 2) OAuth-issued JWT access token (Claude.ai web / mobile path)
  try {
    const claims = await verifyAccessToken(bearerToken);
    return {
      token: bearerToken,
      scopes: claims.scope.split(/\s+/),
      clientId: claims.cid,
      extra: { userId: claims.sub },
    };
  } catch {
    return undefined;
  }
};

const handler = withMcpAuth(baseHandler, verifyToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { handler as GET, handler as POST, handler as DELETE };
