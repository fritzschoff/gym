'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ExerciseWithDefaults, Session, SessionSet, WorkoutPlan } from '@/lib/types';
import { completeSet, finishSession } from '@/actions/sessions';
import { ElapsedTimer } from './elapsed-timer';
import { RestTimer } from './rest-timer';
import { ExerciseTracker } from './exercise-tracker';
import { SessionSummary } from './session-summary';

interface HistoricalMax {
  exercise_id: string;
  max_weight: number;
}

interface SessionClientProps {
  session: Session;
  plan: WorkoutPlan;
  exercises: ExerciseWithDefaults[];
  existingSessionSets: SessionSet[];
  lastSessionSets: SessionSet[];
  historicalMaxWeights: HistoricalMax[];
  locale: string;
}

export function SessionClient({
  session,
  plan,
  exercises,
  existingSessionSets,
  lastSessionSets,
  historicalMaxWeights,
  locale,
}: SessionClientProps) {
  // Local mirror of completed sets — start from any already-saved sets (resume scenario)
  const [sessionSets, setSessionSets] = useState<SessionSet[]>(existingSessionSets);

  // Rest timer state
  const [restActive, setRestActive] = useState(false);
  const [restSeconds, setRestSeconds] = useState(120);

  // Summary modal state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    durationSeconds: number;
    setsCompleted: number;
    totalSets: number;
    newPRs: string[];
  } | null>(null);

  const [isFinishing, startFinishTransition] = useTransition();

  const planName = locale === 'pt' ? plan.name_pt : plan.name_en;

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets_count, 0);

  const handleSetComplete = async (
    exerciseId: string,
    setNumber: number,
    data: {
      weight_kg?: number | null;
      reps?: number | null;
      duration_seconds?: number | null;
      intensity?: string | null;
    }
  ) => {
    // 1. Save immediately to Supabase
    await completeSet(session.id, exerciseId, {
      set_number: setNumber,
      ...data,
    });

    // 2. Update local state
    const newSet: SessionSet = {
      id: `${exerciseId}-${setNumber}`,
      session_id: session.id,
      exercise_id: exerciseId,
      set_number: setNumber,
      weight_kg: data.weight_kg ?? null,
      reps: data.reps ?? null,
      duration_seconds: data.duration_seconds ?? null,
      intensity: (data.intensity as SessionSet['intensity']) ?? null,
      completed: true,
      completed_at: new Date().toISOString(),
    };

    setSessionSets((prev) => {
      const filtered = prev.filter(
        (s) => !(s.exercise_id === exerciseId && s.set_number === setNumber)
      );
      return [...filtered, newSet];
    });

    // 3. Check if this is the last set of the last exercise — if so, skip rest
    const ex = exercises.find((e) => e.id === exerciseId);
    const isLastExercise = exercises[exercises.length - 1]?.id === exerciseId;
    const completedCountForEx =
      sessionSets.filter((s) => s.exercise_id === exerciseId).length + 1;
    const isLastSet = ex ? completedCountForEx >= ex.sets_count : false;

    if (!(isLastExercise && isLastSet)) {
      setRestSeconds(ex?.rest_seconds ?? 120);
      setRestActive(true);
    }
  };

  const handleFinish = () => {
    startFinishTransition(async () => {
      await finishSession(session.id);

      // Calculate duration
      const durationSeconds = Math.floor(
        (Date.now() - new Date(session.started_at).getTime()) / 1000
      );

      // Detect new PRs
      const newPRs: string[] = [];
      for (const ex of exercises) {
        if (ex.is_timed) continue;
        const setsForEx = sessionSets.filter((s) => s.exercise_id === ex.id);
        const maxThisSession = Math.max(
          ...setsForEx.map((s) => s.weight_kg ?? 0),
          0
        );
        const historicalMax =
          historicalMaxWeights.find((h) => h.exercise_id === ex.id)?.max_weight ?? 0;
        if (maxThisSession > 0 && maxThisSession > historicalMax) {
          const exName = locale === 'pt' ? ex.name_pt : ex.name_en;
          newPRs.push(exName);
        }
      }

      setSummaryData({
        durationSeconds,
        setsCompleted: sessionSets.length,
        totalSets,
        newPRs,
      });
      setShowSummary(true);
    });
  };

  return (
    <>
      {/* Full-screen session layout */}
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-950">
        {/* Custom session header (replaces TopBar for this page) */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <span className="max-w-[200px] truncate text-sm font-semibold text-gray-900 dark:text-white">
            {planName}
          </span>

          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
          >
            {isFinishing ? '...' : 'End'}
          </button>
        </header>

        {/* Main content */}
        <div className="flex-1 space-y-4 px-4 py-4 pb-36">
          {/* Elapsed timer */}
          <ElapsedTimer startedAt={session.started_at} />

          {/* Rest timer */}
          <RestTimer
            seconds={restSeconds}
            active={restActive}
            onComplete={() => setRestActive(false)}
          />

          {/* Exercise list */}
          <div className="space-y-3">
            {exercises.map((exercise) => {
              const completedSetsForEx = sessionSets.filter(
                (s) => s.exercise_id === exercise.id
              );
              const lastSetsForEx = lastSessionSets.filter(
                (s) => s.exercise_id === exercise.id
              );

              return (
                <ExerciseTracker
                  key={exercise.id}
                  exercise={exercise}
                  sessionId={session.id}
                  completedSets={completedSetsForEx}
                  lastSessionSets={lastSetsForEx}
                  onSetComplete={handleSetComplete}
                  locale={locale}
                />
              );
            })}
          </div>
        </div>

        {/* Finish button pinned at bottom */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-1 text-center text-xs text-gray-500 dark:text-gray-400">
            {sessionSets.length} / {totalSets} sets completed
          </div>
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            {isFinishing ? 'Saving...' : 'Finish Workout'}
          </button>
        </div>
      </div>

      {/* Summary modal */}
      {showSummary && summaryData && (
        <SessionSummary
          durationSeconds={summaryData.durationSeconds}
          setsCompleted={summaryData.setsCompleted}
          totalSets={summaryData.totalSets}
          newPRs={summaryData.newPRs}
        />
      )}
    </>
  );
}
