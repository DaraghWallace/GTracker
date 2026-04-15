import { createExercise, createSession, createSessionExercise } from "./APIfunctions";
import type { bar } from "./customTypes";
import { bars } from "../assets/bars";


const exercises = [
  { "exerciseId": "1", "name": "Barbell Curl", "group": "Arms", "muscle": "Biceps", "ppl": "Pull" },
  { "exerciseId": "2", "name": "Hammer Curl", "group": "Arms", "muscle": "Brachialis", "ppl": "Pull" },
  { "exerciseId": "3", "name": "Tricep Pushdown", "group": "Arms", "muscle": "Triceps", "ppl": "Push" },
  { "exerciseId": "4", "name": "Skull Crusher", "group": "Arms", "muscle": "Triceps", "ppl": "Push" },
  { "exerciseId": "5", "name": "Bench Press", "group": "Chest", "muscle": "Pectorals", "ppl": "Push" },
  { "exerciseId": "6", "name": "Incline Bench Press", "group": "Chest", "muscle": "Upper Chest", "ppl": "Push" },
  { "exerciseId": "7", "name": "Cable Fly", "group": "Chest", "muscle": "Pectorals", "ppl": "Push" },
  { "exerciseId": "8", "name": "Overhead Press", "group": "Shoulders", "muscle": "Front Delts", "ppl": "Push" },
  { "exerciseId": "9", "name": "Lateral Raise", "group": "Shoulders", "muscle": "Side Delts", "ppl": "Push" },
  { "exerciseId": "10", "name": "Face Pull", "group": "Shoulders", "muscle": "Rear Delts", "ppl": "Pull" },
  { "exerciseId": "11", "name": "Pull Up", "group": "Back", "muscle": "Lats", "ppl": "Pull" },
  { "exerciseId": "12", "name": "Barbell Row", "group": "Back", "muscle": "Mid Back", "ppl": "Pull" },
  { "exerciseId": "13", "name": "Lat Pulldown", "group": "Back", "muscle": "Lats", "ppl": "Pull" },
  { "exerciseId": "14", "name": "Seated Cable Row", "group": "Back", "muscle": "Mid Back", "ppl": "Pull" },
  { "exerciseId": "15", "name": "Deadlift", "group": "Back", "muscle": "Lower Back", "ppl": "Pull" },
  { "exerciseId": "16", "name": "Squat", "group": "Legs", "muscle": "Quads", "ppl": "Legs" },
  { "exerciseId": "17", "name": "Leg Press", "group": "Legs", "muscle": "Quads", "ppl": "Legs" },
  { "exerciseId": "18", "name": "Romanian Deadlift", "group": "Legs", "muscle": "Hamstrings", "ppl": "Legs" },
  { "exerciseId": "19", "name": "Leg Curl", "group": "Legs", "muscle": "Hamstrings", "ppl": "Legs" },
  { "exerciseId": "20", "name": "Calf Raise", "group": "Legs", "muscle": "Calves", "ppl": "Legs" },
];

const sessions = [
  // January
  { "sessionId": "ses11", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-01-02", "focus": "Pull", "notes": "seeded", "userWeight": 82.0 },
  { "sessionId": "ses12", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-01-04", "focus": "Push", "notes": "seeded", "userWeight": 81.8 },
  { "sessionId": "ses13", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-01-06", "focus": "Legs", "notes": "seeded", "userWeight": 82.2 },
  { "sessionId": "ses14", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-01-08", "focus": "Pull", "notes": "seeded", "userWeight": 81.5 },
  { "sessionId": "ses15", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-01-10", "focus": "Push", "notes": "seeded", "userWeight": 81.7 },
  // February
  { "sessionId": "ses24", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-02-02", "focus": "Pull", "notes": "seeded", "userWeight": 81.2 },
  { "sessionId": "ses25", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-02-04", "focus": "Push", "notes": "seeded", "userWeight": 80.9 },
  { "sessionId": "ses26", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-02-06", "focus": "Legs", "notes": "seeded", "userWeight": 81.1 },
  { "sessionId": "ses27", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-02-09", "focus": "Pull", "notes": "seeded", "userWeight": 80.6 },
  { "sessionId": "ses28", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-02-11", "focus": "Push", "notes": "seeded", "userWeight": 80.8 },
  // March
  { "sessionId": "ses01", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-03", "focus": "Pull", "notes": "seeded", "userWeight": 80.3 },
  { "sessionId": "ses02", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-05", "focus": "Push", "notes": "seeded", "userWeight": 80.5 },
  { "sessionId": "ses03", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-07", "focus": "Legs", "notes": "seeded", "userWeight": 80.1 },
  { "sessionId": "ses04", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-09", "focus": "Pull", "notes": "seeded", "userWeight": 79.8 },
  { "sessionId": "ses05", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-11", "focus": "Push", "notes": "seeded", "userWeight": 80.0 },
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