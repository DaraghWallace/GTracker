import { v4 as uuidv4 } from 'uuid';
const invokeid = "8g7b7ycam7"

//#region: 
// C
// R
// U
// D
//#endregion

//#region: Sessions
// C works
export async function createSession() {
    const url = `https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions`;

    try {
        console.log("creating session...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId: uuidv4(),
                userId: "string",
                focus: "string",
                sets: [],
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
        console.log("Session created:", result);
        return result;
    } catch (error) {
        console.error("Failed to Post:", error);
        throw error;
    }
}
// R works
export async function getSessions() {
  const response = await fetch(`https://${invokeid}.execute-api.ap-southeast-2.amazonaws.com/prod/sessions`,{method: 'GET'})
  const data = await response.json();
  console.log("getSessions() succesfully executed");
  console.log(data);
  
  return Promise.resolve(data)
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
                exerciseId: uuidv4(),
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
                setId: uuidv4(),
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