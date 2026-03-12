'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ExerciseWithDefaults } from '@/lib/types';
import { createExercise, updateExercise } from '@/actions/exercises';

const INTENSITY_OPTIONS = ['mod', 'int', 'pint', 'pmod'] as const;

interface ExerciseFormProps {
  planId: string;
  exercise?: ExerciseWithDefaults;
  onClose: () => void;
}

interface SetDefault {
  weight: string;
  reps: string;
  intensity: string;
  duration: string;
}

function buildInitialSets(exercise?: ExerciseWithDefaults): SetDefault[] {
  const count = exercise?.sets_count ?? 3;
  const defaults = exercise?.exercise_defaults ?? [];
  return Array.from({ length: count }, (_, i) => {
    const d = defaults.find((x) => x.set_number === i + 1);
    return {
      weight: d?.weight_kg?.toString() ?? '',
      reps: d?.reps?.toString() ?? '',
      intensity: d?.intensity ?? '',
      duration: d?.duration_seconds?.toString() ?? '',
    };
  });
}

export function ExerciseForm({ planId, exercise, onClose }: ExerciseFormProps) {
  const t = useTranslations('plan');
  const tCommon = useTranslations('common');
  const tIntensity = useTranslations('intensity');
  const [isPending, startTransition] = useTransition();

  const isEdit = !!exercise;

  const [nameEn, setNameEn] = useState(exercise?.name_en ?? '');
  const [namePt, setNamePt] = useState(exercise?.name_pt ?? '');
  const [setsCount, setSetsCount] = useState(exercise?.sets_count ?? 3);
  const [repsMin, setRepsMin] = useState(exercise?.reps_min ?? 10);
  const [repsMax, setRepsMax] = useState(exercise?.reps_max ?? 15);
  const [restSeconds, setRestSeconds] = useState(exercise?.rest_seconds ?? 120);
  const [isTimed, setIsTimed] = useState(exercise?.is_timed ?? false);
  const [setDefaults, setSetDefaults] = useState<SetDefault[]>(() =>
    buildInitialSets(exercise)
  );

  // Adjust set defaults array when setsCount changes
  const handleSetsCountChange = (n: number) => {
    setSetsCount(n);
    setSetDefaults((prev) => {
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, () => ({
            weight: '',
            reps: '',
            intensity: '',
            duration: '',
          })),
        ];
      }
      return prev.slice(0, n);
    });
  };

  const updateSet = (index: number, field: keyof SetDefault, value: string) => {
    setSetDefaults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set('name_en', nameEn);
    formData.set('name_pt', namePt);
    formData.set('sets_count', String(setsCount));
    formData.set('reps_min', String(repsMin));
    formData.set('reps_max', String(repsMax));
    formData.set('rest_seconds', String(restSeconds));
    formData.set('is_timed', String(isTimed));

    setDefaults.forEach((s, i) => {
      const n = i + 1;
      if (isTimed) {
        formData.set(`set_${n}_duration`, s.duration);
      } else {
        formData.set(`set_${n}_weight`, s.weight);
        formData.set(`set_${n}_reps`, s.reps);
        formData.set(`set_${n}_intensity`, s.intensity);
      }
    });

    startTransition(async () => {
      if (isEdit) {
        await updateExercise(exercise.id, planId, formData);
      } else {
        await createExercise(planId, formData);
      }
      onClose();
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gray-50 shadow-xl dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {isEdit ? t('editExercise') : t('addExercise')}
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
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Name (EN)</label>
              <input
                className={inputClass}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Bench Press"
              />
            </div>
            <div>
              <label className={labelClass}>Name (PT)</label>
              <input
                className={inputClass}
                value={namePt}
                onChange={(e) => setNamePt(e.target.value)}
                placeholder="Supino"
              />
            </div>
          </div>

          {/* Timed toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timed exercise</span>
            <button
              type="button"
              onClick={() => setIsTimed((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isTimed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isTimed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sets count */}
          <div>
            <label className={labelClass}>{t('sets')}</label>
            <input
              type="number"
              min={1}
              max={10}
              className={inputClass}
              value={setsCount}
              onChange={(e) => handleSetsCountChange(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Reps / Rest — only show if not timed */}
          {!isTimed && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Reps min</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={repsMin}
                  onChange={(e) => setRepsMin(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className={labelClass}>Reps max</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={repsMax}
                  onChange={(e) => setRepsMax(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className={labelClass}>{t('rest')} (s)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {isTimed && (
            <div>
              <label className={labelClass}>{t('rest')} (s)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={restSeconds}
                onChange={(e) => setRestSeconds(parseInt(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Per-set defaults */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Set defaults (optional)</p>
            {setDefaults.map((s, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3 dark:border-slate-700">
                <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">Set {i + 1}</p>
                {isTimed ? (
                  <div>
                    <label className={labelClass}>Duration (seconds)</label>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={s.duration}
                      onChange={(e) => updateSet(i, 'duration', e.target.value)}
                      placeholder="30"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelClass}>Weight (kg)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        className={inputClass}
                        value={s.weight}
                        onChange={(e) => updateSet(i, 'weight', e.target.value)}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Reps</label>
                      <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={s.reps}
                        onChange={(e) => updateSet(i, 'reps', e.target.value)}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Intensity</label>
                      <select
                        className={inputClass}
                        value={s.intensity}
                        onChange={(e) => updateSet(i, 'intensity', e.target.value)}
                      >
                        <option value="">—</option>
                        {INTENSITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {tIntensity(opt)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
