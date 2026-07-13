import { fetchAuthSession } from "aws-amplify/auth";
import type { exercise, session, sessionExercise } from "./customTypes";

const API_URL = import.meta.env.VITE_API_URL;

export async function getToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? "";
}

//#region: Sessions
// C works
export async function createSession(newSession: session) {
    const token = await getToken()
    const url = `${API_URL}sessions`;
    console.log(newSession);

    try {
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
export async function getSessions(startDate: string, endDate: string) {
    const token = await getToken()

    try {
        const url = `${API_URL}sessions?&startDate=${startDate}&endDate=${endDate}`;
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
    const token = await getToken()
    const url = `${API_URL}sessions/${newSession.sessionId}`;

    try {
        console.log("updating session...");

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
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
    const token = await getToken()
    if (!token) throw new Error("No auth token");
        const response = await fetch(`${API_URL}sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
            "Authorization": token ? `Bearer ${token}` : "",
        },

        
    });



  if (!response.ok) {
    console.log(response.json());
    throw new Error("Failed to delete session");
  } else console.log("Session Deleted");
};

//#endregion

//#region: Exercises
// C - works
export async function createExercise(newExercise: exercise) {
    const token = await getToken()
    const url = `${API_URL}/exercises`;
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
    const token = await getToken()
    const url = `${API_URL}exercises`;

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
    const token = await getToken()
    const url = `${API_URL}sessionExercises`;

    try {
        console.log("creating SessionExercise...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
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
export async function getSessionExerciseBySession(sessionId: string): Promise<sessionExercise[]> {
    const token = await getToken()
    const url = `${API_URL}sessionExercises?sessionId=${sessionId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": token ? `Bearer ${token}` : "",
        },
    });

    const text = await response.text();
    return JSON.parse(text);
}

// U
export async function updateSessionExercise(newSessionExercise: sessionExercise) {
    const token = await getToken()
    const url = `${API_URL}sessionExercises/${newSessionExercise.sessionExerciseId}`;
    console.log(url);

    try {
        console.log("updating session...");

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
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

// D
export const deleteSessionExercise = async (sessionExerciseId: string) => {
    const token = await getToken()

    if (!token) throw new Error("No auth token");
    const response = await fetch(`${API_URL}sessionExercises/${sessionExerciseId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete Session Exercise");
    } else console.log("Session Exercise Deleted");
};
//#endregion