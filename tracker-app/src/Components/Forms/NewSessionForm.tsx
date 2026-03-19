import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { session } from "../../Helpers/customTypes";
import { createSession } from "../../Helpers/APIfunctions";

type Props = {
  userId: string;
}

export default function NewSessionForm({ userId }: Props) {
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!date) return setMessage("Date is required.");

    const newSession: session = {
      sessionId: uuidv4(),
      userId,
      date,
      focus: focus || null,
      notes: notes || null,
    };

    try {
      createSession(newSession);
      setMessage("Session created!");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input placeholder="Focus (optional)" value={focus} onChange={e => setFocus(e.target.value)} />
      <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
      <button onClick={handleSubmit}>Create session</button>
      {message && <p>{message}</p>}
    </div>
  );
}