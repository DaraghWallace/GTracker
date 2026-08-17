import { useState, type Dispatch, type SetStateAction } from 'react';

import type { exercise,  sessionExercise } from "../../Helpers/customTypes"
import { deleteSessionExercise, updateSessionExercise, } from "../../Helpers/APIfunctions";

import "../../CSS/exSeshEle.css"
import { FaTrash, FaPen , FaXmark, FaCheck} from "react-icons/fa6";
import Loading from "./Loading";


type props = {
  sessionExercise: sessionExercise,
  exercises: exercise[],
  setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>
  editSetVisible: boolean
}

export default function SessionExerciseEle({sessionExercise, exercises, setSessionExercises, editSetVisible}: props){
  const setEx = getExercise(sessionExercise.exerciseId, exercises);
  
  const [delConfirm, setDelConfirm] = useState(false);
  
  const [editSets, setEditSets] = useState(false);
  const [newExercise, setNewExercise] = useState(sessionExercise.exerciseId);
  const [newSets, setNewSets] = useState(sessionExercise.sets);

  const [awaiting, setAwaiting] = useState(false);
  
  return <div className="EsSesh">
    <div className="es_header">
      {(editSets && editSetVisible)? 
          <select value={newExercise} onChange={(e)=> setNewExercise(e.target.value)}>
            {exercises.map((exercise)=>{
              return <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.name}</option>
            })}
          </select>
        : 
          <div>{setEx.name}</div>
      }
      {editSetVisible && // toggle edit / delete && confirm delete / edit
        <div>
          {editSets? 
            <>
              <button onClick={()=> {handleCancelEdit(setNewSets, sessionExercise, setEditSets)}}><FaXmark/></button> 
              <button onClick={()=> {handleUpdateSessionExercise(sessionExercise, newExercise, newSets, setEditSets, setSessionExercises, setAwaiting)}} className="green_button"><FaCheck/></button>
            </> 
          : 
            <button onClick={()=>setEditSets(true)}><FaPen/></button>
          }
          {/* <button onClick={()=> {handleCancelEdit(setNewSets, sessionExercise, setEditSets)}}><FaXmark/></button>  */}
          {delConfirm? 
            <>Are you Sure
              <button onClick={()=>handleDeleteSessionExercise(sessionExercise, setSessionExercises, setDelConfirm, setAwaiting)}>Y</button>
              <button onClick={()=>setDelConfirm(false)}>N</button>
            </>
          : 
            <button onClick={()=> setDelConfirm(true)}><FaTrash/></button>
          }
        </div>
      }
    </div>

    <div className="es_reps">
      {displaySet(sessionExercise.sets).map((set, index)=>{
        return (
        <div className="es_rep" key={index}>
          {(editSets && editSetVisible)?
            <div>
              <input type="number" data-index={index} data-key="weight" placeholder={String(set.weight)}
                onChange={(e)=>handleUpdateSetOfReps(e.target, newSets, setNewSets,)}
              /> 
              Kgs x 
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

    {awaiting && <Loading  message = {"Sending Request"}/>}

  </div>
}

type SetObj = { weight: number; reps: number };
function displaySet(sets: string): SetObj[] {
  return sets.split(',').map(weightStr => {
    const [weight, reps] = weightStr.split('x');
    return { weight: Number(weight), reps: Number(reps) };
  });
}

async function handleUpdateSetOfReps(e: HTMLInputElement, newSets: string, 
    setNewSets: Dispatch<SetStateAction<string>>, 
  ) {
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

function getExercise(exerciseId: string, exercises: exercise[]): exercise {
  const thisExercise = exercises.find(e => e.exerciseId === exerciseId);
  
  if (!thisExercise) { 
    return {
      exerciseId: exerciseId,
      name: "Exercise Not Found",
      group: "N/A",
      target: "N/A",
      ppl: "N/A",
      author: "N/A"
    } 
  } else return thisExercise
}


async function handleDeleteSessionExercise(sessionExercise:sessionExercise, 
    setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>,
    setDelConfirm: React.Dispatch<React.SetStateAction<boolean>>,
    setAwaiting: React.Dispatch<React.SetStateAction<boolean>>
  ) {
  setAwaiting(true)
  await deleteSessionExercise(sessionExercise.sessionExerciseId)
  setSessionExercises(prev => prev.filter(s => s.sessionExerciseId !== sessionExercise.sessionExerciseId))
  setDelConfirm(false)
  setAwaiting(false)
}

function handleCancelEdit(setNewSets: Dispatch<SetStateAction<string>>, sessionExercise: sessionExercise, setEditSets: Dispatch<SetStateAction<boolean>>) {
  setNewSets(sessionExercise.sets)
  setEditSets(false)
}

async function handleUpdateSessionExercise(sessionExercise: sessionExercise, 
    newExercise: string, newSets: string,
    setEditSets: Dispatch<SetStateAction<boolean>>, 
    setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>,
    setAwaiting: Dispatch<SetStateAction<boolean>>, 
  ) {
  setAwaiting(true)
  const newSessionExercise = {
    sessionExerciseId: sessionExercise.sessionExerciseId,
    sessionId: sessionExercise.sessionId,
    exerciseId: newExercise,
    toFailure: sessionExercise.toFailure,
    sets: newSets,
  }

  await updateSessionExercise(newSessionExercise)
  setSessionExercises(prev => prev.map(s =>
    s.sessionExerciseId === newSessionExercise.sessionExerciseId ? newSessionExercise : s
  ))
  setEditSets(false)
  setAwaiting(false)
}