import { useState, type Dispatch, type SetStateAction } from "react";

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
    if (!completed) {
      const tempArr = setArr 
      tempArr.push(`${weight}x${reps}`)
      await setSetArr(tempArr) 
      // console.log(setArr);
      
      setCompleted(true)      
    }
  }

  return (
    <div className="f_fc_Row">
      <input
          className="thin_input"
          type="number"
          placeholder="weight (kg)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
        />
      <input
        className="thin_input"
        type="number"
        placeholder="# of reps"
        value={reps}
        onChange={e => setReps(e.target.value)}
      />
      <input
        className="thin_input"
        type="checkbox"
        checked={completed}
        onChange={()=> completeSet()}
      />
    </div>
  );
}
