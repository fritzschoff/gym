'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyPassword, createAuthToken } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const valid = await verifyPassword(password);
  if (!valid) {
    return { error: 'Invalid password' };
  }
  const token = await createAuthToken();
  const cookieStore = await cookies();
  cookieStore.set('gymtracker_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('gymtracker_auth');
  redirect('/');
}

export async function changePassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const current = formData.get('currentPassword') as string;
  const newPass = formData.get('newPassword') as string;
  const confirmPass = formData.get('confirmPassword') as string;

  if (newPass !== confirmPass) return { error: 'Passwords do not match' };
  if (newPass.length < 6) return { error: 'Password too short' };

  const valid = await verifyPassword(current);
  if (!valid) return { error: 'Current password is incorrect' };

  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.hash(newPass, 10);
  const supabase = await createServerSupabaseClient();
  await supabase
    .from('user_preferences')
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .not('id', 'is', null);
  return { success: true };
}
