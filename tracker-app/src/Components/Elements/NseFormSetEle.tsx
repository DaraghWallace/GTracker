import { useState, type Dispatch, type SetStateAction } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa6";

import "../../CSS/form.css";

type Props = {
  index: number;
  setArr: string[];
  setSetArr: Dispatch<SetStateAction<string[]>>;
  group: string | undefined
}

/*
  NseSetFormEle
    One row of the "add sets" form for a new session exercise. Collects a
    weight/reps pair (or, for Cardio exercises, a time/distance/RPE set) and
    writes an encoded string into setArr at this row's index when locked.
    Locking is reversible: unlocking clears this row's slot in setArr (back
    to "") so an edited-but-not-relocked set can't sneak into submission,
    and the row becomes editable again.
*/

export default function NseSetFormEle({ index, setSetArr, group }: Props) {
  //Muscles
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  //Cardio
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [distance, setDistance] = useState("");
  const [rpe, setRPE] = useState("");

  const [locked, setLocked] = useState(false);

  const isCardio = group === "Cardio";

  function lockSet() {
    if (locked) return;

    if (isCardio) {
      const hasTime = hours !== "" || minutes !== "" || seconds !== "";
      if (!hasTime || distance === "") return;

      const h = hours || "0";
      const m = minutes || "0";
      const s = seconds || "0";
      const w = weight || "0";
      const r = rpe || "0";

      setSetArr(prev => {
        const updated = [...prev];
        updated[index] = `${h}:${m}:${s}x${distance}x${w}x${r}`;
        return updated;
      });
    } else {
      if (weight === "" || reps === "") return;

      setSetArr(prev => {
        const updated = [...prev];
        updated[index] = `${weight}x${reps}`;
        return updated;
      });
    }

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


  if (isCardio) {
    return(
      <div className="sets">
        <div className="set_field_wide"> {/* Time */}
          <input
            type="number"
            placeholder="00"
            aria-label="hours"
            value={hours}
            disabled={locked}
            onChange={e => setHours(e.target.value)}
          />:
          <input
            type="number"
            placeholder="00"
            aria-label="minutes"
            value={minutes}
            disabled={locked}
            onChange={e => setMinutes(e.target.value)}
            max={60}
          />
          :
          <input
            type="number"
            placeholder="00"
            aria-label="seconds"
            value={seconds}
            disabled={locked}
            onChange={e => setSeconds(e.target.value)}
            max={60}
          />
        </div>
        <div className="set_field"> {/* Distance */}
          <input
            type="number"
            placeholder="##.##"
            aria-label="distance"
            value={distance}
            disabled={locked}
            onChange={e => setDistance(e.target.value)}
          />Km
        </div>
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
        <div className="set_field"> {/* RPE */}
          <input
            type="number"
            placeholder="#"
            aria-label="rpe"
            value={rpe}
            disabled={locked}
            onChange={e => setRPE(e.target.value)}
            min={1}
            max={10}
          />
        </div>
        <div className="set_field"> {/* Lock it in */}
          {locked ?
            <button aria-label="Unlock set" onClick={unlockSet}><FaLock /></button>
            :
            <button aria-label="Lock in set" onClick={lockSet}><FaLockOpen /></button>
          }
        </div>
      </div>
    )
  } else{
    return (
      <div className="sets">
        <div className="set_field"> {/* Weight */}
          <input
            type="number"
            placeholder="Kgs"
            aria-label="Weight"
            value={weight}
            disabled={locked}
            onChange={e => setWeight(e.target.value)}
          />
        </div>
        <div className="set_field"> {/* Reps */}
          <input
            type="number"
            placeholder="#"
            aria-label="Reps"
            value={reps}
            disabled={locked}
            onChange={e => setReps(e.target.value)}
          />
        </div>
        <div className="set_field"> {/* Lock it in */}
          {locked ?
            <button aria-label="Unlock set" onClick={unlockSet}><FaLock /></button>
            :
            <button aria-label="Lock in set" onClick={lockSet}><FaLockOpen /></button>
          }
        </div>
      </div>
    );    
  }
}