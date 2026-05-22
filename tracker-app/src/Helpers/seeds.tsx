import { createExercise, createSession, createSessionExercise } from "./APIfunctions";
import type { bar } from "./customTypes";
import { bars } from "../assets/bars";


const exercises = [
  { "exerciseId": "0", "name": "Bench Press", "group": "Chest", "muscle": "Pectorals", "ppl": "Push" },
  { "exerciseId": "1", "name": "Incline Bench Press", "group": "Chest", "muscle": "Upper Chest", "ppl": "Push" },
  { "exerciseId": "2", "name": "Decline Bench Press", "group": "Chest", "muscle": "Lower Chest", "ppl": "Push" },
  { "exerciseId": "3", "name": "Push-Ups", "group": "Chest", "muscle": "Pectorals", "ppl": "Push" },
  { "exerciseId": "4", "name": "Dumbbell Flyes", "group": "Chest", "muscle": "Pectorals", "ppl": "Push" },
  { "exerciseId": "5", "name": "Cable Crossovers", "group": "Chest", "muscle": "Inner Chest", "ppl": "Push" },
  { "exerciseId": "6", "name": "Chest Dips", "group": "Chest", "muscle": "Lower Chest", "ppl": "Push" },
  { "exerciseId": "7", "name": "Pull-Ups", "group": "Back", "muscle": "Lats", "ppl": "Pull" },
  { "exerciseId": "8", "name": "Chin-Ups", "group": "Back", "muscle": "Lats", "ppl": "Pull" },
  { "exerciseId": "9", "name": "Lat Pulldown", "group": "Back", "muscle": "Lats", "ppl": "Pull" },
  { "exerciseId": "10", "name": "Seated Cable Row", "group": "Back", "muscle": "Middle Back", "ppl": "Pull" },
  { "exerciseId": "11", "name": "Bent-Over Row", "group": "Back", "muscle": "Middle Back", "ppl": "Pull" },
  { "exerciseId": "12", "name": "Single-Arm Dumbbell Row", "group": "Back", "muscle": "Lats", "ppl": "Pull" },
  { "exerciseId": "13", "name": "Deadlift", "group": "Back", "muscle": "Lower Back", "ppl": "Pull" },
  { "exerciseId": "14", "name": "Face Pulls", "group": "Shoulders", "muscle": "Rear Delts", "ppl": "Pull" },
  { "exerciseId": "15", "name": "Overhead Press", "group": "Shoulders", "muscle": "Front Delts", "ppl": "Push" },
  { "exerciseId": "16", "name": "Lateral Raises", "group": "Shoulders", "muscle": "Side Delts", "ppl": "Push" },
  { "exerciseId": "17", "name": "Front Raises", "group": "Shoulders", "muscle": "Front Delts", "ppl": "Push" },
  { "exerciseId": "18", "name": "Rear Delt Flyes", "group": "Shoulders", "muscle": "Rear Delts", "ppl": "Pull" },
  { "exerciseId": "19", "name": "Upright Rows", "group": "Shoulders", "muscle": "Traps", "ppl": "Pull" },
  { "exerciseId": "20", "name": "Arnold Press", "group": "Shoulders", "muscle": "Front Delts", "ppl": "Push" },
  { "exerciseId": "21", "name": "Bicep Curls", "group": "Arms", "muscle": "Biceps", "ppl": "Pull" },
  { "exerciseId": "22", "name": "Hammer Curls", "group": "Arms", "muscle": "Brachialis", "ppl": "Pull" },
  { "exerciseId": "23", "name": "Preacher Curls", "group": "Arms", "muscle": "Biceps", "ppl": "Pull" },
  { "exerciseId": "24", "name": "Tricep Pushdowns", "group": "Arms", "muscle": "Triceps", "ppl": "Push" },
  { "exerciseId": "25", "name": "Skull Crushers", "group": "Arms", "muscle": "Triceps", "ppl": "Push" },
  { "exerciseId": "26", "name": "Overhead Tricep Extension", "group": "Arms", "muscle": "Triceps", "ppl": "Push" },
  { "exerciseId": "27", "name": "Dips", "group": "Arms", "muscle": "Triceps", "ppl": "Push" },
  { "exerciseId": "28", "name": "Squats", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "29", "name": "Front Squats", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "30", "name": "Goblet Squats", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "31", "name": "Leg Press", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "32", "name": "Romanian Deadlift", "group": "Legs", "muscle": "Hamstrings", "ppl": "Legs" },
  { "exerciseId": "33", "name": "Lunges", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "34", "name": "Leg Extension", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "35", "name": "Leg Curl", "group": "Legs", "muscle": "Hamstrings", "ppl": "Legs" },
  { "exerciseId": "36", "name": "Hip Thrust", "group": "Legs", "muscle": "Glutes", "ppl": "Legs" },
  { "exerciseId": "37", "name": "Calf Raises", "group": "Legs", "muscle": "Calves", "ppl": "Legs" },
  { "exerciseId": "38", "name": "Hack Squat", "group": "Legs", "muscle": "Quadriceps", "ppl": "Legs" },
  { "exerciseId": "39", "name": "Plank", "group": "Core", "muscle": "Abdominals", "ppl": "Core" },
  { "exerciseId": "40", "name": "Crunches", "group": "Core", "muscle": "Abdominals", "ppl": "Core" },
  { "exerciseId": "41", "name": "Leg Raises", "group": "Core", "muscle": "Lower Abs", "ppl": "Core" },
  { "exerciseId": "42", "name": "Cable Crunches", "group": "Core", "muscle": "Abdominals", "ppl": "Core" },
  { "exerciseId": "43", "name": "Russian Twists", "group": "Core", "muscle": "Obliques", "ppl": "Core" },
  { "exerciseId": "44", "name": "Ab Wheel Rollout", "group": "Core", "muscle": "Abdominals", "ppl": "Core" },
  { "exerciseId": "45", "name": "Hanging Knee Raises", "group": "Core", "muscle": "Lower Abs", "ppl": "Core" },
  { "exerciseId": "46", "name": "Glute Kickbacks", "group": "Legs", "muscle": "Glutes", "ppl": "Legs" },
  { "exerciseId": "47", "name": "Cable Pull-Throughs", "group": "Legs", "muscle": "Glutes", "ppl": "Legs" },
  { "exerciseId": "48", "name": "Sumo Deadlift", "group": "Legs", "muscle": "Glutes", "ppl": "Legs" },
  { "exerciseId": "49", "name": "Abductor Machine", "group": "Legs", "muscle": "Hip Abductors", "ppl": "Legs" },
  { "exerciseId": "50", "name": "Adductor Machine", "group": "Legs", "muscle": "Hip Adductors", "ppl": "Legs" },
  { "exerciseId": "51", "name": "Treadmill", "group": "Cardio", "muscle": "Full Body", "ppl": "Cardio" },
  { "exerciseId": "52", "name": "Elliptical", "group": "Cardio", "muscle": "Full Body", "ppl": "Cardio" },
  { "exerciseId": "53", "name": "Stationary Bike", "group": "Cardio", "muscle": "Legs", "ppl": "Cardio" },
  { "exerciseId": "54", "name": "Rowing Machine", "group": "Cardio", "muscle": "Full Body", "ppl": "Pull" },
  { "exerciseId": "55", "name": "Stair Climber", "group": "Cardio", "muscle": "Glutes", "ppl": "Cardio" },
  { "exerciseId": "56", "name": "Battle Ropes", "group": "Cardio", "muscle": "Shoulders", "ppl": "Cardio" },
  { "exerciseId": "57", "name": "Jump Rope", "group": "Cardio", "muscle": "Calves", "ppl": "Cardio" },
  { "exerciseId": "58", "name": "Clean and Press", "group": "Full Body", "muscle": "Full Body", "ppl": "Push" },
  { "exerciseId": "59", "name": "Kettlebell Swings", "group": "Full Body", "muscle": "Hamstrings", "ppl": "Legs" },
  { "exerciseId": "60", "name": "Burpees", "group": "Full Body", "muscle": "Full Body", "ppl": "Cardio" },
  { "exerciseId": "61", "name": "Thrusters", "group": "Full Body", "muscle": "Shoulders", "ppl": "Push" },
  { "exerciseId": "62", "name": "Farmer's Carries", "group": "Full Body", "muscle": "Traps", "ppl": "Pull" },
  { "exerciseId": "63", "name": "TRX Rows", "group": "Back", "muscle": "Middle Back", "ppl": "Pull" },
  { "exerciseId": "64", "name": "Resistance Band Pull-Aparts", "group": "Shoulders", "muscle": "Rear Delts", "ppl": "Pull" },
  { "exerciseId": "65", "name": "Foam Rolling", "group": "Recovery", "muscle": "Full Body", "ppl": "Recovery" }
];

const sessions = [
  // January
  { "sessionId": "ses11", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-04-02", "focus": "Pull", "notes": "seeded", "userWeight": 82.0 },
  { "sessionId": "ses12", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-04-04", "focus": "Push", "notes": "seeded", "userWeight": 81.8 },
  { "sessionId": "ses13", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-04-06", "focus": "Legs", "notes": "seeded", "userWeight": 82.2 },
  { "sessionId": "ses14", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-04-08", "focus": "Pull", "notes": "seeded", "userWeight": 81.5 },
  { "sessionId": "ses15", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-04-10", "focus": "Push", "notes": "seeded", "userWeight": 81.7 },
  // February
  { "sessionId": "ses24", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-02-02", "focus": "Pull", "notes": "seeded", "userWeight": 81.2 },
  { "sessionId": "ses25", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-02-04", "focus": "Push", "notes": "seeded", "userWeight": 80.9 },
  { "sessionId": "ses26", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-02-06", "focus": "Legs", "notes": "seeded", "userWeight": 81.1 },
  { "sessionId": "ses27", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-02-09", "focus": "Pull", "notes": "seeded", "userWeight": 80.6 },
  { "sessionId": "ses28", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-02-11", "focus": "Push", "notes": "seeded", "userWeight": 80.8 },
  // March
  { "sessionId": "ses01", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-03-03", "focus": "Pull", "notes": "seeded", "userWeight": 80.3 },
  { "sessionId": "ses02", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-03-05", "focus": "Push", "notes": "seeded", "userWeight": 80.5 },
  { "sessionId": "ses03", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-03-07", "focus": "Legs", "notes": "seeded", "userWeight": 80.1 },
  { "sessionId": "ses04", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-03-09", "focus": "Pull", "notes": "seeded", "userWeight": 79.8 },
  { "sessionId": "ses05", "userId": "b9be14b8-20c1-70c0-318f-358eae133ea1", "dateDone": "2026-03-11", "focus": "Push", "notes": "seeded", "userWeight": 80.0 },
];

const sessionsExercises = [
  // Session ses11 - Pull
  { "sessionExerciseId": "set31", "exerciseId": "11", "sessionId": "ses11", "sets": "0x6,0x5,0x5",        "toFailure": false },
  { "sessionExerciseId": "set32", "exerciseId": "1",  "sessionId": "ses11", "sets": "16x12,18x10,20x8",   "toFailure": false },
  { "sessionExerciseId": "set33", "exerciseId": "13", "sessionId": "ses11", "sets": "42x12,46x10,50x8",   "toFailure": false },

  // Session ses12 - Push
  { "sessionExerciseId": "set34", "exerciseId": "5",  "sessionId": "ses12", "sets": "50x10,55x8,60x6",    "toFailure": false },
  { "sessionExerciseId": "set35", "exerciseId": "8",  "sessionId": "ses12", "sets": "32x10,36x8,40x6",    "toFailure": false },
  { "sessionExerciseId": "set36", "exerciseId": "3",  "sessionId": "ses12", "sets": "20x12,22x10,25x8",   "toFailure": false },

  // Session ses13 - Legs
  { "sessionExerciseId": "set37", "exerciseId": "16", "sessionId": "ses13", "sets": "60x10,70x8,80x6",    "toFailure": false },
  { "sessionExerciseId": "set38", "exerciseId": "18", "sessionId": "ses13", "sets": "50x10,55x8,60x8",    "toFailure": false },
  { "sessionExerciseId": "set39", "exerciseId": "20", "sessionId": "ses13", "sets": "30x15,35x12,40x10",  "toFailure": false },

  // Session ses14 - Pull
  { "sessionExerciseId": "set40", "exerciseId": "12", "sessionId": "ses14", "sets": "50x10,55x8,60x6",    "toFailure": false },
  { "sessionExerciseId": "set41", "exerciseId": "2",  "sessionId": "ses14", "sets": "12x12,14x10,16x8",   "toFailure": false },
  { "sessionExerciseId": "set42", "exerciseId": "15", "sessionId": "ses14", "sets": "80x6,90x5,100x4",    "toFailure": false },

  // Session ses15 - Push
  { "sessionExerciseId": "set43", "exerciseId": "6",  "sessionId": "ses15", "sets": "40x10,45x8,50x6",    "toFailure": false },
  { "sessionExerciseId": "set44", "exerciseId": "9",  "sessionId": "ses15", "sets": "8x15,10x12,12x10",   "toFailure": true  },
  { "sessionExerciseId": "set45", "exerciseId": "4",  "sessionId": "ses15", "sets": "16x12,18x10,20x8",   "toFailure": false },

  // Session ses24 - Pull
  { "sessionExerciseId": "set70", "exerciseId": "12", "sessionId": "ses24", "sets": "54x10,60x8,66x6",    "toFailure": false },
  { "sessionExerciseId": "set71", "exerciseId": "2",  "sessionId": "ses24", "sets": "14x12,16x10,18x8",   "toFailure": false },
  { "sessionExerciseId": "set72", "exerciseId": "15", "sessionId": "ses24", "sets": "88x6,98x5,108x4",    "toFailure": false },

  // Session ses25 - Push
  { "sessionExerciseId": "set73", "exerciseId": "6",  "sessionId": "ses25", "sets": "44x10,48x8,52x6",    "toFailure": false },
  { "sessionExerciseId": "set74", "exerciseId": "9",  "sessionId": "ses25", "sets": "9x15,11x12,13x10",   "toFailure": true  },
  { "sessionExerciseId": "set75", "exerciseId": "4",  "sessionId": "ses25", "sets": "18x12,22x10,24x8",   "toFailure": false },

  // Session ses26 - Legs
  { "sessionExerciseId": "set76", "exerciseId": "17", "sessionId": "ses26", "sets": "108x12,128x10,148x8", "toFailure": false },
  { "sessionExerciseId": "set77", "exerciseId": "19", "sessionId": "ses26", "sets": "34x12,38x10,44x8",   "toFailure": false },
  { "sessionExerciseId": "set78", "exerciseId": "16", "sessionId": "ses26", "sets": "74x10,84x8,94x6",    "toFailure": false },

  // Session ses27 - Pull
  { "sessionExerciseId": "set79", "exerciseId": "14", "sessionId": "ses27", "sets": "46x12,50x10,54x8",   "toFailure": false },
  { "sessionExerciseId": "set80", "exerciseId": "10", "sessionId": "ses27", "sets": "13x15,15x12,18x10",  "toFailure": true  },
  { "sessionExerciseId": "set81", "exerciseId": "11", "sessionId": "ses27", "sets": "0x8,0x7,0x7",        "toFailure": false },

  // Session ses28 - Push
  { "sessionExerciseId": "set82", "exerciseId": "5",  "sessionId": "ses28", "sets": "60x10,67x8,72x6",    "toFailure": false },
  { "sessionExerciseId": "set83", "exerciseId": "7",  "sessionId": "ses28", "sets": "13x15,15x12,18x10",  "toFailure": true  },
  { "sessionExerciseId": "set84", "exerciseId": "8",  "sessionId": "ses28", "sets": "38x10,43x8,48x6",    "toFailure": false },

  // Session ses01 - Pull
  { "sessionExerciseId": "set01", "exerciseId": "11", "sessionId": "ses01", "sets": "0x8,0x7,0x6",        "toFailure": false },
  { "sessionExerciseId": "set02", "exerciseId": "1",  "sessionId": "ses01", "sets": "20x12,22x10,24x8",   "toFailure": false },
  { "sessionExerciseId": "set03", "exerciseId": "13", "sessionId": "ses01", "sets": "50x12,55x10,60x8",   "toFailure": false },

  // Session ses02 - Push
  { "sessionExerciseId": "set04", "exerciseId": "5",  "sessionId": "ses02", "sets": "60x10,70x8,75x6",    "toFailure": false },
  { "sessionExerciseId": "set05", "exerciseId": "8",  "sessionId": "ses02", "sets": "40x10,45x8,50x6",    "toFailure": false },
  { "sessionExerciseId": "set06", "exerciseId": "3",  "sessionId": "ses02", "sets": "25x12,30x10,32x8",   "toFailure": false },

  // Session ses03 - Legs
  { "sessionExerciseId": "set07", "exerciseId": "16", "sessionId": "ses03", "sets": "80x10,90x8,100x6",   "toFailure": false },
  { "sessionExerciseId": "set08", "exerciseId": "18", "sessionId": "ses03", "sets": "60x10,70x8,75x8",    "toFailure": false },
  { "sessionExerciseId": "set09", "exerciseId": "20", "sessionId": "ses03", "sets": "40x15,45x12,50x10",  "toFailure": false },

  // Session ses04 - Pull
  { "sessionExerciseId": "set10", "exerciseId": "12", "sessionId": "ses04", "sets": "60x10,70x8,80x6",    "toFailure": false },
  { "sessionExerciseId": "set11", "exerciseId": "2",  "sessionId": "ses04", "sets": "16x12,18x10,20x8",   "toFailure": false },
  { "sessionExerciseId": "set12", "exerciseId": "15", "sessionId": "ses04", "sets": "100x6,110x5,120x4",  "toFailure": false },

  // Session ses05 - Push
  { "sessionExerciseId": "set13", "exerciseId": "6",  "sessionId": "ses05", "sets": "50x10,55x8,60x6",    "toFailure": false },
  { "sessionExerciseId": "set14", "exerciseId": "9",  "sessionId": "ses05", "sets": "10x15,12x12,14x10",  "toFailure": true  },
  { "sessionExerciseId": "set15", "exerciseId": "4",  "sessionId": "ses05", "sets": "20x12,25x10,27x8",   "toFailure": false },
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