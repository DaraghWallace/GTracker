import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise, user } from "../../Helpers/customTypes";
import { createExercise } from "../../Helpers/APIfunctions";

import "../../CSS/form.css"
import { FaPlus, FaXmark } from "react-icons/fa6";
import Loading from "../Elements/Loading";

type Props = {
  user:user,
  setNewExercise: Dispatch<SetStateAction<boolean>>
}

export default function NewExerciseForm({user, setNewExercise}: Props) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [target, setTarget] = useState("");
  const [ppl, setPpl] = useState("");
  // const [demoLink, setDemoLink] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);


  async function handleSubmit() {
    if (!name || !group || !target) return setMessage("All fields are required.");
    setIsLoading(true)
    const newExercise: exercise = {
      exerciseId: crypto.randomUUID(),
      name,
      group,
      target,
      ppl,
      author: user.userId,
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
    <div className="form">
      <div className="f_panel">
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      
      <select value={group} onChange={e => setGroup(e.target.value)}>
        <option hidden>Group</option>
        <option value="Arms">Arms</option>
        <option value="Shoulders">Shoulders</option>
        <option value="Chest">Chest</option>
        <option value="Back">Back</option>
        <option value="Core">Core</option>
        <option value="Legs">Legs</option>
      </select>
      
      {handleTargetMuscle(group, target, setTarget)}
      
      <select value={ppl} onChange={e => setPpl(e.target.value)}>
        <option hidden>Push-Pull?</option>
        <option value="push">Push</option>
        <option value="pull">Pull</option>
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

function handleTargetMuscle(group:string,target: string, setTarget: React.Dispatch<React.SetStateAction<string>>) {

  switch (group) {
    case "Arms":
      return <select value={target} onChange={e => setTarget(e.target.value)}>
        <option hidden>Target</option>
        <option value="Bicep">Bicep</option>
        <option value="Tricep">Tricep</option>
        <option value="Brachialis">Brachialis</option>
        <option value="Fore Arm">Fore Arm</option>
      </select>
    case "Shoulders":
      return <select value={target} onChange={e => setTarget(e.target.value)}>
        <option hidden>Target</option>
        <option value="Front Delt">Front Delt</option>
        <option value="Side Delt">Side Delt</option>
        <option value="Rear Delt">Rear Delt</option>
      </select>
    case "Chest":
      return <select value={target} onChange={e => setTarget(e.target.value)}>
        <option hidden>Target</option>
        <option value="Upper Pec">Upper Pec</option>
        <option value="Middle Pec">Middle Pec</option>
        <option value="Lower Pec">Lower Pec</option>
      </select>
    case "Back":
      return <select value={target} onChange={e => setTarget(e.target.value)}>
        <option hidden>Target</option>
        <option value="Traps">Traps</option>
        <option value="Mid Back">Mid Back</option>
        <option value="Lats">Lats</option>
      </select>
    case "Core":
      return <select value={target} onChange={e => setTarget(e.target.value)}>
        <option hidden>Target</option>
        <option value="Abs">Abs</option>
        <option value="Obliques">Obliques</option>
      </select>
    case "Legs":
      return <select value={target} onChange={e => setTarget(e.target.value)}>
        <option hidden>Target</option>
        <option value="Quads">Quads</option>
        <option value="Glutes">Glutes</option>
        <option value="Hamstring">Hamstring</option>
        <option value="Calf">Calf</option>
        <option value="Abductors">Hip Abductors</option>
        <option value="Adductors">Hip Adductors</option>
      </select>
    default:
      break;
  }
}