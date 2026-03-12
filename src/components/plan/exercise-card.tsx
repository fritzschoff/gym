'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExerciseWithDefaults } from '@/lib/types';
import { deleteExercise, reorderExercise } from '@/actions/exercises';
import { ExerciseForm } from './exercise-form';

interface ExerciseCardProps {
  exercise: ExerciseWithDefaults;
  planId: string;
  locale: string;
  isFirst: boolean;
  isLast: boolean;
}

export function ExerciseCard({
  exercise,
  planId,
  locale,
  isFirst,
  isLast,
}: ExerciseCardProps) {
  const t = useTranslations('plan');
  const tCommon = useTranslations('common');
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const name = locale === 'pt' ? exercise.name_pt : exercise.name_en;

  const handleDelete = async () => {
    setIsPending(true);
    await deleteExercise(exercise.id, planId);
    setIsPending(false);
    setShowConfirmDelete(false);
  };

  const handleReorder = async (direction: 'up' | 'down') => {
    setIsPending(true);
    await reorderExercise(exercise.id, planId, direction);
    setIsPending(false);
  };

  const defaults = exercise.exercise_defaults ?? [];
  const sortedDefaults = [...defaults].sort((a, b) => a.set_number - b.set_number);

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {exercise.sets_count} {t('sets')} &middot;{' '}
              {exercise.is_timed
                ? `${t('rest')}: ${exercise.rest_seconds}${t('seconds')}`
                : `${exercise.reps_min}–${exercise.reps_max} ${t('reps')} &middot; ${t('rest')}: ${exercise.rest_seconds}s`}
            </p>
          </div>

          {/* Reorder + Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleReorder('up')}
              disabled={isFirst || isPending}
              className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
              aria-label="Move up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              onClick={() => handleReorder('down')}
              disabled={isLast || isPending}
              className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
              aria-label="Move down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="rounded p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              aria-label={t('editExercise')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              aria-label={t('deleteExercise')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Set defaults */}
        <div className="mt-3 space-y-1">
          {sortedDefaults.length === 0 ? (
            <p className="text-xs text-gray-400 italic">{t('notSet')}</p>
          ) : (
            sortedDefaults.map((d) => (
              <div key={d.id} className="text-xs text-gray-600 dark:text-gray-300">
                {exercise.is_timed ? (
                  <span>
                    Set {d.set_number}: {d.duration_seconds}s
                  </span>
                ) : (
                  <span>
                    Set {d.set_number}:{' '}
                    {d.weight_kg != null ? `${d.weight_kg}kg` : '—'}{' '}
                    &times; {d.reps != null ? d.reps : '—'} reps
                    {d.intensity ? ` (${d.intensity})` : ''}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('confirmDelete')}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('deleteExercise')}: &ldquo;{name}&rdquo;?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {tCommon('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEdit && (
        <ExerciseForm
          planId={planId}
          exercise={exercise}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
