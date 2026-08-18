import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise, user } from "../../Helpers/customTypes";
import { createExercise } from "../../Helpers/APIfunctions";

import "../../CSS/form.css"
import { FaPlus, FaXmark } from "react-icons/fa6";
import Loading from "../Elements/Loading";

type MuscleGroup = "Arms" | "Shoulders" | "Chest" | "Back" | "Core" | "Legs";
type PushPull = "push" | "pull";

type TargetOption = { value: string; label: string };

// Each muscle group's target-muscle options (value/label differ for the
// hip abductor/adductor entries, hence the pair rather than a plain string).
const TARGET_OPTIONS: Record<MuscleGroup, TargetOption[]> = {
  Arms: [
    { value: "Bicep", label: "Bicep" },
    { value: "Tricep", label: "Tricep" },
    { value: "Brachialis", label: "Brachialis" },
    { value: "Fore Arm", label: "Fore Arm" },
  ],
  Shoulders: [
    { value: "Front Delt", label: "Front Delt" },
    { value: "Side Delt", label: "Side Delt" },
    { value: "Rear Delt", label: "Rear Delt" },
  ],
  Chest: [
    { value: "Upper Pec", label: "Upper Pec" },
    { value: "Middle Pec", label: "Middle Pec" },
    { value: "Lower Pec", label: "Lower Pec" },
  ],
  Back: [
    { value: "Traps", label: "Traps" },
    { value: "Mid Back", label: "Mid Back" },
    { value: "Lats", label: "Lats" },
  ],
  Core: [
    { value: "Abs", label: "Abs" },
    { value: "Obliques", label: "Obliques" },
  ],
  Legs: [
    { value: "Quads", label: "Quads" },
    { value: "Glutes", label: "Glutes" },
    { value: "Hamstring", label: "Hamstring" },
    { value: "Calf", label: "Calf" },
    { value: "Abductors", label: "Hip Abductors" },
    { value: "Adductors", label: "Hip Adductors" },
  ],
};

type Props = {
  user: user,
  setNewExercise: Dispatch<SetStateAction<boolean>>
}

/*
  NewExerciseForm
    handleSubmit: validates all fields are filled, creates the exercise via
    the API, then resets the form so another exercise can be added right after.
*/
export default function NewExerciseForm({ user, setNewExercise }: Props) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "">("");
  const [target, setTarget] = useState("");
  const [ppl, setPpl] = useState<PushPull | "">("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  function handleGroupChange(nextGroup: MuscleGroup) {
    setGroup(nextGroup);
    // The target list is different per group, so a target picked under the
    // old group is almost never valid for the new one.
    setTarget("");
  }

  async function handleSubmit() {
    if (!name || !group || !target || !ppl) return setMessage("All fields are required.");

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
        </select>

        {renderTargetMuscleSelect(group, target, setTarget)}

        <select value={ppl} aria-label="Push or pull" onChange={e => setPpl(e.target.value as PushPull)}>
          <option hidden>Push-Pull?</option>
          <option value="push">Push</option>
          <option value="pull">Pull</option>
        </select>

        <div>
          <button aria-label="Create exercise" onClick={handleSubmit}><FaPlus /></button>
          <button aria-label="Cancel" onClick={() => setNewExercise(false)}><FaXmark /></button>
        </div>

        {message && <p>{message}</p>}
        {isLoading && <Loading message={"Creating Exercise"} />}
      </div>
    </div>
  );
}

function renderTargetMuscleSelect(group: MuscleGroup | "", target: string, setTarget: Dispatch<SetStateAction<string>>) {
  if (!group) return null;

  return (
    <select value={target} aria-label="Target muscle" onChange={e => setTarget(e.target.value)}>
      <option hidden>Target</option>
      {TARGET_OPTIONS[group].map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}