import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState } from "react";
// import NewExerciseForm from "./Forms/NewExerciseForm";

import '../CSS/Body.css'

type Props = {
  currentUser: user | null;
  sessionData: session[];
  exercises: exercise[];
  sessionExercises: sessionExercise[];
  loadUserData: (userId: string) => Promise<void>;
}

export default function Body({currentUser, sessionData, exercises, sessionExercises, loadUserData}: Props){
  // const [page, setPage] = useState("sessions");
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);
  // const [newExerciseFormOpen, setNewExerciseFormOpen] = useState(false);
  
  return(
    <div>
      {newSessionFormOpen && <NewSessionForm 
        userId={currentUser?.userId ?? ""} 
        loadUserData={loadUserData} 
        setNewSessionFormOpen={setNewSessionFormOpen}
      />}
      {/* {newExerciseFormOpen && <NewExerciseForm userId={currentUser?.userId ?? ""} loadUserData={loadUserData}/>} */}
      {/* <div>
        <button onClick={() => setPage("sessions")}>Gym Sessions</button>
        <button onClick={() => setPage("progress")}>My Progress</button>
      </div> */}
      


      {/* {page == "sessions" &&  */}
        <div>
          {/* <h2>Sessions</h2>  */}
          <div>
            <button onClick={() => setNewSessionFormOpen(true)}>new session</button>
            {/* <button onClick={() => setNewExerciseFormOpen(true)}>new Exercise</button> */}
            {/* <button onClick={()=> console.log(sessionData)}>sessions?</button> */}
          </div>

          <div className="sessions">
            {
              sessionData.map((session) => (
                <SessionEle key={session.sessionId}
                  session = {session}
                  exercises = {exercises}
                  sessionExercises = {sessionExercises}
                  loadUserData={loadUserData}
                  userId={currentUser!.userId}
                />
              ))
            }
          </div>

        </div>      
      {/* }{page == "progress" && 
        <div>
          <h2>Progress</h2> 
          <div>

          </div>
        </div>      
      } */}

    </div>
  )
}