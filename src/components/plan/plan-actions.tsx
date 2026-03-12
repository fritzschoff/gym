'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { WorkoutPlan } from '@/lib/types';
import { deletePlan } from '@/actions/plans';
import { PlanForm } from './plan-form';
import { ExerciseForm } from './exercise-form';

interface PlanHeaderActionsProps {
  plan: WorkoutPlan;
  planId: string;
}

export function PlanHeaderActions({ plan, planId }: PlanHeaderActionsProps) {
  const t = useTranslations('plan');
  const tCommon = useTranslations('common');
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deletePlan(planId);
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors"
        >
          {t('editPlan')}
        </button>
        <button
          onClick={() => setShowConfirmDelete(true)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
        >
          {t('deletePlan')}
        </button>
      </div>

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('confirmDelete')}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('deletePlan')}: &ldquo;{plan.name_en}&rdquo;?
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

      {showEdit && (
        <PlanForm plan={plan} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}

interface AddExerciseButtonProps {
  planId: string;
}

export function AddExerciseButton({ planId }: AddExerciseButtonProps) {
  const t = useTranslations('plan');
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {t('addExercise')}
      </button>

      {showForm && (
        <ExerciseForm planId={planId} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
