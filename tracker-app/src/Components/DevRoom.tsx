import { useState } from "react";
import NewExerciseForm from "./Forms/NewExerciseForm";
import type { exercise } from "../Helpers/customTypes";

import { FaPlus, FaPen, FaTrash } from "react-icons/fa6";

type Props = {
  exercises: exercise[];
}

export default function DevRoom({exercises}: Props) {
  const [newExercise, setNewExercise] = useState(false);
  const [display, setDisplay] = useState("exercises");
  

  return <div >
    {display != "exercises" && <button onClick={() => setDisplay("exercises")}>Ex</button>}
    {display != "users" && <button onClick={() => setDisplay("users")}>U</button>}
    
    {display == "exercises" && <div>
      <button onClick={() => setNewExercise(true)}><FaPlus /></button>
      <div className="progression_grid">
        {exercises.map((exercise)=>(
          <div className="p_g_row" key={exercise.exerciseId}>
            <div className="p_g_cell">{exercise.name}</div>
            <div className="p_g_cell">{exercise.group}</div>
            <div className="p_g_cell">{exercise.target}</div>
            <div className="p_g_cell">{exercise.ppl}</div>
            <div className="p_g_cell">
              <button><FaPen/></button>
              <button><FaTrash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>}
    
    {display == "users" && <div>
      <button className="wide_button">Users?</button>
    </div>}



    {newExercise && <NewExerciseForm exercises={exercises} setNewExercise={setNewExercise}/>}
  </div>
}
