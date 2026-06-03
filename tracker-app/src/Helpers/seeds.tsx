import { createExercise, createSession, createSessionExercise } from "./APIfunctions";
import type { bar, exercise, session, sessionExercise } from "./customTypes";
import { bars } from "../assets/bars";


const exercises: exercise[] = [
  { "exerciseId": "0", "name": "Abductor Machine", "group": "Legs", "target": "Hip Abductors", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "1", "name": "Adductor Machine", "group": "Legs", "target": "Hip Adductors", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "2", "name": "Arnold Press", "group": "Shoulders", "target": "Front Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "3", "name": "Barbell Skull Crushers", "group": "Arms", "target": "Triceps", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "4", "name": "Dumbbell Skull Crushers", "group": "Arms", "target": "Triceps", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "5", "name": "Barbell Bench Press", "group": "Chest", "target": "Pectorals", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "6", "name": "Dumbbell Bench Press", "group": "Chest", "target": "Pectorals", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "7", "name": "Barbell Bent-Over Row", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "8", "name": "Dumbbell Bent-Over Row", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "9", "name": "Barbell Bicep Curls", "group": "Arms", "target": "Biceps", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "10", "name": "Dumbbell Bicep Curls", "group": "Arms", "target": "Biceps", "ppl": "Pull", "author": "Dev" },
  // { "exerciseId": "11", "name": "Burpees", "group": "Full Body", "target": "Full Body", "ppl": "Cardio", "author": "Dev" },
  { "exerciseId": "12", "name": "Cable Crossovers", "group": "Chest", "target": "Inner Chest", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "13", "name": "Cable Crunches", "group": "Core", "target": "Abdominals", "ppl": "Core", "author": "Dev" },
  { "exerciseId": "14", "name": "Cable Kick Backs", "group": "Legs", "target": "Glutes", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "15", "name": "Cable Pull-Throughs", "group": "Legs", "target": "Glutes", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "16", "name": "Cable Row", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "17", "name": "Calf Raises", "group": "Legs", "target": "Calves", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "18", "name": "Chest Dips", "group": "Chest", "target": "Lower Chest", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "19", "name": "Chin-Ups", "group": "Back", "target": "Lats", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "20", "name": "Barbell Clean and Press", "group": "Full Body", "target": "Full Body", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "21", "name": "Kettel Clean and Press", "group": "Full Body", "target": "Full Body", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "22", "name": "Crunches", "group": "Core", "target": "Abdominals", "ppl": "Core", "author": "Dev" },
  { "exerciseId": "24", "name": "Deadlift", "group": "Back", "target": "Lower Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "25", "name": "Barbell Decline Bench Press", "group": "Chest", "target": "Lower Chest", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "26", "name": "Dumbbell Decline Bench Press", "group": "Chest", "target": "Lower Chest", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "27", "name": "Dips", "group": "Arms", "target": "Triceps", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "28", "name": "Dumbbell Flyes", "group": "Chest", "target": "Pectorals", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "29", "name": "Face Pulls", "group": "Shoulders", "target": "Rear Delts", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "30", "name": "Farmer's Carries", "group": "Full Body", "target": "Traps", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "32", "name": "Barbell Front Raises", "group": "Shoulders", "target": "Front Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "33", "name": "Dumbbell Front Raises", "group": "Shoulders", "target": "Front Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "34", "name": "Front Squats", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "35", "name": "Glute Kickbacks", "group": "Legs", "target": "Glutes", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "36", "name": "Goblet Squats", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "37", "name": "Hack Squat", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "38", "name": "Hammer Curls", "group": "Arms", "target": "Brachialis", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "39", "name": "Hamstring Curls", "group": "Legs", "target": "Hamstrings", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "40", "name": "Barbell Hip Thrust", "group": "Legs", "target": "Glutes", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "41", "name": "Dumbbell Hip Thrust", "group": "Legs", "target": "Glutes", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "42", "name": "Barbell Incline Bench Press", "group": "Chest", "target": "Upper Chest", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "43", "name": "Dumbbell Incline Bench Press", "group": "Chest", "target": "Upper Chest", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "44", "name": "Kettlebell Swings", "group": "Full Body", "target": "Hamstrings", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "45", "name": "Lat Flys", "group": "Shoulders", "target": "Side Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "46", "name": "Lat Pulldown", "group": "Back", "target": "Lats", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "47", "name": "Lateral Raises", "group": "Shoulders", "target": "Side Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "48", "name": "Leaning Cable Raise", "group": "Shoulders", "target": "Side Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "49", "name": "Leg Curl", "group": "Legs", "target": "Hamstrings", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "50", "name": "Leg Extension", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "51", "name": "Leg Press", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "52", "name": "Leg Raises", "group": "Core", "target": "Lower Abs", "ppl": "Core", "author": "Dev" },
  { "exerciseId": "53", "name": "Lunges", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "55", "name": "Barbell Overhead Press", "group": "Shoulders", "target": "Front Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "56", "name": "Dumbbell Overhead Press", "group": "Shoulders", "target": "Front Delts", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "57", "name": "Barbell Overhead Tricep Extension", "group": "Arms", "target": "Triceps", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "58", "name": "Dumbbell Overhead Tricep Extension", "group": "Arms", "target": "Triceps", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "59", "name": "Pec Fly", "group": "Chest", "target": "Pectorals", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "60", "name": "Barbell Preacher Curls", "group": "Arms", "target": "Biceps", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "61", "name": "Dumbbell Preacher Curls", "group": "Arms", "target": "Biceps", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "62", "name": "Prisoner Back Extension", "group": "Back", "target": "Lower Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "63", "name": "Pull-Ups", "group": "Back", "target": "Lats", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "64", "name": "Push-Ups", "group": "Chest", "target": "Pectorals", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "65", "name": "Rear Delt Flyes", "group": "Shoulders", "target": "Rear Delts", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "66", "name": "Resistance Band Pull-Aparts", "group": "Shoulders", "target": "Rear Delts", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "67", "name": "Barbell Reverse Lunges", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "68", "name": "Dumbbell Reverse Lunges", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "69", "name": "Barbell Romanian Deadlift", "group": "Legs", "target": "Hamstrings", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "70", "name": "Dumbbell Romanian Deadlift", "group": "Legs", "target": "Hamstrings", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "71", "name": "Barbell Rows", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "72", "name": "Dumbbell Rows", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "73", "name": "Seated Cable Row", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "74", "name": "Single-Arm Dumbbell Row", "group": "Back", "target": "Lats", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "75", "name": "Barbell Squats", "group": "Legs", "target": "Quadriceps", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "76", "name": "Sumo Deadlift", "group": "Legs", "target": "Glutes", "ppl": "Legs", "author": "Dev" },
  { "exerciseId": "78", "name": "Supported Rows", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "79", "name": "Glute Dives", "group": "Full Body", "target": "Shoulders", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "81", "name": "Tricep Pushdowns", "group": "Arms", "target": "Triceps", "ppl": "Push", "author": "Dev" },
  { "exerciseId": "82", "name": "TRX Rows", "group": "Back", "target": "Middle Back", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "83", "name": "Barbell Upright Rows", "group": "Shoulders", "target": "Traps", "ppl": "Pull", "author": "Dev" },
  { "exerciseId": "84", "name": "Dumbbell Upright Rows", "group": "Shoulders", "target": "Traps", "ppl": "Pull", "author": "Dev" },
]


const sessions: session[] = [
  { sessionId: "sess_1",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2024-08-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_2",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2024-09-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_3",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2024-10-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_4",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2024-11-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_5",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2024-12-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_6",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-01-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_7",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-02-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_8",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-03-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_9",  userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-04-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_10", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-05-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_11", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-06-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_12", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-07-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_13", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-08-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_14", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-09-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_15", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-10-01", focus: null, notes: "Historical import" },
  { sessionId: "sess_16", userId: "e9ce44e8-a001-7013-8050-0ac56f4a06f6", userWeight: 0, dateDone: "2025-11-01", focus: null, notes: "Historical import" },
];


const sessionsExercises: sessionExercise[] = [
 // ─── Aug 2024 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_001", sessionId: "sess_1", exerciseId: "64", toFailure: false, sets: "0x10" },          // Push-Ups
  { sessionExerciseId: "se_002", sessionId: "sess_1", exerciseId: "5",  toFailure: false, sets: "15x10" },   // Barbell Bench Press
  { sessionExerciseId: "se_003", sessionId: "sess_1", exerciseId: "42", toFailure: false, sets: "10x10" },   // Barbell Incline Bench Press
  { sessionExerciseId: "se_004", sessionId: "sess_1", exerciseId: "59", toFailure: false, sets: "47x10" },   // Pec Fly
  { sessionExerciseId: "se_005", sessionId: "sess_1", exerciseId: "28", toFailure: false, sets: "9x10" },    // Dumbbell Flyes (Cord flys)
  { sessionExerciseId: "se_006", sessionId: "sess_1", exerciseId: "25", toFailure: false, sets: "16.25x10" },// Barbell Decline Bench Press
  { sessionExerciseId: "se_007", sessionId: "sess_1", exerciseId: "55", toFailure: false, sets: "25x10" },   // Barbell Overhead Press
  { sessionExerciseId: "se_008", sessionId: "sess_1", exerciseId: "61", toFailure: false, sets: "5x10" },    // Dumbbell Preacher Curls
  { sessionExerciseId: "se_009", sessionId: "sess_1", exerciseId: "81", toFailure: false, sets: "21.25x10" },// Tricep Pushdowns
  { sessionExerciseId: "se_010", sessionId: "sess_1", exerciseId: "45", toFailure: false, sets: "7.5x10" },  // Lat Flys
  { sessionExerciseId: "se_011", sessionId: "sess_1", exerciseId: "16", toFailure: false, sets: "23.5x10" }, // Cable Row
  { sessionExerciseId: "se_012", sessionId: "sess_1", exerciseId: "46", toFailure: false, sets: "45x10" },   // Lat Pulldown
  { sessionExerciseId: "se_013", sessionId: "sess_1", exerciseId: "36", toFailure: false, sets: "10x10" },   // Goblet Squats
  { sessionExerciseId: "se_014", sessionId: "sess_1", exerciseId: "49", toFailure: false, sets: "54x10" },   // Leg Curl
  { sessionExerciseId: "se_015", sessionId: "sess_1", exerciseId: "37", toFailure: false, sets: "47.6x10" }, // Hack Squat
  { sessionExerciseId: "se_016", sessionId: "sess_1", exerciseId: "52", toFailure: false, sets: "0x10" },          // Leg Raises
  { sessionExerciseId: "se_017", sessionId: "sess_1", exerciseId: "56", toFailure: false, sets: "7x10" },    // Dumbbell Overhead Press

  // ─── Sep 2024 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_018", sessionId: "sess_2", exerciseId: "5",  toFailure: false, sets: "20x10" },
  { sessionExerciseId: "se_019", sessionId: "sess_2", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_020", sessionId: "sess_2", exerciseId: "59", toFailure: false, sets: "61x10" },
  { sessionExerciseId: "se_021", sessionId: "sess_2", exerciseId: "28", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_022", sessionId: "sess_2", exerciseId: "55", toFailure: false, sets: "30x10" },
  { sessionExerciseId: "se_023", sessionId: "sess_2", exerciseId: "61", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_024", sessionId: "sess_2", exerciseId: "81", toFailure: false, sets: "23.75x10" },
  { sessionExerciseId: "se_025", sessionId: "sess_2", exerciseId: "45", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_026", sessionId: "sess_2", exerciseId: "10", toFailure: false, sets: "15x10" },   // Dumbbell Bicep Curls
  { sessionExerciseId: "se_027", sessionId: "sess_2", exerciseId: "16", toFailure: false, sets: "27x10" },
  { sessionExerciseId: "se_028", sessionId: "sess_2", exerciseId: "46", toFailure: false, sets: "61x10" },   // Wide
  { sessionExerciseId: "se_029", sessionId: "sess_2", exerciseId: "46", toFailure: false, sets: "49.5x10" }, // Narrow
  { sessionExerciseId: "se_030", sessionId: "sess_2", exerciseId: "78", toFailure: false, sets: "30x10" },   // Supported Rows
  { sessionExerciseId: "se_031", sessionId: "sess_2", exerciseId: "71", toFailure: false, sets: "22.5x10" }, // Barbell Rows
  { sessionExerciseId: "se_032", sessionId: "sess_2", exerciseId: "49", toFailure: false, sets: "70.5x10" }, // Leg Curl
  { sessionExerciseId: "se_033", sessionId: "sess_2", exerciseId: "50", toFailure: false, sets: "77.5x10" }, // Leg Extension
  { sessionExerciseId: "se_034", sessionId: "sess_2", exerciseId: "37", toFailure: false, sets: "77.5x10" },
  { sessionExerciseId: "se_035", sessionId: "sess_2", exerciseId: "51", toFailure: false, sets: "80x10" },   // Leg Press
  { sessionExerciseId: "se_036", sessionId: "sess_2", exerciseId: "17", toFailure: false, sets: "0x10" },          // Calf Raises
  { sessionExerciseId: "se_037", sessionId: "sess_2", exerciseId: "67", toFailure: false, sets: "5x10" },    // Reverse Lunges
  { sessionExerciseId: "se_039", sessionId: "sess_2", exerciseId: "49", toFailure: false, sets: "95x10" },   // Belly leg curls
  { sessionExerciseId: "se_040", sessionId: "sess_2", exerciseId: "56", toFailure: false, sets: "17.5x10" },

  // ─── Oct 2024 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_041", sessionId: "sess_3", exerciseId: "5",  toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_042", sessionId: "sess_3", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_043", sessionId: "sess_3", exerciseId: "59", toFailure: false, sets: "68x10" },
  { sessionExerciseId: "se_044", sessionId: "sess_3", exerciseId: "28", toFailure: false, sets: "11.25x10" },
  { sessionExerciseId: "se_045", sessionId: "sess_3", exerciseId: "55", toFailure: false, sets: "32x10" },
  { sessionExerciseId: "se_046", sessionId: "sess_3", exerciseId: "48", toFailure: false, sets: "8.75x10" }, // Leaning Cable Raise
  { sessionExerciseId: "se_047", sessionId: "sess_3", exerciseId: "61", toFailure: false, sets: "12.5x10" },
  { sessionExerciseId: "se_048", sessionId: "sess_3", exerciseId: "81", toFailure: false, sets: "31.25x10" },
  { sessionExerciseId: "se_049", sessionId: "sess_3", exerciseId: "10", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_050", sessionId: "sess_3", exerciseId: "9",  toFailure: false, sets: "20x10" },   // Barbell Bicep Curls
  { sessionExerciseId: "se_051", sessionId: "sess_3", exerciseId: "65", toFailure: false, sets: "8.75x10" }, // Rear Delt Flyes
  { sessionExerciseId: "se_052", sessionId: "sess_3", exerciseId: "10", toFailure: false, sets: "15x10" },   // Seated curls
  { sessionExerciseId: "se_053", sessionId: "sess_3", exerciseId: "16", toFailure: false, sets: "30.5x10" },
  { sessionExerciseId: "se_054", sessionId: "sess_3", exerciseId: "46", toFailure: false, sets: "61x10" },
  { sessionExerciseId: "se_055", sessionId: "sess_3", exerciseId: "49", toFailure: false, sets: "75x10" },
  { sessionExerciseId: "se_056", sessionId: "sess_3", exerciseId: "50", toFailure: false, sets: "80x10" },
  { sessionExerciseId: "se_057", sessionId: "sess_3", exerciseId: "37", toFailure: false, sets: "77.5x10" },
  { sessionExerciseId: "se_058", sessionId: "sess_3", exerciseId: "17", toFailure: false, sets: "0x10" },
  { sessionExerciseId: "se_059", sessionId: "sess_3", exerciseId: "67", toFailure: false, sets: "9x10" },
  { sessionExerciseId: "se_060", sessionId: "sess_3", exerciseId: "49", toFailure: false, sets: "100x10" },  // Belly leg curls

  // ─── Nov 2024 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_061", sessionId: "sess_4", exerciseId: "5",  toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_062", sessionId: "sess_4", exerciseId: "42", toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_063", sessionId: "sess_4", exerciseId: "59", toFailure: false, sets: "75x10" },
  { sessionExerciseId: "se_064", sessionId: "sess_4", exerciseId: "55", toFailure: false, sets: "32x10" },
  { sessionExerciseId: "se_065", sessionId: "sess_4", exerciseId: "81", toFailure: false, sets: "35x10" },
  { sessionExerciseId: "se_066", sessionId: "sess_4", exerciseId: "65", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_067", sessionId: "sess_4", exerciseId: "10", toFailure: false, sets: "15x10" },   // Seated curls
  { sessionExerciseId: "se_068", sessionId: "sess_4", exerciseId: "16", toFailure: false, sets: "30.5x10" },
  { sessionExerciseId: "se_069", sessionId: "sess_4", exerciseId: "46", toFailure: false, sets: "68x10" },
  { sessionExerciseId: "se_070", sessionId: "sess_4", exerciseId: "50", toFailure: false, sets: "82x10" },
  { sessionExerciseId: "se_071", sessionId: "sess_4", exerciseId: "37", toFailure: false, sets: "82.5x10" },
  { sessionExerciseId: "se_072", sessionId: "sess_4", exerciseId: "67", toFailure: false, sets: "9x10" },
  { sessionExerciseId: "se_073", sessionId: "sess_4", exerciseId: "49", toFailure: false, sets: "105x10" },  // Belly leg curls

  // ─── Dec 2024 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_074", sessionId: "sess_5", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_075", sessionId: "sess_5", exerciseId: "59", toFailure: false, sets: "70x10" },
  { sessionExerciseId: "se_076", sessionId: "sess_5", exerciseId: "25", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_077", sessionId: "sess_5", exerciseId: "81", toFailure: false, sets: "35x10" },
  { sessionExerciseId: "se_078", sessionId: "sess_5", exerciseId: "45", toFailure: false, sets: "12.5x10" },
  { sessionExerciseId: "se_079", sessionId: "sess_5", exerciseId: "10", toFailure: false, sets: "15x10" },   // Seated curls
  { sessionExerciseId: "se_080", sessionId: "sess_5", exerciseId: "46", toFailure: false, sets: "61x10" },
  { sessionExerciseId: "se_081", sessionId: "sess_5", exerciseId: "78", toFailure: false, sets: "30x10" },
  { sessionExerciseId: "se_082", sessionId: "sess_5", exerciseId: "71", toFailure: false, sets: "35x10" },
  { sessionExerciseId: "se_083", sessionId: "sess_5", exerciseId: "37", toFailure: false, sets: "70x10" },
  { sessionExerciseId: "se_084", sessionId: "sess_5", exerciseId: "49", toFailure: false, sets: "90x10" },   // Belly leg curls
  { sessionExerciseId: "se_085", sessionId: "sess_5", exerciseId: "40", toFailure: false, sets: "40x10" },   // Hip Thrust (glute drives)

  // ─── Jan 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_086", sessionId: "sess_6", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_087", sessionId: "sess_6", exerciseId: "59", toFailure: false, sets: "70x10" },
  { sessionExerciseId: "se_088", sessionId: "sess_6", exerciseId: "3",  toFailure: false, sets: "17.5x10" }, // Barbell Skull Crushers
  { sessionExerciseId: "se_089", sessionId: "sess_6", exerciseId: "55", toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_090", sessionId: "sess_6", exerciseId: "48", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_091", sessionId: "sess_6", exerciseId: "81", toFailure: false, sets: "32.75x10" },
  { sessionExerciseId: "se_092", sessionId: "sess_6", exerciseId: "14", toFailure: false, sets: "7.5x10" },  // Cable Kick Backs
  { sessionExerciseId: "se_093", sessionId: "sess_6", exerciseId: "45", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_094", sessionId: "sess_6", exerciseId: "65", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_095", sessionId: "sess_6", exerciseId: "38", toFailure: false, sets: "15x10" },   // Hammer Curls
  { sessionExerciseId: "se_096", sessionId: "sess_6", exerciseId: "10", toFailure: false, sets: "15x10" },   // Seated curls
  { sessionExerciseId: "se_097", sessionId: "sess_6", exerciseId: "16", toFailure: false, sets: "27x10" },
  { sessionExerciseId: "se_099", sessionId: "sess_6", exerciseId: "36", toFailure: false, sets: "12x10" },
  { sessionExerciseId: "se_100", sessionId: "sess_6", exerciseId: "50", toFailure: false, sets: "61x10" },
  { sessionExerciseId: "se_101", sessionId: "sess_6", exerciseId: "37", toFailure: false, sets: "75x10" },
  { sessionExerciseId: "se_102", sessionId: "sess_6", exerciseId: "17", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_103", sessionId: "sess_6", exerciseId: "52", toFailure: false, sets: "0x10" },
  { sessionExerciseId: "se_104", sessionId: "sess_6", exerciseId: "49", toFailure: false, sets: "90x10" },   // Belly leg curls

  // ─── Feb 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_105", sessionId: "sess_7", exerciseId: "81", toFailure: false, sets: "35x10" },
  { sessionExerciseId: "se_106", sessionId: "sess_7", exerciseId: "61", toFailure: false, sets: "12.5x10" },
  { sessionExerciseId: "se_107", sessionId: "sess_7", exerciseId: "71", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_109", sessionId: "sess_7", exerciseId: "52", toFailure: false, sets: "0x10" },

  // ─── Mar 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_110", sessionId: "sess_8", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_111", sessionId: "sess_8", exerciseId: "59", toFailure: false, sets: "67x10" },
  { sessionExerciseId: "se_112", sessionId: "sess_8", exerciseId: "55", toFailure: false, sets: "27.5x10" },
  { sessionExerciseId: "se_113", sessionId: "sess_8", exerciseId: "61", toFailure: false, sets: "12.5x10" },
  { sessionExerciseId: "se_114", sessionId: "sess_8", exerciseId: "81", toFailure: false, sets: "31.5x10" },
  { sessionExerciseId: "se_115", sessionId: "sess_8", exerciseId: "46", toFailure: false, sets: "63.5x10" },
  { sessionExerciseId: "se_116", sessionId: "sess_8", exerciseId: "78", toFailure: false, sets: "35x10" },   // Iso lat rows
  { sessionExerciseId: "se_117", sessionId: "sess_8", exerciseId: "36", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_118", sessionId: "sess_8", exerciseId: "50", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_119", sessionId: "sess_8", exerciseId: "37", toFailure: false, sets: "105x10" },
  { sessionExerciseId: "se_120", sessionId: "sess_8", exerciseId: "17", toFailure: false, sets: "0x10" },
  { sessionExerciseId: "se_121", sessionId: "sess_8", exerciseId: "52", toFailure: false, sets: "0x10" },
  { sessionExerciseId: "se_122", sessionId: "sess_8", exerciseId: "49", toFailure: false, sets: "85x10" },   // Belly leg curls

  // ─── Apr 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_123", sessionId: "sess_9", exerciseId: "59", toFailure: false, sets: "61x10" },
  { sessionExerciseId: "se_124", sessionId: "sess_9", exerciseId: "3",  toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_125", sessionId: "sess_9", exerciseId: "55", toFailure: false, sets: "30x10" },
  { sessionExerciseId: "se_126", sessionId: "sess_9", exerciseId: "48", toFailure: false, sets: "9x10" },
  { sessionExerciseId: "se_127", sessionId: "sess_9", exerciseId: "61", toFailure: false, sets: "12.5x10" },
  { sessionExerciseId: "se_128", sessionId: "sess_9", exerciseId: "81", toFailure: false, sets: "32x10" },
  { sessionExerciseId: "se_129", sessionId: "sess_9", exerciseId: "65", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "se_130", sessionId: "sess_9", exerciseId: "38", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_131", sessionId: "sess_9", exerciseId: "16", toFailure: false, sets: "55x10" },
  { sessionExerciseId: "se_132", sessionId: "sess_9", exerciseId: "46", toFailure: false, sets: "56.5x10" },
  { sessionExerciseId: "se_133", sessionId: "sess_9", exerciseId: "78", toFailure: false, sets: "40x10" },   // Iso lat rows
  { sessionExerciseId: "se_135", sessionId: "sess_9", exerciseId: "36", toFailure: false, sets: "20x10" },
  { sessionExerciseId: "se_136", sessionId: "sess_9", exerciseId: "50", toFailure: false, sets: "70.5x10" },
  { sessionExerciseId: "se_137", sessionId: "sess_9", exerciseId: "37", toFailure: false, sets: "100x10" },
  { sessionExerciseId: "se_138", sessionId: "sess_9", exerciseId: "67", toFailure: false, sets: "14x10" },
  { sessionExerciseId: "se_139", sessionId: "sess_9", exerciseId: "40", toFailure: false, sets: "90x10" },   // Hip Thrust (glute drives)
  { sessionExerciseId: "se_140", sessionId: "sess_9", exerciseId: "51", toFailure: false, sets: "180x10" },  // Seated leg press
  { sessionExerciseId: "se_141", sessionId: "sess_9", exerciseId: "62", toFailure: false, sets: "5x10" },    // Prisoner Back Extension
  { sessionExerciseId: "se_142", sessionId: "sess_9", exerciseId: "52", toFailure: false, sets: "0x10" },

  // ─── May 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_143", sessionId: "sess_10", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_144", sessionId: "sess_10", exerciseId: "59", toFailure: false, sets: "68x10" },
  { sessionExerciseId: "se_145", sessionId: "sess_10", exerciseId: "3",  toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_146", sessionId: "sess_10", exerciseId: "55", toFailure: false, sets: "55x10" },
  { sessionExerciseId: "se_147", sessionId: "sess_10", exerciseId: "48", toFailure: false, sets: "8.75x10" },
  { sessionExerciseId: "se_148", sessionId: "sess_10", exerciseId: "81", toFailure: false, sets: "36x10" },
  { sessionExerciseId: "se_149", sessionId: "sess_10", exerciseId: "45", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_150", sessionId: "sess_10", exerciseId: "10", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_151", sessionId: "sess_10", exerciseId: "46", toFailure: false, sets: "59x10" },
  { sessionExerciseId: "se_152", sessionId: "sess_10", exerciseId: "78", toFailure: false, sets: "42.5x10" }, // Iso lat rows
  { sessionExerciseId: "se_153", sessionId: "sess_10", exerciseId: "71", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_155", sessionId: "sess_10", exerciseId: "36", toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_156", sessionId: "sess_10", exerciseId: "50", toFailure: false, sets: "75x10" },
  { sessionExerciseId: "se_157", sessionId: "sess_10", exerciseId: "37", toFailure: false, sets: "80x10" },
  { sessionExerciseId: "se_158", sessionId: "sess_10", exerciseId: "49", toFailure: false, sets: "90x10" },  // Belly leg curls
  { sessionExerciseId: "se_159", sessionId: "sess_10", exerciseId: "52", toFailure: false, sets: "0x10" },

  // ─── Jun 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_160", sessionId: "sess_11", exerciseId: "5",  toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_161", sessionId: "sess_11", exerciseId: "42", toFailure: false, sets: "22.5x10" },
  { sessionExerciseId: "se_162", sessionId: "sess_11", exerciseId: "55", toFailure: false, sets: "55x10" },
  { sessionExerciseId: "se_163", sessionId: "sess_11", exerciseId: "48", toFailure: false, sets: "11.25x10" },
  { sessionExerciseId: "se_164", sessionId: "sess_11", exerciseId: "81", toFailure: false, sets: "36x10" },
  { sessionExerciseId: "se_165", sessionId: "sess_11", exerciseId: "14", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_166", sessionId: "sess_11", exerciseId: "45", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_167", sessionId: "sess_11", exerciseId: "10", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_168", sessionId: "sess_11", exerciseId: "16", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_169", sessionId: "sess_11", exerciseId: "46", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_171", sessionId: "sess_11", exerciseId: "36", toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_172", sessionId: "sess_11", exerciseId: "17", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_173", sessionId: "sess_11", exerciseId: "49", toFailure: false, sets: "80x10" },  // Belly leg curls
  { sessionExerciseId: "se_174", sessionId: "sess_11", exerciseId: "40", toFailure: false, sets: "70x10" },  // Hip Thrust
  { sessionExerciseId: "se_175", sessionId: "sess_11", exerciseId: "52", toFailure: false, sets: "0x10" },

  // ─── Jul 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_176", sessionId: "sess_12", exerciseId: "5",  toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_177", sessionId: "sess_12", exerciseId: "59", toFailure: false, sets: "68x10" },
  { sessionExerciseId: "se_178", sessionId: "sess_12", exerciseId: "55", toFailure: false, sets: "45x10" },
  { sessionExerciseId: "se_179", sessionId: "sess_12", exerciseId: "48", toFailure: false, sets: "9x10" },
  { sessionExerciseId: "se_180", sessionId: "sess_12", exerciseId: "61", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_181", sessionId: "sess_12", exerciseId: "81", toFailure: false, sets: "42x10" },
  { sessionExerciseId: "se_182", sessionId: "sess_12", exerciseId: "38", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "se_183", sessionId: "sess_12", exerciseId: "46", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_184", sessionId: "sess_12", exerciseId: "78", toFailure: false, sets: "40x10" },  // Iso lat rows
  { sessionExerciseId: "se_185", sessionId: "sess_12", exerciseId: "37", toFailure: false, sets: "100x10" },
  { sessionExerciseId: "se_186", sessionId: "sess_12", exerciseId: "50", toFailure: false, sets: "80x10" },
  { sessionExerciseId: "se_187", sessionId: "sess_12", exerciseId: "17", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_188", sessionId: "sess_12", exerciseId: "49", toFailure: false, sets: "100x10" }, // Belly leg curls
  { sessionExerciseId: "se_189", sessionId: "sess_12", exerciseId: "40", toFailure: false, sets: "80x10" },  // Hip Thrust

  // ─── Aug 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_190", sessionId: "sess_13", exerciseId: "5",  toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_191", sessionId: "sess_13", exerciseId: "59", toFailure: false, sets: "70x10" },
  { sessionExerciseId: "se_192", sessionId: "sess_13", exerciseId: "55", toFailure: false, sets: "50x10" },
  { sessionExerciseId: "se_193", sessionId: "sess_13", exerciseId: "48", toFailure: false, sets: "7.5x10" },
  { sessionExerciseId: "se_194", sessionId: "sess_13", exerciseId: "81", toFailure: false, sets: "38.3x10" },
  { sessionExerciseId: "se_195", sessionId: "sess_13", exerciseId: "46", toFailure: false, sets: "70.5x10" },
  { sessionExerciseId: "se_196", sessionId: "sess_13", exerciseId: "78", toFailure: false, sets: "45x10" },  // Iso lat rows
  { sessionExerciseId: "se_197", sessionId: "sess_13", exerciseId: "51", toFailure: false, sets: "177x10" }, // Seated leg press
  { sessionExerciseId: "se_198", sessionId: "sess_13", exerciseId: "49", toFailure: false, sets: "50x10" },  // Leg curl
  { sessionExerciseId: "se_199", sessionId: "sess_13", exerciseId: "22", toFailure: false, sets: "63x10" },  // Machine crunch

  // ─── Sep 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_200", sessionId: "sess_14", exerciseId: "5",  toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_201", sessionId: "sess_14", exerciseId: "59", toFailure: false, sets: "59x10" },
  { sessionExerciseId: "se_202", sessionId: "sess_14", exerciseId: "48", toFailure: false, sets: "7x10" },
  { sessionExerciseId: "se_203", sessionId: "sess_14", exerciseId: "81", toFailure: false, sets: "31.5x10" },
  { sessionExerciseId: "se_204", sessionId: "sess_14", exerciseId: "16", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_205", sessionId: "sess_14", exerciseId: "46", toFailure: false, sets: "68x10" },
  { sessionExerciseId: "se_206", sessionId: "sess_14", exerciseId: "49", toFailure: false, sets: "36x10" },  // Leg curl
  { sessionExerciseId: "se_207", sessionId: "sess_14", exerciseId: "22", toFailure: false, sets: "55x10" },  // Machine crunch

  // ─── Oct 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_208", sessionId: "sess_15", exerciseId: "5",  toFailure: false, sets: "25x10" },
  { sessionExerciseId: "se_209", sessionId: "sess_15", exerciseId: "59", toFailure: false, sets: "59x10" },
  { sessionExerciseId: "se_210", sessionId: "sess_15", exerciseId: "55", toFailure: false, sets: "50x10" },
  { sessionExerciseId: "se_211", sessionId: "sess_15", exerciseId: "61", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_212", sessionId: "sess_15", exerciseId: "81", toFailure: false, sets: "31x10" },
  { sessionExerciseId: "se_213", sessionId: "sess_15", exerciseId: "16", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_214", sessionId: "sess_15", exerciseId: "46", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "se_216", sessionId: "sess_15", exerciseId: "50", toFailure: false, sets: "84x10" },
  { sessionExerciseId: "se_217", sessionId: "sess_15", exerciseId: "49", toFailure: false, sets: "36x10" },  // Leg curl
  { sessionExerciseId: "se_218", sessionId: "sess_15", exerciseId: "22", toFailure: false, sets: "63x10" },  // Machine crunch

  // ─── Nov 2025 ────────────────────────────────────────────────────────────────
  { sessionExerciseId: "se_219", sessionId: "sess_16", exerciseId: "48", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "se_220", sessionId: "sess_16", exerciseId: "49", toFailure: false, sets: "90x10" },  // Belly leg curls
  { sessionExerciseId: "se_221", sessionId: "sess_16", exerciseId: "49", toFailure: false, sets: "43x10" },  // Leg curl
  { sessionExerciseId: "se_222", sessionId: "sess_16", exerciseId: "52", toFailure: false, sets: "0x52" },          // Leg raises (52 reps noted)
  { sessionExerciseId: "se_223", sessionId: "sess_16", exerciseId: "22", toFailure: false, sets: "59x10" },  // Machine crunch
];

export async function seedExercises() {
  for (const exercise of exercises) {
    try {
      await createExercise(exercise);
      console.log("created - ", exercise.name);
      
    } catch (e: unknown) {
      console.error("failed to create - ", exercise.name, " : ", e);
    }
  }
  console.log("Done!");
}

export async function seedSessions() {
  for (const session of sessions) {
    try {
      await createSession(session);
      console.log("created - Session", session.sessionId);
      
    } catch (e: unknown) {
      console.error("failed to create - ", session.sessionId, " : ", e);
    }
  }
  console.log("Done!");
}

export async function seedSessionsExercises() {
  for (const sessionsExercise of sessionsExercises) {
    try {
      await createSessionExercise(sessionsExercise);
      console.log("created - sessionsExercise");
      
    } catch (e: unknown) {
      console.error("failed to create - sessionsExercise: ", e);
    }
  }
  console.log("Done!");
}

export function getRandomQuote(): bar {
  return bars[Math.floor(Math.random() * bars.length)];
}