import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise } from "../../Helpers/customTypes";
import { createExercise } from "../../Helpers/APIfunctions";

import { FaPlus, FaXmark } from "react-icons/fa6";
import Loading from "../Elements/Loading";

type Props = {
  exercises: exercise[];
  setNewExercise: Dispatch<SetStateAction<boolean>>
}

export default function NewExerciseForm({exercises, setNewExercise}: Props) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [muscle, setMuscle] = useState("");
  const [ppl, setPpl] = useState("");
  // const [demoLink, setDemoLink] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);


  async function handleSubmit() {
    if (!name || !group || !muscle) return setMessage("All fields are required.");
    setIsLoading(true)
    const newExercise: exercise = {
      exerciseId: crypto.randomUUID(),
      name,
      group,
      muscle,
      ppl,
      // demoLink
    };

    try {
      await createExercise(newExercise);
      setMessage("Exercise created!");
      setIsLoading(false)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
      setIsLoading(false)
    }
  }

  return (
    <div className="Form">
      <div className="F_feildCont">
      
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <select value={ppl} onChange={e => setPpl(e.target.value)}>
        <option hidden>Push-Pull?</option>
        <option value="push">Push</option>
        <option value="pull">Pull</option>
        {/* <option value="legs">Legs</option> */}
      </select>
      {/* <input type="text" placeholder="Group" value={group} onChange={e => setGroup(e.target.value)} /> */}
      <select value={ppl} onChange={e => setGroup(e.target.value)}>
        <option hidden>Group</option>
        {exercises.map((exercise) => 
          <option key={exercise.exerciseId} value={exercise.group}>{exercise.group}</option>
        )}
      </select>
      <select value={ppl} onChange={e => setMuscle(e.target.value)}>
        <option hidden>Muscle</option>
        {exercises.map((exercise) => 
          <option key={exercise.exerciseId} value={exercise.muscle}>{exercise.muscle}</option>
        )}
      </select>
      {/* <input placeholder="Demo-Link" value={demoLink} onChange={e => setDemoLink(e.target.value)} /> */}
      <div>
        <button onClick={handleSubmit}><FaPlus/></button>
        <button onClick={()=>setNewExercise(false)}><FaXmark/></button>        
      </div>

      {message && <p>{message}</p>}
      {isLoading && <Loading message = {"Creating Exercise"}/>}
      </div>
    </div>
  );
}