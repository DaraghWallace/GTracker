import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise } from "../../Helpers/customTypes";

import { FaPen, FaTrash, FaXmark, FaCheck } from "react-icons/fa6";
import { deleteExercise, updateExercise } from "../../Helpers/APIfunctions";
// import Loading from "./Loading";

type Props = {
  exercise: exercise;
}

export default function DevExercise({exercise}: Props){
  // const [awaiting, setAwaiting] = useState(false);
  const [editExercise, setEditExercise] = useState(false);
  const [deleteExercise, setDeleteExercise] = useState(false);

  const [ exName, setExName] = useState(exercise.name);
  const [ exGroup, setExGroup] = useState(exercise.group);
  const [ exTarget, setExTarget] = useState(exercise.target);
  const [ exPpl, setExPpl] = useState(exercise.ppl);

  
  return (
    <div className="G_row" >
      { editExercise ? 
        <div className="G_cell_big">
          <input type="text" placeholder={exercise.name}
            onChange={(e) => setExName(e.target.value)}
          />
        </div> : 
        <div className="G_cell_big">{exercise.name}</div>
      }
      
      { editExercise ? 
        <div className="G_cell">
          <select defaultValue={exercise.group} onChange={(e) => setExGroup(e.target.value)}>
            <option>Arms</option>
            <option>Shoulders</option>
            <option>Back</option>
            <option>Chest</option>
            <option>Core</option>
            <option>Legs</option>
            {/* <option>Cardio</option> */}
          </select>
        </div> :  
        <div className="G_cell">{exercise.group}</div>
      }

      
      { editExercise ? 
        <div className="G_cell">
          <input type="text" placeholder={exercise.target}
            onChange={(e) => setExTarget(e.target.value)}
          />
        </div> :  
        <div className="G_cell">{exercise.target}</div>
      }
      
      { editExercise ? 
        <div className="G_cell">
          <select defaultValue={exercise.group} onChange={(e) => setExPpl(e.target.value)}>
            <option>Push</option>
            <option>Pull</option>
            <option>Hold</option>
          </select>
        </div> : 
        <div className="G_cell">{exercise.ppl}</div>
      }
      
      <div className="G_cell">
          {deleteExercise?
            <button onClick={()=> handleDelete(exercise.exerciseId, setEditExercise)}><FaCheck/></button>:
            <button onClick={()=> setEditExercise(!editExercise)}>{editExercise? <FaXmark/> : <FaPen/>}</button>
          }
          
          {editExercise?
            <button onClick={()=>handleSubmit({
              exerciseId: exercise.exerciseId, // PK - uuid
              name: exName,
              group: exGroup,
              target: exTarget,
              ppl: exPpl,
              author: exercise.author,
              }, setEditExercise )}>
                <FaCheck/>
            </button> :
            
            <button  onClick={()=> setDeleteExercise(!deleteExercise)}>
              {deleteExercise? <FaXmark/> : <FaTrash/>}
            </button>
          }
      </div>

      {/* {awaiting && <Loading message= {`Actioning ${exName}`}/>} */}
    </div>
  )
}

function handleSubmit(newExercise:exercise, setEditExercise: Dispatch<SetStateAction<boolean>>) {
  // setAwaiting(true)
  try {
    updateExercise(newExercise)
    // setSessionExercises(prev => prev.map(s =>
    //   s.sessionExerciseId === newSessionExercise.sessionExerciseId ? newSessionExercise : s
    // ))
  } catch (error) {
    console.error(`Failed to update exercise ${newExercise.exerciseId}:`, error);
  } finally {
    setEditExercise(false)
  }
}

function handleDelete(exerciseId:string, setEditExercise: Dispatch<SetStateAction<boolean>>) {
  // setAwaiting(true)
  try {
    deleteExercise(exerciseId)
  } catch (error) {
    console.error(`Failed to Delete exercise ${exerciseId}:`, error);
  }finally {
    setEditExercise(false)
    // setAwaiting(false)
  }
}