'use server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function startSession(planId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('sessions')
    .insert({
      workout_plan_id: planId,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (data) redirect(`/session/${data.id}`);
}

export async function completeSet(
  sessionId: string,
  exerciseId: string,
  setData: {
    set_number: number;
    weight_kg?: number | null;
    reps?: number | null;
    duration_seconds?: number | null;
    intensity?: string | null;
  }
) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('session_sets').upsert(
    {
      session_id: sessionId,
      exercise_id: exerciseId,
      set_number: setData.set_number,
      weight_kg: setData.weight_kg ?? null,
      reps: setData.reps ?? null,
      duration_seconds: setData.duration_seconds ?? null,
      intensity: setData.intensity ?? null,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: 'session_id,exercise_id,set_number',
    }
  );
}

export async function finishSession(sessionId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from('sessions')
    .update({
      finished_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  revalidatePath('/dashboard');
  revalidatePath('/history');
}

export async function deleteSession(sessionId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('sessions').delete().eq('id', sessionId);
  revalidatePath('/dashboard');
  revalidatePath('/history');
  revalidatePath('/progress');
}
