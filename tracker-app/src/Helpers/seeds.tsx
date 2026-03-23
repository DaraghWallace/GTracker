import { createExercise } from "./APIfunctions";
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

export function getRandomQuote(): bar {
  return bars[Math.floor(Math.random() * bars.length)];
}