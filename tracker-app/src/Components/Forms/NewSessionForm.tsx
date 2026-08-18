import { useState, type Dispatch, type SetStateAction } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { session } from "../../Helpers/customTypes";
import { createSession } from "../../Helpers/APIfunctions";

import { FaXmark, FaCheck } from "react-icons/fa6";
import Loading from "../Elements/Loading";

import "../../CSS/form.css";

type PostStatus = "idle" | "posting" | "done" | "failed";

type Props = {
  userId: string;
  setNewSessionFormOpen: Dispatch<SetStateAction<boolean>>;
  setSessionData: Dispatch<SetStateAction<session[]>>;
}

/*
  NewSessionForm
    handleSubmit: validates the date, creates the session via the API, and
    adds it straight into local state (rather than refetching) on success.
*/
export default function NewSessionForm({ userId, setNewSessionFormOpen, setSessionData }: Props) {
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const [userWeight, setUserWeight] = useState(0);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const [postStatus, setPostStatus] = useState<PostStatus>("idle");

  async function handleSubmit() {
    if (!date) {
      setMessage("Date is required.");
      return;
    }

    const newSession: session = {
      sessionId: uuidv4(),
      userId,
      dateDone: date,
      userWeight: userWeight,
      focus: focus || null,
      notes: notes || null,
    };

    try {
      setPostStatus("posting")
      await createSession(newSession);
      setMessage("Session created!");

      // Add it straight into state instead of refetching a (possibly narrower) range
      setSessionData(prev => [...prev, newSession]);

      setNewSessionFormOpen(false)
      setPostStatus("done")
    } catch (e: unknown) {
      setPostStatus("failed")
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="form">
      <div className="f_panel">
        <div className="f_p_col">
          <input type="text" placeholder="Focus" aria-label="Focus" value={focus} size={7} onChange={e => setFocus(e.target.value)} />
          <div className="bold_text">Current Weight: <input type="number" aria-label="Current weight" value={userWeight} onChange={e => setUserWeight(Number(e.target.value))} />Kgs</div>
          <div><input type="date" aria-label="Date" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>

        <textarea placeholder="Notes (optional)" aria-label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        {message && <p>{message}</p>}

        <div className="f_p_row_c">
          <button aria-label="Create session" onClick={handleSubmit} className="green_button"><FaCheck /></button>
          <button aria-label="Cancel" onClick={() => setNewSessionFormOpen(false)}><FaXmark /></button>
        </div>
        {postStatus === "posting" && <Loading message={'Creating Session'} />}
      </div>
    </div>
  );
}