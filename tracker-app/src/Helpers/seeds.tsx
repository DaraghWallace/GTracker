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
  { "sessionId": "1", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-03", "focus": "Pull", "notes": "seeded" },
  { "sessionId": "2", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-05", "focus": "Push", "notes": "seeded" },
  { "sessionId": "3", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-07", "focus": "Legs", "notes": "seeded" },
  { "sessionId": "4", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-09", "focus": "Pull", "notes": "seeded" },
  { "sessionId": "5", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-11", "focus": "Push", "notes": "seeded" },
  { "sessionId": "6", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-13", "focus": "Legs", "notes": "seeded" },
  { "sessionId": "7", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-15", "focus": "Pull", "notes": "seeded" },
  { "sessionId": "8", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-17", "focus": "Push", "notes": "seeded" },
  { "sessionId": "9", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-19", "focus": "Legs", "notes": "seeded" },
  { "sessionId": "10", "userId": "f9ce44a8-c091-7016-2d52-e469a07ea283", "dateDone": "2026-03-21", "focus": "Full Body", "notes": "seeded" },
];

const sessionsExercises = [
  // Session 1 - Pull
  { "sessionExerciseId": "1",  "exerciseId": "11", "sessionId": "1", "sets": "0x8,0x7,0x6",          "toFailure": false },
  { "sessionExerciseId": "2",  "exerciseId": "1",  "sessionId": "1", "sets": "20x12,22x10,24x8",         "toFailure": false },
  { "sessionExerciseId": "3",  "exerciseId": "13", "sessionId": "1", "sets": "50x12,55x10,60x8",         "toFailure": false },

  // Session 2 - Push
  { "sessionExerciseId": "4",  "exerciseId": "5",  "sessionId": "2", "sets": "60x10,70x8,75x6",          "toFailure": false },
  { "sessionExerciseId": "5",  "exerciseId": "8",  "sessionId": "2", "sets": "40x10,45x8,50x6",          "toFailure": false },
  { "sessionExerciseId": "6",  "exerciseId": "3",  "sessionId": "2", "sets": "25x12,30x10,32x8",         "toFailure": false },

  // Session 3 - Legs
  { "sessionExerciseId": "7",  "exerciseId": "16", "sessionId": "3", "sets": "80x10,90x8,100x6",         "toFailure": false },
  { "sessionExerciseId": "8",  "exerciseId": "18", "sessionId": "3", "sets": "60x10,70x8,75x8",          "toFailure": false },
  { "sessionExerciseId": "9",  "exerciseId": "20", "sessionId": "3", "sets": "40x15,45x12,50x10",        "toFailure": false },

  // Session 4 - Pull
  { "sessionExerciseId": "10", "exerciseId": "12", "sessionId": "4", "sets": "60x10,70x8,80x6",          "toFailure": false },
  { "sessionExerciseId": "11", "exerciseId": "2",  "sessionId": "4", "sets": "16x12,18x10,20x8",         "toFailure": false },
  { "sessionExerciseId": "12", "exerciseId": "15", "sessionId": "4", "sets": "100x6,110x5,120x4",        "toFailure": false },

  // Session 5 - Push
  { "sessionExerciseId": "13", "exerciseId": "6",  "sessionId": "5", "sets": "50x10,55x8,60x6",          "toFailure": false },
  { "sessionExerciseId": "14", "exerciseId": "9",  "sessionId": "5", "sets": "10x15,12x12,14x10",        "toFailure": true  },
  { "sessionExerciseId": "15", "exerciseId": "4",  "sessionId": "5", "sets": "20x12,25x10,27x8",         "toFailure": false },

  // Session 6 - Legs
  { "sessionExerciseId": "16", "exerciseId": "17", "sessionId": "6", "sets": "120x12,140x10,160x8",      "toFailure": false },
  { "sessionExerciseId": "17", "exerciseId": "19", "sessionId": "6", "sets": "40x12,45x10,50x8",         "toFailure": false },
  { "sessionExerciseId": "18", "exerciseId": "16", "sessionId": "6", "sets": "85x10,95x8,105x6",         "toFailure": false },

  // Session 7 - Pull
  { "sessionExerciseId": "19", "exerciseId": "14", "sessionId": "7", "sets": "50x12,55x10,60x8",         "toFailure": false },
  { "sessionExerciseId": "20", "exerciseId": "10", "sessionId": "7", "sets": "15x15,17x12,20x10",        "toFailure": true  },
  { "sessionExerciseId": "21", "exerciseId": "11", "sessionId": "7", "sets": "0x9,0x8,0x7",           "toFailure": false },

  // Session 8 - Push
  { "sessionExerciseId": "22", "exerciseId": "5",  "sessionId": "8", "sets": "65x10,72x8,77x6",          "toFailure": false },
  { "sessionExerciseId": "23", "exerciseId": "7",  "sessionId": "8", "sets": "15x15,17x12,20x10",        "toFailure": true  },
  { "sessionExerciseId": "24", "exerciseId": "8",  "sessionId": "8", "sets": "42x10,47x8,52x6",          "toFailure": false },

  // Session 9 - Legs
  { "sessionExerciseId": "25", "exerciseId": "16", "sessionId": "9", "sets": "90x10,100x8,110x6",        "toFailure": false },
  { "sessionExerciseId": "26", "exerciseId": "18", "sessionId": "9", "sets": "65x10,72x8,78x8",          "toFailure": false },
  { "sessionExerciseId": "27", "exerciseId": "20", "sessionId": "9", "sets": "45x15,50x12,55x10",        "toFailure": false },

  // Session 10 - Full Body
  { "sessionExerciseId": "28", "exerciseId": "5",  "sessionId": "10", "sets": "67x10,74x8,79x6",         "toFailure": false },
  { "sessionExerciseId": "29", "exerciseId": "16", "sessionId": "10", "sets": "92x10,102x8,112x6",       "toFailure": false },
  { "sessionExerciseId": "30", "exerciseId": "12", "sessionId": "10", "sets": "65x10,72x8,82x6",         "toFailure": false },
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