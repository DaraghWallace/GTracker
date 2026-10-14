import { useState } from "react";
import type { user, session, sessionExercise, exercise } from "../../Helpers/customTypes";
import { getClientLatestSession, getClientSessionExercises } from "../../Helpers/api";

import { FaUserLargeSlash } from "react-icons/fa6";

import ClientSessionForm from "../Forms/ClientSessionForm";
import SessionExerciseEle from "./SessionExerciseEle";

/*
  CoachClientCard.tsx - one client's card on the trainer's Coaching page.

  Shows:
    - client nickname, with a remove button that asks "Are you sure? Y/N" first
    - client stats (height, starting/target weight, goal)
    - a "Show Latest session" button that lazily fetches the client's most recent
      session and its exercises (fetched once, then cached in state)
    - a "Create Session" button that opens ClientSessionForm for this client

  Latest session states: loading, error, "No sessions logged yet", or the session
  header (date + weight) followed by its exercises (read-only SessionExerciseEles).
*/

type Props = {
  client: user;
  handleRemove: (clientId: string) => void;
  exercises: exercise[];
};

export default function CoachClientcard({ client, handleRemove, exercises }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [clientSessionFormOpen, setClientSessionFormOpen] = useState(false);

  const [showLatest, setShowLatest] = useState(false);
  const [latestSession, setLatestSession] = useState<session | null | undefined>(undefined); // undefined = not fetched yet
  const [clientExercises, setClientExercises] = useState<sessionExercise[] | undefined>(undefined);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);

  async function handleShowLatest() {
    setShowLatest(true);
    if (latestSession !== undefined) return; // already fetched

    setLoadingLatest(true);
    setLatestError(null);
    try {
      const session = await getClientLatestSession(client.userId);
      setLatestSession(session);
      if (session) setClientExercises(await getClientSessionExercises(session.sessionId));
    } catch (e) {
      setLatestError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingLatest(false);
    }
  }

  function renderLatestSession() {
    if (loadingLatest) return <div>Loading...</div>;
    if (latestError) return <div style={{ color: "red" }}>{latestError}</div>;
    if (latestSession === null) return <div>No sessions logged yet.</div>;
    if (!latestSession) return null;

    return (
      <div>
        <div className="cc_s_header">
          <div>Latest Session: {displayDate(latestSession.dateDone)}</div>
          <div>{latestSession.userWeight > 0 && `${latestSession.userWeight}Kgs`}</div>
        </div>

        <div className="cc_latest_exercises">
          {clientExercises?.length === 0 && <div>No exercises logged for this session.</div>}
          {clientExercises?.map((ex) => (
            <SessionExerciseEle
              key={ex.sessionExerciseId}
              sessionExercise={ex}
              exercises={exercises}
              setSessionExercises={() => {}}
              editSetVisible={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="client_card">
      <div>
        <div className="cc_header">
          {client.nickname}

          {confirmRemove ? (
            <div>
              Are you sure?
              <button onClick={() => handleRemove(client.userId)}>Y</button>
              <button onClick={() => setConfirmRemove(false)}>N</button>
            </div>
          ) : (
            <button onClick={() => setConfirmRemove(true)}><FaUserLargeSlash /></button>
          )}
        </div>

        <div className="cc_content">
          <div className="cc_c_bar_light">Height: {client.height_cm}cm</div>
          <div className="cc_c_bar_dark">Starting Weight: {client.cur_weight}Kgs</div>
          <div className="cc_c_bar_light">Target Weight: {client.tar_weight}Kgs</div>
          <div className="cc_c_bar_dark">Goal: {client.goal}</div>

          {showLatest ? (
            <div className="cc_latest_session">{renderLatestSession()}</div>
          ) : (
            <button className="load_sesh_button" onClick={handleShowLatest}>
              Show Latest session
            </button>
          )}
        </div>
      </div>

      <div className="cc_footer">
        <button className="load_sesh_button" onClick={() => setClientSessionFormOpen(true)}>
          Create Session
        </button>
      </div>

      {clientSessionFormOpen && (
        <ClientSessionForm
          exercises={exercises}
          clientId={client.userId}
          setClientSessionFormOpen={setClientSessionFormOpen}
        />
      )}
    </div>
  );
}

function displayDate(date: string): string {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}