import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ExerciseCard } from '@/components/plan/exercise-card';
import { PlanHeaderActions, AddExerciseButton } from '@/components/plan/plan-actions';
import { StartSessionButton } from '@/components/dashboard/start-session-button';
import { ExerciseWithDefaults, WorkoutPlan } from '@/lib/types';

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const t = await getTranslations('plan');
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  const supabase = await createServerSupabaseClient();

  // Fetch plan
  const { data: plan } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (!plan) notFound();

  const workoutPlan = plan as WorkoutPlan;
  const planName = locale === 'pt' ? workoutPlan.name_pt : workoutPlan.name_en;

  // Fetch exercises with their defaults
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('*, exercise_defaults(*)')
    .eq('workout_plan_id', id)
    .order('sort_order', { ascending: true });

  const exercises: ExerciseWithDefaults[] = (exercisesData ?? []) as ExerciseWithDefaults[];

  const gradientClass = `bg-gradient-to-br ${workoutPlan.color}`;

  return (
    <div className="pb-6">
      {/* Plan Header */}
      <div className={`${gradientClass} px-4 pt-4 pb-6 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 transition-colors"
              aria-label="Back to dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">{planName}</h1>
          </div>
          <StartSessionButton
            planId={id}
            label={t('startSession')}
            className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 disabled:opacity-60 transition-colors"
          />
        </div>
        <p className="mt-1 pl-9 text-sm text-white/70">
          {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
        </p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Edit / Delete plan buttons */}
        <div className="flex items-center justify-end">
          <PlanHeaderActions plan={workoutPlan} planId={id} />
        </div>

        {/* Exercise list */}
        {exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                planId={id}
                locale={locale}
                isFirst={index === 0}
                isLast={index === exercises.length - 1}
              />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            No exercises yet. Add one below.
          </p>
        )}

        {/* Add Exercise button */}
        <AddExerciseButton planId={id} />
      </div>
    </div>
  );
}
