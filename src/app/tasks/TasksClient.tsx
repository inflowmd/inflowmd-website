'use client';

import { useEffect, useRef, useState } from 'react';
import { Reorder } from 'framer-motion';
import { logout } from './login/actions';
import TasksChat from './TasksChat';

const DONE_STORAGE_KEY = 'inflowmd:tasks:done';

type IconType = 'you' | 'bot' | 'code' | 'wait' | 'note';
type PriorityType = 'high' | 'med' | 'low';

interface Task {
  id: string;
  icon: IconType;
  txt: string;
  done?: boolean;
}

interface Client {
  id: string;
  name: string;
  pri: PriorityType;
  tags: string[];
  tasks: Task[];
}

interface Section {
  section: string;
  clients: Client[];
}

export interface TasksData {
  lastUpdated: string;
  today: string[];
  sections: Section[];
}

interface TasksClientProps {
  data: TasksData;
}

const ICONS: Record<IconType, string> = { you: '👤', bot: '🤖', code: '💻', wait: '⏸', note: '📝' };
const ICON_LABELS: Record<IconType, string> = { you: 'You', bot: 'Cowork', code: 'Code', wait: 'Waiting', note: 'Note' };

const PRI_STYLES: Record<PriorityType, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  med: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const ICON_STYLES: Record<IconType, string> = {
  you: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  bot: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  code: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
  wait: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  note: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
};

function taskKey(clientId: string, i: number) {
  return `${clientId}-${i}`;
}

interface TaskLocation {
  clientId: string;
  clientName: string;
  taskIndex: number;
  task: Task;
}

function findTaskById(data: TasksData, taskId: string): TaskLocation | null {
  for (const sec of data.sections) {
    for (const c of sec.clients) {
      const idx = c.tasks.findIndex((t) => t.id === taskId);
      if (idx >= 0) {
        return { clientId: c.id, clientName: c.name, taskIndex: idx, task: c.tasks[idx] };
      }
    }
  }
  return null;
}

/**
 * Decide whether an individual task should be visible under a given filter.
 * - 'you'/'bot'/'note'/'waiting' icon filters: match the icon AND hide done items
 *   (since "Needs me" / "Cowork" implies remaining work).
 * - 'urgent' / 'biz': these are client-level filters; all tasks visible.
 * - 'all': everything visible.
 */
function taskMatchesFilter(
  task: { icon: IconType },
  filter: string,
  isDone: boolean
): boolean {
  switch (filter) {
    case 'you':
      return task.icon === 'you' && !isDone;
    case 'bot':
      return task.icon === 'bot' && !isDone;
    case 'code':
      return task.icon === 'code' && !isDone;
    case 'waiting':
      return task.icon === 'wait';
    case 'urgent':
    case 'biz':
    case 'all':
    default:
      return true;
  }
}

/** Client-level gate (must pass before any tasks are considered). */
function clientPassesFilter(client: Client, filter: string): boolean {
  switch (filter) {
    case 'urgent':
      return client.pri === 'high';
    case 'biz':
      return client.tags.includes('biz');
    default:
      return true;
  }
}

export type Operation =
  | { op: 'mark_task_done'; clientId: string; taskIndex: number }
  | { op: 'unmark_task_done'; clientId: string; taskIndex: number }
  | { op: 'add_task'; clientId: string; text: string; icon: IconType }
  | { op: 'remove_task'; clientId: string; taskIndex: number }
  | { op: 'update_task'; clientId: string; taskIndex: number; text?: string; icon?: IconType }
  | { op: 'set_client_priority'; clientId: string; priority: PriorityType }
  | { op: 'reorder_tasks'; clientId: string; order: number[] }
  | { op: 'reorder_clients'; sectionName: string; order: string[] }
  | { op: 'reorder_sections'; order: string[] }
  | { op: 'add_to_today'; taskId: string }
  | { op: 'remove_from_today'; taskId: string }
  | { op: 'clear_today' };

function applyOperationLocal(data: TasksData, op: Operation): TasksData {
  const next: TasksData = JSON.parse(JSON.stringify(data));
  if (!next.today) next.today = [];
  next.lastUpdated = new Date().toISOString().slice(0, 10);

  // Today-list ops
  if (op.op === 'add_to_today') {
    if (!next.today.includes(op.taskId)) next.today.push(op.taskId);
    return next;
  }
  if (op.op === 'remove_from_today') {
    next.today = next.today.filter((id) => id !== op.taskId);
    return next;
  }
  if (op.op === 'clear_today') {
    next.today = [];
    return next;
  }

  // Section-level ops (no clientId)
  if (op.op === 'reorder_sections') {
    const byName = new Map(next.sections.map((s) => [s.section, s]));
    next.sections = op.order.map((n) => byName.get(n)).filter((s): s is Section => !!s);
    return next;
  }
  if (op.op === 'reorder_clients') {
    const section = next.sections.find((s) => s.section === op.sectionName);
    if (section) {
      const byId = new Map(section.clients.map((c) => [c.id, c]));
      section.clients = op.order.map((id) => byId.get(id)).filter((c): c is Client => !!c);
    }
    return next;
  }

  // Client-targeted ops
  for (const sec of next.sections) {
    const c = sec.clients.find((c) => c.id === op.clientId);
    if (!c) continue;
    switch (op.op) {
      case 'mark_task_done':
        if (c.tasks[op.taskIndex]) c.tasks[op.taskIndex].done = true;
        return next;
      case 'unmark_task_done':
        if (c.tasks[op.taskIndex]) c.tasks[op.taskIndex].done = false;
        return next;
      case 'add_task':
        c.tasks.push({
          id: Math.random().toString(16).slice(2, 10),
          icon: op.icon,
          txt: op.text,
        });
        return next;
      case 'remove_task':
        if (c.tasks[op.taskIndex]) c.tasks.splice(op.taskIndex, 1);
        return next;
      case 'update_task': {
        const t = c.tasks[op.taskIndex];
        if (!t) return next;
        if (op.text !== undefined) t.txt = op.text;
        if (op.icon !== undefined) t.icon = op.icon;
        return next;
      }
      case 'set_client_priority':
        c.pri = op.priority;
        return next;
      case 'reorder_tasks':
        c.tasks = op.order.map((i) => c.tasks[i]).filter(Boolean);
        return next;
    }
  }
  return next;
}

/* ---------------- Debounced persist ---------------- */
function opKey(op: Operation): string {
  if (op.op === 'reorder_tasks') return `reorder_tasks:${op.clientId}`;
  if (op.op === 'reorder_clients') return `reorder_clients:${op.sectionName}`;
  if (op.op === 'reorder_sections') return 'reorder_sections';
  return `${op.op}:${Date.now()}`;
}

export default function TasksClient({ data: initialData }: TasksClientProps) {
  const [data, setData] = useState<TasksData>(initialData);
  const sections: Section[] = data.sections;

  // Seed local done-state from persisted `done` fields in the data.
  // Local clicks toggle ephemerally on top; chat-driven updates flip the
  // persisted field and rehydrate on next page load.
  const initialDone = (() => {
    const s = new Set<string>();
    for (const sec of initialData.sections) {
      for (const c of sec.clients) {
        c.tasks.forEach((t, i) => {
          if (t.done) s.add(taskKey(c.id, i));
        });
      }
    }
    return s;
  })();

  const [done, setDone] = useState<Set<string>>(initialDone);
  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Debounce queue: latest op per scope wins. Flushed after 2s of quiet.
  const pendingOpsRef = useRef<Map<string, Operation>>(new Map());
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function schedulePersist(op: Operation) {
    pendingOpsRef.current.set(opKey(op), op);
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(async () => {
      const ops = Array.from(pendingOpsRef.current.values());
      pendingOpsRef.current.clear();
      for (const op of ops) {
        try {
          await fetch('/api/tasks-update', {
            method: 'POST',
            credentials: 'include',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ operation: op, summary: `reorder via UI (${op.op})` }),
          });
        } catch (e) {
          console.error('reorder persist failed:', e);
        }
      }
    }, 2000);
  }

  function handleTasksReorder(clientId: string, newOrderedTasks: Task[]) {
    setData((d) => {
      const next: TasksData = JSON.parse(JSON.stringify(d));
      for (const sec of next.sections) {
        const c = sec.clients.find((c) => c.id === clientId);
        if (!c) continue;
        // Compute the order in terms of original indices for the persisted op
        const originalTasks = c.tasks;
        const newOrderIndices: number[] = newOrderedTasks.map((nt) =>
          originalTasks.findIndex((ot) => ot === nt)
        );
        // Bail if any task didn't map cleanly (shouldn't happen but safe)
        if (newOrderIndices.some((i) => i < 0)) return d;
        // Remap local done Set to new indices
        setDone((prev) => {
          const remap = new Set<string>();
          for (const k of prev) {
            const [cid, idxStr] = k.split('-');
            if (cid !== clientId) {
              remap.add(k);
              continue;
            }
            const oldIdx = parseInt(idxStr, 10);
            const newIdx = newOrderIndices.indexOf(oldIdx);
            if (newIdx !== -1) remap.add(`${clientId}-${newIdx}`);
          }
          return remap;
        });
        c.tasks = newOrderedTasks;
        schedulePersist({ op: 'reorder_tasks', clientId, order: newOrderIndices });
        break;
      }
      return next;
    });
  }

  function handleClientsReorder(sectionName: string, newClients: Client[]) {
    setData((d) => {
      const next: TasksData = JSON.parse(JSON.stringify(d));
      const sec = next.sections.find((s) => s.section === sectionName);
      if (!sec) return d;
      const byId = new Map(sec.clients.map((c) => [c.id, c]));
      sec.clients = newClients.map((nc) => byId.get(nc.id)).filter((c): c is Client => !!c);
      schedulePersist({
        op: 'reorder_clients',
        sectionName,
        order: newClients.map((c) => c.id),
      });
      return next;
    });
  }

  function handleSectionsReorder(newSections: Section[]) {
    setData((d) => {
      const next: TasksData = JSON.parse(JSON.stringify(d));
      const byName = new Map(next.sections.map((s) => [s.section, s]));
      next.sections = newSections.map((ns) => byName.get(ns.section)).filter((s): s is Section => !!s);
      schedulePersist({
        op: 'reorder_sections',
        order: newSections.map((s) => s.section),
      });
      return next;
    });
  }

  // On first client-side mount, overlay any locally-stored toggle state.
  // This persists manual check/uncheck clicks across refreshes (per browser).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) setDone(new Set(arr.filter((x) => typeof x === 'string')));
    } catch {
      // ignore corrupt localStorage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever the set changes.
  useEffect(() => {
    try {
      localStorage.setItem(DONE_STORAGE_KEY, JSON.stringify(Array.from(done)));
    } catch {
      // quota / private-mode — non-fatal
    }
  }, [done]);
  const allTasks = sections.flatMap(s => s.clients.flatMap(c => c.tasks));
  const youTasks = allTasks.filter(t => t.icon === 'you').length;
  const botTasks = allTasks.filter(t => t.icon === 'bot').length;

  function handleAppliedOperation(op: Operation) {
    setData((d) => applyOperationLocal(d, op));
    // Keep the ephemeral checkbox set in sync with chat-applied changes
    if (op.op === 'mark_task_done') {
      setDone((s) => new Set(s).add(taskKey(op.clientId, op.taskIndex)));
    } else if (op.op === 'unmark_task_done') {
      setDone((s) => {
        const n = new Set(s);
        n.delete(taskKey(op.clientId, op.taskIndex));
        return n;
      });
    }
  }

  function toggleDone(key: string) {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'you', label: '👤 Needs me' },
    { key: 'bot', label: '🤖 Cowork' },
    { key: 'code', label: '💻 Code' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'biz', label: 'Biz dev' },
    { key: 'waiting', label: 'Waiting' },
  ];

  /* -------- Today panel helpers -------- */
  function todayDoneState(): { todayItems: TaskLocation[]; doneInToday: number } {
    const items: TaskLocation[] = [];
    for (const id of data.today) {
      const loc = findTaskById(data, id);
      if (loc) items.push(loc);
    }
    const doneInToday = items.filter((i) =>
      i.task.done || done.has(taskKey(i.clientId, i.taskIndex))
    ).length;
    return { todayItems: items, doneInToday };
  }

  function removeFromToday(taskId: string) {
    setData((d) => applyOperationLocal(d, { op: 'remove_from_today', taskId }));
    schedulePersist({ op: 'remove_from_today', taskId });
  }

  function clearToday() {
    setData((d) => applyOperationLocal(d, { op: 'clear_today' }));
    schedulePersist({ op: 'clear_today' });
  }

  const { todayItems, doneInToday } = todayDoneState();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              InflowMD Task Board
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Updated {data.lastUpdated} · Internal use only
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total tasks', val: allTasks.length },
            { label: 'Done', val: done.size },
            { label: 'Need you', val: youTasks },
            { label: 'Cowork', val: botTasks },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center">
              <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">{s.val}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filter === f.key
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Two-column layout: Today on left, Board on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TODAY PANEL */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    Today
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {todayItems.length === 0
                      ? 'Stage tasks here'
                      : `${doneInToday} / ${todayItems.length} done`}
                  </p>
                </div>
                {todayItems.length > 0 && (
                  <button
                    onClick={clearToday}
                    className="text-xs px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {todayItems.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed py-4 px-1">
                  <p className="mb-2">No tasks staged for today yet.</p>
                  <p className="text-xs">
                    Ask the chat:
                    <br />
                    <em>&quot;Stage 3 things for today.&quot;</em>
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {todayItems.map((loc) => {
                    const key = taskKey(loc.clientId, loc.taskIndex);
                    const isDone = loc.task.done || done.has(key);
                    return (
                      <li key={loc.task.id} className="group/today flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <button
                          onClick={() => toggleDone(key)}
                          className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                            isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          aria-label={isDone ? 'Mark not done' : 'Mark done'}
                        >
                          {isDone && <span className="text-white text-[10px]">✓</span>}
                        </button>
                        <div className={`flex-1 min-w-0 ${isDone ? 'opacity-40' : ''}`}>
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">
                            {loc.clientName}
                          </div>
                          <div className={`text-sm text-gray-800 dark:text-gray-200 leading-snug ${isDone ? 'line-through' : ''}`}>
                            <span className={`inline-block text-[10px] px-1 py-0.5 rounded font-medium mr-1.5 ${ICON_STYLES[loc.task.icon]}`}>
                              {ICONS[loc.task.icon]}
                            </span>
                            {loc.task.txt}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromToday(loc.task.id)}
                          className="opacity-0 group-hover/today:opacity-100 text-gray-300 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity text-sm leading-none mt-1"
                          aria-label="Remove from today"
                          title="Remove from Today"
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* MAIN BOARD */}
          <div className="lg:col-span-8 min-w-0">

        {filter !== 'all' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
            Drag-to-reorder disabled while a filter is active. Switch to <strong>All</strong> to reorder.
          </p>
        )}

        {/* Sections — draggable when filter === 'all', plain otherwise */}
        {filter === 'all' ? (
          <Reorder.Group
            axis="y"
            values={sections}
            onReorder={handleSectionsReorder}
            className="space-y-6"
          >
            {sections.map((section) => (
              <Reorder.Item
                key={section.section}
                value={section}
                className="cursor-default"
                whileDrag={{ scale: 1.01, opacity: 0.95 }}
              >
                <div className="group/section">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-gray-300 dark:text-gray-700 opacity-0 group-hover/section:opacity-100 transition-opacity cursor-grab active:cursor-grabbing select-none text-sm">
                      ⋮⋮
                    </span>
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {section.section}
                    </h2>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={section.clients}
                    onReorder={(newClients) => handleClientsReorder(section.section, newClients)}
                    className="space-y-2"
                  >
                    {section.clients.map((client) => {
                      const isCollapsed = collapsed.has(client.id);
                      const doneCount = client.tasks.filter((_, i) => done.has(taskKey(client.id, i))).length;
                      const pct = client.tasks.length ? Math.round((doneCount / client.tasks.length) * 100) : 0;
                      return (
                        <Reorder.Item
                          key={client.id}
                          value={client}
                          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden group/client"
                          whileDrag={{ scale: 1.01, opacity: 0.95, zIndex: 10 }}
                        >
                          {/* Client header */}
                          <div className="flex items-center bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="px-2 py-3 text-gray-300 dark:text-gray-700 opacity-0 group-hover/client:opacity-100 transition-opacity cursor-grab active:cursor-grabbing select-none text-sm">
                              ⋮⋮
                            </span>
                            <button
                              onClick={() => toggleCollapse(client.id)}
                              className="flex-1 flex items-center justify-between pr-4 py-3 text-left"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                                <div className="mt-1.5 h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRI_STYLES[client.pri]}`}>
                                  {client.pri}
                                </span>
                                <span className={`text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▾</span>
                              </div>
                            </button>
                          </div>

                          {/* Tasks */}
                          {!isCollapsed && (
                            <Reorder.Group
                              axis="y"
                              values={client.tasks}
                              onReorder={(newTasks) => handleTasksReorder(client.id, newTasks as Task[])}
                            >
                              {client.tasks.map((task, i) => {
                                const key = taskKey(client.id, i);
                                const isDone = done.has(key);
                                return (
                                  <Reorder.Item
                                    key={key}
                                    value={task}
                                    className="flex items-start gap-2 px-2 py-3 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group/task"
                                    whileDrag={{ scale: 1.005, opacity: 0.95, zIndex: 10 }}
                                  >
                                    <span className="pt-1 text-gray-300 dark:text-gray-700 opacity-0 group-hover/task:opacity-100 transition-opacity cursor-grab active:cursor-grabbing select-none text-sm">
                                      ⋮⋮
                                    </span>
                                    <button
                                      onClick={() => toggleDone(key)}
                                      className={`flex-1 flex items-start gap-3 text-left ${isDone ? 'opacity-40' : ''}`}
                                    >
                                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                                        isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                                      }`}>
                                        {isDone && <span className="text-white text-xs">✓</span>}
                                      </div>
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5 ${ICON_STYLES[task.icon]}`}>
                                        {ICONS[task.icon]} {ICON_LABELS[task.icon]}
                                      </span>
                                      <span className={`text-sm text-gray-800 dark:text-gray-200 ${isDone ? 'line-through' : ''}`}>
                                        {task.txt}
                                      </span>
                                    </button>
                                  </Reorder.Item>
                                );
                              })}
                            </Reorder.Group>
                          )}
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          /* Filtered view — plain divs, no drag */
          sections.map((section) => {
            const clientsWithVisible = section.clients
              .filter((c) => clientPassesFilter(c, filter))
              .map((client) => {
                const visibleIndices = client.tasks
                  .map((t, i) => ({ t, i }))
                  .filter(({ t, i }) => taskMatchesFilter(t, filter, done.has(taskKey(client.id, i))))
                  .map(({ i }) => i);
                return { client, visibleIndices };
              })
              .filter((x) => x.visibleIndices.length > 0);
            if (!clientsWithVisible.length) return null;
            return (
              <div key={section.section} className="mb-6">
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                  {section.section}
                </h2>
                <div className="space-y-2">
                  {clientsWithVisible.map(({ client, visibleIndices }) => {
                    const isCollapsed = collapsed.has(client.id);
                    const doneCount = client.tasks.filter((_, i) => done.has(taskKey(client.id, i))).length;
                    const pct = client.tasks.length ? Math.round((doneCount / client.tasks.length) * 100) : 0;
                    return (
                      <div key={client.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <button
                          onClick={() => toggleCollapse(client.id)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                            <div className="mt-1.5 h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRI_STYLES[client.pri]}`}>{client.pri}</span>
                            <span className={`text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▾</span>
                          </div>
                        </button>
                        {!isCollapsed && (
                          <div>
                            {visibleIndices.map((i) => {
                              const task = client.tasks[i];
                              const key = taskKey(client.id, i);
                              const isDone = done.has(key);
                              return (
                                <button
                                  key={i}
                                  onClick={() => toggleDone(key)}
                                  className={`w-full flex items-start gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left ${isDone ? 'opacity-40' : ''}`}
                                >
                                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                                    isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {isDone && <span className="text-white text-xs">✓</span>}
                                  </div>
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5 ${ICON_STYLES[task.icon]}`}>
                                    {ICONS[task.icon]} {ICON_LABELS[task.icon]}
                                  </span>
                                  <span className={`text-sm text-gray-800 dark:text-gray-200 ${isDone ? 'line-through' : ''}`}>{task.txt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

          </div>{/* /MAIN BOARD col */}
        </div>{/* /grid */}

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-10 mb-24 lg:mb-10">
          InflowMD · Internal · Not indexed
        </p>
      </div>
      <TasksChat data={data} onApplied={handleAppliedOperation} />
    </main>
  );
}
