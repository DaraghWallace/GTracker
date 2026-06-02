import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise, sessionExercise } from "../../Helpers/customTypes";
import { deleteSessionExercise, getSessionExerciseBySession, updateSessionExercise } from "../../Helpers/APIfunctions";

import "../../CSS/App.css"

import { FaXmark, FaCheck, FaTrash, FaPen } from "react-icons/fa6";
import Loading from "./Loading";

type props = {
  sessionId: string,
  sessionExercise: sessionExercise,
  exercises: exercise[],
  editSetVisible: boolean,
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>
  editSessions:boolean
  editSession:boolean
}

export default function SessionExerciseEle({sessionId, sessionExercise, exercises, editSetVisible, setSessionExercises, editSessions, editSession}: props){
  const setEx = getExercise(sessionExercise.exerciseId, exercises);
  const [editSets, setEditSets] = useState(false);
  const [newExercise, setNewExercise] = useState(sessionExercise.exerciseId);
  const [newSets, setNewSets] = useState(sessionExercise.sets);
  const [confirmDel, setConfirmDel] = useState(false);
  
  const [awaiting, setAwaiting] = useState(false);

  return (
    <div className="s_e_set" key={sessionExercise.sessionExerciseId}>
      <div className="s_e_e_header">
        <div>
          {(editSessions && editSession && editSets)?          
            <select value={newExercise} onChange={(e)=> setNewExercise(e.target.value)}>
                {exercises.map((exercise)=>{
                  return <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.name}</option>
                })}
              </select>
            :
              <div>{setEx?.name}:</div>
          }
        </div>
        
        {(editSetVisible && editSessions) && 
          <div>
            { (editSession && editSets) &&
              <>
                <button onClick={()=> {handleUpdateSessionExercise(sessionId, sessionExercise, newExercise, newSets, setEditSets, setSessionExercises)}} className="green_button"><FaCheck/></button>
                <button onClick={()=> {handleCancelEdit(setNewSets, sessionExercise, setEditSets)}}><FaXmark/></button>              
                {!confirmDel && <button onClick={()=> setEditSets(true)}><FaPen/></button>}
              </>
            }
            {confirmDel ? 
              <div>
                <button onClick={() => setConfirmDel(false)}><FaXmark/></button>
                Are you Sure<button onClick={() => handleDeleteSessionExercise(sessionId, sessionExercise.sessionExerciseId, setSessionExercises, setAwaiting)} className="red_button"><FaTrash/></button>
              </div>
            :
              <div>
                <button onClick={() => setConfirmDel(true)} className="red_button"><FaTrash/></button>
                {editSets ? <button onClick={() => setEditSets(false)}><FaXmark/></button> :
                <button onClick={() => setEditSets(true)}><FaPen/></button>}

              </div>
            }
          </div>
        }
      </div>

      <div className="s_e_s_weights">
        {displaySet(sessionExercise.sets).map((set, index)=>{
          return (
          <div className="s_e_s_w_num" key={index}>
            {(editSessions && editSets)?
              <div>
                <input type="number" data-index={index} data-key="weight" placeholder={String(set.weight)}
                  onChange={(e)=>handleUpdateSetOfReps(e.target, newSets, setNewSets)}
                /> 
                x 
                <input type="number" data-index={index} data-key="reps" placeholder={String(set.reps)}
                  onChange={(e)=>handleUpdateSetOfReps(e.target, newSets, setNewSets)}
                />                  
              </div>
            :
              <div className="s_e_s_w_num" key={index}>{set.weight}kg x {set.reps}</div>
            }
          </div>
        )})}
      </div>
      {awaiting && <Loading  message = {"Message"}/>}
    </div>
  );
}

async function handleUpdateSessionExercise(sessionId: string,sessionExercise: sessionExercise, newExercise: string, newSets: string,setEditSets: Dispatch<SetStateAction<boolean>>, setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>) {
  const newSessionExercise = {
    sessionExerciseId: sessionExercise.sessionExerciseId,
    sessionId: sessionExercise.sessionId,
    exerciseId: newExercise,
    toFailure: sessionExercise.toFailure,
    sets: newSets,
  }

  await updateSessionExercise(newSessionExercise)
  const data = await getSessionExerciseBySession(sessionId)
  setSessionExercises(data)
  setEditSets(false)
}

async function handleUpdateSetOfReps(e: HTMLInputElement, newSets: string, setNewSets: Dispatch<SetStateAction<string>>) {
  const setsArr = newSets.split(",").map(s => s.split("x"));
  const index: number = Number(e.dataset.index)
  const key = e.dataset.key;

  if (key == "weight") {
    setsArr[index][0] = e.value
  }else setsArr[index][1] = e.value

  //out put eg: 16x12,18x10,20x8
  const updatedStrings: string[] = []
  setsArr.forEach(setOfReps => {
    const newString: string = `${setOfReps[0]}x${setOfReps[1]}`
    updatedStrings.push(newString)
  });

  // console.log(updatedStrings.toString());
  setNewSets(updatedStrings.toString())
}

function handleCancelEdit(setNewSets: Dispatch<SetStateAction<string>>, sessionExercise: sessionExercise, setEditSets: Dispatch<SetStateAction<boolean>>) {
  setNewSets(sessionExercise.sets)
  setEditSets(false)
}

function getExercise(exerciseId: string, exercises: exercise[]): exercise | undefined {
  return exercises.find(e => e.exerciseId === exerciseId);
}

type SetObj = { weight: number; reps: number };
function displaySet(sets: string): SetObj[] {
  return sets.split(',').map(weightStr => {
    const [weight, reps] = weightStr.split('x');
    return { weight: Number(weight), reps: Number(reps) };
  });
}

async function handleDeleteSessionExercise(sessionId:string, sessionExerciseId:string, setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>, setAwaiting:  React.Dispatch<React.SetStateAction<boolean>> ){
  setAwaiting(true)
  await deleteSessionExercise(sessionExerciseId)
  const data = await getSessionExerciseBySession(sessionId)
  setSessionExercises(data)
  setAwaiting(false)
}