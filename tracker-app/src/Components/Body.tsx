import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState, type Dispatch, type SetStateAction} from "react";
// import NewExerciseForm from "./Forms/NewExerciseForm";
import ProgressGrid from "./ProgressGrid";

import '../CSS/Body.css'

import { FaPlus, FaPen, FaXmark } from "react-icons/fa6";

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
  const [toggleEditing, setToggleEditing] = useState(false);

  const [sessionFilter, setSessionFilter] = useState("All");
  const [sessionFilterArr, setSessionFilterArr] = useState<string[]>([]);
  const [sessionSubFilter, setSessionSubFilter] = useState("");
  const [gridFilter, setGridFilter] = useState("month");

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
            {!newSessionFormOpen && 
              <div className="s_header">
                <button onClick={() => setNewSessionFormOpen(true)}><FaPlus /></button>
                {toggleEditing ? 
                  <button onClick={() => setToggleEditing(false)}><FaXmark /></button>
                  :
                  <button onClick={() => setToggleEditing(true)}><FaPen /></button>
                }
                <div>Filter: 
                  <select onChange={(e) => handleSessionFilter(e.target.value, setSessionFilter, setSessionFilterArr, setSessionSubFilter, sessionData)}>
                    <option value="All">All</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                  {sessionFilter == "Month" &&
                    <select onChange={(e) => setSessionSubFilter(e.target.value)}>
                      { sessionFilterArr.map((subFilter)=> {
                        return <option key={subFilter} value={subFilter}>{subFilter}</option>;
                      })}
                    </select>
                  }{sessionFilter == "Year" &&
                    <select onChange={(e) => setSessionSubFilter(e.target.value)}>
                      { sessionFilterArr.map((subFilter)=> {
                        return <option key={subFilter} value={subFilter}>{subFilter}</option>;
                      })}
                    </select>
                  }
                </div>

              </div>
            }
            
            <div className="sessions">
              {(sessionFilter !== "All" && sessionSubFilter
                ? sessionData.filter((session) => handleFilter(session.dateDone, sessionFilter, sessionSubFilter))
                : sessionData
              ).map((session) => (
                <SessionEle key={session.sessionId}
                  session={session}
                  setSessionData={setSessionData}
                  exercises={exercises}
                  sessionExercises={sessionExercises}
                  setSessionExercises={setSessionExercises}
                  userId={currentUser!.userId}
                  toggleEditing={toggleEditing}
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

async function handleSessionFilter(
  eValue: string,
  setSessionFilter: Dispatch<SetStateAction<string>>,
  setSessionFilterArr: Dispatch<SetStateAction<string[]>>,
  setSessionSubFilter: Dispatch<SetStateAction<string>>,
  sessions: session[]
) {
  setSessionFilter(eValue);
  setSessionSubFilter(""); // reset stale subfilter
  switch (eValue) {
    case "Month":
      setSessionFilterArr(await getMonthsFromSessions(sessions));
      break;
    case "Year":
      setSessionFilterArr(await getYearsFromSessions(sessions));
      break;
    default:
      break;
  }
}

async function getMonthsFromSessions(sessions: session[]): Promise<string[]> {
  const selection = new Set<string>();

  sessions.forEach((session) => {
    const sessionDate = session.dateDone.split("-");
    selection.add(sessionDate[1] + "-" + sessionDate[0]);
  });
  
  return Array.from(selection);
}

async function getYearsFromSessions(sessions: session[]): Promise<string[]> {
  const selection = new Set<string>();

  sessions.forEach((session) => {
    const sessionDate = session.dateDone.split("-");
    selection.add(sessionDate[0]);
  });
  
  return Array.from(selection);
}

function handleFilter(dateDone: string, filter: string, sessionSubFilter: string): boolean {
  const dateArr = dateDone.split("-");
  if (filter === "Year") return dateArr[0] === sessionSubFilter;
  if (filter === "Month") return `${dateArr[1]}-${dateArr[0]}` === sessionSubFilter;
  return true;
}