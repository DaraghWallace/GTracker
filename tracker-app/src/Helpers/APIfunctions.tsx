import { fetchAuthSession } from "aws-amplify/auth";
import type { exercise, session, sessionExercise } from "./customTypes";

const invokeid = "2egaivggi6"
const authSession = await fetchAuthSession();
const token = authSession.tokens?.idToken?.toString();

export async function getToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? "";
}

//#region: Lil Helpers
export async function fetchFromTable(userId: string, table:string) {
    switch (table) {
        case "sessions":{ // fetchFromTable(userId, "sessions")
            // console.log("Getting Sessions");
            return getSessions(userId).then(sessions => 
                sessions.sort((a: session, b: session) => new Date(b.dateDone).getTime() - new Date(a.dateDone).getTime())
            );
        }case "sets":{ // fetchFromTable(userId, "sets")
            // console.log("Getting Sets");
            const sessions = await getSessions(userId)
            const sessionExercises = await Promise.all(
                sessions.map((session: session) => getSessionExerciseBySession(session.sessionId))
            )
            return sessionExercises.flat()
        }case "exercises":{ // fetchFromTable(userId, "exercises")
            // console.log("Getting Exercises");
            return getExercises()
        }
        default:
            break;
    }
}
//#endregion

//#region: Sessions
// C works
export async function createSession(newSession: session) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions`;
    console.log(newSession);

    try {
        console.log("creating session...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ?? "",
            },
            body: JSON.stringify(newSession),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        const result = JSON.parse(text);

        console.log("Session created:", result);
        return result;
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R works
export async function getSessions(userId: string) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions?userId=${userId}`;

    const authSession = await fetchAuthSession();
    const token = authSession.tokens?.idToken?.toString();

    const response = await fetch(url, {
        method: "GET",
        headers: {
        "Authorization": token ?? "",
        },
    });

    const text = await response.text();
    const parsed = JSON.parse(text);
    
    return Array.isArray(parsed) ? parsed : parsed.Items ?? [];
}
// U
// D
export const deleteSession = async (sessionId: string) => {
    if (!token) throw new Error("No auth token");
    const response = await fetch(`https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Authorization": token ?? "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete session");
  } else console.log("Session Deleted");
};

//#endregion

//#region: Exercises
// C - works
export async function createExercise(newExercise: exercise) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/exercises`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ?? "",
            },
            body: JSON.stringify(newExercise),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            result = text;
        }

        console.log(newExercise.name , " created:", result);
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R - works
export async function getExercises() {
  const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/exercises`
  const authSession = await fetchAuthSession();
  const token = authSession.tokens?.idToken?.toString();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": token ?? "",
    },
  });

  const text = await response.text();
  return JSON.parse(text);
}
// U
// D
//#endregion

//#region: SessionExercise
// C
export async function createSessionExercise(newSessionExercise: sessionExercise) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessionExercise`;

    try {
        console.log("creating SessionExercise...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ?? "",
            },
            body: JSON.stringify(newSessionExercise),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            result = text;
        }
        console.log("SessionExercise created:", result);
        return result;
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R
export async function getSessionExerciseBySession(sessionId:string) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessionExercise?sessionId=${sessionId}`
    const authSession = await fetchAuthSession();
    const token = authSession.tokens?.idToken?.toString();

    const response = await fetch(url, {
        method: "GET",
        headers: {
        "Authorization": token ?? "",
        },
    });

    

    const text = await response.text();
    
    return JSON.parse(text);
}
// U
// D
export const deleteSessionExercise = async (sessionExerciseId: string) => {
    if (!token) throw new Error("No auth token");
    const response = await fetch(`https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessionExercise/${sessionExerciseId}`, {
    method: "DELETE",
    headers: {
      "Authorization": token ?? "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete Session Exercise");
  } else console.log("Session Exercise Deleted");
};
//#endregion