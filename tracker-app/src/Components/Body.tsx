import { useState, type Dispatch, type SetStateAction } from "react";
import type { exercise, session, sessionExercise, user } from "../Helpers/customTypes";

import ProgressGrid from "./ProgressGrid";
import ProgressGraph from "./ProgressGraph";
import DevRoom from "./DevRoom";
import Coaching from "./Coaching";
import SessionEle from "../Components/Elements/SessionEle";
import NewSessionForm from "./Forms/NewSessionForm";

import "../CSS/Body.css";
import "../CSS/form.css";
import { FaPlus, FaPen, FaXmark, FaChartLine, FaTableList } from "react-icons/fa6";

/*
  Body.tsx - main content area of the app.

  Renders whichever page is active:
    - "sessions": filtered/sorted list of SessionEle cards, with add (+) and edit-mode (pen/x) buttons
    - "progress": ProgressGrid or ProgressGraph, toggled with the header icons
    - "dev":      DevRoom
    - "coaching": Coaching

  Owns all header filter state (month, year, muscle group, date sort) and the
  open/closed state of the NewSessionForm overlay. dev/coaching pages have no header.

  Month filter values: 0 = all, 1-12 = Jan-Dec, 13 = Monthly, 14 = Yearly (13/14 progress page only).
  The year dropdown is hidden for Yearly (14) since it spans all years.
*/

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Props = {
  currentUser: user | null;
  sessionData: session[];
  setSessionData: Dispatch<SetStateAction<session[]>>;
  exercises: exercise[];
  sessionExercises: sessionExercise[];
  setSessionExercises: Dispatch<SetStateAction<sessionExercise[]>>;
  page: string;
};

export default function Body({
  currentUser, sessionData, setSessionData, exercises, sessionExercises, setSessionExercises, page,
}: Props) {
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);
  const [editSessions, setEditSessions] = useState(false);

  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(CURRENT_YEAR);
  const [groupFilter, setGroupFilter] = useState("All");
  const [dateSort, setDateSort] = useState(false); // true = ascending (Jan - Dec), false = descending (Dec - Jan)
  const [progressDisplay, setProgressDisplay] = useState<"grid" | "graph">("grid");

  const showHeader = page !== "dev" && page !== "coaching";

  function renderFilters() {
    const groups = [...new Set(exercises.map((ex) => ex.group))].filter((g) => g !== "Cardio");

    return (
      <div className="b_h_filters">
        {/* Date filter */}
        <div className="b_h_filter">
          <div className="b_h_f_text">Date Filter: </div>
          <div>
            <select value={monthFilter} onChange={(e) => setMonthFilter(Number(e.target.value))}>
              <option value={0}>All of</option>
              {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
              {page === "progress" && <option value={13}>Monthly</option>}
              {page === "progress" && <option value={14}>Yearly</option>}
            </select>

            {monthFilter !== 14 && (
              <select value={yearFilter} onChange={(e) => setYearFilter(Number(e.target.value))}>
                {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Sort order (sessions only) */}
        {page === "sessions" && (
          <div className="b_h_filter">
            <div className="b_h_f_text">Sort by: </div>
            <button className="filter_button" onClick={() => setDateSort(!dateSort)}>
              {dateSort ? "Ascending" : "Descending"}
            </button>
          </div>
        )}

        {/* Muscle group (progress grid only) */}
        {page === "progress" && progressDisplay === "grid" && (
          <div className="b_h_filter">
            <div>Group Filter: </div>
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
              <option value="All">All</option>
              {groups.map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>
        )}
      </div>
    );
  }

  function renderHeaderButtons() {
    if (page === "sessions") {
      return (
        <div className="b_h_buttons">
          <button onClick={() => setNewSessionFormOpen(true)}><FaPlus /></button>
          <button onClick={() => setEditSessions(!editSessions)}>
            {editSessions ? <FaXmark /> : <FaPen />}
          </button>
        </div>
      );
    }
    if (page === "progress") {
      return (
        <div className="b_h_buttons">
          <button onClick={() => setProgressDisplay("grid")}><FaTableList /></button>
          <button onClick={() => setProgressDisplay("graph")}><FaChartLine /></button>
        </div>
      );
    }
    return null;
  }

  function renderPageContent(currentUser: user) {
    switch (page) {
      case "sessions": {
        const direction = dateSort ? 1 : -1;
        const visibleSessions = sessionData
          .filter((s) => {
            const date = new Date(s.dateDone);
            const matchesMonth = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
            return matchesMonth && date.getFullYear() === yearFilter;
          })
          .sort((a, b) => direction * (new Date(a.dateDone).getTime() - new Date(b.dateDone).getTime()));
        return (
          <div className="sessions">
            {visibleSessions.map((session) => (
              <SessionEle
                key={session.sessionId}
                session={session}
                setSessionData={setSessionData}
                exercises={exercises}
                sessionExercises={sessionExercises}
                setSessionExercises={setSessionExercises}
                editSessions={editSessions}
              />
            ))}
          </div>
        );
      }
      case "progress":
        return progressDisplay === "grid" ? (
          <ProgressGrid
            exercises={exercises}
            sessionData={sessionData}
            sessionExercises={sessionExercises}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
            groupFilter={groupFilter}
          />
        ) : (
          <ProgressGraph
            exercises={exercises}
            sessionData={sessionData}
            sessionExercises={sessionExercises}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
          />
        );
      case "dev":
        return <DevRoom user={currentUser} exercises={exercises} />;
      case "coaching":
        return <Coaching user={currentUser} exercises={exercises} />;
      default:
        return null;
    }
  }

  return (
    <div className="Body">
      {showHeader && (
        <div className="b_header">
          {renderFilters()}
          {renderHeaderButtons()}
        </div>
      )}

      <div className="b_content">
        {currentUser && renderPageContent(currentUser)}

        {newSessionFormOpen && (
          <NewSessionForm
            userId={currentUser?.userId ?? ""}
            setNewSessionFormOpen={setNewSessionFormOpen}
            setSessionData={setSessionData}
          />
        )}
      </div>
    </div>
  );
}