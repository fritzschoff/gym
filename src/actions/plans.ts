'use server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPlan(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: maxOrder } = await supabase
    .from('workout_plans')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();
  const { data } = await supabase
    .from('workout_plans')
    .insert({
      name_en: formData.get('name_en') as string,
      name_pt: formData.get('name_pt') as string,
      color: (formData.get('color') as string) || 'from-blue-700 to-blue-500',
      sort_order: (maxOrder?.sort_order ?? 0) + 1,
    })
    .select('id')
    .single();
  revalidatePath('/dashboard');
  if (data) redirect(`/plan/${data.id}`);
}

export async function updatePlan(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from('workout_plans')
    .update({
      name_en: formData.get('name_en') as string,
      name_pt: formData.get('name_pt') as string,
      color: formData.get('color') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  revalidatePath('/dashboard');
  revalidatePath(`/plan/${id}`);
}

export async function deletePlan(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('workout_plans').delete().eq('id', id);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}
