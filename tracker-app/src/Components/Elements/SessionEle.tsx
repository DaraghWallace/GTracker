import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import type { exercise, session, set } from "../../Helpers/customTypes";
import NewSetForm from "../Forms/NewSetForm";

import '../../CSS/Body.css'


type Props = {
  session: session;  
  exercises: exercise[];  
  setData: set[];
  loadUserData: (userId: string) => Promise<void>;
  userId: string;
}

export default function SessionEle({session, exercises, setData, loadUserData, userId}: Props) {
  const [newSetFormOpen, setNewSetFormOpen] = useState(false);
  
  return (
    <div className="session_ele">
      <div>{session.focus} {displayDate(session.dateDone)}</div>
      {!newSetFormOpen && <button onClick={()=> setNewSetFormOpen(true)}>Add exercise</button>}
      {newSetFormOpen && <button onClick={()=> setNewSetFormOpen(false)}>Cancel</button>}
      <div>
        {
          newSetFormOpen && <NewSetForm 
            sessionId = {session?.sessionId} 
            exercises = {exercises}
            loadUserData = {loadUserData}
            userId = {userId}
          />
        }        
      </div>
      {setData.filter(set => set.sessionId === session.sessionId).map(set => {
        const setEx = getExercise(set.exerciseId, exercises);
        return (
          <div className="s_e_set" key={set.setId}>
            {setEx?.name}:
            <div className="s_e_s_weights">
              {displaySet(set.weights_kgs).map(weight=>{return (
                <div className="s_e_s_w_num" key={uuidv4()}>{weight} (x##)</div>
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

function displaySet( reps :string) : number[]{
  const weightStrArr = reps.split(',')
  const weightNumArr : number[] = []
  weightStrArr.forEach(weight => {
    weightNumArr.push(Number(weight))
  });

  return weightNumArr
}