'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlanForm } from '@/components/plan/plan-form';

export function AddPlanButton() {
  const t = useTranslations('dashboard');
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {t('addPlan')}
      </button>

      {showForm && <PlanForm onClose={() => setShowForm(false)} />}
    </>
  );
}
