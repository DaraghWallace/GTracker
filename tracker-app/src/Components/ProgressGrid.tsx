import type { exercise, session, sessionExercise } from "../Helpers/customTypes";

import '../CSS/Body.css'

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
}

type sessionCol = {"date": string, [exerciseId: string]: string | number}

function organiseProgress(sessionData: session[], sessionExercises: sessionExercise[]): sessionCol[] {
  const sessionColArr: sessionCol[] = []
  sessionData.forEach(session => {
    const sessionCol: sessionCol = {"date": session.dateDone}
    sessionExercises.forEach(sessionExercise => {
      if (sessionExercise.sessionId === session.sessionId){
        const setsArr = sessionExercise.sets.split(",").map(set => Number(set.split("x")[0]));
        const topSet = Math.max(...setsArr)
        sessionCol[sessionExercise.exerciseId] = topSet;
      }else{
        sessionCol[sessionExercise.exerciseId] = "-";
      }
    });    

    sessionColArr.push(sessionCol);

    
  });

  return sessionColArr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function ProgressGrid({exercises, sessionData, sessionExercises}: Props){
  const displayArr = organiseProgress(sessionData, sessionExercises);
  console.log(displayArr);
  
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