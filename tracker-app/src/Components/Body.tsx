import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState/*, type Dispatch, type SetStateAction*/ } from "react";
// import NewExerciseForm from "./Forms/NewExerciseForm";

import '../CSS/Body.css'
import ProgressGrid from "./ProgressGrid";

type Props = {
  currentUser: user | null;
  sessionData: session[];
  setSessionData: React.Dispatch<React.SetStateAction<session[]>>;
  exercises: exercise[];
  sessionExercises: sessionExercise[];
  setSessionExercises: React.Dispatch<React.SetStateAction<sessionExercise[]>>;
  page:string
}

export  default function Body({currentUser, sessionData, setSessionData, exercises, sessionExercises, setSessionExercises, page}: Props){
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);

  // const [sessionFilter, setSessionFilter] = useState("Monthly");
  // const [sessionMonthFilter, setSessionMonthFilter] = useState(Number);
  const [gridFilter, setGridFilter] = useState("month");

  // const [newExerciseFormOpen, setNewExerciseFormOpen] = useState(false);
  switch (page) {
    case "sessions":
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
              {/* <div>Filter: 
                <select onChange={(e) => handleMonthFilter(setSessionFilter, e.target.value, sessionData, setDisplayData, setSessionMonthFilter)}>
                  <option value="">All - Month</option>
                  <option value="All">All</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              {sessionFilter == "Monthly" &&
                <div>Select Month: 
                </div>
              }*/}
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
    case "progress":
      return (<div>
        <div>Filter: 
          <select onChange={(e) => setGridFilter(e.target.value)}>
            <option value="">Session, Month or Year?</option>
            <option value="Session">Session</option>
            <option value="Month">Month</option>
            <option value="Year">Year</option>
          </select>
        </div>
        <ProgressGrid exercises={exercises} sessionData={sessionData} sessionExercises={sessionExercises} gridFilter={gridFilter}/>
      </div>)
    default:
      break;
  }

}

// function handleMonthFilter(setSessionFilter: Dispatch<SetStateAction<string>>, input: string, sessionData: session[], setDisplayData: Dispatch<SetStateAction<session[]>>, setSessionMonthFilter: Dispatch<SetStateAction<number>>){
//   switch (input) {
//     case "Monthly":
//       setSessionFilter(input)
//       sessionData.forEach(session => {
//         const monthDone = session.dateDone.split("-")[1];
//       });
//       break;
//     default:
//       break;
//   }

// }