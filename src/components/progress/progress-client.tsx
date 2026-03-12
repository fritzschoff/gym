'use client';

import { useState } from 'react';
import { WeightChart } from './weight-chart';
import { VolumeChart } from './volume-chart';
import { DurationChart } from './duration-chart';
import { FrequencyChart } from './frequency-chart';
import { PRBoard } from './pr-board';

interface Exercise {
  id: string;
  name: string;
}

interface WeightDataPoint {
  date: string;
  maxWeight: number;
  isPR: boolean;
}

interface VolumeDataPoint {
  date: string;
  volume: number;
}

interface DurationDataPoint {
  date: string;
  minutes: number;
}

interface FrequencyDataPoint {
  week: string;
  count: number;
}

interface PRRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface PerExerciseData {
  exerciseId: string;
  weightData: WeightDataPoint[];
  volumeData: VolumeDataPoint[];
}

interface ProgressClientProps {
  exercises: Exercise[];
  perExerciseData: PerExerciseData[];
  durationData: DurationDataPoint[];
  frequencyData: FrequencyDataPoint[];
  prRecords: PRRecord[];
  tWeightProgression: string;
  tVolume: string;
  tSessionDuration: string;
  tFrequency: string;
  tPrBoard: string;
  tSelectExercise: string;
  tNoData: string;
}

export function ProgressClient({
  exercises,
  perExerciseData,
  durationData,
  frequencyData,
  prRecords,
  tWeightProgression,
  tVolume,
  tSessionDuration,
  tFrequency,
  tPrBoard,
  tSelectExercise,
  tNoData,
}: ProgressClientProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id ?? ''
  );

  const exerciseData = perExerciseData.find(
    (d) => d.exerciseId === selectedExerciseId
  );

  const hasAnyData =
    durationData.length > 0 ||
    frequencyData.length > 0 ||
    (exerciseData?.weightData.length ?? 0) > 0;

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Exercise selector */}
      {exercises.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {tSelectExercise}
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!hasAnyData ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 dark:text-gray-500">{tNoData}</p>
        </div>
      ) : (
        <>
          {/* Weight Progression */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              {tWeightProgression}
            </h2>
            {exerciseData && exerciseData.weightData.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <WeightChart data={exerciseData.weightData} />
              </div>
            ) : (
              <p className="rounded-xl border border-gray-100 py-8 text-center text-sm text-gray-400 dark:border-slate-800 dark:text-gray-500">
                {tNoData}
              </p>
            )}
          </section>

          {/* Volume */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              {tVolume}
            </h2>
            {exerciseData && exerciseData.volumeData.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <VolumeChart data={exerciseData.volumeData} />
              </div>
            ) : (
              <p className="rounded-xl border border-gray-100 py-8 text-center text-sm text-gray-400 dark:border-slate-800 dark:text-gray-500">
                {tNoData}
              </p>
            )}
          </section>

          {/* Session Duration */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              {tSessionDuration}
            </h2>
            {durationData.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <DurationChart data={durationData} />
              </div>
            ) : (
              <p className="rounded-xl border border-gray-100 py-8 text-center text-sm text-gray-400 dark:border-slate-800 dark:text-gray-500">
                {tNoData}
              </p>
            )}
          </section>

          {/* Frequency */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              {tFrequency}
            </h2>
            {frequencyData.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <FrequencyChart data={frequencyData} />
              </div>
            ) : (
              <p className="rounded-xl border border-gray-100 py-8 text-center text-sm text-gray-400 dark:border-slate-800 dark:text-gray-500">
                {tNoData}
              </p>
            )}
          </section>

          {/* PR Board */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              {tPrBoard}
            </h2>
            <PRBoard records={prRecords} />
          </section>
        </>
      )}
    </div>
  );
}
