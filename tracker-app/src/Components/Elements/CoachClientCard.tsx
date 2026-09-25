import { useState } from "react";
import type { user, session } from "../../Helpers/customTypes";
import { getClientLatestSession } from "../../Helpers/api";

import { FaUserLargeSlash } from "react-icons/fa6";

type Props = {
  client: user;
  handleRemove: (clientId: string) => void;
}

export default function CoachClientcard({ client, handleRemove }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showLatest, setShowLatest] = useState(false);
  const [latestSession, setLatestSession] = useState<session | null | undefined>(undefined); // undefined = not fetched yet
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);

  async function handleToggleLatest() {
    const next = !showLatest;
    setShowLatest(next);
    if (next && latestSession === undefined) {
      setLoadingLatest(true);
      setLatestError(null);
      try {
        const result = await getClientLatestSession(client.userId);
        setLatestSession(result);
      } catch (e: unknown) {
        setLatestError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoadingLatest(false);
      }
    }
  }

  return <div className="client_card" >
    <div className="cc_header">
      {client.nickname}

      {confirmRemove?
        <div>
          Are you sure?
          <button onClick={() => handleRemove(client.userId)}>Y</button>
          <button onClick={() => setConfirmRemove(false)}>N</button>
        </div>:
        <button onClick={() => setConfirmRemove(true)}><FaUserLargeSlash/> </button>      
      }
    </div>
    <div className="cc_content">
      <div>Height: {client.height_cm}cm</div>
      <div>Current Weight: {client.cur_weight}Kgs</div>
      <div>Target Weight: {client.tar_weight}Kgs</div>
      <div>Goal: {client.goal}</div>
    </div>

    {showLatest && (
      <div className="cc_latest_session">
        {loadingLatest && <div>Loading...</div>}
        {latestError && <div style={{ color: "red" }}>{latestError}</div>}
        {!loadingLatest && !latestError && latestSession === null && <div>No sessions logged yet.</div>}
        {!loadingLatest && latestSession && (
          <div>
            <div>{latestSession.focus ?? "Session"} — {displayDate(latestSession.dateDone)}</div>
            <div>{latestSession.userWeight > 0 && `${latestSession.userWeight}Kgs`}</div>
          </div>
        )}
      </div>
    )}

    <div className="cc_footer">
      <button>+</button>
      <button onClick={handleToggleLatest}>M</button>
    </div>
  </div>
}

function displayDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}