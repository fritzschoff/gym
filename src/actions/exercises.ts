'use server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createExercise(planId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: maxOrder } = await supabase
    .from('exercises')
    .select('sort_order')
    .eq('workout_plan_id', planId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const isTimed = formData.get('is_timed') === 'true';
  const setsCount = parseInt(formData.get('sets_count') as string) || 3;

  const { data: exercise } = await supabase
    .from('exercises')
    .insert({
      workout_plan_id: planId,
      name_en: formData.get('name_en') as string,
      name_pt: formData.get('name_pt') as string,
      sets_count: setsCount,
      reps_min: parseInt(formData.get('reps_min') as string) || 10,
      reps_max: parseInt(formData.get('reps_max') as string) || 15,
      rest_seconds: parseInt(formData.get('rest_seconds') as string) || 120,
      is_timed: isTimed,
      sort_order: (maxOrder?.sort_order ?? 0) + 1,
    })
    .select('id')
    .single();

  if (exercise) {
    const defaults: Record<string, unknown>[] = [];
    for (let i = 1; i <= setsCount; i++) {
      if (isTimed) {
        const dur = parseInt(formData.get(`set_${i}_duration`) as string);
        if (dur) defaults.push({ exercise_id: exercise.id, set_number: i, duration_seconds: dur });
      } else {
        const weight = parseFloat(formData.get(`set_${i}_weight`) as string);
        const reps = parseInt(formData.get(`set_${i}_reps`) as string);
        const intensity = formData.get(`set_${i}_intensity`) as string;
        if (weight || reps) {
          defaults.push({
            exercise_id: exercise.id,
            set_number: i,
            weight_kg: weight || null,
            reps: reps || null,
            intensity: intensity || null,
          });
        }
      }
    }
    if (defaults.length) await supabase.from('exercise_defaults').insert(defaults);
  }
  revalidatePath(`/plan/${planId}`);
}

export async function updateExercise(exerciseId: string, planId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const isTimed = formData.get('is_timed') === 'true';
  const setsCount = parseInt(formData.get('sets_count') as string) || 3;

  await supabase
    .from('exercises')
    .update({
      name_en: formData.get('name_en') as string,
      name_pt: formData.get('name_pt') as string,
      sets_count: setsCount,
      reps_min: parseInt(formData.get('reps_min') as string) || 10,
      reps_max: parseInt(formData.get('reps_max') as string) || 15,
      rest_seconds: parseInt(formData.get('rest_seconds') as string) || 120,
      is_timed: isTimed,
    })
    .eq('id', exerciseId);

  await supabase.from('exercise_defaults').delete().eq('exercise_id', exerciseId);

  const defaults: Record<string, unknown>[] = [];
  for (let i = 1; i <= setsCount; i++) {
    if (isTimed) {
      const dur = parseInt(formData.get(`set_${i}_duration`) as string);
      if (dur) defaults.push({ exercise_id: exerciseId, set_number: i, duration_seconds: dur });
    } else {
      const weight = parseFloat(formData.get(`set_${i}_weight`) as string);
      const reps = parseInt(formData.get(`set_${i}_reps`) as string);
      const intensity = formData.get(`set_${i}_intensity`) as string;
      defaults.push({
        exercise_id: exerciseId,
        set_number: i,
        weight_kg: weight || null,
        reps: reps || null,
        intensity: intensity || null,
      });
    }
  }
  if (defaults.length) await supabase.from('exercise_defaults').insert(defaults);
  revalidatePath(`/plan/${planId}`);
}

export async function deleteExercise(exerciseId: string, planId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('exercises').delete().eq('id', exerciseId);
  revalidatePath(`/plan/${planId}`);
}

export async function reorderExercise(
  exerciseId: string,
  planId: string,
  direction: 'up' | 'down'
) {
  const supabase = await createServerSupabaseClient();
  const { data: current } = await supabase
    .from('exercises')
    .select('sort_order')
    .eq('id', exerciseId)
    .single();
  if (!current) return;
  const { data: adjacent } = await supabase
    .from('exercises')
    .select('id, sort_order')
    .eq('workout_plan_id', planId)
    .order('sort_order', { ascending: direction === 'up' })
    .filter('sort_order', direction === 'up' ? 'lt' : 'gt', current.sort_order)
    .limit(1)
    .single();
  if (!adjacent) return;
  await supabase
    .from('exercises')
    .update({ sort_order: adjacent.sort_order })
    .eq('id', exerciseId);
  await supabase
    .from('exercises')
    .update({ sort_order: current.sort_order })
    .eq('id', adjacent.id);
  revalidatePath(`/plan/${planId}`);
}
