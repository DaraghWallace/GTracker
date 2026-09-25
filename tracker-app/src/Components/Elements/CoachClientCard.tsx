import { useState } from "react";
import type { user, session, sessionExercise, exercise } from "../../Helpers/customTypes";
import { getClientLatestSession, getClientSessionExercises} from "../../Helpers/api";

import { FaUserLargeSlash, FaPlus } from "react-icons/fa6";

type Props = {
  client: user;
  handleRemove: (clientId: string) => void;
  exercises: exercise[]
}

export default function CoachClientcard({ client, handleRemove, exercises }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [showLatest, setShowLatest] = useState(false);
  const [latestSession, setLatestSession] = useState<session | null | undefined>(undefined); // undefined = not fetched yet
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [clientExercises, setClientExercises] = useState<sessionExercise[] | undefined>(undefined);
  const [loadingExercises, setLoadingExercises] = useState(false);
  
  async function handleToggleLatest() {
    const next = !showLatest;
    setShowLatest(next);
    if (next && latestSession === undefined) {
      setLoadingLatest(true);
      setLatestError(null);
      try {
        const result = await getClientLatestSession(client.userId);
        setLatestSession(result);
        if (result) {
          setLoadingExercises(true);
          const exResult = await getClientSessionExercises(result.sessionId);
          setClientExercises(exResult);
          setLoadingExercises(false);
        }
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

    {showLatest && (!loadingLatest && latestSession && (
      <div className="cc_latest_exercises">
        {loadingExercises && <div>Loading exercises...</div>}
        {!loadingExercises && clientExercises?.length === 0 && <div>No exercises logged for this session.</div>}
        {!loadingExercises && clientExercises?.map((ex) => (
          <div key={ex.sessionExerciseId}>
            <div>{getExercise(ex.exerciseId, exercises).name}</div>
            <div>{displaySets(ex.sets)}</div>
          </div>
        ))}
      </div>
    ))}

    <div className="cc_footer">
      <button><FaPlus/></button>
      <button onClick={handleToggleLatest}>M</button>
    </div>
  </div>
}

function displayDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function getExercise(exerciseId: string, exercises: exercise[]): exercise {
  const thisExercise = exercises.find(e => e.exerciseId === exerciseId);

  if (!thisExercise) {
    return {
      exerciseId: exerciseId,
      name: "Exercise Not Found",
      group: "N/A",
      target: "N/A",
      ppl: "N/A",
      author: "N/A"
    }
  } else return thisExercise
}

function displaySets(setString: string) {
  const setArr = setString.split(",")
  
  return (setArr.map((set, index)=>{
    const wxr = set.split("x")
    return <div key={index}>{`${wxr[0]}Kgs x ${wxr[1]}`}</div>
  }))
}