import { useState, type Dispatch, type SetStateAction } from "react";
import type { sessionExercise, exercise } from "../../Helpers/customTypes";
import { createSessionExercise, fetchFromTable } from "../../Helpers/APIfunctions";
import NseSetFormEle from "../Elements/NseFormSetEle";

import '../../CSS/Form.css'
import { FaPlus, FaPen, FaCheck, FaMinus, FaXmark  } from "react-icons/fa6";

type Props = {
  sessionId: string;
  exercises: exercise[];
  setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>;
  userId: string
  setNewSetFormOpen: Dispatch<SetStateAction<boolean>>
}


export default function NewSessionExerciseForm({ sessionId, exercises, setSessionExercises, userId, setNewSetFormOpen }: Props) {
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
      const data = await fetchFromTable(userId, "sets")
      setSessionExercises(data)
      
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="F_feildCont">
      <div>
        <div className="f_exercise_group">
          Exercise: {selectedExercise && selectedExercise.name}
          {selectedExercise && <button onClick={()=>setSelectedExercise(null)}><FaPen/></button>}
        </div>

          {!selectedExercise && (
            <div>
              {[...new Set(exercises.map(e => e.group))].map(group => (
                <div className="f_exercise_cont" key={group}>
                  <div className="f_exercise_group">{group}:</div>
                  <div>
                    {exercises.filter(e => e.group === group).map(exercise => (
                      <button className="f_exercise_button" key={exercise.exerciseId} onClick={() => setSelectedExercise(exercise)}>
                        {exercise.name}
                      </button>
                    ))}                  
                  </div>

                </div>
              ))}
            </div>

        )}
      </div>
      
      <div className="f_exercise_group">
        Sets: {numOfSets} 
        <button onClick={()=>setNumOfSets(numOfSets+1)}><FaPlus/></button>
        {numOfSets >= 1 && <button onClick={()=>setNumOfSets(numOfSets-1)}><FaMinus/></button>}
      </div>
      <div className="f_exercise_group">Weight | Reps | Done?</div>
      {displayReps(numOfSets,setArr, setSetArr)}

      <label>
        <input
          type="checkbox"
          checked={toFailure}
          onChange={e => setToFailure(e.target.checked)}
        />
        To failure
      </label>
      <div>
        <button onClick={handleSubmit} className="green_button"><FaCheck/></button>
        <button onClick={() => setNewSetFormOpen(false)}><FaXmark/></button>
      </div>

      {message && <p>{message}</p>}
    </div>        
  );
}

function displayReps(numOfSets: number, setArr: string[], setSetArr: Dispatch<SetStateAction<string[]>>) {
  return Array.from({ length: numOfSets }, (_, i) => (
    <NseSetFormEle key={i} index = {i} setArr={setArr} setSetArr={setSetArr} />
  ));
}