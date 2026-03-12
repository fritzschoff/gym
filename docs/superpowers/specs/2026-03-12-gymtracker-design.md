# GymTracker — Design Specification

## Overview

A mobile-first Next.js web application for tracking gym workouts, deployed to Vercel. The app is pre-loaded with 3 workout splits from the user's MFitPersonal training plan and supports full CRUD on workout plans, live session tracking with timers, progress charts, and personal records. Single-user with password protection, bilingual (EN/PT), light/dark mode, multi-device sync via Supabase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| i18n | next-intl |
| Deployment | Vercel |
| Sync | Supabase real-time subscriptions |

## Data Model

### `workout_plans`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| name_en | text | English name |
| name_pt | text | Portuguese name |
| color | text | Gradient CSS for card display |
| sort_order | int | Display order |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `exercises`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| workout_plan_id | uuid (FK) | References workout_plans |
| name_en | text | English name |
| name_pt | text | Portuguese name |
| sets_count | int | Number of sets (default 3) |
| reps_min | int | Min target reps (default 10) |
| reps_max | int | Max target reps (default 15) |
| rest_seconds | int | Rest interval (default 120) |
| is_timed | boolean | True for isometric/timed exercises |
| sort_order | int | Display order within plan |
| created_at | timestamptz | Auto-set |

### `exercise_defaults`

Default weight/reps/intensity per set — represents the "plan" values shown before starting a session.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| exercise_id | uuid (FK) | References exercises |
| set_number | int | 1, 2, 3, etc. |
| weight_kg | decimal | Default weight (NULL for exercises without defaults) |
| reps | int | Default reps (NULL for timed exercises) |
| duration_seconds | int | Default duration for timed exercises (NULL for weighted) |
| intensity | text | See intensity codes below (NULL for timed exercises) |

### Intensity Codes

| Code | Meaning (PT) | Meaning (EN) | Description |
|------|-------------|--------------|-------------|
| mod | moderado | moderate | Comfortable effort, could do more reps |
| int | intenso | intense | Hard effort, near failure |
| pint | pouco intenso | low intensity | Light effort, warm-up level |
| pmod | pouco moderado | low moderate | Between light and moderate |

### `sessions`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| workout_plan_id | uuid (FK) | References workout_plans |
| started_at | timestamptz | Session start time |
| finished_at | timestamptz | Null until finished |
| notes | text | Optional session notes |
| created_at | timestamptz | Auto-set |

### `session_sets`

Actual logged data during a workout session.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| session_id | uuid (FK) | References sessions |
| exercise_id | uuid (FK) | References exercises |
| set_number | int | 1, 2, 3, etc. |
| weight_kg | decimal | Actual weight used |
| reps | int | Actual reps completed |
| duration_seconds | int | For timed exercises |
| intensity | text | mod/int/pint/pmod |
| completed | boolean | Whether set was completed |
| completed_at | timestamptz | When set was marked done |

### `user_preferences`

Single-row table for syncing settings across devices.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated (single row) |
| language | text | 'en' or 'pt' |
| theme | text | 'light', 'dark', or 'system' |
| updated_at | timestamptz | Auto-set |

### Data Rules

- **Personal Records** are computed at query time as `MAX(weight_kg)` per exercise from `session_sets` (excluding timed exercises), not stored separately.
- **Timed exercises** in `session_sets`: `weight_kg`, `reps`, and `intensity` are NULL; only `duration_seconds` is populated. Timed exercises are excluded from weight-based PR computation.
- **Exercises without defaults**: `exercise_defaults` rows are not created. In the UI, the Plan View shows "Not set" and the Active Session shows empty inputs for the user to fill in.

## Screens

### 1. Password Gate (`/`)

- Full-screen password input
- Password: bcrypt hash stored in `ADMIN_PASSWORD_HASH` environment variable (set in Vercel env vars)
- On success: sets HTTP-only cookie, redirects to dashboard
- Cookie checked via Next.js middleware on all routes

### 2. Dashboard (`/dashboard`)

- Top bar: app logo, language toggle (EN/PT), theme toggle (light/dark)
- Quick stats row: sessions this week, current streak, new PRs count
- 3 workout plan cards with gradient backgrounds:
  - Plan name (localized)
  - Exercise count
  - "Last: X days ago" from most recent session
  - "Start Session" button
- Bottom navigation: Home, Progress, History, Settings

### 3. Workout Plan View (`/plan/[id]`)

- Plan name header with edit button
- List of exercise cards, each showing:
  - Exercise name (localized)
  - Sets with default weight/reps/intensity
  - Rest interval
- CRUD actions:
  - Add new exercise (name EN/PT, sets, reps range, rest interval)
  - Edit exercise details
  - Delete exercise (with confirmation)
  - Reorder exercises (up/down arrows)
- "Start Session" button at top
- "Add New Plan" option from dashboard for creating entirely new splits

### 4. Active Session (`/session/[id]`)

- Header: plan name, back button, end button
- Elapsed timer: counts up from session start, prominent display
- Rest countdown timer: appears after completing a set, counts down from rest_seconds (default 120s), yellow/amber styling, browser vibration + Web Audio API beep when done (gracefully degrades if not permitted)
- Exercise list:
  - Completed exercises: collapsed, green checkmark, dimmed
  - Current exercise: expanded with set-by-set view
    - Each set shows: set number, weight input, reps input, intensity badge
    - "Done" button per set — saves set to Supabase immediately, then starts rest timer
    - Pre-filled with last session's actual values if available, otherwise from exercise_defaults, editable inline
    - For exercises without defaults: empty inputs for weight/reps
  - Upcoming exercises: collapsed, showing name and weight range
- "Finish Workout" button: ends session, saves finished_at, shows summary
- Session summary modal on finish: duration, sets completed, any new PRs

### 5. Progress & Charts (`/progress`)

- Exercise selector dropdown (all exercises across all plans)
- **Weight Progression**: line chart showing max weight per session over time, PR markers
- **Volume Tracking**: bar chart of total volume (sets × reps × weight) per session
- **Session Duration**: line chart of workout duration over time
- **Session Frequency**: bar chart of sessions per week/month
- **PR Board**: table of personal records per exercise, with date achieved and badge

### 6. Session History (`/history`)

- List of past sessions, newest first
- Each entry shows: plan name, date, duration, sets completed
- Tap to expand: full session detail with all logged sets
- Filter by workout plan
- Compare mode (v2 — deferred): select 2 sessions to see side-by-side comparison

### 7. Settings (`/settings`)

- Language toggle: EN / PT
- Theme: Light / Dark / System
- Change password
- Export data (JSON download)

## Authentication

Simple password gate — not a full auth system:

1. User enters password on the gate screen
2. Server Action compares bcrypt hash
3. On match: sets an HTTP-only cookie (`gymtracker_auth`) signed with `COOKIE_SECRET` env var (random string set in Vercel), 30-day expiry
4. Next.js middleware checks cookie on every request; redirects to `/` if missing/invalid
5. No user accounts, no email, no OAuth

## Internationalization

Using `next-intl`:

- Two locales: `en` and `pt`
- Language stored in `user_preferences` table (synced across devices) and mirrored to cookie for SSR
- All UI strings in translation files
- Exercise names stored as `name_en` and `name_pt` in database
- Default: browser language preference, fallback to EN

## Theme

- Tailwind CSS `dark:` variant classes
- Theme preference stored in `user_preferences` table (synced across devices) and mirrored to cookie/localStorage for SSR and flash prevention
- Three options: Light, Dark, System (follows OS preference)
- Default: System

## Seed Data

Pre-loaded from the user's MFitPersonal screenshots:

### Peito/Ombro/Triceps (Chest/Shoulder/Triceps)
1. Supino Reto com Barra Reta / Flat Barbell Bench Press — 3 sets: 15kg/12reps/mod, 17.5kg/10reps/mod, 17.5kg/8reps/pint
2. Supino Inclinado com Halteres / Incline Dumbbell Press — 3 sets: 17.5kg/15reps/pint, 20kg/15reps/pint, 20kg/15reps/pint
3. Crucifixo Máquina / Machine Chest Fly — 3 sets: 45kg/12reps/pmod, 52kg/11reps/mod, 54kg/10reps/pint
4. Elevação Lateral Unilateral na Polia Baixa neutra / Single-Arm Cable Lateral Raise — 3 sets: 6kg/10reps/int, 6kg/10reps/int, 6kg/10reps/int
5. Desenvolvimento Arnold Sentado / Seated Arnold Press — 3 sets: 10kg/10reps/mod, 12.5kg/10reps/mod, 12.5kg/10reps/mod
6. Tríceps na Polia com Barra Reta / Triceps Cable Pushdown — 3 sets: 20kg/15reps/mod, 20.5kg/13reps/mod, 25kg/12reps/mod
7. Triceps Testa com Halteres / Dumbbell Skull Crushers — 3 sets: 7.5kg/12reps/mod, 7.5kg/12reps/mod, 7.5kg/12reps/mod

### Costas/Biceps (Back/Biceps)
1. Remada Unilateral com Halteres no Banco Inclinado (Serrote) / Single-Arm Incline Dumbbell Row — 3 sets: 15kg/15reps/mod, 17.5kg/15reps/mod, 12.5kg/15reps/mod
2. Remada Máquina (Pegada Neutra) / Machine Row (Neutral Grip) — 3 sets: 58kg/15reps/mod, 58kg/15reps/mod, 58kg/15reps/mod
3. Puxada Aberta Barra reta / Wide Grip Lat Pulldown — 3 sets: 50kg/15reps/mod, 59kg/15reps/mod, 59kg/15reps/mod
4. Remada Baixa unilateral supinada / Single-Arm Supinated Cable Row — 3 sets: no defaults (new exercise, weights not yet set)
5. Rosca Alternada Banco Inclinado / Alternating Incline Dumbbell Curl — 3 sets: no defaults (new exercise, weights not yet set)
6. Rosca Scott Alternada com Halteres / Alternating Dumbbell Preacher Curl — 3 sets: 15kg/15reps/mod, 15kg/15reps/mod, 15kg/15reps/mod

### Inferiores (Lower Body)
1. Elevação de Quadril com Barra / Barbell Hip Thrust — 3 sets: no defaults (weights not yet set)
2. Cadeira Extensora / Leg Extension Machine — 3 sets: 32.5kg/13reps/pint, 32.5kg/15reps/int, 32.5kg/15reps/int
3. Cadeira Extensora Unilateral / Single-Leg Extension — 3 sets: 18.5kg/10reps/int, 18.5kg/10reps/int, 18.5kg/10reps/int
4. Cadeira Flexora Unilateral / Single-Leg Curl — 3 sets: 26kg/15reps/mod, 32.5kg/15reps/mod, 38.9kg/12reps/int
5. Elevação de Quadril Unilateral / Single-Leg Hip Thrust — 3 sets: 20s (is_timed=true)
6. Abdominal Prancha Isométrica / Isometric Plank — 3 sets: 30s (is_timed=true)
7. Prancha Isometrica Lateral Baixa / Low Side Plank — 3 sets: 30s (is_timed=true)
8. Prancha Isométrica Alternando Membros Inferiores / Plank with Alternating Leg Lifts — 3 sets: 30s (is_timed=true)

## Supabase Configuration

- **RLS**: Disabled. Single-user app uses the Supabase anon key. No row-level security policies needed since there is only one user.
- **Cascade deletes**: Foreign keys use `ON DELETE CASCADE` for structural data:
  - Deleting an exercise cascades to its exercise_defaults
  - Deleting a session cascades to its session_sets
  - Deleting a workout_plan cascades to its exercises and exercise_defaults
  - **Sessions are preserved** when a workout_plan is deleted: `sessions.workout_plan_id` is set to NULL (`ON DELETE SET NULL`) so historical data survives in Progress and History screens

## Key Behaviors

- **Rest timer auto-starts** after marking a set as done
- **Defaults carry forward**: when starting a session, sets are pre-filled with the last session's actual values (not the original defaults), so progressive overload is easy
- **PR detection**: after finishing a session, compare logged weights to historical max — highlight new PRs in the summary
- **Save on each set**: each set is saved to Supabase immediately when the user taps "Done". The session record is created on "Start Session". If the browser tab closes mid-workout, all completed sets are preserved. The session stays in an "unfinished" state (finished_at = NULL) and can be resumed from any device.
- **Responsive**: mobile-first but works on desktop too — cards stack on mobile, grid on desktop
