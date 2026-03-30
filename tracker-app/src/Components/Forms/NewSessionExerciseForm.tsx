import { useState, type Dispatch, type SetStateAction } from "react";
import type { sessionExercise, exercise } from "../../Helpers/customTypes";
import { createSessionExercise } from "../../Helpers/APIfunctions";

import '../../CSS/Form.css'
import NseSetFormEle from "../Elements/NseFormSetEle";

type Props = {
  sessionId: string;
  exercises: exercise[];
  loadUserData: (userId: string) => Promise<void>;
  userId: string
  setNewSetFormOpen: Dispatch<SetStateAction<boolean>>
}


export default function NewSessionExerciseForm({ sessionId, exercises, loadUserData, userId, setNewSetFormOpen }: Props) {
  // const [query, setQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<exercise | null>(null);
  const [numOfSets, setNumOfSets] = useState(Number);
  const [setArr, setSetArr] = useState<string[]>([]);
  const [toFailure, setToFailure] = useState(false);
  const [message, setMessage] = useState("");

  // const filtered = exercises.filter(e =>
  //   e.name.toLowerCase().includes(query.toLowerCase())
  // );

  async function handleSubmit() {
    if (!selectedExercise) return setMessage("Select an exercise.");
    if (!numOfSets) return setMessage("Enter Set(s).");
    if (!setArr) return setMessage("Enter weight(s).");

    // console.log(setArr);
    const setArrString  = setArr.toString()
    if (setArrString === "") return setMessage("Complete sets.");
    
    const newSessionExercise: sessionExercise = {
      sessionExerciseId: crypto.randomUUID(),
      sessionId: sessionId,
      exerciseId: selectedExercise.exerciseId,
      toFailure: toFailure,
      sets: setArrString, // e.g "Wt(reps),25(10),27(8)"
    };

    console.log(newSessionExercise);
    

    try {
      await createSessionExercise(newSessionExercise);
      setMessage("Set created!");
      setNewSetFormOpen(false)
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
      
      <div className="f_fc_Row">Weight | Reps | Done?</div>
      {displayReps(numOfSets,setArr, setSetArr)}

      <input
        type="number"
        placeholder="Reps"
        value={numOfSets}
        onChange={e => setNumOfSets(Number(e.target.value))}
        min={1}
      />


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

function displayReps(numOfSets: number, setArr: string[], setSetArr: Dispatch<SetStateAction<string[]>>) {
  return Array.from({ length: numOfSets }, (_, i) => (
    <NseSetFormEle key={i} index = {i} setArr={setArr} setSetArr={setSetArr} />
  ));
}
  // return Array.from({ length: reps }, (_, i) => (
  //   <div key={i} className="f_fc_Row">
  //     <div>Set {i + 1}: <input
  //         className="thin_input"
  //         type="number"
  //         placeholder= {`weight (kg)`}
  //       /> 
  //     </div>

  //     <div>Reps: <input
  //         className="thin_input"
  //         type="number"
  //         placeholder= "#"
  //       /> 
  //     </div>
  //   </div>
  // ));