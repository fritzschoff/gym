'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyPassword, createAuthToken } from '@/lib/auth';

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
