import { fetchAuthSession } from "aws-amplify/auth";
import type { session } from "./customTypes";

const invokeid = "mvtpo7wewh"

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
    const authSession = await fetchAuthSession();
    const token = authSession.tokens?.idToken?.toString();
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
export async function createExercise() {
   const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/exercises`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // exerciseId: uuidv4(),
                name: "testEx",
                targetGroup: "string",
                targetMuscle: "string",
            }),
        });

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            result = text;
        }

        console.log("Exercise created:", result);
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R - works
export async function getExercises() {
  const response = await fetch(`https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/exercises`,{method: 'GET'})
  const data = await response.json();
  console.log("getPageItems() succesfully executed");
  console.log(data);
  
  return Promise.resolve(data)
}
// U
// D
//#endregion

//#region: Sets
// C
export async function createSet() {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sets`;

    try {
        console.log("creating set...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // setId: uuidv4(),
                sessionId: "string",
                weight: 100,
                repititions: 10,
                failed: false
            }),
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
export async function getSets() {
  const response = await fetch(`https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sets`,{method: 'GET'})
  const data = await response.json();
  console.log("getSets() succesfully executed");
  console.log(data);
  
  return Promise.resolve(data)
}
// U
// D
//#endregion