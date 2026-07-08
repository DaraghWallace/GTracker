import { useState, type Dispatch, type SetStateAction } from "react";

import SessionExerciseEle from "./SessionExerciseEle"
import Loading from "./Loading";

import type { exercise, session, sessionExercise } from "../../Helpers/customTypes";
import { deleteSession, getSessions, updateSession } from "../../Helpers/APIfunctions";
import NewSessionExerciseForm from "../Forms/NewSessionExerciseForm";

import "../../CSS/sessionEle.css"
import "../../CSS/form.css"

import { FaPlus, FaPen, FaXmark, FaCheck, FaTrash } from "react-icons/fa6";


type Props = {
  session: session;  
  setSessionData: React.Dispatch<React.SetStateAction<session[]>>;
  exercises: exercise[];  
  sessionExercises: sessionExercise[];
  setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>;
  userId: string;
  editSessions:boolean;
}

export default function SessionEle({session, setSessionData, exercises, sessionExercises, setSessionExercises, userId, editSessions}: Props) {
  const [newSetFormOpen, setNewSetFormOpen] = useState(false);

  const [editSession, setEditSession] = useState(false);
  const [delSeshConfirmOpen, setDelSeshConfirmOpen] = useState(false);
  const [newFocus, setNewFocus] = useState(session.focus);
  const [newDateDone, setNewDateDone] = useState(session.dateDone);
  const [newUserWeight, setNewUserWeight] = useState(session.userWeight);

  const [editSetVisible, setEditSetVisible] = useState(false);

  const [awaiting, setAwaiting] = useState(false);

  
  try {
    return (
      <div className="Session">
        <div className="s_header">
          {(editSessions && editSession)? 
            <div className="s_header_form">
              <div>Focus: <input type="text" placeholder={session.focus || ""} size={7} value={newFocus || ""}
                onChange={(e) => setNewFocus(e.target.value)}
              /></div>
              <div>Date: <input placeholder={session.dateDone} type="date" value={newDateDone}
                onChange={(e) => setNewDateDone(e.target.value)}
              /></div>
              <div>Weight: <input placeholder={session.dateDone} type="number" value={newUserWeight}
                onChange={(e) => setNewUserWeight(Number(e.target.value))}
              />Kgs </div>   
            </div>
            :
            <div className="s_header_text" /*onClick={()=> console.log(session)}*/>
              <div>{session.focus && `${session.focus}:`} {displayDate(session.dateDone)}</div>
              <div>{session.userWeight > 0 && `${session.userWeight}Kgs`}</div>
              {editSessions && <>{!editSession &&<button onClick={()=> setEditSession(true)}><FaPen/></button>}</>}
              {/* {session.notes} */}
            </div>      
          }

          {(editSessions && editSession) &&
            <div className="s_header_buttons">
              <button onClick={()=> handleUpdateSession(session, newFocus, newDateDone, newUserWeight, setEditSession, setSessionData, setAwaiting)} className="green_button"><FaCheck /></button>
              <button onClick={()=> setDelSeshConfirmOpen(true)} className="red_button"><FaTrash /></button>
              <button onClick={()=> {setEditSession(false); setEditSetVisible(false)}} ><FaXmark/></button>          
            </div>
          }  

          { editSessions &&
            <div className="s_header_buttons">
              {!newSetFormOpen && <button onClick={()=> setNewSetFormOpen(true)} ><FaPlus/></button>}
              {newSetFormOpen && <button onClick={()=> setNewSetFormOpen(false)} ><FaXmark/></button>}
              {editSetVisible ? 
                <button onClick={()=> setEditSetVisible(false)}><FaXmark/></button>
                :
                <button onClick={()=> setEditSetVisible(true)}><FaPen/></button>
              }            
            </div>      
          }          
        </div>
        


        {newSetFormOpen && 
          <div className="F_inset_feildCont">
            <NewSessionExerciseForm 
              sessionId = {session?.sessionId} 
              exercises = {exercises}
              setSessionExercises={setSessionExercises}
              setNewSetFormOpen = {setNewSetFormOpen}
            />
          </div>
        }

        {sessionExercises &&
          <div className="seshEx_container">  
          {sessionExercises.filter(set => set.sessionId === session.sessionId).map((sessionExercise, index) => ( 
            <SessionExerciseEle key={index}
              sessionId = {session.sessionId}
              sessionExercise = {sessionExercise}
              exercises = {exercises}
              editSetVisible = {editSetVisible}
              setSessionExercises = {setSessionExercises}
              editSessions={editSessions}
              editSession={editSession}
            />
            ))}           
          </div>
        }

        {delSeshConfirmOpen && <div className="form"> 
            <div className="f_panel">
              <div className="f_p_e_header">Are you sure you want to delete your {displayDate(session.dateDone)} session</div>
              <div className="f_p_row_c">
                <button onClick={()=> setDelSeshConfirmOpen(false)}><FaXmark/></button>                 
                <button onClick={()=>handleDeleteSession(session.sessionId, setSessionData, userId, setAwaiting)} className="green_button"><FaCheck/></button>
              </div>
            </div>
        </div>}
        {awaiting && <Loading message = {"Submitting Request"}/>}
      </div>
    )    
  } catch (error) {
    console.error("ERROR! Could not display session: ", error);
  }

}

async function handleUpdateSession(session:session, newFocus:string | null, newDateDone:string, newUserWeight:number, 
  setEditSession: Dispatch<SetStateAction<boolean>>, setSessionData: Dispatch<SetStateAction<session[]>>,
  setAwaiting: Dispatch<SetStateAction<boolean>>
  ) {
  const newSession: session = {
    sessionId: session.sessionId,
    userId: session.userId,
    userWeight: newUserWeight,
    dateDone: newDateDone,
    focus: newFocus,
    notes: session.notes, //TODO
  }

  if(session != newSession){
    setAwaiting(true)
    await updateSession(newSession)

    const date = new Date()
    const LastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const updatedData:session[] = await getSessions(
      `${date.getFullYear()}-01-01`,
      `${date.getFullYear()}-12-${LastDay}`
    )
    setSessionData(updatedData)
    setEditSession(false)
    setAwaiting(false)
  }else console.log("no changes");

  
}

function displayDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

async function handleDeleteSession(sessionId:string, setSessionData: React.Dispatch<React.SetStateAction<session[]>>, userId: string, setAwaiting: Dispatch<SetStateAction<boolean>> ){
  setAwaiting(true)
  const date = new Date
  
  await deleteSession(sessionId)
  const data = await getSessions('01/01/2024', `${date.getFullYear()}-12-31`,)
  setSessionData(data)
  setAwaiting(false)
}