import { useState } from "react";
import NewExerciseForm from "./Forms/NewExerciseForm";
import type { exercise, user } from "../Helpers/customTypes";

import { FaPlus, FaPen, FaTrash, FaAddressBook  } from "react-icons/fa6";
import { LuBicepsFlexed } from "react-icons/lu";

type Props = {
  user: user;
  exercises: exercise[];
}

export default function DevRoom({user, exercises}: Props) {
  const [newExercise, setNewExercise] = useState(false);
  const [display, setDisplay] = useState("exercises");
  

  return <div >
    {display != "exercises" && <div>
      <button onClick={() => setDisplay("exercises")}><LuBicepsFlexed/></button> 
    </div>}
    {display != "users" &&  <div>
      <button onClick={() => setDisplay("users")}><FaAddressBook/></button>
      <button onClick={() => setNewExercise(true)}><FaPlus /></button>     
    </div>}
    
    {display == "exercises" && <div>

      <div className="Grid_container">
        <div className="G_row">
          <div className="G_cell_big">Name</div>
          <div className="G_cell">Group</div>
          <div className="G_cell">Target Muscle</div>
          <div className="G_cell">Push/Pull</div>
          <div className="G_cell">Edit/Del</div>
        </div>
        {exercises.map((exercise)=>(
          <div className="G_row" key={exercise.exerciseId}>
            <div className="G_cell_big">{exercise.name}</div>
            <div className="G_cell">{exercise.group}</div>
            <div className="G_cell">{exercise.target}</div>
            <div className="G_cell">{exercise.ppl}</div>
            <div className="G_cell">
              <button><FaPen/></button>
              <button><FaTrash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>}
    
    {display == "users" && <div>
      <button className="wide_button">Fetch Users</button>
    </div>}



    {newExercise && <NewExerciseForm user={user} setNewExercise={setNewExercise}/>}
  </div>
}
