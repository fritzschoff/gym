import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.COOKIE_SECRET);

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from('user_preferences').select('password_hash').single();
    if (data?.password_hash) {
      return bcrypt.compare(password, data.password_hash);
    }
  } catch {}
  const hash = process.env.ADMIN_PASSWORD_HASH!;
  return bcrypt.compare(password, hash);
}

export async function createAuthToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
