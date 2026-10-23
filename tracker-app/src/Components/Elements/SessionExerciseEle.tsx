import { useState, type Dispatch, type SetStateAction } from "react";

import type { exercise, sessionExercise } from "../../Helpers/customTypes";
import { deleteSessionExercise, updateSessionExercise } from "../../Helpers/APIfunctions";
import Loading from "./Loading";

import "../../CSS/exSeshEle.css";
import { FaTrash, FaPen, FaXmark, FaCheck } from "react-icons/fa6";

/*
  SessionExerciseEle.tsx - one exercise within a session (its name and sets).

  When editSetVisible is on, shows edit (pen) and delete (bin, with Y/N confirm) controls.
  Editing changes the exercise's position, which exercise it is, and its sets in place.

  Sets are stored as a comma-separated string. The shape of each entry depends on the exercise:
    - weight/reps (default):  "weightxreps"               e.g. "16x12,18x10"
    - Hold (ppl === "Hold"):  "h:m:sxweight"              e.g. "0:0:45x10"
    - Cardio (group):         "h:m:sxdistancexrpexweight" e.g. "0:32:15x5.2x7x0"

  displayXSets parse the string for display; updateSetString rewrites one entry when an
  input in edit mode changes. Cardio sets also show pace (min/km) via formatPace.
*/

type Props = {
  sessionExercise: sessionExercise;
  exercises: exercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>> | undefined;
  editSetVisible: boolean;
};

type WeightSet = { weight: number; reps: number };
type HoldSet = { hours: number; minutes: number; seconds: number; weight: number };
type CardioSet = { hours: number; minutes: number; seconds: number; distance: number; rpe: number; weight: number };
type SetKey = "weight" | "reps" | "hours" | "minutes" | "seconds" | "distance" | "rpe";

export default function SessionExerciseEle({ sessionExercise, exercises, setSessionExercises, editSetVisible }: Props) {
  const updateSessionExercises = setSessionExercises ?? (() => {});

  const setEx = getExercise(sessionExercise.exerciseId, exercises);
  const isCardio = setEx.group === "Cardio";
  const isHold = setEx.ppl === "Hold";

  const [delConfirm, setDelConfirm] = useState(false);
  const [editSets, setEditSets] = useState(false);
  const [awaiting, setAwaiting] = useState(false);

  const [newIndex, setNewIndex] = useState(sessionExercise.exerciseIndex);
  const [newExercise, setNewExercise] = useState(sessionExercise.exerciseId);
  const [newSets, setNewSets] = useState(sessionExercise.sets);

  const editing = editSets && editSetVisible;

  function handleCancelEdit() {
    setNewSets(sessionExercise.sets);
    setNewIndex(sessionExercise.exerciseIndex);
    setNewExercise(sessionExercise.exerciseId);
    setEditSets(false);
  }

  async function handleUpdate() {
    const updated = {
      sessionExerciseId: sessionExercise.sessionExerciseId,
      sessionId: sessionExercise.sessionId,
      exerciseIndex: newIndex,
      exerciseId: newExercise,
      toFailure: sessionExercise.toFailure,
      sets: newSets,
    };

    setAwaiting(true);
    try {
      await updateSessionExercise(updated);
      updateSessionExercises((prev) =>
        prev.map((s) => (s.sessionExerciseId === updated.sessionExerciseId ? updated : s))
      );
      setEditSets(false);
    } catch (error) {
      console.error(`Failed to update session exercise ${sessionExercise.sessionExerciseId}:`, error);
    } finally {
      setAwaiting(false);
    }
  }

  async function handleDelete() {
    setAwaiting(true);
    try {
      await deleteSessionExercise(sessionExercise.sessionExerciseId);
      updateSessionExercises((prev) => prev.filter((s) => s.sessionExerciseId !== sessionExercise.sessionExerciseId));
      setDelConfirm(false);
    } catch (error) {
      console.error(`Failed to delete session exercise ${sessionExercise.sessionExerciseId}:`, error);
    } finally {
      setAwaiting(false);
    }
  }

  /** A number input that rewrites one field of one set in newSets as the user types. */
  const setInput = (placeholder: number, index: number, key: SetKey) => (
    <input
      type="number"
      placeholder={String(placeholder)}
      maxLength={3}
      onChange={(e) => setNewSets(updateSetString(newSets, index, key, e.target.value, isCardio))}
    />
  );

  function renderCardioSet(set: CardioSet, index: number) {
    return (
      <div className="es_rep" key={index}>
        {editing ? (
          <div>
            <div>
              {setInput(set.hours, index, "hours")}:
              {setInput(set.minutes, index, "minutes")}:
              {setInput(set.seconds, index, "seconds")}
            </div>
            |
            {setInput(set.distance, index, "distance")} km |
            {setInput(set.weight, index, "weight")}Kgs| RPE
            {setInput(set.rpe, index, "rpe")}
          </div>
        ) : (
          <div className="s_e_s_w_num">
            {(set.hours !== 0 || set.minutes !== 0 || set.seconds !== 0) && (
              <>
                {set.hours}:{String(set.minutes).padStart(2, "0")}:{String(set.seconds).padStart(2, "0")}
                {" | "}
              </>
            )}
            {set.distance}
            {" km | RPE "}
            {set.rpe} {" | "}
            {set.weight >= 0 && `${set.weight}Kgs | `}
            {formatPace(set.hours, set.minutes, set.seconds, set.distance)}
          </div>
        )}
      </div>
    );
  }

  function renderHoldSet(set: HoldSet, index: number) {
    return (
      <div className="es_rep" key={index}>
        {editing ? (
          <div>
            <div>
              {setInput(set.hours, index, "hours")}:
              {setInput(set.minutes, index, "minutes")}:
              {setInput(set.seconds, index, "seconds")}
            </div>
            <div>{setInput(set.weight, index, "reps")}Kgs</div>
          </div>
        ) : (
          <div className="s_e_s_w_num">
            {!Number.isNaN(set.hours) && set.hours !== 0 && `${set.hours}hr `}
            {!Number.isNaN(set.minutes) && set.minutes !== 0 && `${set.minutes}min `}
            {!Number.isNaN(set.seconds) && set.seconds !== 0 && `${set.seconds}sec `}
            {set.weight > 0 && ` | ${set.weight}Kgs`}
          </div>
        )}
      </div>
    );
  }

  function renderWeightSet(set: WeightSet, index: number) {
    return (
      <div className="es_rep" key={index}>
        {editing ? (
          <div>
            {setInput(set.weight, index, "weight")}
            Kgs x
            {setInput(set.reps, index, "reps")}
          </div>
        ) : (
          <div className="s_e_s_w_num">{set.weight}kg x {set.reps}</div>
        )}
      </div>
    );
  }

  return (
    <div className="EsSesh">
      <div className="es_header">
        {/* Name (or position + exercise picker while editing) */}
        {editing ? (
          <div>
            <input type="number" value={newIndex} maxLength={2} onChange={(e) => setNewIndex(Number(e.target.value))} />:
            <select value={newExercise} onChange={(e) => setNewExercise(e.target.value)}>
              {exercises.map((ex) => <option key={ex.exerciseId} value={ex.exerciseId}>{ex.name}</option>)}
            </select>
          </div>
        ) : (
          <div>{sessionExercise.exerciseIndex && `${sessionExercise.exerciseIndex}:`} {setEx.name}</div>
        )}

        {/* Edit / delete controls */}
        {editSetVisible && (
          <div>
            {editSets ? (
              <>
                <button aria-label="Cancel edit" onClick={handleCancelEdit}><FaXmark /></button>
                <button aria-label="Save exercise" className="green_button" onClick={handleUpdate}><FaCheck /></button>
              </>
            ) : (
              <button aria-label="Edit exercise" onClick={() => setEditSets(true)}><FaPen /></button>
            )}

            {delConfirm ? (
              <>
                Are you Sure
                <button aria-label="Confirm delete" onClick={handleDelete}>Y</button>
                <button aria-label="Cancel delete" onClick={() => setDelConfirm(false)}>N</button>
              </>
            ) : (
              <button aria-label="Delete exercise" onClick={() => setDelConfirm(true)}><FaTrash /></button>
            )}
          </div>
        )}
      </div>

      <div className="es_reps">
        {isCardio
          ? displayCardioSets(sessionExercise.sets).map(renderCardioSet)
          : isHold
            ? displayHoldSets(sessionExercise.sets).map(renderHoldSet)
            : displayWeightSets(sessionExercise.sets).map(renderWeightSet)}
      </div>

      {awaiting && <Loading message="Sending Request" />}
    </div>
  );
}

// "weightxreps" entries, e.g. "16x12,18x10,20x8"
function displayWeightSets(sets: string): WeightSet[] {
  if (!sets) return [];
  return sets.split(",").map((entry) => {
    const [weight, reps] = entry.split("x");
    return { weight: Number(weight), reps: Number(reps) };
  });
}

// "h:m:sxweight" entries, e.g. "0:32:15x10"
function displayHoldSets(sets: string): HoldSet[] {
  if (!sets) return [];
  return sets.split(",").map((entry) => {
    const [time, weight] = entry.split("x");
    const [hours, minutes, seconds] = time.split(":");
    return { hours: Number(hours), minutes: Number(minutes), seconds: Number(seconds), weight: Number(weight) };
  });
}

// "h:m:sxdistancexrpexweight" entries, e.g. "0:32:15x5.2x7x0"
function displayCardioSets(sets: string): CardioSet[] {
  if (!sets) return [];
  return sets.split(",").map((entry) => {
    const [time, distance, rpe, weight] = entry.split("x");
    const [hours, minutes, seconds] = time.split(":");
    return {
      hours: Number(hours),
      minutes: Number(minutes),
      seconds: Number(seconds),
      distance: Number(distance),
      rpe: Number(rpe),
      weight: Number(weight),
    };
  });
}

/** Returns the sets string with one field of the entry at `index` replaced by `value`. */
function updateSetString(sets: string, index: number, key: SetKey, value: string, isCardio: boolean): string {
  const entries = sets.split(",");

  if (isCardio) {
    const [time = "0:0:0", distance = "0", rpe = "0", weight = "0"] = (entries[index] ?? "").split("x");
    let [h, m, s] = time.split(":");

    if (key === "hours") h = value;
    else if (key === "minutes") m = value;
    else if (key === "seconds") s = value;

    entries[index] = [
      `${h}:${m}:${s}`,
      key === "distance" ? value : distance,
      key === "rpe" ? value : rpe,
      key === "weight" ? value : weight,
    ].join("x");
  } else {
    const [weight = "0", reps = "0"] = (entries[index] ?? "").split("x");
    entries[index] = `${key === "weight" ? value : weight}x${key === "reps" ? value : reps}`;
  }

  return entries.join(",");
}

function getExercise(exerciseId: string, exercises: exercise[]): exercise {
  return (
    exercises.find((e) => e.exerciseId === exerciseId) ?? {
      exerciseId,
      name: "Exercise Not Found",
      group: "N/A",
      target: "N/A",
      ppl: "N/A",
      author: "N/A",
    }
  );
}

/** Pace as min:sec per km, or "--:--" when there's no distance. */
function formatPace(hours: number, minutes: number, seconds: number, distanceKm: number): string {
  if (!distanceKm) return "--:--";

  const paceSeconds = (hours * 3600 + minutes * 60 + seconds) / distanceKm;
  let paceMin = Math.floor(paceSeconds / 60);
  let paceSec = Math.round(paceSeconds % 60);

  if (paceSec === 60) {
    paceMin += 1;
    paceSec = 0;
  }

  return `${paceMin}:${String(paceSec).padStart(2, "0")}/km`;
}