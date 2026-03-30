import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import type { exercise, session, sessionExercise } from "../../Helpers/customTypes";
import NewSetForm from "../Forms/NewSessionExerciseForm";

import '../../CSS/Body.css'


type Props = {
  session: session;  
  exercises: exercise[];  
  sessionExercises: sessionExercise[];
  loadUserData: (userId: string) => Promise<void>;
  userId: string;
}

export default function SessionEle({session, exercises, sessionExercises, loadUserData, userId}: Props) {
  const [newSetFormOpen, setNewSetFormOpen] = useState(false);
  
  return (
    <div className="session_ele">
      <div>{session.focus} {displayDate(session.dateDone)} <button onClick={()=> console.log(session)}>?</button></div>
      {!newSetFormOpen && <button onClick={()=> setNewSetFormOpen(true)}>Add exercise</button>}
      {newSetFormOpen && <button onClick={()=> setNewSetFormOpen(false)}>Cancel</button>}
      <div>
        {
          newSetFormOpen && <NewSetForm 
            sessionId = {session?.sessionId} 
            exercises = {exercises}
            loadUserData = {loadUserData}
            userId = {userId}
            setNewSetFormOpen = {setNewSetFormOpen}
          />
        }        
      </div>
      {sessionExercises.filter(set => set.sessionId === session.sessionId).map(sessionExercise => {
        const setEx = getExercise(sessionExercise.exerciseId, exercises);
        
        return (
          <div className="s_e_set" key={sessionExercise.sessionExerciseId}>
            <div>{setEx?.name} <button onClick={()=> console.log(sessionExercise)}>(?)</button>:</div>
            <div className="s_e_s_weights">
              {displaySet(sessionExercise.sets).map(set=>{return (
                <div className="s_e_s_w_num" key={uuidv4()}>{set.weight}kg x {set.reps}</div>
              )})}
            </div>
          </div>
        );
      })}
    </div>
  )
}

function getExercise(exerciseId: string, exercises: exercise[]): exercise | undefined {
  return exercises.find(e => e.exerciseId === exerciseId);
}

function displayDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

type SetObj = { weight: number; reps: number };
function displaySet(sets: string): SetObj[] {
  return sets.split(',').map(weightStr => {
    const [weight, reps] = weightStr.split('x');
    return { weight: Number(weight), reps: Number(reps) };
  });
}