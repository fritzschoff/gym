'use client';

import { useState, useTransition } from 'react';
import { SessionDetail } from './session-detail';
import { deleteSession } from '@/actions/sessions';

interface SessionSet {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  intensity: string | null;
}

interface Exercise {
  id: string;
  name: string;
}

interface SessionItem {
  id: string;
  workout_plan_id: string | null;
  planName: string | null;
  started_at: string;
  finished_at: string | null;
  sets: SessionSet[];
}

interface SessionListProps {
  sessions: SessionItem[];
  exercises: Exercise[];
  tNoSessions: string;
  tFilterByPlan: string;
  tAllPlans: string;
  tSetsLogged: string;
  tDeleteSession: string;
  tConfirmDeleteSession: string;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '';
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function SessionList({
  sessions,
  exercises,
  tNoSessions,
  tFilterByPlan,
  tAllPlans,
  tSetsLogged,
  tDeleteSession,
  tConfirmDeleteSession,
}: SessionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Build plan options from session data
  const planOptions = Array.from(
    new Map(
      sessions
        .filter((s) => s.planName)
        .map((s) => [s.workout_plan_id!, s.planName!])
    ).entries()
  );

  const filtered =
    planFilter === 'all'
      ? sessions
      : sessions.filter((s) => s.workout_plan_id === planFilter);

  if (sessions.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-gray-400 dark:text-gray-500">{tNoSessions}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Plan filter */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {tFilterByPlan}
        </label>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="all">{tAllPlans}</option>
          {planOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {filtered.map((session) => {
          const isExpanded = expandedId === session.id;
          const duration = formatDuration(session.started_at, session.finished_at);
          const completedSets = session.sets.filter(
            (s) => s.weight_kg != null || s.reps != null || s.duration_seconds != null
          ).length;

          // Build exercise groups for detail view
          const exerciseGroups = exercises
            .map((ex) => ({
              exerciseId: ex.id,
              exerciseName: ex.name,
              sets: session.sets.filter((s) => s.exercise_id === ex.id),
            }))
            .filter((g) => g.sets.length > 0);

          return (
            <div
              key={session.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {/* Card header — click to expand */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
                className="flex w-full items-start justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {session.planName ?? (
                      <span className="italic text-gray-400">Deleted Plan</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(session.started_at)}
                    {duration && (
                      <span className="ml-2 text-gray-400 dark:text-gray-500">
                        · {duration}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {completedSets} {tSetsLogged}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`mt-1 shrink-0 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <>
                  <SessionDetail groups={exerciseGroups} />
                  <div className="border-t border-gray-200 px-4 py-3 dark:border-slate-700">
                    {deletingId === session.id ? (
                      <div className="space-y-2">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {tConfirmDeleteSession}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              startTransition(async () => {
                                await deleteSession(session.id);
                                setDeletingId(null);
                                setExpandedId(null);
                              });
                            }}
                            disabled={isPending}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {isPending ? '...' : tDeleteSession}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(session.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {tDeleteSession}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
