'use client';

import { useState } from 'react';
import { ExerciseDefault, ExerciseWithDefaults, IntensityCode, SessionSet } from '@/lib/types';

const INTENSITY_OPTIONS: { value: IntensityCode; label: string }[] = [
  { value: 'mod', label: 'Moderate' },
  { value: 'int', label: 'Intense' },
  { value: 'pint', label: 'Low Intensity' },
  { value: 'pmod', label: 'Low Moderate' },
];

interface SetRowProps {
  set_number: number;
  exercise: ExerciseWithDefaults;
  defaultValues: ExerciseDefault | null;
  onComplete: (data: {
    weight_kg?: number | null;
    reps?: number | null;
    duration_seconds?: number | null;
    intensity?: string | null;
  }) => void;
  completed: boolean;
  completedData?: SessionSet | null;
  isCurrent: boolean;
}

export function SetRow({
  set_number,
  exercise,
  defaultValues,
  onComplete,
  completed,
  completedData,
  isCurrent,
}: SetRowProps) {
  const [weight, setWeight] = useState(
    completedData?.weight_kg?.toString() ?? defaultValues?.weight_kg?.toString() ?? ''
  );
  const [reps, setReps] = useState(
    completedData?.reps?.toString() ?? defaultValues?.reps?.toString() ?? ''
  );
  const [intensity, setIntensity] = useState<string>(
    completedData?.intensity ?? defaultValues?.intensity ?? ''
  );
  const [duration, setDuration] = useState(
    completedData?.duration_seconds?.toString() ??
      defaultValues?.duration_seconds?.toString() ??
      ''
  );

  const inputBase =
    'w-full rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
  const inputActive =
    'border-gray-300 bg-white text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  const inputDisabled =
    'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500';

  const isDisabled = completed || !isCurrent;

  if (completed && completedData) {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-green-400 bg-green-50 px-4 py-3 dark:border-green-600 dark:bg-green-950/30">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
          Set {set_number}
        </span>
        <span className="ml-auto text-sm text-green-600 dark:text-green-500">
          {exercise.is_timed
            ? completedData.duration_seconds != null
              ? `${completedData.duration_seconds}s`
              : '—'
            : [
                completedData.weight_kg != null ? `${completedData.weight_kg}kg` : null,
                completedData.reps != null ? `×${completedData.reps}` : null,
                completedData.intensity ?? null,
              ]
                .filter(Boolean)
                .join(' ') || '—'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 px-4 py-3 transition-all ${
        isCurrent
          ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30'
          : 'border-gray-200 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Set {set_number}
      </p>

      {exercise.is_timed ? (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
              Duration (s)
            </label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isDisabled}
              className={`${inputBase} ${isDisabled ? inputDisabled : inputActive}`}
              placeholder="30"
            />
          </div>
          <button
            onClick={() =>
              onComplete({ duration_seconds: duration ? parseInt(duration) : null })
            }
            disabled={isDisabled}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="w-20 shrink-0">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">kg</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={isDisabled}
              className={`${inputBase} ${isDisabled ? inputDisabled : inputActive}`}
              placeholder="60"
            />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">reps</label>
            <input
              type="number"
              min={0}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              disabled={isDisabled}
              className={`${inputBase} ${isDisabled ? inputDisabled : inputActive}`}
              placeholder="12"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
              Intensity
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              disabled={isDisabled}
              className={`${inputBase} ${isDisabled ? inputDisabled : inputActive}`}
            >
              <option value="">—</option>
              {INTENSITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() =>
              onComplete({
                weight_kg: weight ? parseFloat(weight) : null,
                reps: reps ? parseInt(reps) : null,
                intensity: intensity || null,
              })
            }
            disabled={isDisabled}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
