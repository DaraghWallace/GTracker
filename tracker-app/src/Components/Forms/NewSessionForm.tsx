import { useState, type Dispatch, type SetStateAction } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { session } from "../../Helpers/customTypes";
import { createSession, getSessions } from "../../Helpers/APIfunctions";

import {  FaXmark, FaCheck, } from "react-icons/fa6";
import Loading from "../Elements/Loading";

import "../../CSS/form.css";

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

  const [postStatus, setPostStatus] = useState("waiting");

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
      setPostStatus("posting")
      const date = new Date
      await createSession(newSession);
      setMessage("Session created!");
      const data = await getSessions(
        `${date.getFullYear()}-01-01`, `${date.getFullYear()}-12-31`
      );
      // console.log(data);
      setSessionData(data);
      setNewSessionFormOpen(false)
      setPostStatus("Done")
    } catch (e: unknown) {
      setPostStatus("failed")
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="form">
      <div className="f_panel">
        <div className="f_p_row">
          <input type="text" placeholder="Focus" value={focus} size={7} onChange={e => setFocus(e.target.value)} /> - 
          <div><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div> - 
          <div><input type="Number" value={userWeight} onChange={e => setUserWeight(Number(e.target.value))} />Kgs</div>
        </div>
        
        
        

        <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        {message && <p>{message}</p>}   
        
        <div className="f_p_row_c">
          <button onClick={handleSubmit} className="green_button"><FaCheck/></button>
          <button onClick={() => setNewSessionFormOpen(false)}><FaXmark/></button>
        </div>          
        {postStatus=="posting" && <Loading message={'Creating Session'}/>}
      </div>
    </div>
  );
}