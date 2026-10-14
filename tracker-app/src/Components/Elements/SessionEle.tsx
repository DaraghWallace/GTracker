import { useState, type Dispatch, type SetStateAction } from "react";

import SessionExerciseEle from "./SessionExerciseEle";
import Loading from "./Loading";

import type { exercise, session, sessionExercise } from "../../Helpers/customTypes";
import { deleteSession, deleteSessionExercise, updateSession } from "../../Helpers/APIfunctions";
import NewSessionExerciseForm from "../Forms/NewSessionExerciseForm";

import "../../CSS/sessionEle.css";
import "../../CSS/form.css";

import { FaPlus, FaPen, FaXmark, FaCheck, FaTrash, FaAngleDown, FaAngleUp } from "react-icons/fa6";

/*
  SessionEle.tsx - one session card on the Sessions page.

  Always shows: the session header (focus, date, body weight), its exercises
  (sorted by exerciseIndex), and a Hide/Show toggle.

  When the page's edit mode (editSessions) is on, it also shows:
    - a pen to edit the session's focus/date/weight, with save, delete and cancel buttons
    - a delete confirmation overlay (deletes the session's exercises first, then the session)
    - exercise controls: add an exercise (NewSessionExerciseForm) or toggle per-exercise editing

  Saving/deleting shows a Loading overlay while the request is in flight; failures are
  logged to the console.
*/

type Props = {
  session: session;
  setSessionData: Dispatch<SetStateAction<session[]>>;
  exercises: exercise[];
  sessionExercises: sessionExercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  editSessions: boolean;
};

export default function SessionEle({ session, setSessionData, exercises, sessionExercises, setSessionExercises, editSessions }: Props) {
  const sessionSets = sessionExercises
    .filter((set) => set.sessionId === session.sessionId)
    .sort((a, b) => a.exerciseIndex - b.exerciseIndex);

  const [showSession, setShowSession] = useState(true);
  const [newSetFormOpen, setNewSetFormOpen] = useState(false);
  const [editSetVisible, setEditSetVisible] = useState(false);
  const [editSession, setEditSession] = useState(false);
  const [delSeshConfirmOpen, setDelSeshConfirmOpen] = useState(false);
  const [awaiting, setAwaiting] = useState(false);

  const [newFocus, setNewFocus] = useState(session.focus);
  const [newDateDone, setNewDateDone] = useState(session.dateDone);
  const [newUserWeight, setNewUserWeight] = useState(session.userWeight);

  const editingHeader = editSessions && editSession;

  async function handleUpdateSession() {
    const updated: session = {
      sessionId: session.sessionId,
      userId: session.userId,
      userWeight: newUserWeight,
      dateDone: newDateDone,
      focus: newFocus,
      notes: session.notes, // TODO
    };

    setAwaiting(true);
    try {
      await updateSession(updated);
      setSessionData((prev) => prev.map((s) => (s.sessionId === updated.sessionId ? updated : s)));
      setEditSession(false);
    } catch (error) {
      console.error(`Failed to update session ${session.sessionId}:`, error);
    } finally {
      setAwaiting(false);
    }
  }

  async function handleDeleteSession() {
    setAwaiting(true);
    try {
      await Promise.all(sessionSets.map((se) => deleteSessionExercise(se.sessionExerciseId)));
      await deleteSession(session.sessionId);

      setSessionData((prev) => prev.filter((s) => s.sessionId !== session.sessionId));
      setSessionExercises((prev) => prev.filter((se) => se.sessionId !== session.sessionId));
    } catch (error) {
      console.error(`Failed to delete session ${session.sessionId}:`, error);
    } finally {
      setAwaiting(false);
    }
  }

  function handleCancelEdit() {
    setEditSession(false);
    setEditSetVisible(false);
  }

  return (
    <div className="Session">
      <div className="s_header">
        {/* Header: edit form or plain text */}
        {editingHeader ? (
          <div className="s_header_form">
            <div>
              Focus: <input type="text" placeholder={session.focus || ""} size={7} value={newFocus || ""}
                onChange={(e) => setNewFocus(e.target.value)} />
            </div>
            <div>
              Date: <input type="date" placeholder={session.dateDone} value={newDateDone}
                onChange={(e) => setNewDateDone(e.target.value)} />
            </div>
            <div>
              Weight: <input type="number" value={newUserWeight}
                onChange={(e) => setNewUserWeight(Number(e.target.value))} />Kgs
            </div>
          </div>
        ) : (
          <div className="s_header_text">
            <div>{session.focus && `${session.focus}:`} {displayDate(session.dateDone)}</div>
            <div>{session.userWeight > 0 && `${session.userWeight}Kgs`}</div>
            {editSessions && (
              <button aria-label="Edit session" onClick={() => setEditSession(true)}><FaPen /></button>
            )}
          </div>
        )}

        {/* Session controls (while editing the header) */}
        {editingHeader && (
          <div className="s_header_buttons">
            Sessions:
            <button aria-label="Save session" className="green_button" onClick={handleUpdateSession}><FaCheck /></button>
            <button aria-label="Delete session" className="red_button" onClick={() => setDelSeshConfirmOpen(true)}><FaTrash /></button>
            <button aria-label="Cancel edit" onClick={handleCancelEdit}><FaXmark /></button>
          </div>
        )}

        {/* Exercise controls (any time edit mode is on) */}
        {editSessions && (
          <div className="s_header_buttons">
            Exercises:
            {newSetFormOpen ? (
              <button aria-label="Close add-exercise form" onClick={() => setNewSetFormOpen(false)}><FaXmark /></button>
            ) : (
              <button aria-label="Add exercise" onClick={() => setNewSetFormOpen(true)}><FaPlus /></button>
            )}
            {editSetVisible ? (
              <button aria-label="Stop editing exercises" onClick={() => setEditSetVisible(false)}><FaXmark /></button>
            ) : (
              <button aria-label="Edit exercises" onClick={() => setEditSetVisible(true)}><FaPen /></button>
            )}
          </div>
        )}
      </div>

      {newSetFormOpen && (
        <div className="F_inset_feildCont">
          <NewSessionExerciseForm
            sessionId={session.sessionId}
            exercises={exercises}
            setSessionExercises={setSessionExercises}
            setNewSetFormOpen={setNewSetFormOpen}
            sessionSets={sessionSets}
          />
        </div>
      )}

      {showSession && (
        <div className="seshEx_container">
          {sessionSets.map((sessionExercise) => (
            <SessionExerciseEle
              key={sessionExercise.sessionExerciseId}
              sessionExercise={sessionExercise}
              exercises={exercises}
              setSessionExercises={setSessionExercises}
              editSetVisible={editSetVisible}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation overlay */}
      {delSeshConfirmOpen && (
        <div className="form">
          <div className="f_panel">
            <div className="f_p_e_header">Are you sure you want to delete your {displayDate(session.dateDone)} session</div>
            <div className="f_p_row_c">
              <button aria-label="Cancel delete" onClick={() => setDelSeshConfirmOpen(false)}><FaXmark /></button>
              <button aria-label="Confirm delete" className="green_button" onClick={handleDeleteSession}><FaCheck /></button>
            </div>
          </div>
        </div>
      )}

      <button className="hide_button" onClick={() => setShowSession(!showSession)}>
        {showSession ? <><FaAngleUp /> Hide <FaAngleUp /></> : <><FaAngleDown /> Show <FaAngleDown /></>}
      </button>

      {awaiting && <Loading message="Submitting Request" />}
    </div>
  );
}

function displayDate(date: string): string {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}