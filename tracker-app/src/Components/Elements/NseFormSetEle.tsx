import { useState, type Dispatch, type SetStateAction } from "react";

import "../../CSS/form.css";

type Props = {
  index: number;
  setArr: string[];
  setSetArr: Dispatch<SetStateAction<string[]>>;
}

/*
  NseSetFormEle
    One row of the "add sets" form for a new session exercise. Collects a
    weight/reps pair, then locks itself in as read-only once submitted,
    writing "weightXreps" into setArr at this row's index.
*/

export default function NseSetFormEle({ index, setSetArr }: Props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [completed, setCompleted] = useState(false);

  function completeSet() {
    if (weight === "" || reps === "") return;
    if (completed) return;

    setSetArr(prev => {
      const updated = [...prev];
      updated[index] = `${weight}x${reps}`;
      return updated;
    });
    setCompleted(true);
  }

  return (
    !completed ?
      <div className="sets">
        <div className="set_field">
          <input
            type="number"
            placeholder="Kgs"
            aria-label="Weight"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
        </div>
        <div className="set_field">
          <input
            type="number"
            placeholder="#"
            aria-label="Reps"
            value={reps}
            onChange={e => setReps(e.target.value)}
          />
        </div>
        <div className="set_field">
          <input
            type="checkbox"
            aria-label="Complete set"
            checked={completed}
            onChange={() => completeSet()}
          />
        </div>
      </div>
      :
      <div className="sets">
        <div className="set_field">{weight}</div>
        <div className="set_field">{reps}</div>
        <div className="set_field">
          <input
            type="checkbox"
            aria-label="Set completed"
            checked={completed}
            disabled
          />
        </div>
      </div>
  );
}