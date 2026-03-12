-- Seed workout plans and exercises using CTE pattern

WITH plan1 AS (
  INSERT INTO workout_plans (name_en, name_pt, color, sort_order)
  VALUES ('Chest/Shoulder/Triceps', 'Peito/Ombro/Tríceps', 'from-blue-700 to-blue-500', 1)
  RETURNING id
),

-- Plan 1 Exercise 1: Flat Barbell Bench Press
ex1_1 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Flat Barbell Bench Press', 'Supino Reto com Barra Reta', 3, 8, 15, 120, false, 1 FROM plan1
  RETURNING id
),

-- Plan 1 Exercise 2: Incline Dumbbell Press
ex1_2 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Incline Dumbbell Press', 'Supino Inclinado com Halteres', 3, 15, 15, 120, false, 2 FROM plan1
  RETURNING id
),

-- Plan 1 Exercise 3: Machine Chest Fly
ex1_3 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Machine Chest Fly', 'Crucifixo Máquina', 3, 10, 12, 120, false, 3 FROM plan1
  RETURNING id
),

-- Plan 1 Exercise 4: Single-Arm Cable Lateral Raise
ex1_4 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Single-Arm Cable Lateral Raise', 'Elevação Lateral Unilateral na Polia Baixa neutra', 3, 10, 10, 120, false, 4 FROM plan1
  RETURNING id
),

-- Plan 1 Exercise 5: Seated Arnold Press
ex1_5 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Seated Arnold Press', 'Desenvolvimento Arnold Sentado', 3, 10, 10, 120, false, 5 FROM plan1
  RETURNING id
),

-- Plan 1 Exercise 6: Triceps Cable Pushdown
ex1_6 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Triceps Cable Pushdown', 'Tríceps na Polia com Barra Reta', 3, 12, 15, 120, false, 6 FROM plan1
  RETURNING id
),

-- Plan 1 Exercise 7: Dumbbell Skull Crushers
ex1_7 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Dumbbell Skull Crushers', 'Triceps Testa com Halteres', 3, 12, 12, 120, false, 7 FROM plan1
  RETURNING id
),

-- Plan 2: Back/Biceps
plan2 AS (
  INSERT INTO workout_plans (name_en, name_pt, color, sort_order)
  VALUES ('Back/Biceps', 'Costas/Bíceps', 'from-green-700 to-green-500', 2)
  RETURNING id
),

-- Plan 2 Exercise 1: Single-Arm Incline Dumbbell Row
ex2_1 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Single-Arm Incline Dumbbell Row', 'Remada Unilateral com Halteres no Banco Inclinado (Serrote)', 3, 15, 15, 120, false, 1 FROM plan2
  RETURNING id
),

-- Plan 2 Exercise 2: Machine Row (Neutral Grip)
ex2_2 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Machine Row (Neutral Grip)', 'Remada Máquina (Pegada Neutra)', 3, 15, 15, 120, false, 2 FROM plan2
  RETURNING id
),

-- Plan 2 Exercise 3: Wide Grip Lat Pulldown
ex2_3 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Wide Grip Lat Pulldown', 'Puxada Aberta Barra reta', 3, 15, 15, 120, false, 3 FROM plan2
  RETURNING id
),

-- Plan 2 Exercise 4: Single-Arm Supinated Cable Row (no defaults)
ex2_4 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Single-Arm Supinated Cable Row', 'Remada Baixa unilateral supinada', 3, 10, 15, 120, false, 4 FROM plan2
  RETURNING id
),

-- Plan 2 Exercise 5: Alternating Incline Dumbbell Curl (no defaults)
ex2_5 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Alternating Incline Dumbbell Curl', 'Rosca Alternada Banco Inclinado', 3, 10, 15, 120, false, 5 FROM plan2
  RETURNING id
),

-- Plan 2 Exercise 6: Alternating Dumbbell Preacher Curl
ex2_6 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Alternating Dumbbell Preacher Curl', 'Rosca Scott Alternada com Halteres', 3, 15, 15, 120, false, 6 FROM plan2
  RETURNING id
),

-- Plan 3: Lower Body
plan3 AS (
  INSERT INTO workout_plans (name_en, name_pt, color, sort_order)
  VALUES ('Lower Body', 'Membros Inferiores', 'from-orange-700 to-orange-500', 3)
  RETURNING id
),

-- Plan 3 Exercise 1: Barbell Hip Thrust (no defaults)
ex3_1 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Barbell Hip Thrust', 'Elevação de Quadril com Barra', 3, 10, 15, 120, false, 1 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 2: Leg Extension Machine
ex3_2 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Leg Extension Machine', 'Cadeira Extensora', 3, 13, 15, 120, false, 2 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 3: Single-Leg Extension
ex3_3 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Single-Leg Extension', 'Cadeira Extensora Unilateral', 3, 10, 10, 120, false, 3 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 4: Single-Leg Curl
ex3_4 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Single-Leg Curl', 'Cadeira Flexora Unilateral', 3, 12, 15, 120, false, 4 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 5: Single-Leg Hip Thrust (timed)
ex3_5 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Single-Leg Hip Thrust', 'Elevação de Quadril Unilateral', 3, 0, 0, 120, true, 5 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 6: Isometric Plank (timed)
ex3_6 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Isometric Plank', 'Abdominal Prancha Isométrica', 3, 0, 0, 60, true, 6 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 7: Low Side Plank (timed)
ex3_7 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Low Side Plank', 'Prancha Isometrica Lateral Baixa', 3, 0, 0, 60, true, 7 FROM plan3
  RETURNING id
),

-- Plan 3 Exercise 8: Plank with Alternating Leg Lifts (timed)
ex3_8 AS (
  INSERT INTO exercises (workout_plan_id, name_en, name_pt, sets_count, reps_min, reps_max, rest_seconds, is_timed, sort_order)
  SELECT id, 'Plank with Alternating Leg Lifts', 'Prancha Isométrica Alternando Membros Inferiores', 3, 0, 0, 60, true, 8 FROM plan3
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 1: Flat Barbell Bench Press
d_ex1_1 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 15.0, 12, 'mod' FROM ex1_1
  UNION ALL
  SELECT id, 2, 17.5, 10, 'mod' FROM ex1_1
  UNION ALL
  SELECT id, 3, 17.5, 8, 'pint' FROM ex1_1
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 2: Incline Dumbbell Press
d_ex1_2 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 17.5, 15, 'pint' FROM ex1_2
  UNION ALL
  SELECT id, 2, 20.0, 15, 'pint' FROM ex1_2
  UNION ALL
  SELECT id, 3, 20.0, 15, 'pint' FROM ex1_2
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 3: Machine Chest Fly
d_ex1_3 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 45.0, 12, 'pmod' FROM ex1_3
  UNION ALL
  SELECT id, 2, 52.0, 11, 'mod' FROM ex1_3
  UNION ALL
  SELECT id, 3, 54.0, 10, 'pint' FROM ex1_3
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 4: Single-Arm Cable Lateral Raise
d_ex1_4 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 6.0, 10, 'int' FROM ex1_4
  UNION ALL
  SELECT id, 2, 6.0, 10, 'int' FROM ex1_4
  UNION ALL
  SELECT id, 3, 6.0, 10, 'int' FROM ex1_4
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 5: Seated Arnold Press
d_ex1_5 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 10.0, 10, 'mod' FROM ex1_5
  UNION ALL
  SELECT id, 2, 12.5, 10, 'mod' FROM ex1_5
  UNION ALL
  SELECT id, 3, 12.5, 10, 'mod' FROM ex1_5
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 6: Triceps Cable Pushdown
d_ex1_6 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 20.0, 15, 'mod' FROM ex1_6
  UNION ALL
  SELECT id, 2, 20.5, 13, 'mod' FROM ex1_6
  UNION ALL
  SELECT id, 3, 25.0, 12, 'mod' FROM ex1_6
  RETURNING id
),

-- Exercise defaults for Plan 1 Exercise 7: Dumbbell Skull Crushers
d_ex1_7 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 7.5, 12, 'mod' FROM ex1_7
  UNION ALL
  SELECT id, 2, 7.5, 12, 'mod' FROM ex1_7
  UNION ALL
  SELECT id, 3, 7.5, 12, 'mod' FROM ex1_7
  RETURNING id
),

-- Exercise defaults for Plan 2 Exercise 1: Single-Arm Incline Dumbbell Row
d_ex2_1 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 15.0, 15, 'mod' FROM ex2_1
  UNION ALL
  SELECT id, 2, 17.5, 15, 'mod' FROM ex2_1
  UNION ALL
  SELECT id, 3, 12.5, 15, 'mod' FROM ex2_1
  RETURNING id
),

-- Exercise defaults for Plan 2 Exercise 2: Machine Row
d_ex2_2 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 58.0, 15, 'mod' FROM ex2_2
  UNION ALL
  SELECT id, 2, 58.0, 15, 'mod' FROM ex2_2
  UNION ALL
  SELECT id, 3, 58.0, 15, 'mod' FROM ex2_2
  RETURNING id
),

-- Exercise defaults for Plan 2 Exercise 3: Wide Grip Lat Pulldown
d_ex2_3 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 50.0, 15, 'mod' FROM ex2_3
  UNION ALL
  SELECT id, 2, 59.0, 15, 'mod' FROM ex2_3
  UNION ALL
  SELECT id, 3, 59.0, 15, 'mod' FROM ex2_3
  RETURNING id
),

-- Exercise defaults for Plan 2 Exercise 6: Alternating Dumbbell Preacher Curl
d_ex2_6 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 15.0, 15, 'mod' FROM ex2_6
  UNION ALL
  SELECT id, 2, 15.0, 15, 'mod' FROM ex2_6
  UNION ALL
  SELECT id, 3, 15.0, 15, 'mod' FROM ex2_6
  RETURNING id
),

-- Exercise defaults for Plan 3 Exercise 2: Leg Extension Machine
d_ex3_2 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 32.5, 13, 'pint' FROM ex3_2
  UNION ALL
  SELECT id, 2, 32.5, 15, 'int' FROM ex3_2
  UNION ALL
  SELECT id, 3, 32.5, 15, 'int' FROM ex3_2
  RETURNING id
),

-- Exercise defaults for Plan 3 Exercise 3: Single-Leg Extension
d_ex3_3 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 18.5, 10, 'int' FROM ex3_3
  UNION ALL
  SELECT id, 2, 18.5, 10, 'int' FROM ex3_3
  UNION ALL
  SELECT id, 3, 18.5, 10, 'int' FROM ex3_3
  RETURNING id
),

-- Exercise defaults for Plan 3 Exercise 4: Single-Leg Curl
d_ex3_4 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, weight_kg, reps, intensity)
  SELECT id, 1, 26.0, 15, 'mod' FROM ex3_4
  UNION ALL
  SELECT id, 2, 32.5, 15, 'mod' FROM ex3_4
  UNION ALL
  SELECT id, 3, 38.9, 12, 'int' FROM ex3_4
  RETURNING id
),

-- Exercise defaults for Plan 3 Exercise 5: Single-Leg Hip Thrust (timed, 20s each)
d_ex3_5 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, duration_seconds)
  SELECT id, 1, 20 FROM ex3_5
  UNION ALL
  SELECT id, 2, 20 FROM ex3_5
  UNION ALL
  SELECT id, 3, 20 FROM ex3_5
  RETURNING id
),

-- Exercise defaults for Plan 3 Exercise 6: Isometric Plank (timed, 30s each)
d_ex3_6 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, duration_seconds)
  SELECT id, 1, 30 FROM ex3_6
  UNION ALL
  SELECT id, 2, 30 FROM ex3_6
  UNION ALL
  SELECT id, 3, 30 FROM ex3_6
  RETURNING id
),

-- Exercise defaults for Plan 3 Exercise 7: Low Side Plank (timed, 30s each)
d_ex3_7 AS (
  INSERT INTO exercise_defaults (exercise_id, set_number, duration_seconds)
  SELECT id, 1, 30 FROM ex3_7
  UNION ALL
  SELECT id, 2, 30 FROM ex3_7
  UNION ALL
  SELECT id, 3, 30 FROM ex3_7
  RETURNING id
)

-- Exercise defaults for Plan 3 Exercise 8: Plank with Alternating Leg Lifts (timed, 30s each)
INSERT INTO exercise_defaults (exercise_id, set_number, duration_seconds)
SELECT id, 1, 30 FROM ex3_8
UNION ALL
SELECT id, 2, 30 FROM ex3_8
UNION ALL
SELECT id, 3, 30 FROM ex3_8;
