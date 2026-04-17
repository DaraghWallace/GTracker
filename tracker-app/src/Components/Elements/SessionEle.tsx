import { useState, type Dispatch, type SetStateAction } from "react";

import SessionExerciseEle from "./SessionExerciseEle"

import type { exercise, session, sessionExercise } from "../../Helpers/customTypes";
import { deleteSession, fetchFromTable, updateSession } from "../../Helpers/APIfunctions";
import NewSessionExerciseForm from "../Forms/NewSessionExerciseForm";

import "../../CSS/App.css"
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
  const [newFocus, setNewFocus] = useState(session.focus);
  const [newDateDone, setNewDateDone] = useState(session.dateDone);
  const [newUserWeight, setNewUserWeight] = useState(session.userWeight);

  const [editSetVisible, setEditSetVisible] = useState(false);

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
        {editSession? 
          <div>
            <input placeholder={session.focus || "Focus"} size={9} value={newFocus || ""}
              onChange={(e) => setNewFocus(e.target.value)}
            />-
            <input placeholder={session.dateDone} type="date" value={newDateDone}
              onChange={(e) => setNewDateDone(e.target.value)}
            />- 
            <input placeholder={session.dateDone} type="number" value={newUserWeight}
              onChange={(e) => setNewUserWeight(Number(e.target.value))}
            />kgs       
          </div>
          :
          <div onClick={()=> console.log(session)}>{session.focus} {displayDate(session.dateDone) + ` (${session.userWeight}kg)`}</div>      
        }

        {editSession &&
          <div>
            <button onClick={()=>handleUpdateSession(session, newFocus, newDateDone, newUserWeight, setEditSession, setSessionData)}>S</button>
            <button onClick={()=> setDelSeshConfirmOpen(true)}>D</button>
            <button onClick={()=> {setEditSession(false); setEditSetVisible(false)}}>C</button>          
          </div>
        }  
        {!editSession &&<button onClick={()=> setEditSession(true)}>Edit</button>}
      </div>
      
      {editSession &&
        <div className="middle_column">
          {!newSetFormOpen && <button onClick={()=> setNewSetFormOpen(true)}>Add exercise</button>}
          {newSetFormOpen && <button onClick={()=> setNewSetFormOpen(false)}>Cancel</button>}
          {!newSetFormOpen && <button onClick={()=> setEditSetVisible(!editSetVisible)}>Edit sets</button>}
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
      {sessionExercises.filter(set => set.sessionId === session.sessionId).map((sessionExercise, index) => {
        return <SessionExerciseEle key={index}
          sessionExercise = {sessionExercise}
          exercises = {exercises}
          editSetVisible = {editSetVisible}
          setSessionExercises = {setSessionExercises}
          userId={userId}
        />
      })}
    </div>
  )
}

async function handleUpdateSession(session:session, newFocus:string | null, newDateDone:string, newUserWeight:number, setEditSession: Dispatch<SetStateAction<boolean>>, setSessionData: Dispatch<SetStateAction<session[]>>) {
  const newSession: session = {
    sessionId: session.sessionId,
    userId: session.userId,
    userWeight: newUserWeight,
    dateDone: newDateDone,
    focus: newFocus,
    notes: session.notes, //TODO
  }
  await updateSession(newSession)
  const updatedData:session[] = await fetchFromTable(session.userId, "sessions")
  setSessionData(updatedData)
  setEditSession(false)

}

function displayDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

async function handleDeleteSession(sessionId:string, setSessionData: React.Dispatch<React.SetStateAction<session[]>>, userId: string ){
  await deleteSession(sessionId)
  const data = await fetchFromTable(userId, "sessions")
  setSessionData(data)
}