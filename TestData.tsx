interface UserProfile {
  userId: string;
  email: string;
  username: string;

  stats?: {
    height_cm?: number;
    cur_weight_kg?: number;
    tar_weight_kg?: number;
  };

  goals?: {
    description: string,
    achieved: boolean,
  }[];
  role: "member" | "trainer";

  createdAt: string;
  updatedAt?: string;
}

interface Exercise {
    exerciseId: string
    name: string
    targetGroup: string
    targetMuscle: string
    toFailure: boolean
    sets: {
        repetitions: number
        weight: number
    }[]
}

interface Session {
    sessionId: String,
    userId: UserProfile["userId"],
    date: Date,
    focus: string
    exorsises: [Exercise[]]
}
