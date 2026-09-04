import { useState, type Dispatch, type SetStateAction } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa6";

import "../../CSS/form.css";

type Props = {
  index: number;
  setArr: string[];
  setSetArr: Dispatch<SetStateAction<string[]>>;
}

/*
  NseSetFormEle
    One row of the "add sets" form for a new session exercise. Collects a
    weight/reps pair and writes "weightXreps" into setArr at this row's
    index when locked. Locking is reversible: unlocking clears this row's
    slot in setArr (back to "") so an edited-but-not-relocked set can't
    sneak into submission, and the row becomes editable again.
*/

export default function NseSetFormEle({ index, setSetArr }: Props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [locked, setLocked] = useState(false);

  function lockSet() {
    if (weight === "" || reps === "") return;
    if (locked) return;

    setSetArr(prev => {
      const updated = [...prev];
      updated[index] = `${weight}x${reps}`;
      return updated;
    });
    setLocked(true);
  }

  function unlockSet() {
    if (!locked) return;

    setSetArr(prev => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });
    setLocked(false);
  }

  return (
    <div className="sets">
      <div className="set_field">
        <input
          type="number"
          placeholder="Kgs"
          aria-label="Weight"
          value={weight}
          disabled={locked}
          onChange={e => setWeight(e.target.value)}
        />
      </div>
      <div className="set_field">
        <input
          type="number"
          placeholder="#"
          aria-label="Reps"
          value={reps}
          disabled={locked}
          onChange={e => setReps(e.target.value)}
        />
      </div>
      <div className="set_field">
        {locked ?
          <button aria-label="Unlock set" onClick={unlockSet}><FaLock /></button>
          :
          <button aria-label="Lock in set" onClick={lockSet}><FaLockOpen /></button>
        }
      </div>
    </div>
  );
}