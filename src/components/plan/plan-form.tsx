'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { WorkoutPlan } from '@/lib/types';
import { createPlan, updatePlan } from '@/actions/plans';

const COLOR_OPTIONS = [
  { label: 'Blue', value: 'from-blue-700 to-blue-500' },
  { label: 'Green', value: 'from-green-700 to-green-500' },
  { label: 'Purple', value: 'from-purple-700 to-purple-500' },
  { label: 'Red', value: 'from-red-700 to-red-500' },
  { label: 'Orange', value: 'from-orange-600 to-orange-400' },
  { label: 'Teal', value: 'from-teal-700 to-teal-500' },
  { label: 'Pink', value: 'from-pink-700 to-pink-500' },
  { label: 'Indigo', value: 'from-indigo-700 to-indigo-500' },
];

interface PlanFormProps {
  plan?: WorkoutPlan;
  onClose: () => void;
}

export function PlanForm({ plan, onClose }: PlanFormProps) {
  const t = useTranslations('plan');
  const tCommon = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const isEdit = !!plan;

  const [nameEn, setNameEn] = useState(plan?.name_en ?? '');
  const [namePt, setNamePt] = useState(plan?.name_pt ?? '');
  const [color, setColor] = useState(plan?.color ?? 'from-blue-700 to-blue-500');

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set('name_en', nameEn);
    formData.set('name_pt', namePt);
    formData.set('color', color);

    startTransition(async () => {
      if (isEdit) {
        await updatePlan(plan.id, formData);
        onClose();
      } else {
        await createPlan(formData);
        // createPlan redirects, so onClose won't be needed
      }
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-50 shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {isEdit ? t('editPlan') : t('createPlan')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className={labelClass}>Name (EN)</label>
            <input
              className={inputClass}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Push Day"
            />
          </div>
          <div>
            <label className={labelClass}>Name (PT)</label>
            <input
              className={inputClass}
              value={namePt}
              onChange={(e) => setNamePt(e.target.value)}
              placeholder="Dia de Empurrar"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className={labelClass}>Color</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`h-10 rounded-lg bg-gradient-to-br ${opt.value} ${
                    color === opt.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !nameEn.trim()}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
