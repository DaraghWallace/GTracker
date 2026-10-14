import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise } from "../../Helpers/customTypes";
import { apiPost } from "../../Helpers/api";

import { FaXmark, FaHourglassHalf, FaPlus, FaMinus, FaList } from "react-icons/fa6";
import { FiSend } from "react-icons/fi";

/*
  ClientSessionForm.tsx - form overlay for a trainer to create a session for a client.

  The trainer fills in a focus and date, sets how many exercises the session has,
  then for each exercise picks one (grouped by muscle group) and chooses how many sets.

  On submit:
    1. POST /sessions/for-client to create the session
    2. POST /coaching/sessions/:id/exercises once per exercise, in order,
       with every set defaulted to "0x0" (weight x reps, for the client to fill in)
    3. calls onCreated (if provided)

  The form only closes via the X button (setClientSessionFormOpen) or whatever onCreated does.
*/

type Props = {
  exercises: exercise[];
  clientId: string;
  onCreated?: () => void;
  setClientSessionFormOpen: Dispatch<SetStateAction<boolean>>;
};

type Entry = { exerciseId: string; setCount: number };

const newEntry = (): Entry => ({ exerciseId: "", setCount: 1 });

export default function ClientSessionForm({ exercises, clientId, onCreated, setClientSessionFormOpen }: Props) {
  const [focus, setFocus] = useState("");
  const [date, setDate] = useState("");
  const [list, setList] = useState<Entry[]>([newEntry()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = [...new Set(exercises.map((e) => e.group))];

  const addEntry = () => setList((l) => [...l, newEntry()]);
  const removeLastEntry = () => setList((l) => (l.length > 1 ? l.slice(0, -1) : l));
  const updateEntry = (i: number, patch: Partial<Entry>) =>
    setList((l) => l.map((entry, idx) => (idx === i ? { ...entry, ...patch } : entry)));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const session = await apiPost("/sessions/for-client", { clientId, focus, date });

      for (const [i, entry] of list.entries()) {
        await apiPost(`/coaching/sessions/${session.sessionId}/exercises`, {
          exerciseIndex: i + 1,
          exerciseId: entry.exerciseId,
          toFailure: false,
          sets: Array(entry.setCount).fill("0x0").join(","),
        });
      }

      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form">
      <div className="f_panel">
        <div className="f_p_header">New Session</div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {/* Session details */}
        <div className="f_p_col">
          <input type="text" placeholder="Focus" aria-label="Focus" value={focus} size={7} onChange={(e) => setFocus(e.target.value)} />
          <div className="f_p_e_header">
            Date <input type="date" aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <div className="f_p_e_header">Number of exercises</div>
            <div>
              <button onClick={addEntry}><FaPlus /></button>
              <button onClick={removeLastEntry}><FaMinus /></button>
            </div>
          </div>
        </div>

        {/* One block per exercise */}
        <div>
          {list.map((entry, i) => (
            <div key={i}>
              <hr />
              <div className="f_p_row">
                <div className="f_p_e_header">
                  {i + 1}: {entry.exerciseId ? getExercise(entry.exerciseId, exercises).name : "Select Exercise"}
                </div>
                <button onClick={() => updateEntry(i, { exerciseId: "" })}><FaList /></button>
              </div>

              {/* Exercise picker, shown until one is chosen */}
              {!entry.exerciseId && (
                <div className="f_p_exercises">
                  {groups.map((group) => (
                    <div key={group}>
                      <div className="f_p_e_header">{group}:</div>
                      <div className="f_e_cont">
                        {exercises.filter((e) => e.group === group).map((e) => (
                          <button
                            className="f_e_button"
                            key={e.exerciseId}
                            onClick={() => updateEntry(i, { exerciseId: e.exerciseId })}
                          >
                            {e.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space"> </div>

              <div className="f_p_row">
                <div className="f_p_e_header"># of Sets: {entry.setCount}</div>
                <div>
                  <button onClick={() => updateEntry(i, { setCount: entry.setCount + 1 })}><FaPlus /></button>
                  <button onClick={() => updateEntry(i, { setCount: Math.max(1, entry.setCount - 1) })}><FaMinus /></button>
                </div>
              </div>
            </div>
          ))}
          <hr />
        </div>

        {/* Close / submit */}
        <div className="f_p_row_c">
          <button onClick={() => setClientSessionFormOpen(false)}><FaXmark /></button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <FaHourglassHalf /> : <FiSend />}
          </button>
        </div>
      </div>
    </div>
  );
}

function getExercise(exerciseId: string, exercises: exercise[]): exercise {
  return (
    exercises.find((e) => e.exerciseId === exerciseId) ?? {
      exerciseId,
      name: "Exercise Not Found",
      group: "N/A",
      target: "N/A",
      ppl: "N/A",
      author: "N/A",
    }
  );
}