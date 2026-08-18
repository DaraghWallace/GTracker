import { useState, type Dispatch, type SetStateAction } from 'react';

import type { exercise, sessionExercise } from "../../Helpers/customTypes"
import { deleteSessionExercise, updateSessionExercise } from "../../Helpers/APIfunctions";

import "../../CSS/exSeshEle.css"
import { FaTrash, FaPen, FaXmark, FaCheck } from "react-icons/fa6";
import Loading from "./Loading";


type Props = {
  sessionExercise: sessionExercise;
  exercises: exercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  editSetVisible: boolean;
}

type SetObj = { weight: number; reps: number };
type SetKey = "weight" | "reps";

type UpdateSessionExerciseArgs = {
  sessionExercise: sessionExercise;
  newExercise: string;
  newSets: string;
  setEditSets: Dispatch<SetStateAction<boolean>>;
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  setAwaiting: Dispatch<SetStateAction<boolean>>;
}

type DeleteSessionExerciseArgs = {
  sessionExercise: sessionExercise;
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  setDelConfirm: Dispatch<SetStateAction<boolean>>;
  setAwaiting: Dispatch<SetStateAction<boolean>>;
}

type UpdateSetOfRepsArgs = {
  index: number;
  key: SetKey;
  value: string;
  newSets: string;
  setNewSets: Dispatch<SetStateAction<string>>;
}

/*
  SessionExerciseEle
    Displays a single exercise within a session (its name and sets) and,
    when editSetVisible is on, lets it be edited or deleted in place.
*/
export default function SessionExerciseEle({ sessionExercise, exercises, setSessionExercises, editSetVisible }: Props) {
  const setEx = getExercise(sessionExercise.exerciseId, exercises);

  const [delConfirm, setDelConfirm] = useState(false);

  const [editSets, setEditSets] = useState(false);
  const [newExercise, setNewExercise] = useState(sessionExercise.exerciseId);
  const [newSets, setNewSets] = useState(sessionExercise.sets);

  const [awaiting, setAwaiting] = useState(false);

  return <div className="EsSesh">
    <div className="es_header">
      {(editSets && editSetVisible) ?
        <select value={newExercise} onChange={(e) => setNewExercise(e.target.value)}>
          {exercises.map((exercise) => {
            return <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.name}</option>
          })}
        </select>
        :
        <div>{setEx.name}</div>
      }
      {editSetVisible && // toggle edit / delete && confirm delete / edit
        <div>
          {editSets ?
            <>
              <button aria-label="Cancel edit" onClick={() => handleCancelEdit(setNewSets, sessionExercise, setEditSets)}><FaXmark /></button>
              <button aria-label="Save exercise" onClick={() => handleUpdateSessionExercise({
                sessionExercise, newExercise, newSets, setEditSets, setSessionExercises, setAwaiting
              })} className="green_button"><FaCheck /></button>
            </>
            :
            <button aria-label="Edit exercise" onClick={() => setEditSets(true)}><FaPen /></button>
          }
          {delConfirm ?
            <>Are you Sure
              <button aria-label="Confirm delete" onClick={() => handleDeleteSessionExercise({
                sessionExercise, setSessionExercises, setDelConfirm, setAwaiting
              })}>Y</button>
              <button aria-label="Cancel delete" onClick={() => setDelConfirm(false)}>N</button>
            </>
            :
            <button aria-label="Delete exercise" onClick={() => setDelConfirm(true)}><FaTrash /></button>
          }
        </div>
      }
    </div>

    <div className="es_reps">
      {displaySet(sessionExercise.sets).map((set, index) => {
        return (
          <div className="es_rep" key={index}>
            {(editSets && editSetVisible) ?
              <div>
                <input type="number" placeholder={String(set.weight)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "weight", value: e.target.value, newSets, setNewSets })}
                />
                Kgs x
                <input type="number" placeholder={String(set.reps)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "reps", value: e.target.value, newSets, setNewSets })}
                />
              </div>
              :
              <div className="s_e_s_w_num">{set.weight}kg x {set.reps}</div>
            }
          </div>
        )
      })}
    </div>

    {awaiting && <Loading message={"Sending Request"} />}

  </div>
}

// A session exercise's `sets` field is stored as a comma-separated string of
// "weight x reps" pairs, e.g. "16x12,18x10,20x8" - this parses it for display/editing.
function displaySet(sets: string): SetObj[] {
  return sets.split(',').map(weightStr => {
    const [weight, reps] = weightStr.split('x');
    return { weight: Number(weight), reps: Number(reps) };
  });
}

function handleUpdateSetOfReps({ index, key, value, newSets, setNewSets }: UpdateSetOfRepsArgs) {
  const setsArr = newSets.split(",").map(s => s.split("x"));
  setsArr[index][key === "weight" ? 0 : 1] = value;

  // output e.g. "16x12,18x10,20x8"
  const updatedSets = setsArr.map(([weight, reps]) => `${weight}x${reps}`).join(",");
  setNewSets(updatedSets);
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

async function handleDeleteSessionExercise({ sessionExercise, setSessionExercises, setDelConfirm, setAwaiting }: DeleteSessionExerciseArgs) {
  setAwaiting(true)
  try {
    await deleteSessionExercise(sessionExercise.sessionExerciseId)
    setSessionExercises(prev => prev.filter(s => s.sessionExerciseId !== sessionExercise.sessionExerciseId))
    setDelConfirm(false)
  } catch (error) {
    console.error(`Failed to delete session exercise ${sessionExercise.sessionExerciseId}:`, error);
  } finally {
    setAwaiting(false)
  }
}

function handleCancelEdit(setNewSets: Dispatch<SetStateAction<string>>, sessionExercise: sessionExercise, setEditSets: Dispatch<SetStateAction<boolean>>) {
  setNewSets(sessionExercise.sets)
  setEditSets(false)
}

async function handleUpdateSessionExercise({
  sessionExercise, newExercise, newSets, setEditSets, setSessionExercises, setAwaiting
}: UpdateSessionExerciseArgs) {
  setAwaiting(true)
  const newSessionExercise = {
    sessionExerciseId: sessionExercise.sessionExerciseId,
    sessionId: sessionExercise.sessionId,
    exerciseId: newExercise,
    toFailure: sessionExercise.toFailure,
    sets: newSets,
  }

  try {
    await updateSessionExercise(newSessionExercise)
    setSessionExercises(prev => prev.map(s =>
      s.sessionExerciseId === newSessionExercise.sessionExerciseId ? newSessionExercise : s
    ))
    setEditSets(false)
  } catch (error) {
    console.error(`Failed to update session exercise ${sessionExercise.sessionExerciseId}:`, error);
  } finally {
    setAwaiting(false)
  }
}