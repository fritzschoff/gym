import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProgressClient } from '@/components/progress/progress-client';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sunday
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysFromMonday);
  return `${monday.getMonth() + 1}/${monday.getDate()}`;
}

export default async function ProgressPage() {
  const t = await getTranslations('progress');
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  const supabase = await createServerSupabaseClient();

  // Fetch all exercises
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('id, name_en, name_pt')
    .order('name_en', { ascending: true });

  const exercises = (exercisesData ?? []).map((ex) => ({
    id: ex.id,
    name: locale === 'pt' ? ex.name_pt : ex.name_en,
  }));

  // Fetch all finished sessions
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select('id, started_at, finished_at')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: true });

  const sessions = sessionsData ?? [];

  // Fetch all session sets
  const { data: setsData } = await supabase
    .from('session_sets')
    .select('session_id, exercise_id, weight_kg, reps, set_number')
    .eq('completed', true);

  const allSets = setsData ?? [];

  // --- Duration data (all sessions) ---
  const durationData = sessions
    .filter((s) => s.finished_at)
    .map((s) => {
      const startMs = new Date(s.started_at).getTime();
      const endMs = new Date(s.finished_at!).getTime();
      const minutes = Math.round((endMs - startMs) / 60000);
      return { date: formatDate(s.started_at), minutes };
    });

  // --- Frequency data (sessions per week) ---
  const weekCounts = new Map<string, number>();
  for (const s of sessions) {
    const key = getWeekKey(s.started_at);
    weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1);
  }
  const frequencyData = Array.from(weekCounts.entries()).map(([week, count]) => ({
    week,
    count,
  }));

  // --- Build a session lookup: session_id -> started_at ---
  const sessionMap = new Map(sessions.map((s) => [s.id, s.started_at]));

  // --- Per-exercise data (weight + volume) ---
  const perExerciseData = (exercisesData ?? []).map((ex) => {
    // Sets for this exercise, sorted by date
    const exSets = allSets
      .filter((s) => s.exercise_id === ex.id)
      .map((s) => ({
        ...s,
        startedAt: sessionMap.get(s.session_id) ?? '',
      }))
      .filter((s) => s.startedAt)
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      );

    // Group by session
    const bySession = new Map<
      string,
      { startedAt: string; sets: typeof exSets }
    >();
    for (const s of exSets) {
      if (!bySession.has(s.session_id)) {
        bySession.set(s.session_id, { startedAt: s.startedAt, sets: [] });
      }
      bySession.get(s.session_id)!.sets.push(s);
    }

    // Compute all-time max weight to detect PRs
    let runningMax = 0;

    const weightData = Array.from(bySession.values()).map(
      ({ startedAt, sets }) => {
        const maxWeight = Math.max(
          ...sets.map((s) => s.weight_kg ?? 0),
          0
        );
        const isPR = maxWeight > 0 && maxWeight > runningMax;
        if (isPR) runningMax = maxWeight;
        return {
          date: formatDate(startedAt),
          maxWeight,
          isPR,
        };
      }
    );

    const volumeData = Array.from(bySession.values()).map(
      ({ startedAt, sets }) => {
        const volume = sets.reduce(
          (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
          0
        );
        return { date: formatDate(startedAt), volume: Math.round(volume) };
      }
    );

    return {
      exerciseId: ex.id,
      weightData,
      volumeData,
    };
  });

  // --- PR Board: best weight per exercise, sorted by date desc ---
  const prRecords: {
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
  }[] = [];

  for (const ex of exercisesData ?? []) {
    const exSets = allSets
      .filter((s) => s.exercise_id === ex.id && s.weight_kg != null && s.weight_kg > 0)
      .map((s) => ({
        ...s,
        startedAt: sessionMap.get(s.session_id) ?? '',
      }))
      .filter((s) => s.startedAt);

    if (exSets.length === 0) continue;

    // Find the set with the highest weight
    const best = exSets.reduce((prev, curr) =>
      (curr.weight_kg ?? 0) > (prev.weight_kg ?? 0) ? curr : prev
    );

    prRecords.push({
      exerciseName: locale === 'pt' ? ex.name_pt : ex.name_en,
      weight: best.weight_kg ?? 0,
      reps: best.reps ?? 0,
      date: formatDate(best.startedAt),
    });
  }

  // Sort by date descending (use raw ISO for comparison)
  prRecords.sort((a, b) => {
    // We only have formatted dates; find raw via the original data
    return b.date.localeCompare(a.date);
  });

  return (
    <div>
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
      </div>
      <ProgressClient
        exercises={exercises}
        perExerciseData={perExerciseData}
        durationData={durationData}
        frequencyData={frequencyData}
        prRecords={prRecords}
        tWeightProgression={t('weightProgression')}
        tVolume={t('volume')}
        tSessionDuration={t('sessionDuration')}
        tFrequency={t('frequency')}
        tPrBoard={t('prBoard')}
        tSelectExercise={t('selectExercise')}
        tNoData={t('noData')}
      />
    </div>
  );
}
