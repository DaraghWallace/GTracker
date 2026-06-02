import { createExercise, /*createSession, createSessionExercise*/ } from "./APIfunctions";
import type { bar } from "./customTypes";
import { bars } from "../assets/bars";


const exercises = [
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



// const sessions = [];

// const sessionsExercises = [];

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

// export async function seedSessions() {
//   for (const session of sessions) {
//     try {
//       await createSession(session);
//       console.log("created - Session", session.sessionId);
      
//     } catch (e: unknown) {
//       console.error("failed to create - ", session.sessionId, " : ", e);
//     }
//   }
//   console.log("Done!");
// }

// export async function seedSessionsExercises() {
//   for (const sessionsExercise of sessionsExercises) {
//     try {
//       await createSessionExercise(sessionsExercise);
//       console.log("created - sessionsExercise");
      
//     } catch (e: unknown) {
//       console.error("failed to create - sessionsExercise: ", e);
//     }
//   }
//   console.log("Done!");
// }

export function getRandomQuote(): bar {
  return bars[Math.floor(Math.random() * bars.length)];
}