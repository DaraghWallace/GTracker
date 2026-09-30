import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise } from "../../Helpers/customTypes";
import { apiPost } from "../../Helpers/api";

import { FaUserPlus , FaXmark, FaMagnifyingGlass , FaHourglassHalf, FaPlus, FaMinus, FaList, FaCross, FaFloppyDisk } from "react-icons/fa6";

type Props = {
  exercises: exercise[];
  clientId: string;
  onCreated?: () => void;
  setClientSessionFormOpen: Dispatch<SetStateAction<boolean>>
};

export default function ClientSessionForm({ exercises, clientId, onCreated, setClientSessionFormOpen }: Props) {
  const [focus, setFocus] = useState("");
  const [date, setDate] = useState("");
  const [list, setList] = useState([{ exerciseId: "", reps: 1 }]);

  // const [submitting, setSubmitting] = useState(false);

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
          await apiPost(`/coaching/sessions/${session.sessionId}/exercises`, {
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
      <div className="f_p_header">New Session</div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div className="f_p_col">
        <input type="text" placeholder="Focus" aria-label="Focus" value={focus} size={7} onChange={e => setFocus(e.target.value)} />
        <div className="f_p_e_header">Date <input type="date" aria-label="Date" value={date} onChange={e => setDate(e.target.value)} /></div>
        
        <div>
          <div className="f_p_e_header">Number of exercises</div>
          <div>
            <button onClick={() => setList(l => [...l, { exerciseId: "", reps: 1 }])}><FaPlus/></button>
            <button onClick={() => setList(l => l.length > 1 ? l.slice(0, -1) : l)}><FaMinus/></button>            
          </div>
        </div>
      </div>

      <div>
        {list.map((ex, i) => (
          <div key={i}>
            <hr/>
            <div  className="f_p_row">
              {ex.exerciseId ?
                <div className="f_p_e_header">
                  {i + 1}: {getExercise(ex.exerciseId ,exercises).name}
                </div>:<div className="f_p_e_header">
                  {i + 1}: Select Exercise
                </div>
              } <button onClick={() => update(i, { exerciseId: "" })}><FaList/></button>         
            </div>
            
            {ex.exerciseId == "" &&
              <div className="f_p_exercises" >
                {[...new Set(exercises.map(e => e.group))].map(group => (
                  <div key={group}>
                    <div className="f_p_e_header">{group}:</div>
                    <div className="f_e_cont">
                      {exercises.filter(e => e.group === group).map(exercise => (
                        <button className="f_e_button" key={exercise.exerciseId} onClick={() => update(i, { exerciseId: exercise.exerciseId })}>
                          {exercise.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }

            <div className="space"> </div>

            <div className="f_p_row">
              <div className="f_p_e_header"># of Sets: {ex.reps}</div>
              <div>
                <button onClick={() => update(i, { reps: ex.reps + 1 })}><FaPlus/></button>
                <button onClick={() => update(i, { reps: Math.max(1, ex.reps - 1) })}><FaMinus/></button>                
              </div>
            </div>
          </div>
        ))}
        <hr/>
      </div>


      <div className="f_p_row_c">
        <button onClick={() => setClientSessionFormOpen(false)}><FaXmark/></button>
        <button onClick={handleSubmit} disabled={submitting}>
          <FaFloppyDisk/>
        </button>        
      </div>
    </div>
    


  </div>);
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