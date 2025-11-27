'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Circle, Clock } from 'lucide-react';

type TaskStatus = 'In Progress' | 'Pending' | 'Blocked' | 'Complete';

type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: TaskStatus;
  priority: 'High' | 'Medium' | 'Low';
};

const initialTasks: Task[] = [
  {
    id: 't-101',
    title: 'Close cash forecast variance for Q3',
    owner: 'Priya Anand',
    due: 'Oct 18',
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 't-102',
    title: 'Vendor cost mitigation plan',
    owner: 'Leo Park',
    due: 'Oct 22',
    status: 'Pending',
    priority: 'Medium',
  },
  {
    id: 't-103',
    title: 'Ops review: EU DC cycle time',
    owner: 'Marta Reyes',
    due: 'Oct 17',
    status: 'Blocked',
    priority: 'High',
  },
  {
    id: 't-104',
    title: 'Board deck scenario appendix',
    owner: 'Ian Patel',
    due: 'Oct 25',
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 't-105',
    title: 'AR policy refresh',
    owner: 'Lucia Martinez',
    due: 'Oct 31',
    status: 'Complete',
    priority: 'Low',
  },
];

const statusStyles: Record<TaskStatus, string> = {
  'In Progress': 'bg-blue-500/15 text-blue-400',
  Pending: 'bg-amber-500/15 text-amber-400',
  Blocked: 'bg-rose-500/15 text-rose-400',
  Complete: 'bg-emerald-500/15 text-emerald-400',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'all' | 'open' | 'complete'>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'complete') {
      return tasks.filter((task) => task.status === 'Complete');
    }
    if (filter === 'open') {
      return tasks.filter((task) => task.status !== 'Complete');
    }
    return tasks;
  }, [tasks, filter]);

  const toggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'Complete' ? 'In Progress' : 'Complete' }
          : task,
      ),
    );
  };

  const summary = useMemo(() => {
    const open = tasks.filter((task) => task.status !== 'Complete').length;
    const blocked = tasks.filter((task) => task.status === 'Blocked').length;
    const dueSoon = tasks.filter((task) => task.status !== 'Complete').slice(0, 2);
    return { open, blocked, dueSoon };
  }, [tasks]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.35em] text-[#688790]">Command center</p>
        <h1 className="text-3xl font-black text-[#212F34] dark:text-white">Task backlog</h1>
        <p className="text-sm text-[#688790] max-w-2xl">
          Align finance, ops, and treasury owners around the next wave of deliverables. Flag blockers and
          mark off tasks that are cleared.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-white dark:bg-[#111A1B] border border-white/50 dark:border-white/10 p-4 shadow-sm flex items-center gap-3">
          <Clock className="w-8 h-8 text-[#53AAA3]" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Open tasks</p>
            <p className="text-2xl font-black">{summary.open}</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white dark:bg-[#111A1B] border border-white/50 dark:border-white/10 p-4 shadow-sm flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Blocked</p>
            <p className="text-2xl font-black">{summary.blocked}</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white dark:bg-[#111A1B] border border-white/50 dark:border-white/10 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Next up</p>
          <ul className="mt-3 space-y-2 text-sm text-[#212F34] dark:text-white">
            {summary.dueSoon.map((task) => (
              <li key={task.id} className="flex items-center justify-between">
                <span>{task.title}</span>
                <span className="text-xs text-[#688790]">{task.due}</span>
              </li>
            ))}
            {summary.dueSoon.length === 0 && <li className="text-xs text-[#688790]">No near-term deliverables.</li>}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl bg-white dark:bg-[#0F1416] border border-white/40 dark:border-white/10 shadow-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#212F34] dark:text-white">Workstreams</h2>
          <div className="flex gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'In flight', value: 'open' },
              { label: 'Complete', value: 'complete' },
            ].map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={filter === option.value ? 'sport' : 'outline'}
                onClick={() => setFilter(option.value as typeof filter)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-[#111A1B] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-[#212F34] dark:text-white">{task.title}</p>
                <p className="text-xs text-[#688790]">Owner: {task.owner} • Due {task.due} • {task.priority} priority</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', statusStyles[task.status])}>
                  {task.status}
                </span>
                <Button size="sm" variant="outline" onClick={() => toggleComplete(task.id)}>
                  {task.status === 'Complete' ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Reopen
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Circle className="w-4 h-4" />
                      Mark done
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center text-sm text-[#688790] py-10">Nothing to show in this filter.</div>
          )}
        </div>
      </section>
    </div>
  );
}
