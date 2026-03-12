'use client';

interface SessionSet {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  intensity: string | null;
}

interface ExerciseGroup {
  exerciseId: string;
  exerciseName: string;
  sets: SessionSet[];
}

interface SessionDetailProps {
  groups: ExerciseGroup[];
}

const INTENSITY_LABELS: Record<string, string> = {
  mod: 'Moderate',
  int: 'Intense',
  pint: 'Low Intensity',
  pmod: 'Low Moderate',
};

export function SessionDetail({ groups }: SessionDetailProps) {
  if (groups.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
        No sets recorded
      </p>
    );
  }

  return (
    <div className="border-t border-gray-100 dark:border-slate-700/50">
      {groups.map((group) => (
        <div key={group.exerciseId} className="px-4 py-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {group.exerciseName}
          </p>
          <div className="space-y-1">
            {group.sets
              .sort((a, b) => a.set_number - b.set_number)
              .map((set) => (
                <div
                  key={set.id}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="w-12 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    Set {set.set_number}
                  </span>
                  {set.duration_seconds != null ? (
                    <span>{set.duration_seconds}s</span>
                  ) : (
                    <>
                      {set.weight_kg != null && (
                        <span className="font-medium">{set.weight_kg}kg</span>
                      )}
                      {set.reps != null && (
                        <span>× {set.reps} reps</span>
                      )}
                      {set.intensity && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({INTENSITY_LABELS[set.intensity] ?? set.intensity})
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
