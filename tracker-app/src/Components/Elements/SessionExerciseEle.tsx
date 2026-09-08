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

type WeightSet = { weight: number; reps: number };
type CardioSet = { hours: number; minutes: number; seconds: number; distance: number; rpe: number };
type SetKey = "weight" | "reps" | "hours" | "minutes" | "seconds" | "distance" | "rpe";

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
  isCardio: boolean;
}

/*
  SessionExerciseEle
    Displays a single exercise within a session (its name and sets) and,
    when editSetVisible is on, lets it be edited or deleted in place.
    Sets are stored as a comma-separated string whose per-entry shape
    depends on the exercise's group: weight/reps exercises use
    "weightxreps" (e.g. "16x12,18x10"), Cardio exercises use
    "h:m:sxdistancexrpe" (e.g. "0:32:15x5.2x7").
*/
export default function SessionExerciseEle({ sessionExercise, exercises, setSessionExercises, editSetVisible }: Props) {
  const setEx = getExercise(sessionExercise.exerciseId, exercises);
  const isCardio = setEx.group === "Cardio";

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
      {isCardio ?
        displayCardioSets(sessionExercise.sets).map((set, index) => (
          <div className="es_rep" key={index}>
            {( editSets && editSetVisible) ?
              <div>
                <input type="number" placeholder={String(set.hours)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "hours", value: e.target.value, newSets, setNewSets, isCardio })}
                />:
                <input type="number" placeholder={String(set.minutes)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "minutes", value: e.target.value, newSets, setNewSets, isCardio })}
                />:
                <input type="number" placeholder={String(set.seconds)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "seconds", value: e.target.value, newSets, setNewSets, isCardio })}
                />
                /
                <input type="number" placeholder={String(set.distance)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "distance", value: e.target.value, newSets, setNewSets, isCardio })}
                />
                km / RPE
                <input type="number" placeholder={String(set.rpe)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "rpe", value: e.target.value, newSets, setNewSets, isCardio })}
                />
              </div>
              :
              <div className="s_e_s_w_num">
                {set.hours}{":"}
                {String(set.minutes).padStart(2, "0")}{":"}
                {String(set.seconds).padStart(2, "0")}
                {" | "}
                {set.distance}
                {" km | RPE "}
                {set.rpe} {" | "}
                {(() => {
                  const totalSeconds = set.hours * 3600 + set.minutes * 60 + set.seconds;
                  if (!set.distance) return "--:--";

                  const paceSeconds = totalSeconds / set.distance;
                  const paceMin = Math.floor(paceSeconds / 60);
                  const paceSec = Math.round(paceSeconds % 60);

                  return `${paceMin}:${String(paceSec).padStart(2, "0")}/km`;
                })()}
              </div>
            }
          </div>
        ))
        :
        displayWeightSets(sessionExercise.sets).map((set, index) => (
          <div className="es_rep" key={index}>
            {(editSets && editSetVisible) ?
              <div>
                <input type="number" placeholder={String(set.weight)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "weight", value: e.target.value, newSets, setNewSets, isCardio })}
                />
                Kgs x
                <input type="number" placeholder={String(set.reps)}
                  onChange={(e) => handleUpdateSetOfReps({ index, key: "reps", value: e.target.value, newSets, setNewSets, isCardio })}
                />
              </div>
              :
              <div className="s_e_s_w_num">{set.weight}kg x {set.reps}</div>
            }
          </div>
        ))
      }
    </div>

    {awaiting && <Loading message={"Sending Request"} />}

  </div>
}

// Weight/reps sets: "weightxreps" pairs, e.g. "16x12,18x10,20x8"
function displayWeightSets(sets: string): WeightSet[] {
  if (!sets) return [];
  return sets.split(',').map(entry => {
    const [weight, reps] = entry.split('x');
    return { weight: Number(weight), reps: Number(reps) };
  });
}

// Cardio sets: "h:m:sxdistancexrpe", e.g. "0:32:15x5.2x7"
function displayCardioSets(sets: string): CardioSet[] {
  if (!sets) return [];
  return sets.split(',').map(entry => {
    const [time, distance, rpe] = entry.split('x');
    const [hours, minutes, seconds] = time.split(':');
    return {
      hours: Number(hours),
      minutes: Number(minutes),
      seconds: Number(seconds),
      distance: Number(distance),
      rpe: Number(rpe),
    };
  });
}

function handleUpdateSetOfReps({ index, key, value, newSets, setNewSets, isCardio }: UpdateSetOfRepsArgs) {
  const entries = newSets.split(",");

  if (isCardio) {
    const [time = "0:0:0", distance = "0", rpe = "0"] = (entries[index] ?? "").split("x");
    let [h, m, s] = time.split(":");

    if (key === "hours") h = value;
    else if (key === "minutes") m = value;
    else if (key === "seconds") s = value;

    const newDistance = key === "distance" ? value : distance;
    const newRpe = key === "rpe" ? value : rpe;

    entries[index] = `${h}:${m}:${s}x${newDistance}x${newRpe}`;
  } else {
    const [weight = "0", reps = "0"] = (entries[index] ?? "").split("x");
    const newWeight = key === "weight" ? value : weight;
    const newReps = key === "reps" ? value : reps;

    entries[index] = `${newWeight}x${newReps}`;
  }

  setNewSets(entries.join(","));
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