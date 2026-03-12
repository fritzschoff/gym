CREATE TABLE workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_pt text NOT NULL,
  color text NOT NULL DEFAULT 'from-blue-600 to-blue-400',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'system',
  password_hash text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO user_preferences (language, theme) VALUES ('en', 'system');

CREATE INDEX idx_exercises_plan ON exercises(workout_plan_id);
CREATE INDEX idx_exercise_defaults_exercise ON exercise_defaults(exercise_id);
CREATE INDEX idx_sessions_plan ON sessions(workout_plan_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_session_sets_session ON session_sets(session_id);
CREATE INDEX idx_session_sets_exercise ON session_sets(exercise_id);
