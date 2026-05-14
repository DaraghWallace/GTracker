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
      {dateRowDisplay(monthFilter, yearFilter, dateArr)}
      {weightRowDisplay(monthFilter, yearFilter, weightProgArr)}



      {/* {strengthProgArr.map((itm => (
        <div key={itm.exerciseName} className="p_g_row">
          <div className="p_g_cell" onClick={()=> console.log(itm)}>{itm.exerciseName}</div>
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
      } */}
    </div>
  )
}

// type sessionCol = {"date": string, [exerciseId: string]: string | number}
function dateRowDisplay(monthFilter:number, yearFilter:number, dateArr: string[]) {
  switch (monthFilter) {
    case 13:
      return <div className="p_g_row">
        <div className="p_g_cell">Month</div>
        {[...new Set(dateArr
            .filter(d => new Date(d).getFullYear() === yearFilter)
            .map(d => new Date(d).getMonth() + 1)
          )].sort((a, b) => a - b).map(month => (
            <div key={month} className="p_g_cell">
              {new Date(yearFilter, month - 1).toLocaleString('default', { month: 'short' })}
            </div>
          ))
        }
      </div>
    case 14:
      return <div className="p_g_row">
        <div className="p_g_cell">Year</div>
        {[...new Set(dateArr.map((date) => new Date(date).getFullYear()))]
        .sort((a, b) => a - b).map(year => (
          <div key={year} className="p_g_cell">{year}</div>
        ))
        }
      </div>
    default:
      return <div className="p_g_row">
        <div className="p_g_cell">Date</div>
        {dateArr.filter(thisDate => {
            const date = new Date(thisDate);
            const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
            const matchedYe = date.getFullYear() === yearFilter;
            return matchedMo && matchedYe;
          }).map(date => (
            <div key={date} className="p_g_cell">{date}</div>
          ))
        }
      </div>
  }
}

function weightRowDisplay(monthFilter:number, yearFilter:number,weightProgArr: weightRowItm[]) {
  switch (monthFilter) {
    case 13: return <div className="p_g_row">
      <div className="p_g_cell">Weight (avg)</div>
      {[...new Set(weightProgArr
        .filter(wP => new Date(wP.date).getFullYear() === yearFilter).map(wP => new Date(wP.date).getMonth() +1)
      )].sort((a, b) => a - b).map(monthOf => {
        const monthOfWeights = weightProgArr.filter(wP => 
          new Date(wP.date).getMonth() + 1 === monthOf &&
          new Date(wP.date).getFullYear() === yearFilter
        )
        const avgWeight = monthOfWeights.reduce((sum, wP) => sum + wP.userWeight, 0) / monthOfWeights.length
        return <div key={monthOf} className="p_g_cell">{avgWeight.toFixed(2)}</div>
      })}
    </div>
    case 14: return <div className="p_g_row">
      <div className="p_g_cell">Weight (avg)</div>
      {[...new Set(weightProgArr.map((weightProg) => new Date(weightProg.date).getFullYear()))].map(yearOf => {
        const yearOfWeights = weightProgArr.filter(wP => new Date(wP.date).getFullYear() == yearOf)
        const avgWeight = yearOfWeights.reduce((sum,wP) => sum + wP.userWeight,0) / yearOfWeights.length
        return <div key={yearOf} className="p_g_cell">{avgWeight.toFixed(2)}</div>
      })}
    </div>
    default: return <div className="p_g_row">
      <div className="p_g_cell">Weight</div>
      {weightProgArr.filter(weight => {
          const date = new Date(weight.date);
          const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
          const matchedYe = date.getFullYear() === yearFilter;
          return matchedMo && matchedYe;
        }).map(weight => (
          <div key={weight.date} className="p_g_cell">{weight.userWeight}</div>
        ))
      }
    </div>
  }
}
