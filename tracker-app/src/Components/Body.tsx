import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, set, user } from "../Helpers/customTypes";
import { useState } from "react";
import NewExerciseForm from "./Forms/NewExerciseForm";


type Props = {
  currentUser: user | null;
  sessionData: session[];
  exercises: exercise[];
  setData: set[];
  loadUserData: (userId: string) => Promise<void>;
}

export default function Body({currentUser, sessionData, exercises, setData, loadUserData}: Props){
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);
  const [newExerciseFormOpen, setNewExerciseFormOpen] = useState(false);
  
  return(
    <div>
      {newSessionFormOpen && <NewSessionForm userId={currentUser?.userId ?? ""} loadUserData={loadUserData} />}
      {newExerciseFormOpen && <NewExerciseForm userId={currentUser?.userId ?? ""} loadUserData={loadUserData}/>}
      
      <div>
        <button onClick={() => setNewSessionFormOpen(true)}>new session</button>
        <button onClick={() => setNewExerciseFormOpen(true)}>new exercise</button>
      </div>


      <div>
        <h2>Sessions</h2> 
        <button onClick={()=> console.log(sessionData)}>sessions?</button>
        {
          sessionData.map((session) => (
            <SessionEle key={session.sessionId}
              session = {session}
              exercises = {exercises}
              setData = {setData}
            />
          ))
        }
      </div>
    </div>
  )
}