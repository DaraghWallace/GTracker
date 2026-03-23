import { useState } from "react";
import type { exercise, session, set } from "../../Helpers/customTypes";
import NewSetForm from "../Forms/NewSetForm";

type Props = {
  session: session;  
  exercises: exercise[];  
  setData: set[];
  loadUserData: (userId: string) => Promise<void>;
  userId: string;
}

export default function SessionEle({session, exercises, setData, loadUserData, userId}: Props) {
  const [newSetFormOpen, setNewSetFormOpen] = useState(false);
  
  return (
    <div>
      <div>{session.focus}</div>
        {setData.filter(set => set.sessionId === session.sessionId).map(set => {
          const setEx = getExercise(set.exerciseId, exercises);
          return (
            <div key={set.setId}>
              <div>{setEx?.name}</div>
              <div>{set.weights_kgs}</div>
            </div>
          );
        })}
      
      <button onClick={()=> setNewSetFormOpen(true)}>New Set</button>
      {/* map of sets with matvhing session id */}
      <div>
        {
          newSetFormOpen && <NewSetForm 
            sessionId = {session?.sessionId} 
            exercises = {exercises}
            loadUserData = {loadUserData}
            userId = {userId}
          />
        }        
      </div>
    </div>
  )
}

function getExercise(exerciseId: string, exercises: exercise[]): exercise | undefined {
  return exercises.find(e => e.exerciseId === exerciseId);
}