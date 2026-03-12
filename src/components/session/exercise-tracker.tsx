'use client';

import { useState } from 'react';
import { ExerciseDefault, ExerciseWithDefaults, SessionSet } from '@/lib/types';
import { SetRow } from './set-row';

interface ExerciseTrackerProps {
  exercise: ExerciseWithDefaults;
  sessionId: string;
  completedSets: SessionSet[];
  lastSessionSets: SessionSet[];
  onSetComplete: (
    exerciseId: string,
    setNumber: number,
    data: {
      weight_kg?: number | null;
      reps?: number | null;
      duration_seconds?: number | null;
      intensity?: string | null;
    }
  ) => void;
  locale: string;
}

export function ExerciseTracker({
  exercise,
  sessionId,
  completedSets,
  lastSessionSets,
  onSetComplete,
  locale,
}: ExerciseTrackerProps) {
  const name = locale === 'pt' ? exercise.name_pt : exercise.name_en;
  const allDone = completedSets.length >= exercise.sets_count;

  const [collapsed, setCollapsed] = useState(false);

  // Determine next uncompleted set number
  const completedNums = new Set(completedSets.map((s) => s.set_number));
  let currentSetNumber = -1;
  for (let i = 1; i <= exercise.sets_count; i++) {
    if (!completedNums.has(i)) {
      currentSetNumber = i;
      break;
    }
  }

  // Build default values for a given set number
  const getDefaultValues = (setNum: number): ExerciseDefault | null => {
    // First: check last session sets
    const last = lastSessionSets.find(
      (s) => s.exercise_id === exercise.id && s.set_number === setNum
    );
    if (last) {
      return {
        id: '',
        exercise_id: exercise.id,
        set_number: setNum,
        weight_kg: last.weight_kg,
        reps: last.reps,
        duration_seconds: last.duration_seconds,
        intensity: last.intensity,
      };
    }
    // Fallback: exercise plan defaults
    return exercise.exercise_defaults.find((d) => d.set_number === setNum) ?? null;
  };

  const sets = Array.from({ length: exercise.sets_count }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Exercise header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {allDone && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completedSets.length}/{exercise.sets_count} sets
              {!exercise.is_timed &&
                ` · ${exercise.reps_min}–${exercise.reps_max} reps`}
            </p>
          </div>
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
          className={`text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Set rows */}
      {!collapsed && (
        <div className="space-y-2 px-4 pb-4">
          {sets.map((setNum) => {
            const completedSet = completedSets.find((s) => s.set_number === setNum) ?? null;
            const defaultVals = getDefaultValues(setNum);

            return (
              <SetRow
                key={setNum}
                set_number={setNum}
                exercise={exercise}
                defaultValues={defaultVals}
                completed={!!completedSet}
                completedData={completedSet}
                isCurrent={setNum === currentSetNumber}
                onComplete={(data) => onSetComplete(exercise.id, setNum, data)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
