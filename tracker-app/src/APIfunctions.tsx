import { v4 as uuidv4 } from 'uuid';


//#region: Exercises
// C
export async function createExercise() {
   const url = "https://q5yv5ilvsh.execute-api.ap-southeast-2.amazonaws.com/prod/exercises";
    try {
        console.log("creating...");
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
        
        let result;
        try {
            result = await response.json();
        } catch {
            result = await response.text();
        }

        console.log("Exersise created:", result);
        return result;
    } catch (error) {
        console.error("Failed to fetch:", error);
        throw error;
    }
}
// R
export async function getExercises() {
  const response = await fetch("https://q5yv5ilvsh.execute-api.ap-southeast-2.amazonaws.com/prod/exercises",{method: 'GET'})
  const data = await response.json();
  console.log("getPageItems() succesfully executed");
  console.log(data);
  
  return Promise.resolve(data)
}
// U
// D
//#endregion

//#region: Sessions
// C
export async function createSession() {
   const url = "https://q5yv5ilvsh.execute-api.ap-southeast-2.amazonaws.com/prod/sessions";
    try {
        console.log("creating...");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId: uuidv4(),
                userId: "string",
                name: "testSesh",
                focus: "string",
                sets: [],
            }),
        });
        
        let result;
        try {
            result = await response.json();
        } catch {
            result = await response.text();
        }

        console.log("Session created:", result);
        return result;
    } catch (error) {
        console.error("Session to fetch:", error);
        throw error;
    }
}
// R
export async function getSessions() {
  const response = await fetch("https://q5yv5ilvsh.execute-api.ap-southeast-2.amazonaws.com/prod/sessions",{method: 'GET'})
  const data = await response.json();
  console.log("getPageItems() succesfully executed");
  console.log(data);
  
  return Promise.resolve(data)
}
// U
// D
//#endregion

//#region: 
// C
// R
// U
// D
//#endregion