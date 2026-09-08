import { useState, useMemo } from "react";
import NewExerciseForm from "./Forms/NewExerciseForm";
import type { exercise, user } from "../Helpers/customTypes";

import { FaPlus, FaAddressBook, FaArrowDownAZ ,   } from "react-icons/fa6";
import { LuBicepsFlexed } from "react-icons/lu";

import "../CSS/dev.css"
import "../CSS/progress.css"
import DevExercise from "./Elements/DevExercise";

type Props = {
  user: user;
  exercises: exercise[];
}

const ALL = "all";

export default function DevRoom({user, exercises}: Props) {
  const [newExercise, setNewExercise] = useState(false);
  const [display, setDisplay] = useState("exercises");

  const [groupFilter, setGroupFilter] = useState(ALL);
  const [pushPullFilter, setPushPullFilter] = useState(ALL);
  const [sortAlpha, setSortAlpha] = useState(false);

  // Unique group values, derived from the data so the dropdown stays in sync
  const groupOptions = useMemo(() => {
    const groups = new Set(exercises.map((e) => e.group).filter(Boolean));
    return Array.from(groups).sort();
  }, [exercises]);

  const pushPullOptions = useMemo(() => {
    const values = new Set(exercises.map((e) => e.ppl).filter(Boolean));
    return Array.from(values).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    let result = exercises;

    if (groupFilter !== ALL) {
      result = result.filter((e) => e.group === groupFilter);
    }

    if (pushPullFilter !== ALL) {
      result = result.filter((e) => e.ppl === pushPullFilter);
    }

    if (sortAlpha) {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [exercises, groupFilter, pushPullFilter, sortAlpha]);

  return <div className="dev_cont">
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
          <div className="G_cell_big">
            Name
            <button
              className="wide_button"
              onClick={() => setSortAlpha((prev) => !prev)}
            >
              {sortAlpha ? <FaArrowDownAZ/> : "-"}
            </button>
          </div>
          <div className="G_cell">
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
              <option value={ALL}>All Groups</option>
              {groupOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>  
          </div>
          <div className="G_cell">Target Muscle</div>
          <div className="G_cell">
          <select value={pushPullFilter} onChange={(e) => setPushPullFilter(e.target.value)}>
            <option value={ALL}>All Push/Pull</option>
            {pushPullOptions.map((pp) => (
              <option key={pp} value={pp}>{pp}</option>
            ))}
          </select>
          </div>
          <div className="G_cell">Edit/Del</div>
        </div>
        {filteredExercises.map((exercise)=>(
          <DevExercise key={exercise.exerciseId} exercise={exercise}/>
        ))}
      </div>
    </div>}
    
    {display == "users" && <div>
      <button className="wide_button">Fetch Users</button>
    </div>}



    {newExercise && <NewExerciseForm user={user} setNewExercise={setNewExercise} exercises={exercises}/>}
  </div>
}