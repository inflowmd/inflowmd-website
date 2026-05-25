"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { TasksData, Operation } from "./TasksClient";

function AppliedCard({ summary, ok, error }: { summary: string; ok: boolean; error?: string }) {
  if (ok) {
    return (
      <div className="my-2 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20">
        <p className="text-sm text-emerald-900 dark:text-emerald-200">
          <span className="font-semibold">✓</span> {summary}
        </p>
      </div>
    );
  }
  return (
    <div className="my-2 px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
      <p className="text-sm text-red-700 dark:text-red-300">
        <span className="font-semibold">✕ Failed:</span> {summary}
        {error && <span className="block text-xs opacity-70 mt-1">{error}</span>}
      </p>
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
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const seenToolIds = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/tasks-chat",
      credentials: "include",
    }),
  });

  // When a tool result arrives (server already committed), apply optimistically
  // to local state so the board updates without waiting for redeploy.
  useEffect(() => {
    for (const m of messages) {
      for (const part of m.parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = part as any;
        if (
          typeof p.type === "string" &&
          p.type.startsWith("tool-") &&
          p.state === "output-available" &&
          !seenToolIds.current.has(p.toolCallId)
        ) {
          seenToolIds.current.add(p.toolCallId);
          const output = p.output;
          if (output?.ok && output.operation) {
            onApplied(output.operation as Operation);
          }
        }
      }
    }
  }, [messages, onApplied]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status !== "ready") return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  // suppress unused-var lint for the data prop (used implicitly via onApplied target)
  void data;

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
            Claude Sonnet · auto-applies changes
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
                if (typeof part.type === "string" && part.type.startsWith("tool-")) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const p = part as any;
                  if (p.state === "output-available") {
                    const out = p.output;
                    return (
                      <AppliedCard
                        key={i}
                        summary={out?.summary ?? "(no summary)"}
                        ok={!!out?.ok}
                        error={out?.error}
                      />
                    );
                  }
                  return (
                    <div key={i} className="text-xs text-gray-400 italic">
                      Applying…
                    </div>
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
