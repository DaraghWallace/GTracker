import { createExercise, createSession, createSessionExercise } from "./APIfunctions";
import type { bar, exercise, session, sessionExercise } from "./customTypes";
import { bars } from "../assets/bars";


const exercises: exercise[] = [
  // CHEST
  { exerciseId: "64-dumbbell-bench", name: "Dumbbell Bench Press", group: "Chest", target: "Middle Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "1-barbell-bench-press", name: "Barbell Bench Press", group: "Chest", target: "Middle Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "2-incline-dumbbell-press", name: "Incline Dumbbell Press", group: "Chest", target: "Upper Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "3-decline-bench-press", name: "Decline Bench Press", group: "Chest", target: "Lower Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "4-push-up", name: "Push-Up", group: "Chest", target: "Middle Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "5-chest-fly", name: "Chest Fly", group: "Chest", target: "Middle Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "6-dips", name: "Dips", group: "Chest", target: "Lower Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "7-low-to-high-cable-fly", name: "Low-to-High Cable Fly", group: "Chest", target: "Upper Pec", ppl: "Push", author: "Dev" },
  { exerciseId: "65-pec-fly", name: "Pec Fly", group: "Chest", target: "Middle Pec", ppl: "Push", author: "Dev" },

  // SHOULDERS
  { exerciseId: "8-overhead-press", name: "Overhead Press", group: "Shoulders", target: "Front Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "9-dumbbell-shoulder-press", name: "Dumbbell Shoulder Press", group: "Shoulders", target: "Front Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "61-machine-shoulder-press", name: "Machine Shoulder Press", group: "Shoulders", target: "Front Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "10-lateral-raise", name: "Lateral Raise", group: "Shoulders", target: "Side Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "11-cable-lateral-raise", name: "Cable Lateral Raise", group: "Shoulders", target: "Side Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "62-leaning-cable-fly", name: "Leaning Cable Fly", group: "Shoulders", target: "Side Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "12-face-pull", name: "Face Pull", group: "Shoulders", target: "Rear Delt", ppl: "Pull", author: "Dev" },
  { exerciseId: "13-reverse-pec-deck", name: "Reverse Pec Deck", group: "Shoulders", target: "Rear Delt", ppl: "Pull", author: "Dev" },
  { exerciseId: "14-front-raise", name: "Front Raise", group: "Shoulders", target: "Front Delt", ppl: "Push", author: "Dev" },
  { exerciseId: "63-rear-delt-fly", name: "Rear Delt Fly", group: "Shoulders", target: "Rear Delt", ppl: "Pull", author: "Dev" },

  // BACK
  { exerciseId: "15-deadlift", name: "Deadlift", group: "Back", target: "Lats", ppl: "Pull", author: "Dev" },
  { exerciseId: "16-pull-up", name: "Pull-Up", group: "Back", target: "Lats", ppl: "Pull", author: "Dev" },
  { exerciseId: "17-lat-pulldown", name: "Lat Pulldown", group: "Back", target: "Lats", ppl: "Pull", author: "Dev" },
  { exerciseId: "18-barbell-row", name: "Barbell Row", group: "Back", target: "Mid Back", ppl: "Pull", author: "Dev" },
  { exerciseId: "19-seated-cable-row", name: "Seated Cable Row", group: "Back", target: "Mid Back", ppl: "Pull", author: "Dev" },
  { exerciseId: "66-cable-rows", name: "Cable Rows", group: "Back", target: "Mid Back", ppl: "Pull", author: "Dev" },
  { exerciseId: "20-single-arm-dumbbell-row", name: "Single-Arm Dumbbell Row", group: "Back", target: "Mid Back", ppl: "Pull", author: "Dev" },
  { exerciseId: "21-shrugs", name: "Shrugs", group: "Back", target: "Traps", ppl: "Pull", author: "Dev" },
  { exerciseId: "22-rack-pulls", name: "Rack Pulls", group: "Back", target: "Traps", ppl: "Pull", author: "Dev" },

  // ARMS
  { exerciseId: "23-barbell-curl", name: "Barbell Curl", group: "Arms", target: "Bicep", ppl: "Pull", author: "Dev" },
  { exerciseId: "24-dumbbell-curl", name: "Dumbbell Curl", group: "Arms", target: "Bicep", ppl: "Pull", author: "Dev" },
  { exerciseId: "25-preacher-curl", name: "Barbell Preacher Curl", group: "Arms", target: "Bicep", ppl: "Pull", author: "Dev" },
  { exerciseId: "57-dbl-preacher-curls", name: "Dumbbell Preacher Curls", group: "Arms", target: "Bicep", ppl: "Pull", author: "Dev" },
  { exerciseId: "26-tricep-pushdown", name: "Tricep Pushdown", group: "Arms", target: "Tricep", ppl: "Push", author: "Dev" },
  { exerciseId: "27-skull-crushers", name: "Skull Crushers", group: "Arms", target: "Tricep", ppl: "Push", author: "Dev" },
  { exerciseId: "28-overhead-tricep-extension", name: "Overhead Tricep Extension", group: "Arms", target: "Tricep", ppl: "Push", author: "Dev" },
  { exerciseId: "29-hammer-curl", name: "Hammer Curl", group: "Arms", target: "Brachialis", ppl: "Pull", author: "Dev" },
  { exerciseId: "30-cross-body-hammer-curl", name: "Cross-Body Hammer Curl", group: "Arms", target: "Brachialis", ppl: "Pull", author: "Dev" },
  { exerciseId: "31-wrist-curl", name: "Wrist Curl", group: "Arms", target: "Fore Arm", ppl: "Pull", author: "Dev" },
  { exerciseId: "32-reverse-wrist-curl", name: "Reverse Wrist Curl", group: "Arms", target: "Fore Arm", ppl: "Push", author: "Dev" },
  { exerciseId: "33-farmers-carry", name: "Farmer's Carry", group: "Arms", target: "Fore Arm", ppl: "Pull", author: "Dev" },

  // CORE
  { exerciseId: "34-plank", name: "Plank", group: "Core", target: "Abs", ppl: "Push", author: "Dev" },
  { exerciseId: "35-hanging-leg-raise", name: "Hanging Leg Raise", group: "Core", target: "Abs", ppl: "Pull", author: "Dev" },
  { exerciseId: "36-cable-crunch", name: "Cable Crunch", group: "Core", target: "Abs", ppl: "Pull", author: "Dev" },
  { exerciseId: "37-russian-twist", name: "Russian Twist", group: "Core", target: "Obliques", ppl: "Push", author: "Dev" },
  { exerciseId: "38-side-plank", name: "Side Plank", group: "Core", target: "Obliques", ppl: "Push", author: "Dev" },
  { exerciseId: "39-woodchopper", name: "Woodchopper", group: "Core", target: "Obliques", ppl: "Pull", author: "Dev" },

  // LEGS
  { exerciseId: "40-barbell-back-squat", name: "Barbell Back Squat", group: "Legs", target: "Quads", ppl: "Legs", author: "Dev" },
  { exerciseId: "41-front-squat", name: "Front Squat", group: "Legs", target: "Quads", ppl: "Legs", author: "Dev" },
  { exerciseId: "42-leg-press", name: "Leg Press", group: "Legs", target: "Quads", ppl: "Legs", author: "Dev" },
  { exerciseId: "43-leg-extension", name: "Leg Extension", group: "Legs", target: "Quads", ppl: "Legs", author: "Dev" },
  { exerciseId: "69-single-leg-extensions", name: "Single Leg Extensions", group: "Legs", target: "Quads", ppl: "Legs", author: "Dev" },
  { exerciseId: "44-walking-lunge", name: "Walking Lunge", group: "Legs", target: "Quads", ppl: "Legs", author: "Dev" },
  { exerciseId: "45-romanian-deadlift", name: "Romanian Deadlift", group: "Legs", target: "Hamstring", ppl: "Legs", author: "Dev" },
  { exerciseId: "46-seated-leg-curl", name: "Seated Leg Curl", group: "Legs", target: "Hamstring", ppl: "Legs", author: "Dev" },
  { exerciseId: "73-lieing-leg-curls", name: "Lying Leg Curls", group: "Legs", target: "Hamstring", ppl: "Legs", author: "Dev" },
  { exerciseId: "47-good-morning", name: "Good Morning", group: "Legs", target: "Hamstring", ppl: "Legs", author: "Dev" },
  { exerciseId: "48-hip-thrust", name: "Hip Thrust", group: "Legs", target: "Glutes", ppl: "Legs", author: "Dev" },
  { exerciseId: "49-glute-bridge", name: "Glute Bridge", group: "Legs", target: "Glutes", ppl: "Legs", author: "Dev" },
  { exerciseId: "50-cable-kickback", name: "Cable Kickback", group: "Legs", target: "Glutes", ppl: "Legs", author: "Dev" },
  { exerciseId: "51-calf-raise", name: "Calf Raise", group: "Legs", target: "Calf", ppl: "Legs", author: "Dev" },
  { exerciseId: "52-seated-calf-raise", name: "Seated Calf Raise", group: "Legs", target: "Calf", ppl: "Legs", author: "Dev" },
  { exerciseId: "74-calf-raises", name: "Calf Raises", group: "Legs", target: "Calf", ppl: "Legs", author: "Dev" },
  { exerciseId: "53-hip-abduction-machine", name: "Hip Abduction Machine", group: "Legs", target: "Abductors", ppl: "Legs", author: "Dev" },
  { exerciseId: "54-banded-lateral-walk", name: "Banded Lateral Walk", group: "Legs", target: "Abductors", ppl: "Legs", author: "Dev" },
  { exerciseId: "55-hip-adduction-machine", name: "Hip Adduction Machine", group: "Legs", target: "Adductors", ppl: "Legs", author: "Dev" },
  { exerciseId: "56-copenhagen-plank", name: "Copenhagen Plank", group: "Legs", target: "Adductors", ppl: "Legs", author: "Dev" },
  { exerciseId: "72-glute-drive", name: "Glute Drive", group: "Legs", target: "Glutes", ppl: "Legs", author: "Dev" },
];

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

const sessionId = "0b7dc5db-0149-4af0-a9f2-8a6426ae2e8d";

const sessionExercises: sessionExercise[] = [
  // ===== CHEST =====
  { sessionExerciseId: "f221d7c0-6196-42ad-a021-5605e64663b9", sessionId: sessionId, exerciseId: "64-dumbbell-bench", toFailure: false, sets: "25x10" },
  { sessionExerciseId: "0d4ae75a-a640-4375-810a-6507b7da38fa", sessionId: sessionId, exerciseId: "2-incline-dumbbell-press", toFailure: true, sets: "22.5x10, 20x4" },
  { sessionExerciseId: "dd1da7ad-0d73-4374-ad55-9a1c79ad3460", sessionId: sessionId, exerciseId: "65-pec-fly", toFailure: false, sets: "70x10" },
  { sessionExerciseId: "078266c0-8d31-4588-9410-ab4fd76edaad", sessionId: sessionId, exerciseId: "27-skull-crushers", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "e8b37ae2-dad2-4020-9520-93970b0d37f3", sessionId: sessionId, exerciseId: "3-decline-bench-press", toFailure: false, sets: "16.25x10" },

  // ===== ARMS / SHOULDERS =====
  { sessionExerciseId: "c9b1f839-d243-4ea8-9417-a85017ae23c0", sessionId: sessionId, exerciseId: "61-machine-shoulder-press", toFailure: false, sets: "50x10" },
  { sessionExerciseId: "8a875334-3ef9-47b2-b953-e5954b59a40f", sessionId: sessionId, exerciseId: "62-leaning-cable-fly", toFailure: false, sets: "11.25x10" },
  { sessionExerciseId: "b1be83f8-b112-4d06-87ae-aab2ea3b3e5b", sessionId: sessionId, exerciseId: "57-dbl-preacher-curls", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "042ea139-d4aa-458d-b4d2-c66ae93f62fb", sessionId: sessionId, exerciseId: "26-tricep-pushdown", toFailure: false, sets: "38.3x10" },
  { sessionExerciseId: "07010263-e99c-4e90-87ab-a64be5512186", sessionId: sessionId, exerciseId: "50-cable-kickback", toFailure: false, sets: "17.5x10" },
  { sessionExerciseId: "5f00aed6-6fe9-45f0-94a9-fac3b9cba9d7", sessionId: sessionId, exerciseId: "10-lateral-raise", toFailure: true, sets: "17.5x10" },
  { sessionExerciseId: "1684420b-e0df-4ce5-a52b-57f570a8c3d6", sessionId: sessionId, exerciseId: "25-preacher-curl", toFailure: false, sets: "20x10" },
  { sessionExerciseId: "4582ac56-7591-48d7-8793-8a4ad6c43e65", sessionId: sessionId, exerciseId: "29-hammer-curl", toFailure: false, sets: "17.5x10, 15x10" },
  { sessionExerciseId: "c6f3741a-e9a9-465c-9507-438da2b857d2", sessionId: sessionId, exerciseId: "24-dumbbell-curl", toFailure: true, sets: "17.5x12, 20x10" },
  { sessionExerciseId: "371daef8-3f28-44ee-a48f-c78e9d50e848", sessionId: sessionId, exerciseId: "23-barbell-curl", toFailure: false, sets: "25x12" },
  { sessionExerciseId: "0ddb8b7a-2597-4ad7-ad2a-fa01948aa451", sessionId: sessionId, exerciseId: "63-rear-delt-fly", toFailure: false, sets: "10x10" },
  { sessionExerciseId: "aecf5d4d-64eb-4174-87d6-8207dcb990b8", sessionId: sessionId, exerciseId: "25-preacher-curl", toFailure: true, sets: "15x10" },

  // ===== BACK =====
  { sessionExerciseId: "b0057d7c-e60e-4a58-8c58-fe734f182989", sessionId: sessionId, exerciseId: "66-cable-rows", toFailure: false, sets: "66x10" },
  { sessionExerciseId: "08d9b92f-c91f-40d0-a44c-dfdfb9dd4362", sessionId: sessionId, exerciseId: "17-lat-pulldown", toFailure: false, sets: "70.5x10" },
  { sessionExerciseId: "090ec3f0-3444-46dd-8138-a4643be16b50", sessionId: sessionId, exerciseId: "20-single-arm-dumbbell-row", toFailure: false, sets: "45x10" },
  { sessionExerciseId: "a7efa0c2-9c76-4e1b-b54e-54623a709365", sessionId: sessionId, exerciseId: "18-barbell-row", toFailure: false, sets: "45x10" },
  { sessionExerciseId: "02246c5a-0428-4f89-9379-9b0132e20799", sessionId: sessionId, exerciseId: "15-deadlift", toFailure: false, sets: "90x5, 110x4, 110x3" },

  // ===== LEGS =====
  { sessionExerciseId: "a389bd44-ade4-4cc3-97ae-18ce4ebb569b", sessionId: sessionId, exerciseId: "41-front-squat", toFailure: false, sets: "25x10" },
  { sessionExerciseId: "669702ec-9c2a-4f8b-8765-3d89255c77ea", sessionId: sessionId, exerciseId: "43-leg-extension", toFailure: false, sets: "90x10" },
  { sessionExerciseId: "8801a5e3-f66b-436f-8224-5e3bdcd26cb2", sessionId: sessionId, exerciseId: "42-leg-press", toFailure: false, sets: "100x10, 90x4" },
  { sessionExerciseId: "560988ff-cea3-42f5-b4a2-8de45df3fdd0", sessionId: sessionId, exerciseId: "74-calf-raises", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "4bec9d11-8b71-4afd-a79b-28102bc18eb7", sessionId: sessionId, exerciseId: "44-walking-lunge", toFailure: false, sets: "14x8" },
  { sessionExerciseId: "98792792-41fb-47c8-a43b-042f82b12ba0", sessionId: sessionId, exerciseId: "73-lieing-leg-curls", toFailure: false, sets: "105x10" },
  { sessionExerciseId: "6caf3315-b3ae-4b4c-bb71-91d6c02c11ef", sessionId: sessionId, exerciseId: "72-glute-drive", toFailure: false, sets: "90x10" },
  { sessionExerciseId: "e072fa92-deb5-4751-85aa-534b6fc41a9f", sessionId: sessionId, exerciseId: "42-leg-press", toFailure: false, sets: "180x10" },
  { sessionExerciseId: "af45ade4-f8f8-4476-8b30-f1179552fd94", sessionId: sessionId, exerciseId: "46-seated-leg-curl", toFailure: false, sets: "75x10" },

  // ===== CORE =====
  { sessionExerciseId: "c0b2744b-b477-428a-813e-ed294c4666db", sessionId: sessionId, exerciseId: "35-hanging-leg-raise", toFailure: false, sets: "15x10" },
  { sessionExerciseId: "3f0f4ad1-f286-43a6-875e-69dc8a9cffec", sessionId: sessionId, exerciseId: "36-cable-crunch", toFailure: false, sets: "63x10" },
  { sessionExerciseId: "4e324ed1-c5db-4378-8edb-e8e7eba0f183", sessionId: sessionId, exerciseId: "47-good-morning", toFailure: false, sets: "5x10" },
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
  for (const sessionsExercise of sessionExercises) {
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