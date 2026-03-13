import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SessionList } from '@/components/history/session-list';

export default async function HistoryPage() {
  const t = await getTranslations('history');
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  const supabase = await createServerSupabaseClient();

  // Fetch all finished sessions with plan info and session sets
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select(
      `id, workout_plan_id, started_at, finished_at,
       workout_plans(name_en, name_pt),
       session_sets(id, exercise_id, set_number, weight_kg, reps, duration_seconds, intensity, completed)`
    )
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false });

  // Fetch exercises for name lookup
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('id, name_en, name_pt');

  const exercises = (exercisesData ?? []).map((ex) => ({
    id: ex.id,
    name: locale === 'pt' ? ex.name_pt : ex.name_en,
  }));

  const sessions = (sessionsData ?? []).map((s) => {
    const plan = Array.isArray(s.workout_plans)
      ? (s.workout_plans[0] as { name_en: string; name_pt: string } | undefined) ?? null
      : (s.workout_plans as { name_en: string; name_pt: string } | null);
    const planName = plan
      ? locale === 'pt'
        ? plan.name_pt
        : plan.name_en
      : null;

    return {
      id: s.id,
      workout_plan_id: s.workout_plan_id,
      planName,
      started_at: s.started_at,
      finished_at: s.finished_at,
      sets: (s.session_sets as {
        id: string;
        exercise_id: string;
        set_number: number;
        weight_kg: number | null;
        reps: number | null;
        duration_seconds: number | null;
        intensity: string | null;
        completed: boolean;
      }[]) ?? [],
    };
  });

  return (
    <div>
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
      </div>
      <SessionList
        sessions={sessions}
        exercises={exercises}
        tNoSessions={t('noSessions')}
        tFilterByPlan={t('filterByPlan')}
        tAllPlans={t('allPlans')}
        tSetsLogged={t('setsLogged')}
        tDeleteSession={t('deleteSession')}
        tConfirmDeleteSession={t('confirmDeleteSession')}
      />
    </div>
  );
}
