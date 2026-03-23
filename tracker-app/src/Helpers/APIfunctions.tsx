import { fetchAuthSession } from "aws-amplify/auth";
import type { exercise, session, set } from "./customTypes";

const invokeid = "zyuq79jc9c"
const authSession = await fetchAuthSession();
const token = authSession.tokens?.idToken?.toString();


//#region: 
// C
// R
// U
// D
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
  return JSON.parse(text);
}
// U
// D
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

//#region: Sets
// C
export async function createSet(newSet: set) {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sets`;

    try {
        console.log("creating set...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ?? "",
            },
            body: JSON.stringify(newSet),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            result = text;
        }
        console.log("Set created:", result);
        return result;
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R
export async function getSetBySession(sessionId:string) {
  const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sets?sessionId=${sessionId}`
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