import { fetchAuthSession } from "aws-amplify/auth";
import type { exercise, session, sessionExercise } from "./customTypes";

const invokeid = "8wh7ltp62l" //-----------------------------------Update after Destroy - Deploy
const authSession = await fetchAuthSession();
const token = authSession.tokens?.idToken?.toString();

export async function getToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? "";
}

//#region: Sessions
// C works
export async function createSession(newSession: session) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions`;
    console.log(newSession);

    try {
        const authSession = await fetchAuthSession();
        const token = authSession.tokens?.idToken?.toString();

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(newSession),
        });

        const text = await response.text();
        const result = JSON.parse(text);

        console.log("Session created:", result);
        return result;
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R works
export async function getSessions(userId: string, startDate: string, endDate: string) {

    try {
        const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions?userId=${userId}&startDate=${startDate}&endDate=${endDate}`;

        const authSession = await fetchAuthSession();
        const token = authSession.tokens?.idToken?.toString();

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
            },
        });

        const text = await response.text();
        const parsed = JSON.parse(text);
        
        return Array.isArray(parsed) ? parsed : parsed.Items ?? [];        
    } catch (error) {
        console.error("FAILED to get sessions: " + error);
        return [];
    }

}
// U works
export async function updateSession(newSession: session) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions/${newSession.sessionId}`;
    console.log(url);

    try {
        console.log("updating session...");

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ?? "",
            },
            body: JSON.stringify(newSession),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        const result = JSON.parse(text);

        console.log("Session Updated:", result);
        return result;
    } catch (error) {
        console.error("Failed to PUT:", error);
        throw error;
    }
}
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
        const result = JSON.parse(text);
        return result;
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
// C - works
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
export async function getSessionExerciseBySession(sessionId: string): Promise<sessionExercise[]> {
  const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessionExercise?sessionId=${sessionId}`;
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
export async function updateSessionExercise(newSessionExercise: sessionExercise) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessionExercise/${newSessionExercise.sessionExerciseId}`;;
    console.log(url);

    try {
        console.log("updating session...");

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ?? "",
            },
            body: JSON.stringify(newSessionExercise),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        const result = JSON.parse(text);

        console.log("Session Updated:", result);
        return result;
    } catch (error) {
        console.error("Failed to PUT:", error);
        throw error;
    }
}
// D - works
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