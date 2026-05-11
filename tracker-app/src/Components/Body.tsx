import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState, type Dispatch, type SetStateAction } from "react";
// import NewExerciseForm from "./Forms/NewExerciseForm";
import ProgressGrid from "./ProgressGrid";

import '../CSS/Body.css'

import { FaPlus, FaPen, FaXmark, FaMagnifyingGlass } from "react-icons/fa6";

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
  const [displaySessions, setDisplaySessions] = useState(sessionData);

  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);
  const [toggleEditing, setToggleEditing] = useState(false);

  const [monthFilter, setMonthFilter] = useState(0);
  // const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());


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
            {contentFilter(setDisplaySessions, sessionData, yearFilter, page, newSessionFormOpen, setNewSessionFormOpen, toggleEditing, setToggleEditing, setMonthFilter, monthFilter, setYearFilter)}            

            {displaySessions
              .filter((session) => {
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
                  userId={currentUser!.userId}
                  toggleEditing={toggleEditing}
                />
              ))
            }           
          </div>      
        </div>
      )
    case "progress":     
      return (
        <div>
          {contentFilter(setDisplaySessions, sessionData, yearFilter, page, newSessionFormOpen, setNewSessionFormOpen, toggleEditing, setToggleEditing, setMonthFilter,monthFilter, setYearFilter)}            
          <ProgressGrid 
            exercises = {exercises} 
            sessionData = {displaySessions} 
            sessionExercises = {sessionExercises}
            // monthFilter = {monthFilter}
            // yearFilter = {yearFilter}
          />
        </div>
      )
    default:
      break;
  }
}

function contentFilter(setDisplaySessions: Dispatch<SetStateAction<session[]>>, sessionData: session[], yearFilter:number, page: string,newSessionFormOpen: boolean, setNewSessionFormOpen: Dispatch<SetStateAction<boolean>>, toggleEditing: boolean, setToggleEditing: Dispatch<SetStateAction<boolean>>, setMonthFilter: Dispatch<SetStateAction<number>>,monthFilter: number, setYearFilter: Dispatch<SetStateAction<number>>) {
  return (
    <div>
      {!newSessionFormOpen && 
        <div className="s_header">
          {page == "sessions" &&
            <>
              <button onClick={() => setNewSessionFormOpen(true)}><FaPlus /></button>
              {toggleEditing ? 
                <button onClick={() => setToggleEditing(false)}><FaXmark /></button>
                :
                <button onClick={() => setToggleEditing(true)}><FaPen /></button>
              }          
            </>
          }

          <div>Filter: 
            <select onChange={(e)=> setMonthFilter(Number(e.target.value))}>
              <option>-</option>
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
              {page == "progress" && <option value={13}>Anual</option>}
            </select>
            <select onChange={(e)=> setYearFilter(Number(e.target.value))}>
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
            </select>            

            <button onClick={() => setDisplaySessions(handleFilterData(sessionData, monthFilter, yearFilter))}><FaMagnifyingGlass  /></button>
          </div>
        </div>
      }
    </div>
  )
}

function handleFilterData(sessionData: session[],monthFilter: number, yearFilter:number){
  const fSessionArr: session[] = []
  sessionData.forEach(session => {
    const sessionDateArr: string[] = session.dateDone.split("-")
    if (monthFilter != 13) {
      if (Number(sessionDateArr[1]) == monthFilter && Number(sessionDateArr[0]) == yearFilter) {
        fSessionArr.push(session)
      }      
    }else {
      console.log(sessionDateArr[0]);
      
    } 
  });
  return fSessionArr
}