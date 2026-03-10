import { useEffect, useState } from 'react';

import { 
  createExercise, createSession, createSet,
  // getExercises , getSessions, 
  getSets
} from './APIfunctions';

type Set = {
  id: string,
  weight: number
}

function App() {
  // const [exercises, setExercises] = useState([])
  // const [sessions, setSessions] = useState([])
  const [sets, setSets] = useState([])

  useEffect(() => {
    try {
      (async () => {
        // setExercises(await getExercises())
        // setSessions(await getSessions())
        setSets(await getSets())
      })()      
    } catch (error) {
      console.error("problem with fetchData: " + error);
    }
  }, []);

  return (
    <>
      <div>
        <button onClick={handleCreateExersise}>make exercise</button>
        {/* {exercises.map((exercise:Exercise)=>{
          return <div>{exercise.exerciseId} - {exercise.name}</div>
        })} */}
      </div>

      <div>
        <button onClick={handleCreateSession}>make session</button>
        {/* {sessions.map((session:Session)=>{
          return <div>{session.sessionId} - {session.name}</div>
        })} */}
      </div>

      <div>
        <button onClick={handleCreateSet}>make set</button>        
        {sets.map((set:Set)=>{
          return <div>{set.id} - {set.weight}</div>
        })}
      </div>
    </>
  )
}

async function handleCreateExersise() {
  createExercise()
}

function handleCreateSession() {
  createSession()
}

function handleCreateSet() {
  createSet();
}

export default App
