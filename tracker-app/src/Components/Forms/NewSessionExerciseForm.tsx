import { useState, type Dispatch, type SetStateAction } from "react";
import type { sessionExercise, exercise } from "../../Helpers/customTypes";
import { createSessionExercise } from "../../Helpers/APIfunctions";
import NseSetFormEle from "../Elements/NseFormSetEle";

import { FaPlus, FaPen, FaCheck, FaMinus, FaXmark } from "react-icons/fa6";
import Loading from "../Elements/Loading";

import "../../CSS/form.css"

type Props = {
  sessionId: string;
  exercises: exercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  setNewSetFormOpen: Dispatch<SetStateAction<boolean>>
}

/*
  NewSessionExerciseForm
    handleSubmit: validates that every set row has been completed, then
    creates the session exercise via the API and adds it into local state.
    incrementSets/decrementSets: grow/shrink the set rows, keeping setArr
    in sync so a removed row's leftover value can't sneak into the submission.
*/
export default function NewSessionExerciseForm({ sessionId, exercises, setSessionExercises, setNewSetFormOpen }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<exercise | null>(null);
  const [numOfSets, setNumOfSets] = useState(0);
  const [setArr, setSetArr] = useState<string[]>([]);
  const [toFailure, setToFailure] = useState(false);
  const [message, setMessage] = useState("");

  const [awaiting, setAwaiting] = useState(false);

  function incrementSets() {
    setNumOfSets(prev => prev + 1);
  }

  function decrementSets() {
    setNumOfSets(prev => prev - 1);
    // Drop the last row's value too, so an already-completed set doesn't
    // silently ride along in the submission after its row is removed.
    setSetArr(prev => prev.slice(0, -1));
  }

  async function handleSubmit() {
    if (!selectedExercise) return setMessage("Select an exercise.");
    if (!numOfSets) return setMessage("Enter Set(s).");

    const allSetsCompleted = setArr.length === numOfSets && setArr.every(Boolean);
    if (!allSetsCompleted) return setMessage("Complete all sets.");

    const setArrString = setArr.toString()

    const newSessionExercise: sessionExercise = {
      sessionExerciseId: crypto.randomUUID(),
      sessionId: sessionId,
      exerciseId: selectedExercise.exerciseId,
      toFailure: toFailure,
      sets: setArrString, // e.g "Wt(reps),25(10),27(8)"
    };

    setAwaiting(true)

    try {
      await createSessionExercise(newSessionExercise);
      setMessage("Set created!");
      setNewSetFormOpen(false)

      setSessionExercises(prev => [...prev, newSessionExercise]);

      setAwaiting(false)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
      setAwaiting(false)
    }
  }

  return (
    <div className="form">
      <div className="f_panel">
        <div className="thick_text">
          {!selectedExercise && "New "}Exercise: {selectedExercise && selectedExercise.name}
          {selectedExercise && <button aria-label="Change exercise" onClick={() => setSelectedExercise(null)}><FaPen /></button>}
        </div>

        {!selectedExercise && (
          <div className="f_p_exercises" >
            {[...new Set(exercises.map(e => e.group))].map(group => (
              <div key={group}>
                <div className="f_p_e_sub_header">{group}:</div>
                <div className="f_e_cont">
                  {exercises.filter(e => e.group === group).map(exercise => (
                    <button className="f_e_button" key={exercise.exerciseId} onClick={() => setSelectedExercise(exercise)}>
                      {exercise.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="f_p_row_snug">
          <div className="thick_text">Sets: {numOfSets}</div>
          <button aria-label="Add set" onClick={incrementSets}><FaPlus /></button>
          {numOfSets >= 1 && <button aria-label="Remove set" onClick={decrementSets}><FaMinus /></button>}
        </div>

        <div className="f_p_sets">
          <div className="sets">
            <div className="set_field">Weight</div>
            <div className="set_field">Reps</div>
            <div className="set_field">Done?</div>
          </div>

          {renderSetRows(numOfSets, setArr, setSetArr)}

          <div className="f_p_row_mid">
            <div className="bold_text">To failure?</div>
            <input
              type="checkbox"
              aria-label="To failure"
              checked={toFailure}
              onChange={e => setToFailure(e.target.checked)}
            />
          </div>
        </div>

        {message && <div className="thick_text">{message}</div>}

        <div className="f_p_row_c">
          <button aria-label="Create exercise" onClick={handleSubmit}><FaCheck /></button>
          <button aria-label="Cancel" onClick={() => setNewSetFormOpen(false)}><FaXmark /></button>
        </div>

        {awaiting && <Loading message={"Creating Set"} />}
      </div>
    </div>
  );
}

function renderSetRows(numOfSets: number, setArr: string[], setSetArr: Dispatch<SetStateAction<string[]>>) {
  return Array.from({ length: numOfSets }, (_, i) => (
    <NseSetFormEle key={i} index={i} setArr={setArr} setSetArr={setSetArr} />
  ));
}