import NewSessionForm from "./Forms/NewSessionForm"
import SessionEle from "../Components/Elements/SessionEle"
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";
import { useState, type Dispatch, type SetStateAction } from "react";
import ProgressGrid from "./ProgressGrid";
import ProgressGraph from "./ProgressGraph";

import "../CSS/Body.css"
import "../CSS/form.css"

import { FaPlus, FaPen, FaXmark, FaChartLine, FaTableList } from "react-icons/fa6";
import DevRoom from "./DevRoom";

// TODO: ideally export this from customTypes.ts and share it with
// App.tsx/Header.tsx instead of redefining a near-identical union here.

// Month select also offers two aggregate views on the progress page.
const MONTH_FILTER_MONTHLY = 13;
const MONTH_FILTER_YEARLY = 14;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

type Props = {
  currentUser: user | null;
  sessionData: session[];
  setSessionData: Dispatch<SetStateAction<session[]>>;
  exercises: exercise[];
  sessionExercises: sessionExercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  page: string;
}

type DisplayArgs = {
  page: string;
  currentUser: user;
  sessionData: session[];
  setSessionData: Dispatch<SetStateAction<session[]>>;
  sessionExercises: sessionExercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  exercises: exercise[];
  editSessions: boolean;
  monthFilter: number;
  yearFilter: number;
  groupFilter: string;
  dateSort: boolean;
  progressDisplay: string;
}

type FilterArgs = {
  page: string;
  exercises: exercise[];
  setMonthFilter: Dispatch<SetStateAction<number>>;
  monthFilter: number;
  setYearFilter: Dispatch<SetStateAction<number>>;
  yearFilter: number;
  setGroupFilter: Dispatch<SetStateAction<string>>;
  groupFilter: string;
  setDateSort: Dispatch<SetStateAction<boolean>>;
  dateSort: boolean;
  progressDisplay: string;
}

/*
  Body
    Renders the active page - sessions list, progress grid/graph, or dev room -
    plus the header filter controls and the new-session form overlay.
*/
export default function Body({ currentUser, sessionData, setSessionData, exercises, sessionExercises, setSessionExercises, page }: Props) {
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);
  const [editSessions, setEditSessions] = useState(false);

  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(CURRENT_YEAR);
  const [groupFilter, setGroupFilter] = useState("All");
  const [dateSort, setDateSort] = useState(false); // true = ascending (Jan - Dec) || false = descending (Dec - Jan)

  const [progressDisplay, setProgressDisplay] = useState<string>("grid");

  return (<div className="Body">
    {page !== "dev" &&
      <div className="b_header">
        {renderFilters({
          page, exercises, setMonthFilter, monthFilter, setYearFilter, yearFilter,
          setGroupFilter, groupFilter, setDateSort, dateSort, progressDisplay
        })}
        {page === "sessions" &&
          <div className="b_h_buttons">
            <button onClick={() => setNewSessionFormOpen(true)}><FaPlus /></button>
            {editSessions ?
              <button onClick={() => setEditSessions(false)}><FaXmark /></button>
              :
              <button onClick={() => setEditSessions(true)}><FaPen /></button>
            }
          </div>
        }
        {page === "progress" &&
          <div className="b_h_buttons">
            <button onClick={() => setProgressDisplay("grid")}><FaTableList /></button>
            <button onClick={() => setProgressDisplay("graph")}><FaChartLine /></button>
          </div>
        }
      </div>
    }

    <div className="b_content">
      {currentUser &&
        renderPageContent({
          page, currentUser, sessionData, setSessionData, sessionExercises, setSessionExercises,
          exercises, editSessions, monthFilter, yearFilter, groupFilter, dateSort, progressDisplay
        })
      }

      {newSessionFormOpen && <NewSessionForm
        userId={currentUser?.userId ?? ""}
        setNewSessionFormOpen={setNewSessionFormOpen}
        setSessionData={setSessionData}
      />}
    </div>
  </div>)
}

function renderPageContent({
  page, currentUser, sessionData, setSessionData, sessionExercises, setSessionExercises,
  exercises, editSessions, monthFilter, yearFilter, groupFilter, dateSort, progressDisplay
}: DisplayArgs) {

  const sorted = [...sessionData].sort((a, b) =>
    dateSort
      ? new Date(a.dateDone).getTime() - new Date(b.dateDone).getTime()
      : new Date(b.dateDone).getTime() - new Date(a.dateDone).getTime()
  )

  switch (page) {
    case "sessions":
      return (
        <div className="sessions">
          {sorted.filter((session) => {
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
      if (progressDisplay === "grid") {
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
      }
      return (
        <ProgressGraph
          exercises={exercises}
          sessionData={sessionData}
          sessionExercises={sessionExercises}
          monthFilter={monthFilter}
          yearFilter={yearFilter}
        />
      )
    case "dev":
      return <DevRoom user={currentUser} exercises={exercises} />
    default:
      return null;
  }
}

function renderFilters({
  page, exercises, setMonthFilter, monthFilter, setYearFilter, yearFilter,
  setGroupFilter, groupFilter, setDateSort, dateSort, progressDisplay
}: FilterArgs) {
  const mGroupList: string[] = [...new Set(exercises.map(ex => ex.group))];

  return (
    <div className="b_h_filters">
      <div className="b_h_filter"> {/* Date Filter */}
        <div>Date Filter: </div>
        <select onChange={(e) => setMonthFilter(Number(e.target.value))} value={monthFilter}>
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
          {page === "progress" && <option value={MONTH_FILTER_MONTHLY}>Monthly</option>}
          {page === "progress" && <option value={MONTH_FILTER_YEARLY}>Yearly</option>}
        </select>
        {monthFilter !== MONTH_FILTER_YEARLY &&
          <select onChange={(e) => setYearFilter(Number(e.target.value))} value={yearFilter}>
            {YEAR_OPTIONS.map(year => <option value={year} key={year}>{year}</option>)}
          </select>
        }
      </div>
      {page === "sessions" &&
        <div className="b_h_filter">  {/* Sort by date */}
          <button className="filter_button" onClick={() => setDateSort(!dateSort)}>
            {!dateSort ? "Dec to Jan" : "Jan to Dec"}
          </button>
        </div>
      }
      {(page === "progress" && progressDisplay === "grid") &&
        <div className="b_h_filter">  {/* Group Filter */}
          <div>Group Filter: </div>
          <select onChange={(e) => setGroupFilter(e.target.value)} value={groupFilter}>
            <option value="All">All</option>
            {mGroupList.map(group => <option value={group} key={group}>{group}</option>)}
          </select>
        </div>
      }
    </div>
  )
}