'use server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function updateLanguage(language: 'en' | 'pt') {
  const cookieStore = await cookies();
  cookieStore.set('locale', language, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('user_preferences').select('id').single();
  if (data) {
    await supabase.from('user_preferences').update({ language, updated_at: new Date().toISOString() }).eq('id', data.id);
  }
}

export async function updateTheme(theme: 'light' | 'dark' | 'system') {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('user_preferences').select('id').single();
  if (data) {
    await supabase.from('user_preferences').update({ theme, updated_at: new Date().toISOString() }).eq('id', data.id);
  }
}
