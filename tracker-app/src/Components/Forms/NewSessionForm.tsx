import { useState, type Dispatch, type SetStateAction } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { session } from "../../Helpers/customTypes";
import { createSession } from "../../Helpers/APIfunctions";

import '../../CSS/Form.css'

type Props = {
  userId: string;
  loadUserData: (userId: string) => Promise<void>;
  setNewSessionFormOpen: Dispatch<SetStateAction<boolean>>
}

export default function NewSessionForm({ userId, loadUserData, setNewSessionFormOpen }: Props) {
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!date) return setMessage("Date is required.");

    const newSession: session = {
      sessionId: uuidv4(),
      userId,
      dateDone: date,
      focus: focus || null,
      notes: notes || null,
    };

    try {
      await createSession(newSession);
      setMessage("Session created!");
      loadUserData(userId)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="Form">
      <div className="F_feildCont">
        <div className="f_fc_Column">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input placeholder="Focus (optional)" value={focus} onChange={e => setFocus(e.target.value)} />
          <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          {message && <p>{message}</p>}   
          <div>
            <button onClick={handleSubmit}>Create session</button>
            <button onClick={() => setNewSessionFormOpen(false)}>Cancel</button>
          </div>       
          
        </div>
      </div>

    </div>
  );
}