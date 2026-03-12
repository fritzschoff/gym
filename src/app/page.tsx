'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';

type LoginState = { error: string } | null;

function initialState(): LoginState {
  return null;
}

export default function Home() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (prevState: LoginState, formData: FormData) => {
      const result = await login(formData);
      return result ?? null;
    },
    initialState()
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Gym<span className="text-blue-500">Tracker</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your password to continue</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-2"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-95 disabled:opacity-60"
          >
            {isPending ? 'Checking...' : 'Enter / Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
