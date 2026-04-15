import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import type { exercise, session, sessionExercise } from "../../Helpers/customTypes";
import { deleteSession, deleteSessionExercise, fetchFromTable } from "../../Helpers/APIfunctions";
import NewSessionExerciseForm from "../Forms/NewSessionExerciseForm";

import '../../CSS/Body.css'
import '../../CSS/Form.css'



type Props = {
  session: session;  
  setSessionData: React.Dispatch<React.SetStateAction<session[]>>;
  exercises: exercise[];  
  sessionExercises: sessionExercise[];
  setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>;
  userId: string;
}

export default function SessionEle({session, setSessionData, exercises, sessionExercises, setSessionExercises, userId}: Props) {
  const [newSetFormOpen, setNewSetFormOpen] = useState(false);
  const [editSession, setEditSession] = useState(false);
  const [delSeshConfirmOpen, setDelSeshConfirmOpen] = useState(false);
  const [delSetVisible, setDelSetVisible] = useState(false);
  
  return (
    <div className="session_ele">
      {delSeshConfirmOpen && <div className="Form"> 
          <div className="F_feildCont">
            <div>Are you sure you want to delete your {displayDate(session.dateDone)} session</div>
            <div className="f_fc_Row">
              <button onClick={()=>handleDeleteSession(session.sessionId, setSessionData, userId)}>Yes</button>
              <button onClick={()=> setDelSeshConfirmOpen(false)}>No</button>                 
            </div>
          </div>
      </div>}

      <div className="s_e_header">
        <div onClick={()=> console.log(session)}>{session.focus} {displayDate(session.dateDone)}</div>
        {editSession &&
          <div>
            <button onClick={()=> setDelSeshConfirmOpen(true)}>Del</button>
            <button onClick={()=> setEditSession(false)}>Cancel</button>          
          </div>
        }  
        {!editSession &&<button onClick={()=> setEditSession(true)}>Edit</button>}
      </div>
      
      {editSession &&
        <div className="middle_column">
          {!newSetFormOpen && <button onClick={()=> setNewSetFormOpen(true)}>Add exercise</button>}
          {newSetFormOpen && <button onClick={()=> setNewSetFormOpen(false)}>Cancel</button>}
          {!newSetFormOpen && <button onClick={()=> setDelSetVisible(!delSetVisible)}>Deletes sets</button>}
        </div>      
      }

      {newSetFormOpen && 
        <div className="F_inset_feildCont">
          <NewSessionExerciseForm 
            sessionId = {session?.sessionId} 
            exercises = {exercises}
            setSessionExercises={setSessionExercises}
            userId = {userId}
            setNewSetFormOpen = {setNewSetFormOpen}
          />
        </div>
      }        
      {sessionExercises.filter(set => set.sessionId === session.sessionId).map(sessionExercise => {
        const setEx = getExercise(sessionExercise.exerciseId, exercises);
        

        
        return (
          <div className="s_e_set" key={sessionExercise.sessionExerciseId}>
            <div className="s_e_header">
              <div onClick={()=> console.log(sessionExercise)}>{setEx?.name}:</div>
              {delSetVisible && <button onClick={() => handleDeleteSessionExercise(sessionExercise.sessionExerciseId, setSessionExercises, userId)}>Del</button>}
            </div>
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

async function handleDeleteSession(sessionId:string, setSessionData: React.Dispatch<React.SetStateAction<session[]>>, userId: string ){
  await deleteSession(sessionId)
  const data = await fetchFromTable(userId, "sessions")
  setSessionData(data)
}

async function handleDeleteSessionExercise(sessionExerciseId:string, setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>, userId: string ){
  await deleteSessionExercise(sessionExerciseId)
  const data = await fetchFromTable(userId, "sets")
  setSessionExercises(data)
}