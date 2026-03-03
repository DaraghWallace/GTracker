interface UserProfile {
  userId: string;
  email: string;
  username: string;

  height_cm?: number;
  cur_weight_kg?: number;
  tar_weight_kg?: number;

  goals?: {
    description: string,
    achieved: boolean,
  }[];
  role: "member" | "trainer";

  createdAt: string;
  updatedAt?: string;
}

export interface ExerciseSet {
  repetitions: number;
  weight: number;
}

export interface Exercise {
  exerciseId: string;
  name: string;
  targetGroup: string;
  targetMuscle: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  date: string; // ISO string for DynamoDB
  focus: string;
  exercises: Exercise[];
}
