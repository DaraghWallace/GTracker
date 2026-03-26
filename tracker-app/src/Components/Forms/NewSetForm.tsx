import { useState } from "react";
import type { set, exercise } from "../../Helpers/customTypes";
import { createSet } from "../../Helpers/APIfunctions";

import '../../CSS/Form.css'

type Props = {
  sessionId: string;
  exercises: exercise[];
  loadUserData: (userId: string) => Promise<void>;
  userId: string
}

export default function NewSetForm({ sessionId, exercises, loadUserData, userId }: Props) {
  // const [query, setQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<exercise | null>(null);
  const [reps, setReps] = useState(Number);
  const [weights, setWeights] = useState("");
  const [toFailure, setToFailure] = useState(false);
  const [message, setMessage] = useState("");

  // const filtered = exercises.filter(e =>
  //   e.name.toLowerCase().includes(query.toLowerCase())
  // );

  async function handleSubmit() {
    if (!selectedExercise) return setMessage("Select an exercise.");
    if (!reps) return setMessage("Enter reps.");
    if (!weights) return setMessage("Enter weights.");

    const newSet: set = {
      setId: crypto.randomUUID(),
      sessionId: sessionId,
      exerciseId: selectedExercise.exerciseId,
      toFailure,
      weights_kgs: weights, // e.g "Wt(reps),25(10),27(8)"
    };

    try {
      await createSet(newSet);
      setMessage("Set created!");
      loadUserData(userId)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="f_fc_Column">
      <div>
        <div>Exercise: {selectedExercise && selectedExercise.name}</div>

        <div>
          {exercises.map((exercise) => (
            <button key={exercise.exerciseId} onClick={()=>setSelectedExercise(exercise)}>
              {exercise.name}
            </button>
          ))}          
        </div>
      </div>


      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={e => setReps(Number(e.target.value))}
        min={1}
      />


      {displayReps(reps)}

      {/* <input
        placeholder='Weight (kgs)'
        value={weights}
        onChange={e => setWeights(e.target.value)}
      /> */}

      <label>
        <input
          type="checkbox"
          checked={toFailure}
          onChange={e => setToFailure(e.target.checked)}
        />
        To failure
      </label>

      <button onClick={handleSubmit}>Add set</button>
      {message && <p>{message}</p>}
    </div>        
  );
}

function displayReps(reps: number) {
  return Array.from({ length: reps }, (_, i) => (
    <div key={i} className="f_fc_Row">
      <div>Set {i + 1}: <input
          className="thin_input"
          type="number"
          placeholder= {`weight (kg)`}
        /> 
      </div>

      <div>Reps: <input
          className="thin_input"
          type="number"
          placeholder= "#"
        /> 
      </div>
    </div>
  ));
}