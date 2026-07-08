import { useState } from "react";
import NewExerciseForm from "./Forms/NewExerciseForm";
import type { exercise, user } from "../Helpers/customTypes";

import { FaPlus, FaPen, FaTrash } from "react-icons/fa6";

type Props = {
  user: user;
  exercises: exercise[];
}

export default function DevRoom({user, exercises}: Props) {
  const [newExercise, setNewExercise] = useState(false);
  const [display, setDisplay] = useState("exercises");
  

  return <div >
    {display != "exercises" && <button onClick={() => setDisplay("exercises")}>Ex</button>}
    {display != "users" && <button onClick={() => setDisplay("users")}>U</button>}
    
    {display == "exercises" && <div>
      <button onClick={() => setNewExercise(true)}><FaPlus /></button> 
      <div className="Grid_container">
        {exercises.map((exercise)=>(
          <div className="G_row" key={exercise.exerciseId}>
            <div className="G_cell_big">{exercise.name}</div>
            <div className="G_cell">{exercise.group}</div>
            <div className="G_cell">{exercise.target}</div>
            <div className="G_cell_small">{exercise.ppl}</div>
            <div className="G_cell_small">
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



    {newExercise && <NewExerciseForm user={user} setNewExercise={setNewExercise}/>}
  </div>
}
