import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SessionClient } from '@/components/session/session-client';
import {
  ExerciseWithDefaults,
  Session,
  SessionSet,
  WorkoutPlan,
} from '@/lib/types';

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';

  const supabase = await createServerSupabaseClient();

  // 1. Fetch session
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (!sessionData) notFound();

  const session = sessionData as Session;

  // 2. Fetch the plan
  const { data: planData } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('id', session.workout_plan_id)
    .single();

  if (!planData) notFound();

  const plan = planData as WorkoutPlan;

  // 3. Fetch exercises with defaults, ordered by sort_order
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('*, exercise_defaults(*)')
    .eq('workout_plan_id', plan.id)
    .order('sort_order', { ascending: true });

  const exercises: ExerciseWithDefaults[] = (exercisesData ?? []) as ExerciseWithDefaults[];

  // 4. Fetch existing session_sets (resume scenario)
  const { data: existingSetsData } = await supabase
    .from('session_sets')
    .select('*')
    .eq('session_id', id);

  const existingSessionSets: SessionSet[] = (existingSetsData ?? []) as SessionSet[];

  // 5. Fetch last completed session for this plan (for carry-forward defaults)
  const { data: lastSessionData } = await supabase
    .from('sessions')
    .select('id')
    .eq('workout_plan_id', plan.id)
    .not('finished_at', 'is', null)
    .neq('id', id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  let lastSessionSets: SessionSet[] = [];
  if (lastSessionData?.id) {
    const { data: lastSetsData } = await supabase
      .from('session_sets')
      .select('*')
      .eq('session_id', lastSessionData.id);
    lastSessionSets = (lastSetsData ?? []) as SessionSet[];
  }

  // 6. Fetch historical max weights per exercise (for PR detection)
  //    We look at all session_sets for exercises in this plan (excluding current session)
  const exerciseIds = exercises.map((e) => e.id);

  type MaxRow = { exercise_id: string; weight_kg: number };
  let historicalMaxWeights: { exercise_id: string; max_weight: number }[] = [];

  if (exerciseIds.length > 0) {
    // Get all completed sets for these exercises across all past sessions
    const { data: histData } = await supabase
      .from('session_sets')
      .select('exercise_id, weight_kg')
      .in('exercise_id', exerciseIds)
      .neq('session_id', id)
      .not('weight_kg', 'is', null);

    if (histData) {
      // Group by exercise_id and find max
      const maxMap = new Map<string, number>();
      (histData as MaxRow[]).forEach((row) => {
        const current = maxMap.get(row.exercise_id) ?? 0;
        if (row.weight_kg > current) {
          maxMap.set(row.exercise_id, row.weight_kg);
        }
      });
      historicalMaxWeights = Array.from(maxMap.entries()).map(([exercise_id, max_weight]) => ({
        exercise_id,
        max_weight,
      }));
    }
  }

  return (
    <SessionClient
      session={session}
      plan={plan}
      exercises={exercises}
      existingSessionSets={existingSessionSets}
      lastSessionSets={lastSessionSets}
      historicalMaxWeights={historicalMaxWeights}
      locale={locale}
    />
  );
}
