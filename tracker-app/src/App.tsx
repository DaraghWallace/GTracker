import { useEffect, useState } from 'react';

import { createExercise, createSession, getExercises } from './APIfunctions';

type Exercise = {
  exerciseId: string;
  name: string;
};

function App() {
  const [exercices, setExercises] = useState([])

  useEffect(() => {
    // setSiteStatus("Pending")
    try {
      (async () => {
        setExercises(await getExercises())
        // setSiteStatus("Ready")
      })()      
    } catch (error) {
      console.error("problem with fetchData: " + error);
    }
  }, []);

  return (
    <>
      <div>
      </div>

      <div>
        <button onClick={handleCreateExersise}>make exersise</button>
        {exercices.map((exercise:Exercise)=>{
          return <div>{exercise.exerciseId} - {exercise.name}</div>
        })}
      </div>

      <div>
        <button onClick={handleCreateSession}>make session</button>

        {/* {exercices.map((exercise:Exercise)=>{
          return <div>{exercise.exerciseId} - {exercise.name}</div>
        })} */}
      </div>

      <div>
        <button onClick={handleCreateSet}>make set</button>        

        {/* {exercices.map((exercise:Exercise)=>{
          return <div>{exercise.exerciseId} - {exercise.name}</div>
        })} */}
      </div>
    </>
  )
}

async function handleCreateExersise() {
  createExercise()

}

function handleCreateSession() {
  console.log("createSession");
  createSession()
}

function handleCreateSet() {
  console.log("createSet");
}

export default App
