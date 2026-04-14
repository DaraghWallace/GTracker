import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import { useMemo } from "react";

import '../CSS/Body.css'

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  gridFilter: string
}

type sessionCol = {"date": string, [exerciseId: string]: string | number}


export default function ProgressGrid({exercises, sessionData, sessionExercises, gridFilter}: Props){
  const displayArr = useMemo(() => {
    switch (gridFilter) {
      case 'Session':
        return organiseProgressByDay(sessionData, sessionExercises);
      case 'Month':
        return organiseProgressByMonth(sessionData, sessionExercises);
      case 'Year':
        return organiseProgressByYear(sessionData, sessionExercises);
      default:
        return [];
    }
  }, [gridFilter, sessionData, sessionExercises]);
  // console.log(displayArr);
  
  return (
    <div className="progression_grid">
      <div className="p_g_EX_col">
        <div  className="p_g_cell">Exercises</div>
        {exercises.map((exercise) => (
          <div className="p_g_cell" key={exercise.exerciseId}>{exercise.name}</div>
        ))}
      </div>
      <div className="p_g_row">
        {displayArr.map((column) => (
          <div className="p_g_col" key={column.date}>
            <div  className="p_g_cell">{column.date}</div>
            {Object.entries(column)
              .filter(([key]) => key !== "date" && key !== "sessionId")
              .map(([key, value]) => (
                <div className="p_g_cell" key={key}>{value}</div>
              ))}
          </div>
        ))}        
      </div>
    </div>
  );
}

function organiseProgressByDay(sessionData: session[], sessionExercises: sessionExercise[]): sessionCol[] {
  const sessionColArr: sessionCol[] = []
  sessionData.forEach(session => {
    const sessionCol: sessionCol = {"date": session.dateDone}
    sessionExercises.forEach(sessionExercise => {
      if (sessionExercise.sessionId === session.sessionId){
        const setsArr = sessionExercise.sets.split(",").map(set => Number(set.split("x")[0]));
        const topSet = Math.max(...setsArr)
        sessionCol[sessionExercise.exerciseId] = topSet;
      } else if (!(sessionExercise.exerciseId in sessionCol)) {
        sessionCol[sessionExercise.exerciseId] = "-";
      }
    });    

    sessionColArr.push(sessionCol);
  });

  return sessionColArr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function organiseProgressByMonth(sessionData: session[], sessionExercises: sessionExercise[]): sessionCol[] {
  const byDay: sessionCol[] = organiseProgressByDay(sessionData, sessionExercises);
  const monthMap: Record<string, sessionCol> = {};

  byDay.forEach(dayCol => {
    const month = dayCol.date.slice(0, 7); // "2026-01"

    if (!monthMap[month]) {
      monthMap[month] = { date: month };
    }

    Object.entries(dayCol).forEach(([key, value]) => {
      if (key === "date") return;

      const existing = monthMap[month][key];
      if (value === "-") {
        if (!(key in monthMap[month])) monthMap[month][key] = "-";
      } else {
        const num = Number(value);
        if (existing === undefined || existing === "-") {
          monthMap[month][key] = num;
        } else {
          monthMap[month][key] = Math.max(Number(existing), num);
        }
      }
    });
  });

  return Object.values(monthMap).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function organiseProgressByYear(sessionData: session[], sessionExercises: sessionExercise[]): sessionCol[] {
  const byDay: sessionCol[] = organiseProgressByDay(sessionData, sessionExercises);
  // console.log(sessionColArr);
  const yearMap: Record<string, sessionCol> = {};

  byDay.forEach(dayCol => {
    const year = dayCol.date.slice(0, 4); // "2026"

    if (!yearMap[year]) {
      yearMap[year] = { date: year };
    }

    Object.entries(dayCol).forEach(([key, value]) => {
      if (key === "date") return;

      const existing = yearMap[year][key];
      if (value === "-") {
        if (!(key in yearMap[year])) yearMap[year][key] = "-";
      } else {
        const num = Number(value);
        if (existing === undefined || existing === "-") {
          yearMap[year][key] = num;
        } else {
          yearMap[year][key] = Math.max(Number(existing), num);
        }
      }
    });
  });

  return Object.values(yearMap).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}