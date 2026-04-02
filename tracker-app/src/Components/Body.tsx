import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState } from "react";
// import NewExerciseForm from "./Forms/NewExerciseForm";

import '../CSS/Body.css'

type Props = {
  currentUser: user | null;
  sessionData: session[];
  setSessionData: React.Dispatch<React.SetStateAction<session[]>>;
  exercises: exercise[];
  sessionExercises: sessionExercise[];
  setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>;
}

export default function Body({currentUser, sessionData, setSessionData, exercises, sessionExercises, setSessionExercises}: Props){
  // const [page, setPage] = useState("sessions");
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);

  // const [newExerciseFormOpen, setNewExerciseFormOpen] = useState(false);
  
  return(
    <div>
      {newSessionFormOpen && <NewSessionForm 
        userId={currentUser?.userId ?? ""} 
        setNewSessionFormOpen={setNewSessionFormOpen}
        setSessionData={setSessionData}
      />}
      
      <div>
        <div>
          <button onClick={() => setNewSessionFormOpen(true)}>new session</button>
        </div>

        <div className="sessions">
          {sessionData.map((session) => (
            <SessionEle key={session.sessionId}
              session = {session}
              setSessionData={setSessionData}
              exercises = {exercises}
              sessionExercises = {sessionExercises}
              setSessionExercises={setSessionExercises}
              userId={currentUser!.userId}
            />
          ))}
        </div>
      </div>      
    </div>
  )
}