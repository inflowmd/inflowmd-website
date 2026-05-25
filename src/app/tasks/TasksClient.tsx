'use client';

import { useState } from 'react';
import { logout } from './login/actions';
import TasksChat from './TasksChat';

type IconType = 'you' | 'bot' | 'wait' | 'note';
type PriorityType = 'high' | 'med' | 'low';

interface Task {
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
  sections: Section[];
}

interface TasksClientProps {
  data: TasksData;
}

const ICONS: Record<IconType, string> = { you: '👤', bot: '🤖', wait: '⏸', note: '📝' };
const ICON_LABELS: Record<IconType, string> = { you: 'You', bot: 'Cowork', wait: 'Waiting', note: 'Note' };

const PRI_STYLES: Record<PriorityType, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  med: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const ICON_STYLES: Record<IconType, string> = {
  you: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  bot: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  wait: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  note: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
};

function taskKey(clientId: string, i: number) {
  return `${clientId}-${i}`;
}

function matchesFilter(client: Client, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'you') return client.tasks.some(t => t.icon === 'you');
  if (filter === 'bot') return client.tasks.some(t => t.icon === 'bot');
  if (filter === 'urgent') return client.pri === 'high';
  if (filter === 'biz') return client.tags.includes('biz');
  if (filter === 'waiting') return client.tags.includes('waiting') || client.tasks.every(t => t.icon === 'wait');
  return true;
}

export default function TasksClient({ data }: TasksClientProps) {
  const sections: Section[] = data.sections;

  // Seed local done-state from persisted `done` fields in the data.
  // Local clicks toggle ephemerally on top; chat-driven updates flip the
  // persisted field and rehydrate on next page load.
  const initialDone = (() => {
    const s = new Set<string>();
    for (const sec of sections) {
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
  const allTasks = sections.flatMap(s => s.clients.flatMap(c => c.tasks));
  const youTasks = allTasks.filter(t => t.icon === 'you').length;
  const botTasks = allTasks.filter(t => t.icon === 'bot').length;

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
    { key: 'urgent', label: 'Urgent' },
    { key: 'biz', label: 'Biz dev' },
    { key: 'waiting', label: 'Waiting' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">

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

        {/* Sections */}
        {sections.map(section => {
          const visibleClients = section.clients.filter(c => matchesFilter(c, filter));
          if (!visibleClients.length) return null;

          return (
            <div key={section.section} className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                {section.section}
              </h2>

              <div className="space-y-2">
                {visibleClients.map(client => {
                  const isCollapsed = collapsed.has(client.id);
                  const doneCount = client.tasks.filter((_, i) => done.has(taskKey(client.id, i))).length;
                  const pct = client.tasks.length ? Math.round((doneCount / client.tasks.length) * 100) : 0;

                  return (
                    <div key={client.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

                      {/* Client header */}
                      <button
                        onClick={() => toggleCollapse(client.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                          <div className="mt-1.5 h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRI_STYLES[client.pri]}`}>
                            {client.pri}
                          </span>
                          <span className={`text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>
                            ▾
                          </span>
                        </div>
                      </button>

                      {/* Tasks */}
                      {!isCollapsed && (
                        <div>
                          {client.tasks.map((task, i) => {
                            const key = taskKey(client.id, i);
                            const isDone = done.has(key);
                            return (
                              <button
                                key={i}
                                onClick={() => toggleDone(key)}
                                className={`w-full flex items-start gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left ${isDone ? 'opacity-40' : ''}`}
                              >
                                {/* Checkbox */}
                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {isDone && <span className="text-white text-xs">✓</span>}
                                </div>

                                {/* Icon badge */}
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5 ${ICON_STYLES[task.icon]}`}>
                                  {ICONS[task.icon]} {ICON_LABELS[task.icon]}
                                </span>

                                {/* Task text */}
                                <span className={`text-sm text-gray-800 dark:text-gray-200 ${isDone ? 'line-through' : ''}`}>
                                  {task.txt}
                                </span>
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
        })}

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-10 mb-24 lg:mb-10">
          InflowMD · Internal · Not indexed
        </p>
      </div>
      <TasksChat />
    </main>
  );
}
