import { useState } from "react";
import type { exercise } from "../../Helpers/customTypes";
import { createExercise } from "../../Helpers/APIfunctions";

export default function NewExerciseForm() {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [muscle, setMuscle] = useState("");
  const [ppl, setPpl] = useState("");
  // const [demoLink, setDemoLink] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!name || !group || !muscle) return setMessage("All fields are required.");

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
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Group" value={group} onChange={e => setGroup(e.target.value)} />
      <input placeholder="Muscle" value={muscle} onChange={e => setMuscle(e.target.value)} />
      <select value={ppl} onChange={e => setPpl(e.target.value)}>
        <option value="">Push-Pull-Legs?</option>
        <option value="push">Push</option>
        <option value="pull">Pull</option>
        <option value="legs">Legs</option>
      </select>
      {/* <input placeholder="Demo-Link" value={demoLink} onChange={e => setDemoLink(e.target.value)} /> */}
      <button onClick={handleSubmit}>Create exercise</button>
      {message && <p>{message}</p>}
    </div>
  );
}