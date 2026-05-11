import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import { v4 as uuidv4 } from "uuid";
// import '../CSS/Body.css'

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  // monthFilter: number;
  // yearFilter: number;
}

// type sessionCol = {"date": string, [exerciseId: string]: string | number}
type weightRowItm = {"date": string, "userWeight": number}

type strengthRep ={"date": string, "topRep": string}
type strengthRowItm = {"exerciseName": string, "TopReps":strengthRep[]}

export default function ProgressGrid({exercises, sessionData, sessionExercises, /*monthFilter, yearFilter*/}: Props){
  // wtRow: [{dateDone, userWeight}, {dateDone, userWeight},{dateDone, userWeight}, {etc}]
  const dateArr: string[] = []
  const weightProgArr: weightRowItm[] = []
  sessionData.forEach(session => {
    dateArr.push(session.dateDone)
    weightProgArr.push({"date": session.dateDone, "userWeight": session.userWeight})
  });

  // strRow: {exerciseName, [{dateDone, topRep}, {dateDone, topRep}, {dateDone, topRep}, {etc}]}
  const strengthProgArr: strengthRowItm[] = []
  exercises.forEach(exercise => {
    const strengthRepArr: strengthRep[] = []
    sessionData.forEach(session => {
      const sessionExercise = sessionExercises.find(
        se => se.sessionId === session.sessionId && se.exerciseId === exercise.exerciseId
      )

      if (sessionExercise) {
        strengthRepArr.push({
          date: session.dateDone,
          topRep: String(Math.max(...sessionExercise.sets.split(',').map(set => Number(set.split('x')[0]))))
        })
      }else strengthRepArr.push({date: session.dateDone, topRep: "-"})
    });

    strengthProgArr.push({ exerciseName: exercise.name, TopReps: strengthRepArr })
  });

  return(
    <div className="progression_grid">
      <div>
        <button onClick={()=>console.log(sessionData)}>all</button>
        <button onClick={()=>console.log(dateArr)}>dt</button>
        <button onClick={()=>console.log(weightProgArr)}>wt</button>
        <button onClick={()=>console.log(strengthProgArr)}>str</button>
      </div>
      <div className="p_g_row">
        <div className="p_g_cell">Date</div>
        {dateArr./*filter((thisDate)=>{
          const date = new Date(thisDate)
          const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter
          const matchedYe = date.getFullYear() === yearFilter;
          return matchedMo && matchedYe
        }).*/map((date => ( 
          // monthFilter != 13 ?
            <div key={date} className="p_g_cell">{date}</div> //:
            // <div>no day</div>
        )))}        
      </div>

      <div className="p_g_row">
        <div className="p_g_cell">Weight</div>
        {weightProgArr/*.filter((weight)=>{
          const date = new Date(weight.date)
          const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter
          const matchedYe = date.getFullYear() === yearFilter;
          return matchedMo && matchedYe
        })*/.map((weight => (<div key={uuidv4()} className="p_g_cell">{weight.userWeight}</div>)))}        
      </div>

      {strengthProgArr.map((itm => (
        <div className="p_g_row">
          <div className="p_g_cell">{itm.exerciseName}</div>
          {itm.TopReps/*.filter((TpRp)=>{
            const date = new Date(TpRp.date)
            const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter
            const matchedYe = date.getFullYear() === yearFilter;
            return matchedMo && matchedYe
          })*/.map((rep => (
            <div className="p_g_row">
              <div key={uuidv4()} className="p_g_cell">{rep.topRep}</div>
            </div>
          )))}
        </div>
      )))}
      
    </div>
  )
}
