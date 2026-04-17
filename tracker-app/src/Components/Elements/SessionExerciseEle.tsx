import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise, sessionExercise } from "../../Helpers/customTypes";
import { deleteSessionExercise, fetchFromTable, updateSessionExercise } from "../../Helpers/APIfunctions";

import "../../CSS/App.css"

type props = {
  sessionExercise: sessionExercise,
  exercises: exercise[],
  editSetVisible: boolean,
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>
  userId: string
}

export default function SessionExerciseEle({sessionExercise, exercises, editSetVisible, setSessionExercises, userId}: props){
  const setEx = getExercise(sessionExercise.exerciseId, exercises);
  const [editSets, setEditSets] = useState(false);
  const [newExercise, setNewExercise] = useState(sessionExercise.exerciseId);
  const [newSets, setNewSets] = useState(sessionExercise.sets);
  

  return (
    <div className="s_e_set" key={sessionExercise.sessionExerciseId}>
      <div className="s_e_header">
        <div>
          {editSets?          
          <select value={newExercise} onChange={(e)=> setNewExercise(e.target.value)}>
              {exercises.map((exercise)=>{
                return <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.name}</option>
              })}
            </select>
          :
            <div>{setEx?.name}:</div>
          }
        </div>
        
        {editSetVisible && 
          <div>
            { editSets ?
              <>
                <button onClick={()=> {handleUpdateSessionExercise(sessionExercise, newExercise, newSets, setEditSets, setSessionExercises, userId)}}>S</button>
                <button onClick={()=> {handleCancelEdit(setNewSets, sessionExercise, setEditSets)}}>C</button>              
              </>
              :
              <button onClick={()=> setEditSets(true)}>E</button>
            }
            <button onClick={() => handleDeleteSessionExercise(sessionExercise.sessionExerciseId, setSessionExercises, userId)}>Del</button>
          </div>
        }
      </div>
      <div className="s_e_s_weights">
        {displaySet(sessionExercise.sets).map((set, index)=>{
          
          return (
          <div className="s_e_s_w_num" key={index}>
            {editSets?
              <div>
                <form >
                  <input type="number" data-index={index} data-key="weight" placeholder={String(set.weight)}
                    onChange={(e)=>handleUpdateSetOfReps(e.target, newSets, setNewSets)}
                  /> 
                  x 
                  <input type="number" data-index={index} data-key="reps" placeholder={String(set.reps)}
                   onChange={(e)=>handleUpdateSetOfReps(e.target, newSets, setNewSets)}
                  />                  
                </form>
              </div>
            :
              <div className="s_e_s_w_num" key={index}>{set.weight}kg x {set.reps}</div>
            }
          </div>
        )})}
      </div>
    </div>
  );
}

async function handleUpdateSessionExercise(sessionExercise: sessionExercise, newExercise: string, newSets: string,setEditSets: Dispatch<SetStateAction<boolean>>, setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>> ,userId:string) {
  const newSessionExercise = {
    sessionExerciseId: sessionExercise.sessionExerciseId,
    sessionId: sessionExercise.sessionId,
    exerciseId: newExercise,
    toFailure: sessionExercise.toFailure,//*
    sets: newSets,
  }

  await updateSessionExercise(newSessionExercise)
  await setSessionExercises(await fetchFromTable(userId, "sets"))
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

async function handleDeleteSessionExercise(sessionExerciseId:string, setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>, userId: string ){
  await deleteSessionExercise(sessionExerciseId)
  const data = await fetchFromTable(userId, "sets")
  setSessionExercises(data)
}