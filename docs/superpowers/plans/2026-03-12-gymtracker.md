# GymTracker Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first gym workout tracker with session logging, progress charts, and multi-device sync.

**Architecture:** Next.js 14 App Router with Supabase PostgreSQL backend. Server Actions for data mutations, server-side fetching with `revalidatePath` for data freshness. Password-gated single-user app with bilingual UI (EN/PT) and light/dark theming. Real-time Supabase subscriptions deferred to v2; current sync happens on page load/navigation.

**Tech Stack:** Next.js 14, Supabase, Tailwind CSS, Recharts, next-intl, bcryptjs, jose (JWT for cookies)

**Spec:** `docs/superpowers/specs/2026-03-12-gymtracker-design.md`

---

## File Structure

```
gym/
├── .env.local                          # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
│                                       # ADMIN_PASSWORD_HASH, COOKIE_SECRET
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── package.json
├── tsconfig.json
├── middleware.ts                        # Auth check + locale detection
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql
│       └── 002_seed.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout: ThemeProvider, font, metadata
│   │   ├── page.tsx                    # Password gate
│   │   ├── globals.css                 # Tailwind imports + theme vars
│   │   └── (authenticated)/
│   │       ├── layout.tsx              # App shell: TopBar + BottomNav + pb-20
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── plan/
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── session/
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── progress/
│   │       │   └── page.tsx
│   │       ├── history/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # createBrowserClient()
│   │   │   └── server.ts               # createServerClient() for server components/actions
│   │   ├── auth.ts                     # hashPassword, verifyPassword, signToken, verifyToken
│   │   └── types.ts                    # TypeScript types matching DB schema
│   ├── actions/
│   │   ├── auth.ts                     # login, logout, changePassword
│   │   ├── plans.ts                    # createPlan, updatePlan, deletePlan
│   │   ├── exercises.ts                # createExercise, updateExercise, deleteExercise, reorder
│   │   ├── export.ts                   # exportData (JSON download)
│   │   ├── sessions.ts                 # startSession, completeSet, finishSession
│   │   └── preferences.ts             # updateLanguage, updateTheme
│   ├── components/
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── top-bar.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── ui/
│   │   │   ├── language-toggle.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-row.tsx
│   │   │   └── plan-card.tsx
│   │   ├── plan/
│   │   │   ├── exercise-card.tsx
│   │   │   └── exercise-form.tsx
│   │   ├── session/
│   │   │   ├── session-client.tsx      # Client wrapper managing session state
│   │   │   ├── elapsed-timer.tsx
│   │   │   ├── rest-timer.tsx
│   │   │   ├── exercise-tracker.tsx
│   │   │   ├── set-row.tsx
│   │   │   └── session-summary.tsx
│   │   ├── progress/
│   │   │   ├── weight-chart.tsx
│   │   │   ├── volume-chart.tsx
│   │   │   ├── duration-chart.tsx
│   │   │   ├── frequency-chart.tsx
│   │   │   └── pr-board.tsx
│   │   └── history/
│   │       ├── session-list.tsx
│   │       └── session-detail.tsx
│   └── i18n/
│       ├── request.ts                  # next-intl getRequestConfig
│       ├── en.json
│       └── pt.json
```

---

## Chunk 1: Foundation (Tasks 1-4)

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.local`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/maxfritz/code/gym
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr bcryptjs jose recharts next-intl
npm install -D @types/bcryptjs
```

- [ ] **Step 3: Create `.env.local`**

Create with placeholder values (user will fill Supabase creds later):

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ADMIN_PASSWORD_HASH=$2b$10$placeholder
COOKIE_SECRET=change-me-to-random-string
```

- [ ] **Step 4: Configure Tailwind for dark mode**

In `tailwind.config.ts`, set `darkMode: 'class'` so we control it via a class on `<html>`.

- [ ] **Step 5: Set up `globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Create minimal root layout**

`src/app/layout.tsx` — basic HTML shell with Inter font, `<html lang="en" className="">` (theme class added client-side).

- [ ] **Step 7: Create placeholder home page**

`src/app/page.tsx` — renders "GymTracker" heading. Verify with `npm run dev`.

- [ ] **Step 8: Update `.gitignore`**

Add `.env.local`, `.superpowers/`, `node_modules/`.

- [ ] **Step 9: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind and dependencies"
```

---

### Task 2: Database Schema & Seed Data

**Files:**
- Create: `supabase/migrations/001_schema.sql`, `supabase/migrations/002_seed.sql`, `src/lib/types.ts`

- [ ] **Step 1: Write schema migration**

Create `supabase/migrations/001_schema.sql` with all 6 tables:

```sql
-- workout_plans
CREATE TABLE workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_pt text NOT NULL,
  color text NOT NULL DEFAULT 'from-blue-600 to-blue-400',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- exercises
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_pt text NOT NULL,
  sets_count int NOT NULL DEFAULT 3,
  reps_min int NOT NULL DEFAULT 10,
  reps_max int NOT NULL DEFAULT 15,
  rest_seconds int NOT NULL DEFAULT 120,
  is_timed boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- exercise_defaults
CREATE TABLE exercise_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number int NOT NULL,
  weight_kg decimal,
  reps int,
  duration_seconds int,
  intensity text,
  UNIQUE(exercise_id, set_number)
);

-- sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- session_sets
CREATE TABLE session_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number int NOT NULL,
  weight_kg decimal,
  reps int,
  duration_seconds int,
  intensity text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE(session_id, exercise_id, set_number)
);

-- user_preferences
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'system',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- password_hash allows dynamic password change without redeploying env vars
-- NULL means fall back to ADMIN_PASSWORD_HASH env var
ALTER TABLE user_preferences ADD COLUMN password_hash text;

-- Insert default preferences row
INSERT INTO user_preferences (language, theme) VALUES ('en', 'system');

-- Indexes for common queries
CREATE INDEX idx_exercises_plan ON exercises(workout_plan_id);
CREATE INDEX idx_exercise_defaults_exercise ON exercise_defaults(exercise_id);
CREATE INDEX idx_sessions_plan ON sessions(workout_plan_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_session_sets_session ON session_sets(session_id);
CREATE INDEX idx_session_sets_exercise ON session_sets(exercise_id);
```

- [ ] **Step 2: Write seed data migration**

Create `supabase/migrations/002_seed.sql` with all 3 workout plans, 21 exercises, and their exercise_defaults from the spec's Seed Data section. Use explicit UUIDs via `gen_random_uuid()` in CTEs or use INSERT...RETURNING to chain inserts.

Structure as:
```sql
-- Plan 1: Chest/Shoulder/Triceps
WITH plan1 AS (
  INSERT INTO workout_plans (name_en, name_pt, color, sort_order)
  VALUES ('Chest / Shoulder / Triceps', 'Peito / Ombro / Triceps', 'from-blue-700 to-blue-500', 1)
  RETURNING id
),
ex1 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, sort_order)
  VALUES ((SELECT id FROM plan1), 'Flat Barbell Bench Press', 'Supino Reto com Barra Reta', 3, 10, 15, 120, 1)
  RETURNING id
)
INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity) VALUES
  ((SELECT id FROM ex1), 1, 15, 12, 'mod'),
  ((SELECT id FROM ex1), 2, 17.5, 10, 'mod'),
  ((SELECT id FROM ex1), 3, 17.5, 8, 'pint');
```

**Generate the complete SQL for ALL 21 exercises across all 3 plans** using the exact data from the spec's Seed Data section. Use the same CTE/RETURNING pattern shown above. Key rules:
- Each plan gets its own CTE chain
- Plan 1 color: `'from-blue-700 to-blue-500'`, Plan 2 color: `'from-green-700 to-green-500'`, Plan 3 color: `'from-orange-700 to-orange-500'`
- Timed exercises (`is_timed=true`): use `duration_seconds` instead of `weight_kg`/`reps`/`intensity`:
  ```sql
  INSERT INTO exercise_defaults (exercise_id, set_number, duration_seconds) VALUES (id, 1, 30), (id, 2, 30), (id, 3, 30);
  ```
- Exercises with "no defaults" (Remada Baixa unilateral supinada, Rosca Alternada Banco Inclinado, Elevação de Quadril com Barra): insert the exercise but NO exercise_defaults rows

- [ ] **Step 3: Write TypeScript types**

Create `src/lib/types.ts`:

```typescript
export type IntensityCode = 'mod' | 'int' | 'pint' | 'pmod';

export interface WorkoutPlan {
  id: string;
  name_en: string;
  name_pt: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  workout_plan_id: string;
  name_en: string;
  name_pt: string;
  sets_count: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  is_timed: boolean;
  sort_order: number;
  created_at: string;
}

export interface ExerciseDefault {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  intensity: IntensityCode | null;
}

export interface Session {
  id: string;
  workout_plan_id: string | null;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface SessionSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  intensity: IntensityCode | null;
  completed: boolean;
  completed_at: string | null;
}

export interface UserPreferences {
  id: string;
  language: 'en' | 'pt';
  theme: 'light' | 'dark' | 'system';
  updated_at: string;
}

// Joined types for convenience
export interface ExerciseWithDefaults extends Exercise {
  exercise_defaults: ExerciseDefault[];
}

export interface WorkoutPlanWithExercises extends WorkoutPlan {
  exercises: ExerciseWithDefaults[];
}

export interface SessionWithSets extends Session {
  session_sets: SessionSet[];
  workout_plan?: WorkoutPlan | null;
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/ src/lib/types.ts
git commit -m "feat: add database schema, seed data, and TypeScript types"
```

---

### Task 3: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`

- [ ] **Step 1: Create browser client**

`src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

`src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase browser and server clients"
```

---

### Task 4: Authentication (Password Gate + Middleware)

**Files:**
- Create: `src/lib/auth.ts`, `src/actions/auth.ts`, `middleware.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create auth utilities**

`src/lib/auth.ts`:

```typescript
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.COOKIE_SECRET);

export async function verifyPassword(password: string): Promise<boolean> {
  // Check DB password_hash first (allows dynamic password change)
  // Falls back to env var ADMIN_PASSWORD_HASH
  // Note: this function is called from Server Actions only (not middleware/edge),
  // so Supabase fetch is safe here
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from('user_preferences').select('password_hash').single();
    if (data?.password_hash) {
      return bcrypt.compare(password, data.password_hash);
    }
  } catch {}
  // Fallback to env var
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
```

- [ ] **Step 2: Create login server action**

`src/actions/auth.ts`:

```typescript
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
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('gymtracker_auth');
  redirect('/');
}
```

- [ ] **Step 3: Create middleware**

`middleware.ts` in project root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and static assets
  if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('gymtracker_auth')?.value;
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 4: Build password gate page**

`src/app/page.tsx` — full-screen centered password form:
- Dark background with gradient
- App logo/title "GymTracker"
- Password input field
- Submit button
- Error message display
- Uses the `login` server action

- [ ] **Step 5: Generate password hash**

Run locally to generate the bcrypt hash (user provides their password when prompted):

```bash
node -e "const bcrypt = require('bcryptjs'); const pw = process.argv[1]; bcrypt.hash(pw, 10).then(h => console.log(h))" "USER_PASSWORD_HERE"
```

Put the resulting hash in `.env.local` as `ADMIN_PASSWORD_HASH`. The user's password is defined in the spec.

- [ ] **Step 6: Test login flow**

Run `npm run dev`, navigate to `/`, enter password, verify redirect to `/dashboard`.

- [ ] **Step 7: Commit**

```bash
git add middleware.ts src/lib/auth.ts src/actions/auth.ts src/app/page.tsx
git commit -m "feat: add password gate authentication with JWT cookies"
```

---

## Chunk 2: App Shell & Infrastructure (Tasks 5-6)

### Task 5: Internationalization (next-intl)

**Files:**
- Create: `src/i18n/request.ts`, `src/i18n/en.json`, `src/i18n/pt.json`, `src/actions/preferences.ts`
- Modify: `next.config.mjs`, `src/app/layout.tsx`

- [ ] **Step 1: Create i18n config**

`src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  return {
    locale,
    messages: (await import(`@/i18n/${locale}.json`)).default,
  };
});
```

- [ ] **Step 2: Create translation files**

`src/i18n/en.json` and `src/i18n/pt.json` with keys for all UI strings:
- `nav.*` (Home, Progress, History, Settings)
- `dashboard.*` (title, thisWeek, streak, newPRs, startSession, lastSession, exercises, daysAgo)
- `plan.*` (startSession, addExercise, editExercise, deleteExercise, sets, reps, rest, notSet)
- `session.*` (elapsed, rest, done, finish, summary, newPR, setsCompleted, duration)
- `progress.*` (title, weightProgression, volume, sessionDuration, frequency, prBoard)
- `history.*` (title, noSessions, filterByPlan, allPlans)
- `settings.*` (title, language, theme, changePassword, exportData, light, dark, system)
- `auth.*` (title, password, login, invalidPassword, logout)
- `common.*` (save, cancel, delete, confirm, edit, back, kg, reps, seconds)
- `intensity.*` (mod, int, pint, pmod — localized descriptions)

- [ ] **Step 3: Update `next.config.mjs`**

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Wrap layout with NextIntlClientProvider**

Update `src/app/layout.tsx` to import `NextIntlClientProvider` and `getMessages`, wrap children.

- [ ] **Step 5: Create preferences server actions**

`src/actions/preferences.ts`:

```typescript
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
```

- [ ] **Step 6: Create LanguageToggle component**

`src/components/ui/language-toggle.tsx` — button that toggles between EN/PT, calls `updateLanguage` action, triggers page refresh via `router.refresh()`.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/actions/preferences.ts src/components/ui/language-toggle.tsx next.config.mjs src/app/layout.tsx
git commit -m "feat: add bilingual i18n with next-intl (EN/PT)"
```

---

### Task 6: Theme System & App Shell

**Files:**
- Create: `src/components/layout/theme-provider.tsx`, `src/components/ui/theme-toggle.tsx`, `src/components/layout/top-bar.tsx`, `src/components/layout/bottom-nav.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create ThemeProvider**

`src/components/layout/theme-provider.tsx` — client component:
- Reads initial theme from cookie (passed as prop from server)
- Applies `dark` class to `<html>` element
- Handles `system` by listening to `prefers-color-scheme` media query
- Provides theme context to children

- [ ] **Step 2: Create ThemeToggle**

`src/components/ui/theme-toggle.tsx` — cycles through light → dark → system, calls `updateTheme` action, updates context.

- [ ] **Step 3: Create TopBar**

`src/components/layout/top-bar.tsx`:
- App logo text "GymTracker" with blue accent
- LanguageToggle + ThemeToggle on the right
- Responsive padding
- Light/dark aware styling

- [ ] **Step 4: Create BottomNav**

`src/components/layout/bottom-nav.tsx`:
- 4 tabs: Home, Progress, History, Settings
- Icons (use simple SVG or emoji initially)
- Active tab highlighting based on current pathname
- Fixed to bottom on mobile
- Uses `usePathname()` from next/navigation
- Localized labels via `useTranslations`

- [ ] **Step 5: Create app shell layout**

Modify `src/app/layout.tsx`:
- Import ThemeProvider, pass initial theme from cookie
- Body: `min-h-screen bg-gray-50 dark:bg-slate-950`
- Only show TopBar + BottomNav when authenticated (check cookie existence)

Create a shared layout component at `src/app/(authenticated)/layout.tsx` for authenticated pages that includes TopBar and BottomNav, with `pb-20` for bottom nav spacing.

Move dashboard, plan, session, progress, history, settings routes under `(authenticated)` route group.

- [ ] **Step 6: Update globals.css**

Add custom CSS variables if needed, smooth transitions for theme switching.

- [ ] **Step 7: Test app shell**

Run dev server, log in, verify TopBar and BottomNav render, theme toggle works, language toggle works.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/ src/components/ui/theme-toggle.tsx src/app/
git commit -m "feat: add theme system, top bar, and bottom navigation shell"
```

---

## Chunk 3: Dashboard & Plan Management (Tasks 7-8)

### Task 7: Dashboard

**Files:**
- Create: `src/components/dashboard/stats-row.tsx`, `src/components/dashboard/plan-card.tsx`
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

- [ ] **Step 1: Create StatsRow component**

`src/components/dashboard/stats-row.tsx` — server component:
- Queries Supabase for: sessions this week (count), current streak (consecutive days with sessions), new PRs this week
- Displays 3 stat cards in a row
- Blue/green/amber accent colors

- [ ] **Step 2: Create PlanCard component**

`src/components/dashboard/plan-card.tsx`:
- Gradient background using plan's `color` field (Tailwind gradient classes)
- Plan name (localized via `name_en`/`name_pt` based on current locale)
- Exercise count
- "Last: X days ago" computed from most recent session
- "Start Session" button — links to `/session/new?plan={id}` (creates session on click)
- Tap card body to go to `/plan/{id}`

- [ ] **Step 3: Build dashboard page**

`src/app/(authenticated)/dashboard/page.tsx` — server component:
- Fetch workout_plans ordered by sort_order
- Fetch session stats
- Check for unfinished sessions (finished_at IS NULL) — if found, show a "Resume Workout" banner at top linking to `/session/{id}`
- Render StatsRow + PlanCards
- "Add New Plan" button at bottom (links to plan creation form)

- [ ] **Step 4: Test dashboard**

Navigate to `/dashboard`, verify plans render with data from seed, stats show zeros (no sessions yet).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/app/\(authenticated\)/dashboard/
git commit -m "feat: add dashboard with workout plan cards and stats"
```

---

### Task 8: Workout Plan View & Exercise CRUD

**Files:**
- Create: `src/components/plan/exercise-card.tsx`, `src/components/plan/exercise-form.tsx`, `src/actions/plans.ts`, `src/actions/exercises.ts`
- Modify: `src/app/(authenticated)/plan/[id]/page.tsx`

- [ ] **Step 1: Create plan server actions**

`src/actions/plans.ts`:

```typescript
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPlan(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: maxOrder } = await supabase
    .from('workout_plans')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  await supabase.from('workout_plans').insert({
    name_en: formData.get('name_en') as string,
    name_pt: formData.get('name_pt') as string,
    color: formData.get('color') as string || 'from-blue-700 to-blue-500',
    sort_order: (maxOrder?.sort_order ?? 0) + 1,
  });
  revalidatePath('/dashboard');
}

export async function updatePlan(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('workout_plans').update({
    name_en: formData.get('name_en') as string,
    name_pt: formData.get('name_pt') as string,
    color: formData.get('color') as string,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  revalidatePath('/dashboard');
  revalidatePath(`/plan/${id}`);
}

export async function deletePlan(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('workout_plans').delete().eq('id', id);
  revalidatePath('/dashboard');
}
```

- [ ] **Step 2: Create exercise server actions**

`src/actions/exercises.ts`:

```typescript
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createExercise(planId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  // Get max sort_order for this plan
  // Insert exercise
  // Insert exercise_defaults for each set
  revalidatePath(`/plan/${planId}`);
}

export async function updateExercise(exerciseId: string, planId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  // Update exercise fields
  await supabase.from('exercises').update({
    name_en: formData.get('name_en') as string,
    name_pt: formData.get('name_pt') as string,
    sets_count: parseInt(formData.get('sets_count') as string),
    reps_min: parseInt(formData.get('reps_min') as string),
    reps_max: parseInt(formData.get('reps_max') as string),
    rest_seconds: parseInt(formData.get('rest_seconds') as string),
    is_timed: formData.get('is_timed') === 'true',
  }).eq('id', exerciseId);
  // Delete old defaults and re-insert
  await supabase.from('exercise_defaults').delete().eq('exercise_id', exerciseId);
  // Parse set defaults from formData (set_1_weight, set_1_reps, etc.) and insert
  const setsCount = parseInt(formData.get('sets_count') as string);
  const defaults = [];
  for (let i = 1; i <= setsCount; i++) {
    defaults.push({
      exercise_id: exerciseId,
      set_number: i,
      weight_kg: parseFloat(formData.get(`set_${i}_weight`) as string) || null,
      reps: parseInt(formData.get(`set_${i}_reps`) as string) || null,
      duration_seconds: parseInt(formData.get(`set_${i}_duration`) as string) || null,
      intensity: (formData.get(`set_${i}_intensity`) as string) || null,
    });
  }
  if (defaults.length) await supabase.from('exercise_defaults').insert(defaults);
  revalidatePath(`/plan/${planId}`);
}

export async function deleteExercise(exerciseId: string, planId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('exercises').delete().eq('id', exerciseId);
  revalidatePath(`/plan/${planId}`);
}

export async function reorderExercise(exerciseId: string, planId: string, direction: 'up' | 'down') {
  const supabase = await createServerSupabaseClient();
  // Get current exercise and its sort_order
  const { data: current } = await supabase.from('exercises').select('sort_order').eq('id', exerciseId).single();
  if (!current) return;
  // Find adjacent exercise
  const { data: adjacent } = await supabase
    .from('exercises')
    .select('id, sort_order')
    .eq('workout_plan_id', planId)
    .order('sort_order', { ascending: direction === 'up' })
    .filter('sort_order', direction === 'up' ? 'lt' : 'gt', current.sort_order)
    .limit(1)
    .single();
  if (!adjacent) return;
  // Swap sort_orders
  await supabase.from('exercises').update({ sort_order: adjacent.sort_order }).eq('id', exerciseId);
  await supabase.from('exercises').update({ sort_order: current.sort_order }).eq('id', adjacent.id);
  revalidatePath(`/plan/${planId}`);
}
```

- [ ] **Step 3: Create ExerciseCard component**

`src/components/plan/exercise-card.tsx`:
- Exercise name (localized)
- Sets display: each set on a line showing set number, weight/reps/intensity (or duration for timed, or "Not set")
- Rest interval display
- Up/down arrows for reordering
- Edit button → opens ExerciseForm in edit mode
- Delete button with confirmation dialog

- [ ] **Step 4: Create ExerciseForm component**

`src/components/plan/exercise-form.tsx` — client component (modal/sheet):
- Fields: name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed toggle
- Dynamic set defaults section: for each set, inputs for weight_kg/reps/intensity (or duration_seconds if timed)
- Save/Cancel buttons
- Works for both create and edit modes

- [ ] **Step 5: Build plan view page**

`src/app/(authenticated)/plan/[id]/page.tsx` — server component:
- Fetch plan with exercises and defaults (joined query)
- Render plan header with edit/delete
- Render ExerciseCards list
- "Add Exercise" button
- "Start Session" button at top

- [ ] **Step 6: Test plan CRUD**

Navigate to a plan, verify exercises display, try adding/editing/deleting exercises.

- [ ] **Step 7: Commit**

```bash
git add src/actions/plans.ts src/actions/exercises.ts src/components/plan/ src/app/\(authenticated\)/plan/
git commit -m "feat: add workout plan view with full exercise CRUD"
```

---

## Chunk 4: Active Session (Task 9)

### Task 9: Active Session Tracking

**Files:**
- Create: `src/actions/sessions.ts`, `src/components/session/elapsed-timer.tsx`, `src/components/session/rest-timer.tsx`, `src/components/session/exercise-tracker.tsx`, `src/components/session/set-row.tsx`, `src/components/session/session-summary.tsx`
- Modify: `src/app/(authenticated)/session/[id]/page.tsx`

- [ ] **Step 1: Create session server actions**

`src/actions/sessions.ts`:

```typescript
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function startSession(planId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('sessions').insert({
    workout_plan_id: planId,
    started_at: new Date().toISOString(),
  }).select('id').single();

  redirect(`/session/${data!.id}`);
}

export async function completeSet(sessionId: string, exerciseId: string, setData: {
  set_number: number;
  weight_kg?: number;
  reps?: number;
  duration_seconds?: number;
  intensity?: string;
}) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('session_sets').upsert({
    session_id: sessionId,
    exercise_id: exerciseId,
    set_number: setData.set_number,
    weight_kg: setData.weight_kg ?? null,
    reps: setData.reps ?? null,
    duration_seconds: setData.duration_seconds ?? null,
    intensity: setData.intensity ?? null,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'session_id,exercise_id,set_number' });

  // Note: need a unique constraint on (session_id, exercise_id, set_number) in schema
}

export async function finishSession(sessionId: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('sessions').update({
    finished_at: new Date().toISOString(),
  }).eq('id', sessionId);
  revalidatePath('/dashboard');
  revalidatePath('/history');
}
```

- [ ] **Step 2: Create ElapsedTimer component**

`src/components/session/elapsed-timer.tsx` — client component:
- Takes `startedAt` as prop
- Uses `useEffect` + `setInterval` to count up every second
- Displays as `MM:SS` or `HH:MM:SS`
- Blue gradient background, prominent font

- [ ] **Step 3: Create RestTimer component**

`src/components/session/rest-timer.tsx` — client component:
- Takes `seconds` prop (e.g., 120), `active` boolean, `onComplete` callback
- Counts down when active
- Yellow/amber background
- When reaches 0: trigger Web Audio API beep + navigator.vibrate (with try/catch)
- Calls `onComplete`

```typescript
// Audio beep
const playBeep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 200);
  } catch {}
};
```

- [ ] **Step 4: Create SetRow component**

`src/components/session/set-row.tsx` — client component:
- For weighted exercises: set number badge, weight input (number, step 0.5), reps input (number), intensity selector (dropdown with mod/int/pint/pmod)
- For timed exercises: set number badge, duration input (seconds) or a count-up timer button
- "Done" button — calls `completeSet` action
- Pre-filled values: from last session's data or exercise_defaults
- Visual states: completed (green, dimmed), current (highlighted), upcoming (gray, disabled)

- [ ] **Step 5: Create ExerciseTracker component**

`src/components/session/exercise-tracker.tsx` — client component:
- Manages state for the current exercise
- Renders SetRow for each set
- Shows completed checkmark when all sets done
- Handles expand/collapse
- Tracks which set is current

- [ ] **Step 6: Create SessionSummary component**

`src/components/session/session-summary.tsx` — modal/overlay:
- Shows total duration
- Total sets completed
- Highlights any new PRs (compare each exercise's max weight to historical max)
- "Back to Dashboard" button
- Optional notes input

- [ ] **Step 7: Build active session page**

`src/app/(authenticated)/session/[id]/page.tsx`:
- Server component that fetches session, plan, exercises with defaults, and any existing session_sets (for resume)
- Also fetches last session's data for this plan (for "defaults carry forward")
- Renders client wrapper with: ElapsedTimer, RestTimer, ExerciseTracker list, Finish button
- The client wrapper manages: which exercise is current, rest timer state, completion state

- [ ] **Step 8: Handle session creation route**

When user clicks "Start Session" from dashboard or plan view, call `startSession` action which creates the session row and redirects to `/session/{newId}`.

- [ ] **Step 9: Test active session flow**

Start a session from dashboard, verify timer works, log sets with weights, verify data saves to Supabase after each "Done", finish session, see summary.

- [ ] **Step 10: Commit**

```bash
git add src/actions/sessions.ts src/components/session/ src/app/\(authenticated\)/session/
git commit -m "feat: add active session tracking with timers and set logging"
```

---

## Chunk 5: Analytics & History (Tasks 10-11)

### Task 10: Progress & Charts

**Files:**
- Create: `src/components/progress/weight-chart.tsx`, `src/components/progress/volume-chart.tsx`, `src/components/progress/duration-chart.tsx`, `src/components/progress/frequency-chart.tsx`, `src/components/progress/pr-board.tsx`
- Modify: `src/app/(authenticated)/progress/page.tsx`

- [ ] **Step 1: Create WeightChart component**

`src/components/progress/weight-chart.tsx` — client component:
- Props: `data: { date: string; maxWeight: number; isPR: boolean }[]`
- Recharts `LineChart` with `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`
- PR points highlighted with a different color (gold dot)
- Blue line, dark-mode aware colors

- [ ] **Step 2: Create VolumeChart component**

`src/components/progress/volume-chart.tsx`:
- Props: `data: { date: string; volume: number }[]`
- Recharts `BarChart`
- Volume = sum(weight_kg × reps) per session for selected exercise

- [ ] **Step 3: Create DurationChart component**

`src/components/progress/duration-chart.tsx`:
- Props: `data: { date: string; minutes: number }[]`
- Recharts `LineChart` showing session duration over time
- All sessions, not per-exercise

- [ ] **Step 4: Create FrequencyChart component**

`src/components/progress/frequency-chart.tsx`:
- Props: `data: { week: string; count: number }[]`
- Recharts `BarChart` showing sessions per week

- [ ] **Step 5: Create PRBoard component**

`src/components/progress/pr-board.tsx`:
- Table/list of exercises with their PR weight + date achieved
- Sorted by most recent PR first
- Gold trophy icon for each
- Localized exercise names

- [ ] **Step 6: Build progress page**

`src/app/(authenticated)/progress/page.tsx` — server component:
- Fetch all exercises for the dropdown
- Fetch data for default selection (first exercise or all)
- Pass data to client wrapper that manages exercise selection
- When exercise changes: re-fetch data client-side from Supabase
- Layout: exercise selector at top, then charts stacked vertically, PR Board at bottom
- Duration + Frequency charts are global (not per-exercise)

- [ ] **Step 7: Test charts**

Need at least a couple sessions with logged data to see charts. Can manually insert test data or complete a couple sessions via the UI.

- [ ] **Step 8: Commit**

```bash
git add src/components/progress/ src/app/\(authenticated\)/progress/
git commit -m "feat: add progress charts with weight, volume, duration, frequency, and PR board"
```

---

### Task 11: Session History

**Files:**
- Create: `src/components/history/session-list.tsx`, `src/components/history/session-detail.tsx`
- Modify: `src/app/(authenticated)/history/page.tsx`

- [ ] **Step 1: Create SessionList component**

`src/components/history/session-list.tsx`:
- List of sessions ordered by `started_at` DESC
- Each card shows: plan name (or "Deleted Plan" if NULL), date formatted, duration, total sets completed
- Tap to expand/collapse detail
- Plan name uses locale-aware name

- [ ] **Step 2: Create SessionDetail component**

`src/components/history/session-detail.tsx`:
- Expanded view within the list item
- Groups session_sets by exercise
- Shows each set: weight × reps (intensity) or duration
- Highlights any sets that were PRs at the time

- [ ] **Step 3: Build history page**

`src/app/(authenticated)/history/page.tsx`:
- Server component fetching sessions with joins to workout_plans and session_sets
- Plan filter dropdown at top (all plans + each plan name)
- Passes data to client wrapper that handles filtering and expand/collapse
- Shows "No sessions yet" message if empty

- [ ] **Step 4: Test history page**

Complete a session via the UI (or manually insert test session data), navigate to `/history`, verify sessions appear, expand a session to see sets, test plan filter.

- [ ] **Step 5: Commit**

```bash
git add src/components/history/ src/app/\(authenticated\)/history/
git commit -m "feat: add session history with expandable details and plan filtering"
```

---

## Chunk 6: Settings & Deployment (Tasks 12-13)

### Task 12: Settings Page

**Files:**
- Modify: `src/app/(authenticated)/settings/page.tsx`
- Modify: `src/actions/auth.ts` (add changePassword)

- [ ] **Step 1: Build settings page**

`src/app/(authenticated)/settings/page.tsx`:
- **Language**: EN/PT toggle buttons (highlighted for current)
- **Theme**: Light/Dark/System selector (3 buttons, highlighted for current)
- **Change Password**: form with current password, new password, confirm — calls server action that verifies current, hashes new, updates `ADMIN_PASSWORD_HASH` (note: for simplicity, store in user_preferences or document that env var change requires Vercel redeploy; for dynamic password change, add a `password_hash` column to `user_preferences`)
- **Export Data**: button that fetches all data as JSON and triggers browser download
- **Logout**: button that calls `logout` action

- [ ] **Step 2: Verify password_hash column exists**

The `password_hash` column was already added to `user_preferences` in `001_schema.sql`. Verify `verifyPassword` in `src/lib/auth.ts` already checks the DB first and falls back to env var (implemented in Task 4).

- [ ] **Step 3: Add changePassword action**

```typescript
export async function changePassword(formData: FormData) {
  const current = formData.get('currentPassword') as string;
  const newPass = formData.get('newPassword') as string;

  const valid = await verifyPassword(current);
  if (!valid) return { error: 'Current password is incorrect' };

  const hash = await bcrypt.hash(newPass, 10);
  const supabase = await createServerSupabaseClient();
  await supabase.from('user_preferences')
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .not('id', 'is', null); // update the single row

  return { success: true };
}
```

- [ ] **Step 4: Add export data action**

Create `src/actions/export.ts`:

```typescript
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
  return { plans: plans.data, exercises: exercises.data, defaults: defaults.data, sessions: sessions.data, sets: sets.data };
}
```

Client-side in settings page: call action, create Blob, trigger download with `URL.createObjectURL`.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(authenticated\)/settings/ src/actions/auth.ts
git commit -m "feat: add settings page with language, theme, password change, and data export"
```

---

### Task 13: Supabase Setup, Polish & Vercel Deployment

**Files:**
- Various polish across all files

- [ ] **Step 1: Create Supabase project**

Go to supabase.com, create new project. Get:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 2: Run migrations in Supabase**

Go to Supabase SQL Editor. Run `001_schema.sql` then `002_seed.sql`.

- [ ] **Step 3: Disable RLS**

In Supabase dashboard, ensure RLS is disabled on all tables (or add permissive policies for anon).

- [ ] **Step 4: Update `.env.local` with real values**

Fill in Supabase URL, anon key, generated password hash, random cookie secret.

- [ ] **Step 5: Test full flow locally**

1. Login with password
2. See dashboard with 3 plans
3. View a plan's exercises
4. Start a session, log some sets, finish
5. Check progress charts
6. Check history
7. Toggle language and theme
8. Verify data persists on page refresh (Supabase)

- [ ] **Step 6: Build check**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 7: Deploy to Vercel**

```bash
npx vercel
```

Or connect GitHub repo to Vercel. Set environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PASSWORD_HASH`
- `COOKIE_SECRET`

- [ ] **Step 8: Test production deployment**

Verify all features work on the deployed URL.

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: production-ready GymTracker with Vercel deployment"
```
