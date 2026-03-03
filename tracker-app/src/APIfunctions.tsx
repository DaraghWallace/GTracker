import { v4 as uuidv4 } from 'uuid';

export async function createExercise() {
   const url = "https://pfl7tgna8e.execute-api.ap-southeast-2.amazonaws.com/prod/exercises";
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