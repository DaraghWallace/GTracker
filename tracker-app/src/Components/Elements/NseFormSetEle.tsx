import { useState, type Dispatch, type SetStateAction } from "react";

import "../../CSS/form.css";

type Props = {
  index: number
  setArr: string[];
  setSetArr: Dispatch<SetStateAction<string[]>>;
}

export default function NseSetFormEle({setArr, setSetArr}: Props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [completed, setCompleted] = useState(false);


  async function completeSet() {
    if (weight == "") return
    if (reps == "") return
    if (!completed) {
      const tempArr = setArr 
      tempArr.push(`${weight}x${reps}`)
      await setSetArr(tempArr) 
      // console.log(setArr);
      
      setCompleted(true)      
    }
  }

  return (
    <div className="sets">
      <input className="set_field"
          type="number"
          placeholder="Kgs"
          value={weight}
          onChange={e => setWeight(e.target.value)}
        />
      <input className="set_field"
        type="number"
        placeholder="#"
        value={reps}
        onChange={e => setReps(e.target.value)}
      />
      <input className="set_field"
        type="checkbox"
        checked={completed}
        onChange={()=> completeSet()}
      />
    </div>
  );
}
