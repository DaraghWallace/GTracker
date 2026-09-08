import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise, user } from "../../Helpers/customTypes";
import { createExercise } from "../../Helpers/APIfunctions";

import "../../CSS/form.css"
import { FaPlus, FaXmark } from "react-icons/fa6";
import Loading from "../Elements/Loading";

type MuscleGroup = "Arms" | "Shoulders" | "Chest" | "Back" | "Core" | "Legs" | "Cardio";
type PushPull = "push" | "pull";

type Props = {
  user: user,
  setNewExercise: Dispatch<SetStateAction<boolean>>
  exercises: exercise[];
}

export default function NewExerciseForm({ user, setNewExercise,exercises }: Props) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "">("");
  const [target, setTarget] = useState("");
  const [ppl, setPpl] = useState<PushPull | "">("");
  
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  function handleGroupChange(nextGroup: MuscleGroup) {
    setGroup(nextGroup);
    setTarget("");
  }

  async function handleSubmit() {
    if (group != "Cardio")
      if (!name || !group || !target || !ppl) return setMessage("All fields are required.");
    else setTarget(""); setPpl("")
    const newExercise: exercise = {
      exerciseId: crypto.randomUUID(),
      name,
      group,
      target,
      ppl,
      author: user.userId,
    };

    setIsLoading(true)
    try {
      await createExercise(newExercise);
      setMessage("Exercise created!");
      setName("");
      setGroup("");
      setTarget("");
      setPpl("");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form">
      <div className="f_panel">
        <input type="text" placeholder="Name" aria-label="Exercise name" value={name} onChange={e => setName(e.target.value)} />

        <select value={group} aria-label="Muscle group" onChange={e => handleGroupChange(e.target.value as MuscleGroup)}>
          <option hidden>Group</option>
          <option value="Arms">Arms</option>
          <option value="Shoulders">Shoulders</option>
          <option value="Chest">Chest</option>
          <option value="Back">Back</option>
          <option value="Core">Core</option>
          <option value="Legs">Legs</option>
          <option value="Cardio">Cardio</option>
        </select>

        <input type="text" placeholder="Target" aria-label="Target muscle" value={target} onChange={e => setTarget(e.target.value)} />
        {renderTargetMuscleSelect(group, setTarget, exercises)}
        
        {group != "Cardio" && 
          <select value={ppl} aria-label="Push or pull" onChange={e => setPpl(e.target.value as PushPull)}>
            <option hidden>Push-Pull-Hold?</option>
            <option value="push">Push</option>
            <option value="pull">Pull</option>            
            <option value="pull">Hold</option>            
          </select>
        }
        
        <div className="f_p_row_c">
          <button aria-label="Create exercise" onClick={handleSubmit}><FaPlus /></button>
          <button aria-label="Cancel" onClick={() => setNewExercise(false)}><FaXmark /></button>
        </div>

        {message && <p>{message}</p>}
        {isLoading && <Loading message={"Creating Exercise"} />}
      </div>
    </div>
  );
}

function renderTargetMuscleSelect(group: MuscleGroup | "", setTarget: Dispatch<SetStateAction<string>>, exercises: exercise[]) {
  if (!group) return null;

  const exerciseTargets: string[] = [];
  exercises
    .filter(exercise => exercise.group === group)
    .forEach(exercise => {
      if (!exerciseTargets.includes(exercise.target)) exerciseTargets.push(exercise.target);
    });

  return (
    <div className="f_e_cont">
      {exerciseTargets.map(targVar => (
        <button className="f_e_button"
          type="button"
          key={targVar}
          onClick={() => setTarget(targVar)}
        >
          {targVar}
        </button>
      ))}
    </div>
  );
}