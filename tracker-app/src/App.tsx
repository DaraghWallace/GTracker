import { useEffect, useState } from 'react';

import { createExercise, createSession, getExercises , getSessions} from './APIfunctions';

type Exercise = {
  exerciseId: string;
  name: string;
};
type Session = {
  sessionId: string;
  name: string;
};
function App() {
  const [exercices, setExercises] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    // setSiteStatus("Pending")
    try {
      (async () => {
        setExercises(await getExercises())
        setSessions(await getSessions())
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
        {sessions.map((session:Session)=>{
          return <div>{session.sessionId} - {session.name}</div>
        })}
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
