import { useState, type Dispatch, type SetStateAction } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { session } from "../../Helpers/customTypes";
import { createSession, fetchFromTable } from "../../Helpers/APIfunctions";

import '../../CSS/Form.css'

import {  FaXmark, FaCheck, } from "react-icons/fa6";

type Props = {
  userId: string;
  setNewSessionFormOpen: Dispatch<SetStateAction<boolean>>
  setSessionData: React.Dispatch<React.SetStateAction<session[]>>;
}

export default function NewSessionForm({ userId, setNewSessionFormOpen, setSessionData }: Props) {
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const [userWeight, setUserWeight] = useState(0);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!date) return setMessage("Date is required.");

    const newSession: session = {
      sessionId: uuidv4(),
      userId,
      dateDone: date,
      userWeight: userWeight,
      focus: focus || null,
      notes: notes || null,
    };

    try {
      await createSession(newSession);
      setMessage("Session created!");
      const data = await fetchFromTable(userId, "sessions");
      console.log(data);
      setSessionData(data);
      setNewSessionFormOpen(false)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="Form">
      <div className="F_feildCont">
        <div className="f_fc_Row">
          <input placeholder="Focus" value={focus} size={7} onChange={e => setFocus(e.target.value)} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div><input type="Number" value={userWeight} onChange={e => setUserWeight(Number(e.target.value))} />Kgs</div>
        </div>

        <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        {message && <p>{message}</p>}   
        <div>
          <button onClick={handleSubmit} className="green_button"><FaCheck/></button>
          <button onClick={() => setNewSessionFormOpen(false)}><FaXmark/></button>
        </div>       
      </div>
    </div>
  );
}