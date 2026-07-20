import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState, type Dispatch, type SetStateAction } from "react";
import ProgressGrid from "./ProgressGrid";

import "../CSS/Body.css"
import "../CSS/form.css"

import { FaPlus, FaPen, FaXmark } from "react-icons/fa6";
import DevRoom from "./DevRoom";

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
  const [editSessions, setEditSessions] = useState(false);

  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [groupFilter, setGroupFilter] = useState("Legs");

  return (<div className="Body">
    {page != "dev" && 
      <div className="b_header">
        <div>{contentFilter(page, exercises, setMonthFilter, monthFilter, setYearFilter, yearFilter, setGroupFilter, groupFilter)}</div>         
        {page == "sessions" &&
          <div className="b_h_buttons">
            <button onClick={() => setNewSessionFormOpen(true)}><FaPlus /></button>
            {editSessions ? 
              <button onClick={() => setEditSessions(false)}><FaXmark /></button>
              :
              <button onClick={() => setEditSessions(true)}><FaPen /></button>
            }          
          </div>
        }
      </div>    
    }



    <div className="b_content">
      {currentUser && 
        handleDisplay(page,currentUser,
          sessionData,setSessionData, sessionExercises,setSessionExercises,
          exercises,editSessions,monthFilter,yearFilter, groupFilter
        )  
      }
    
      {newSessionFormOpen && <NewSessionForm 
        userId={currentUser?.userId ?? ""} 
        setNewSessionFormOpen={setNewSessionFormOpen}
        setSessionData={setSessionData}
      />}
    </div>
  </div>)
}


function handleDisplay(
  page:string, currentUser: user, 
  sessionData: session[], setSessionData: Dispatch<SetStateAction<session[]>>,
  sessionExercises: sessionExercise[], setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>,
  exercises: exercise[], editSessions: boolean,
  monthFilter: number, yearFilter: number, groupFilter: string) {
  switch (page) {
    case "sessions":
      return(
        <div className="sessions">
          {sessionData.filter((session) => {
            const date = new Date(session.dateDone);
            const matchesMonth = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
            const matchesYear = date.getFullYear() === yearFilter;
            return matchesMonth && matchesYear;
          }).map((session) => (
            <SessionEle key={session.sessionId}
              session={session}
              setSessionData={setSessionData}
              exercises={exercises}
              sessionExercises={sessionExercises}
              setSessionExercises={setSessionExercises}
              editSessions={editSessions}
            />
          ))}           
        </div>      
      )
    case "progress":     
      return (
        <ProgressGrid
          exercises={exercises}
          sessionData={sessionData}
          sessionExercises={sessionExercises}
          monthFilter={monthFilter}
          yearFilter={yearFilter}
          groupFilter={groupFilter}
        />
      )
    case "dev":
      return <DevRoom user={currentUser} exercises={exercises}/>
    default:
      break;
  }
}

function contentFilter( page: string, exercises: exercise[], 
  setMonthFilter: Dispatch<SetStateAction<number>>,monthFilter: number, 
  setYearFilter: Dispatch<SetStateAction<number>>, yearFilter: number,
  setGroupFilter: Dispatch<SetStateAction<string>>, groupFilter: string,
  ) {
  const mGroupList: string[] = [...new Set(exercises.map(ex => ex.group))];
  return (
    <div className="b_h_filters">
      <div className="b_h_filter">
        <div>Date Filter: </div>
        <select onChange={(e)=> setMonthFilter(Number(e.target.value))} value={monthFilter}>
          {/* <option disabled selected hidden value={monthFilter}>{displayMonth(monthFilter)}</option> */}
          <option value={0}>All of</option>
          <option value={1}>Jan</option>
          <option value={2}>Feb</option>
          <option value={3}>Mar</option>
          <option value={4}>Apr</option>
          <option value={5}>May</option>
          <option value={6}>Jun</option>
          <option value={7}>Jul</option>
          <option value={8}>Aug</option>
          <option value={9}>Sep</option>
          <option value={10}>Oct</option>
          <option value={11}>Nov</option>
          <option value={12}>Dec</option>
          {page == "progress" && <option value={13}>Monthly</option>}
          {page == "progress" && <option value={14}>Yearly</option>}
        </select>
        {monthFilter != 14 &&
          <select onChange={(e)=> setYearFilter(Number(e.target.value))} value={yearFilter}>
            <option value={2026}>2026</option>className="b_h_date_filter"
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>  
        }        
      </div>
      {page == "progress" &&
        <div className="b_h_filter">
          <div>Group Filter: </div>
          <select onChange={(e) => setGroupFilter(e.target.value)}>
            <option hidden>{groupFilter}</option>
            <option value={"All"}>All</option>
            {mGroupList.map(group => {
              return <option value={group}>{group}</option>
            })}
          </select>
        </div>
      }
    </div>
  )
}


