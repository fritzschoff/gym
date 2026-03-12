'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function exportData() {
  const supabase = await createServerSupabaseClient();
  const [plans, exercises, defaults, sessions, sets] = await Promise.all([
    supabase.from('workout_plans').select('*'),
    supabase.from('exercises').select('*'),
    supabase.from('exercise_defaults').select('*'),
    supabase.from('sessions').select('*'),
    supabase.from('session_sets').select('*'),
  ]);
  return {
    exportDate: new Date().toISOString(),
    plans: plans.data,
    exercises: exercises.data,
    defaults: defaults.data,
    sessions: sessions.data,
    sets: sets.data,
  };
}
