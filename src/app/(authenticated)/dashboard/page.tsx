import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StatsRow } from '@/components/dashboard/stats-row';
import { PlanCard } from '@/components/dashboard/plan-card';
import { AddPlanButton } from '@/components/dashboard/add-plan-button';
import { WorkoutPlan } from '@/lib/types';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  const supabase = await createServerSupabaseClient();

  // Fetch workout plans ordered by sort_order
  const { data: plans } = await supabase
    .from('workout_plans')
    .select('*')
    .order('sort_order', { ascending: true });

  const workoutPlans: WorkoutPlan[] = plans ?? [];

  // For each plan, get exercise count and most recent session date
  const planStats = await Promise.all(
    workoutPlans.map(async (plan) => {
      const [{ count }, { data: lastSession }] = await Promise.all([
        supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('workout_plan_id', plan.id),
        supabase
          .from('sessions')
          .select('started_at')
          .eq('workout_plan_id', plan.id)
          .not('finished_at', 'is', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .single(),
      ]);
      return {
        exerciseCount: count ?? 0,
        lastSessionDate: lastSession?.started_at ?? null,
      };
    })
  );

  // Check for unfinished (in-progress) session
  const { data: unfinishedSession } = await supabase
    .from('sessions')
    .select('id, workout_plan_id')
    .is('finished_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Resume Workout Banner */}
      {unfinishedSession && (
        <Link
          href={`/session/${unfinishedSession.id}`}
          className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-white shadow-md"
        >
          <span className="font-semibold">{t('resumeWorkout')}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      )}

      {/* Stats Row */}
      <StatsRow />

      {/* Plan Cards */}
      <div className="space-y-3">
        {workoutPlans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            exerciseCount={planStats[i].exerciseCount}
            lastSessionDate={planStats[i].lastSessionDate}
            localizedName={locale === 'pt' ? plan.name_pt : plan.name_en}
          />
        ))}
      </div>

      {/* Add New Plan */}
      <AddPlanButton />
    </div>
  );
}
