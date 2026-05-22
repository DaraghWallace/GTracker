import type { exercise, session, sessionExercise } from "../Helpers/customTypes";

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
  //objs.sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
  strengthProgArr.sort((a,b) => (a.exerciseName > b.exerciseName) ? 1 : (b.exerciseName > a.exerciseName) ? -1 : 0)

  return(
    <div className="progression_grid">
      {dateRowDisplay(monthFilter, yearFilter, dateArr)}
      {weightRowDisplay(monthFilter, yearFilter, weightProgArr)}
      {exerciseRowDisplay(monthFilter, yearFilter, strengthProgArr)}
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

function exerciseRowDisplay(monthFilter:number, yearFilter:number, strengthProgArr: strengthRowItm[]) {
  switch (monthFilter) {
    case 13: 
      return strengthProgArr
      .filter(itm => itm.TopReps.some(rep => rep.topRep !== "-"))
      .map(strengthProgItm => 
        <div className="p_g_row" key={strengthProgItm.exerciseName}>  
          <div className="p_g_cell">{strengthProgItm.exerciseName}</div>
          {[...new Set(strengthProgItm.TopReps
            .filter(item => new Date(item.date).getFullYear() === yearFilter)
            .map(item => new Date(item.date).getMonth() + 1)
            )].sort((a, b) => a - b).map(month => {
              const monthReps = strengthProgItm.TopReps.filter(item =>
                new Date(item.date).getMonth() + 1 === month &&
                new Date(item.date).getFullYear() === yearFilter &&
                item.topRep !== "-"
              )
              const best = monthReps.length > 0 
                ? Math.max(...monthReps.map(r => Number(r.topRep)))
                : "-"
              return <div key={month} className="p_g_cell">{best}</div>
            })
          }
        </div>
      )
    case 14:
      return strengthProgArr
        .filter(itm => itm.TopReps.some(rep => rep.topRep !== "-"))
        .map(strengthProgItm =>
          <div className="p_g_row" key={strengthProgItm.exerciseName}>
            <div className="p_g_cell">{strengthProgItm.exerciseName}</div>
            {[...new Set(strengthProgItm.TopReps.map(item => new Date(item.date).getFullYear()))]
              .sort((a, b) => a - b)
              .map(year => {
                const yearReps = strengthProgItm.TopReps.filter(item =>
                  new Date(item.date).getFullYear() === year &&
                  item.topRep !== "-"
                )
                const best = yearReps.length > 0
                  ? Math.max(...yearReps.map(r => Number(r.topRep)))
                  : "-"
                return <div key={year} className="p_g_cell">{best}</div>
              })
            }
          </div>
      )
    default:
      return strengthProgArr
        .filter(itm => itm.TopReps.some(rep => {
          const date = new Date(rep.date)
          const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
          const matchedYe = date.getFullYear() === yearFilter;
          return matchedMo && matchedYe && rep.topRep !== "-"
        }))
        .map(strengthProgItm => 
          <div className="p_g_row" key={strengthProgItm.exerciseName}> 
            <div className="p_g_cell">{strengthProgItm.exerciseName}</div>
            {strengthProgItm.TopReps.filter(thisRep => {
              const date = new Date(thisRep.date)
              const matchedMo = monthFilter === 0 || date.getMonth() + 1 === monthFilter;
              const matchedYe = date.getFullYear() === yearFilter;
              return matchedMo && matchedYe;
            }).map(rep =>
              <div key={rep.date} className="p_g_cell">{rep.topRep}</div>
            )}
          </div>
        )
  }   
}