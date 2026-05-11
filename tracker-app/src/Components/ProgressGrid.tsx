import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
// import '../CSS/Body.css'

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  monthFilter: number;
  yearFilter: number;
}

// type sessionCol = {"date": string, [exerciseId: string]: string | number}
type weightRowItm = {"date": string, "userWeight": number}

type strengthRep ={"date": string, "topRep": string}
type strengthRowItm = {"exerciseName": string, "TopReps":strengthRep[]}

export default function ProgressGrid({exercises, sessionData, sessionExercises, monthFilter, yearFilter}: Props){
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
      <div className="p_g_row">
        <div className="p_g_cell">{monthFilter == 13 ? "Year" : "Date"}</div>
        {monthFilter === 13 ?
          [...new Set(dateArr.map(date => new Date(date).getFullYear()))].map(year => (
              <div key={year} className="p_g_cell">{year}</div>
            ))
          : 
          dateArr.filter(thisDate => {
            const date = new Date(thisDate);
            const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
            const matchedYe = date.getFullYear() === yearFilter;
            return matchedMo && matchedYe;
          }).map(date => (
            <div key={date} className="p_g_cell">{date}</div>
          ))
        }
      </div>
      <div className="p_g_row">
        <div className="p_g_cell">Weight {monthFilter == 13 && "(avg)"}</div>
        {monthFilter === 13 ? 
          [...new Set(weightProgArr.map(w => new Date(w.date).getFullYear()))].map(year => {
            const yearWeights = weightProgArr.filter(w => new Date(w.date).getFullYear() === year);
            const avg = yearWeights.reduce((sum, w) => sum + w.userWeight, 0) / yearWeights.length;
            return <div key={year} className="p_g_cell">{avg.toFixed(1)}</div>
          })
          : 
          weightProgArr.filter(weight => {
            const date = new Date(weight.date);
            const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
            const matchedYe = date.getFullYear() === yearFilter;
            return matchedMo && matchedYe;
          }).map(weight => (
            <div key={weight.date} className="p_g_cell">{weight.userWeight}</div>
          ))
        }
      </div>

      {strengthProgArr.map((itm => (
        <div key={itm.exerciseName} className="p_g_row">
          <div className="p_g_cell">{itm.exerciseName}</div>
            {monthFilter === 13 ? 
              [...new Set(itm.TopReps.map(rep => new Date(rep.date).getFullYear()))].map(year => {
                const best = itm.TopReps
                  .filter(rep => new Date(rep.date).getFullYear() === year && rep.topRep !== "-")
                  .reduce((max, rep) => Number(rep.topRep) > Number(max) ? rep.topRep : max, "0");
                return <div key={year} className="p_g_cell">{best === "0" ? "-" : best}</div>
              })
              : 
              itm.TopReps.filter(rep => {
                const date = new Date(rep.date);
                const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
                const matchedYe = date.getFullYear() === yearFilter;
                return matchedMo && matchedYe;
              }).map(rep => (
                <div key={rep.date} className="p_g_cell">{rep.topRep}</div>
              ))
            }
          </div>
        )))
      }
    </div>
  )
}
