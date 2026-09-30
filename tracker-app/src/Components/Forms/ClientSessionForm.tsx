import { useState } from "react";
import type { exercise } from "../../Helpers/customTypes";
import { apiPost } from "../../Helpers/api";

type Props = {
  exercises: exercise[];
  clientId: string;
  onCreated?: () => void;
};

export default function ClientSessionForm({ exercises, clientId, onCreated }: Props) {
  const [focus, setFocus] = useState("");
  const [date, setDate] = useState("");
  const [list, setList] = useState([{ exerciseId: exercises[0]?.exerciseId ?? "", reps: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<{ exerciseId: string; reps: number }>) =>
    setList(l => l.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

    async function handleSubmit() {
      setSubmitting(true);
      setError(null);
      try {
        // 1. create the session for the client
        const session = await apiPost("/sessions/for-client", { clientId, focus, date });
        // 2. for each exercise
        for (let i = 0; i < list.length; i++) {
          const ex = list[i];
          // 4. for each set, default to 0x0
          const sets = Array(ex.reps).fill("0x0").join(",");

          // 3. create a session exercise for the session
          await apiPost("/sessionExercises", {
            sessionExerciseId: crypto.randomUUID(),
            sessionId: session.sessionId,
            exerciseIndex: i+1,
            exerciseId: ex.exerciseId,
            toFailure: false,
            sets,
          });
        }

        onCreated?.();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setSubmitting(false);
      }
  }

  return (<div className="form">
    {error && <div style={{ color: "red" }}>{error}</div>}
    <div className="f_panel">
      <div>
        <div>Focus: <input value={focus} onChange={e => setFocus(e.target.value)} /></div>
        <div>Date: <input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div># of exercises
          <button onClick={() => setList(l => [...l, { exerciseId: exercises[0]?.exerciseId ?? "", reps: 1 }])}>+</button>
          <button onClick={() => setList(l => l.length > 1 ? l.slice(0, -1) : l)}>-</button>
        </div>
      </div>

      <div>
        {list.map((ex, i) => (
          <div key={i}>
            <div>{i + 1}.
              <select value={ex.exerciseId} onChange={e => update(i, { exerciseId: e.target.value })}>
                {exercises.map(o => <option key={o.exerciseId} value={o.exerciseId}>{o.name}</option>)}
              </select>
            </div>
            <div>sets {ex.reps}
              <button onClick={() => update(i, { reps: ex.reps + 1 })}>+</button>
              <button onClick={() => update(i, { reps: Math.max(1, ex.reps - 1) })}>-</button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <button onClick={handleSubmit} disabled={submitting}>
      {submitting ? "Saving..." : "Save Session"}
    </button>
  </div>);
}