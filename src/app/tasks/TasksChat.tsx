"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import type { TasksData, Operation } from "./TasksClient";

type ToolName =
  | "mark_task_done"
  | "unmark_task_done"
  | "add_task"
  | "remove_task"
  | "update_task"
  | "set_client_priority";

interface BaseInput {
  clientId: string;
}
interface IndexInput extends BaseInput {
  taskIndex: number;
}
interface AddTaskInput extends BaseInput {
  text: string;
  icon: "you" | "bot" | "wait" | "note";
}
interface UpdateTaskInput extends BaseInput {
  taskIndex: number;
  text?: string;
  icon?: "you" | "bot" | "wait" | "note";
}
interface SetPriorityInput extends BaseInput {
  priority: "high" | "med" | "low";
}

type AnyInput = IndexInput | AddTaskInput | UpdateTaskInput | SetPriorityInput;

type EditStatus = "pending" | "applying" | "applied" | "rejected" | "error";

function describeOperation(
  toolName: ToolName,
  input: AnyInput,
  data: TasksData
): string {
  const client = data.sections
    .flatMap((s) => s.clients)
    .find((c) => c.id === input.clientId);
  const clientName = client?.name ?? `(unknown client: ${input.clientId})`;

  const taskAt = (i: number) => client?.tasks[i]?.txt ?? `(task ${i})`;

  switch (toolName) {
    case "mark_task_done":
      return `Mark "${taskAt((input as IndexInput).taskIndex)}" as done — ${clientName}`;
    case "unmark_task_done":
      return `Reopen "${taskAt((input as IndexInput).taskIndex)}" — ${clientName}`;
    case "add_task": {
      const i = input as AddTaskInput;
      return `Add task to ${clientName}: "${i.text}" (${i.icon})`;
    }
    case "remove_task":
      return `Remove "${taskAt((input as IndexInput).taskIndex)}" — ${clientName}`;
    case "update_task": {
      const u = input as UpdateTaskInput;
      const parts: string[] = [];
      if (u.text) parts.push(`text → "${u.text}"`);
      if (u.icon) parts.push(`icon → ${u.icon}`);
      return `Update "${taskAt(u.taskIndex)}" — ${clientName} (${parts.join(", ")})`;
    }
    case "set_client_priority":
      return `Set ${clientName} priority → ${(input as SetPriorityInput).priority}`;
  }
}

function SuggestedEditCard({
  summary,
  onApply,
  onReject,
  status,
}: {
  summary: string;
  onApply: () => void;
  onReject: () => void;
  status: EditStatus;
}) {
  const statusBadge =
    status === "applied" ? (
      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
        ✓ Applied — deploying
      </span>
    ) : status === "rejected" ? (
      <span className="text-gray-500 text-xs">✕ Rejected</span>
    ) : status === "applying" ? (
      <span className="text-gray-500 text-xs">Applying…</span>
    ) : status === "error" ? (
      <span className="text-red-600 dark:text-red-400 text-xs font-semibold">
        Error — see console
      </span>
    ) : null;

  return (
    <div className="my-2 p-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mt-0.5">
          Proposed change
        </span>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">{summary}</p>
      {status === "pending" ? (
        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onReject}
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Reject
          </button>
        </div>
      ) : (
        statusBadge
      )}
    </div>
  );
}

export default function TasksChat({
  data,
  onApplied,
}: {
  data: TasksData;
  onApplied: (op: Operation) => void;
}) {
  const [editStates, setEditStates] = useState<Record<string, EditStatus>>({});
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/tasks-chat",
      credentials: "include",
    }),
  });

  async function applyEdit(
    toolCallId: string,
    operation: { op: ToolName } & AnyInput,
    summary: string
  ) {
    setEditStates((s) => ({ ...s, [toolCallId]: "applying" }));
    try {
      const res = await fetch("/api/tasks-update", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operation, summary }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEditStates((s) => ({ ...s, [toolCallId]: "applied" }));
      // Mutate the on-screen board immediately so the user sees the change
      // without waiting for the Vercel redeploy.
      onApplied(operation as Operation);
    } catch (e) {
      console.error("Apply failed:", e);
      setEditStates((s) => ({ ...s, [toolCallId]: "error" }));
    }
  }

  function rejectEdit(toolCallId: string) {
    setEditStates((s) => ({ ...s, [toolCallId]: "rejected" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status !== "ready") return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
      >
        💬 Open chat
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-40 w-full lg:w-[420px] lg:max-w-[90vw] lg:rounded-2xl border-t lg:border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-[60vh] lg:h-[70vh] max-h-[680px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Tasks assistant
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Claude Sonnet · suggests changes for your approval
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>Ask things like:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>&quot;What&apos;s blocking ICC?&quot;</li>
              <li>&quot;Mark Florida Vascular&apos;s logo deploy done&quot;</li>
              <li>&quot;Add a task to call Brian tomorrow&quot;</li>
              <li>&quot;Move MĒLA to urgent&quot;</li>
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <div
              className={`text-xs font-semibold ${
                m.role === "user"
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {m.role === "user" ? "You" : "Claude"}
            </div>
            <div className="space-y-2">
              {m.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={i}
                      className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed"
                    >
                      {part.text}
                    </div>
                  );
                }
                if (part.type.startsWith("tool-")) {
                  // Each tool call becomes a suggestion card.
                  // Cast: AI SDK types this as a discriminated union of all tools;
                  // we treat them uniformly via the same shape.
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const p = part as any;
                  const toolName = (p.type as string).replace("tool-", "") as ToolName;
                  const id = p.toolCallId as string;
                  const state = editStates[id] ?? "pending";

                  if (p.state !== "input-available" && p.state !== "output-available") {
                    return (
                      <div key={i} className="text-xs text-gray-400 italic">
                        Composing change…
                      </div>
                    );
                  }
                  const opInput = p.input as AnyInput;
                  const summary = describeOperation(toolName, opInput, data);
                  const operation = { op: toolName, ...opInput };
                  return (
                    <SuggestedEditCard
                      key={i}
                      summary={summary}
                      status={state}
                      onApply={() => applyEdit(id, operation, summary)}
                      onReject={() => rejectEdit(id)}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <div className="text-xs text-gray-500 italic">Thinking…</div>
        )}
        {status === "streaming" && (
          <div className="text-xs text-gray-500 italic">Streaming…</div>
        )}
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400">
            Error: {error.message}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-800 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your tasks…"
          disabled={status !== "ready" && status !== "error"}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || (status !== "ready" && status !== "error")}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
