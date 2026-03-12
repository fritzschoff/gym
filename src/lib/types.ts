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
  password_hash: string | null;
  updated_at: string;
}

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
