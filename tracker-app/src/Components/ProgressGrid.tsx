import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import "../CSS/progressGrid.css"

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  monthFilter: number;
  yearFilter: number;
  groupFilter: string;
}

type weightRowItm = { date: string; userWeight: number };
type strengthRep = { date: string; topRep: string };
type strengthRowItm = { exerciseName: string; TopReps: strengthRep[], group: string };

const monthYearMatch = (dateStr: string, monthFilter: number, yearFilter: number) => {
  const d = new Date(dateStr);
  const matchedMo = monthFilter === 0 || d.getMonth() + 1 === monthFilter;
  return matchedMo && d.getFullYear() === yearFilter;
};

const uniqueSorted = (arr: number[]) => [...new Set(arr)].sort((a, b) => a - b);

const bestRep = (reps: strengthRep[]) => {
  const vals = reps.filter(r => r.topRep !== "-").map(r => Number(r.topRep));
  return vals.length ? Math.max(...vals) : "-";
};

export default function ProgressGrid({ exercises, sessionData, sessionExercises, monthFilter, yearFilter, groupFilter }: Props) {
  const dateArr = sessionData.map(s => s.dateDone);
  const weightProgArr: weightRowItm[] = sessionData.map(s => ({ date: s.dateDone, userWeight: s.userWeight }));

  const strengthProgArr: strengthRowItm[] = exercises
    .map(exercise => ({
      exerciseName: exercise.name,
      group: exercise.group,
      TopReps: sessionData.map(session => {
        const se = sessionExercises.find(se => se.sessionId === session.sessionId && se.exerciseId === exercise.exerciseId);
        const topRep = se
          ? String(Math.max(...se.sets.split(',').map(set => Number(set.split('x')[0]))))
          : "-";
        return { date: session.dateDone, topRep, };
      })
    }))
    .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

  return (
    <div className="Grid_container">
      {dateRow(monthFilter, yearFilter, dateArr)}
      {weightRow(monthFilter, yearFilter, weightProgArr)}
      {exerciseRows(monthFilter, yearFilter, strengthProgArr, groupFilter)}
    </div>
  );
}

function dateRow(monthFilter: number, yearFilter: number, dateArr: string[]) {
  if (monthFilter === 13) {
    const months = uniqueSorted(dateArr.filter(d => new Date(d).getFullYear() === yearFilter).map(d => new Date(d).getMonth() + 1));
    return (
      <div className="G_row">
        <div className="G_cell">Month</div>
        {months.map(m => (
          <div key={m} className="G_cell">{new Date(yearFilter, m - 1).toLocaleString('default', { month: 'short' })}</div>
        ))}
      </div>
    );
  }
  if (monthFilter === 14) {
    const years = uniqueSorted(dateArr.map(d => new Date(d).getFullYear()));
    return (
      <div className="G_row">
        <div className="G_cell">Year</div>
        {years.map(y => <div key={y} className="G_cell">{y}</div>)}
      </div>
    );
  }
  return (
    <div className="G_row">
      <div className="G_cell">Date</div>
      {dateArr.filter(d => monthYearMatch(d, monthFilter, yearFilter)).map(d => (
        <div key={d} className="G_cell">{d}</div>
      ))}
    </div>
  );
}

function weightRow(monthFilter: number, yearFilter: number, weightProgArr: weightRowItm[]) {
  if (monthFilter === 13) {
    const months = uniqueSorted(weightProgArr.filter(w => new Date(w.date).getFullYear() === yearFilter).map(w => new Date(w.date).getMonth() + 1));
    return (
      <div className="G_row">
        <div className="G_cell">Weight (avg)</div>
        {months.map(m => {
          const matched = weightProgArr.filter(w => new Date(w.date).getMonth() + 1 === m && new Date(w.date).getFullYear() === yearFilter);
          const avg = matched.reduce((s, w) => s + w.userWeight, 0) / matched.length;
          return <div key={m} className="G_cell">{avg.toFixed(2)}</div>;
        })}
      </div>
    );
  }
  if (monthFilter === 14) {
    const years = uniqueSorted(weightProgArr.map(w => new Date(w.date).getFullYear()));
    return (
      <div className="G_row">
        <div className="G_cell">Weight (avg)</div>
        {years.map(y => {
          const matched = weightProgArr.filter(w => new Date(w.date).getFullYear() === y);
          const avg = matched.reduce((s, w) => s + w.userWeight, 0) / matched.length;
          return <div key={y} className="G_cell">{avg.toFixed(2)}</div>;
        })}
      </div>
    );
  }
  return (
    <div className="G_row">
      <div className="G_cell">Weight</div>
      {weightProgArr.filter(w => monthYearMatch(w.date, monthFilter, yearFilter)).map(w => (
        <div key={w.date} className="G_cell">{w.userWeight}</div>
      ))}
    </div>
  );
}

function exerciseRows(monthFilter: number, yearFilter: number, strengthProgArr: strengthRowItm[], groupFilter:string) {
  if (monthFilter === 13) { //Monthly
    return strengthProgArr
      .filter(itm => groupFilter === "All" || itm.group === groupFilter)
      .filter(itm => itm.TopReps.some(r => r.topRep !== "-"))
      .map(itm => {
        const months = uniqueSorted(itm.TopReps.filter(r => new Date(r.date).getFullYear() === yearFilter).map(r => new Date(r.date).getMonth() + 1));
        return (
          <div className="G_row" key={itm.exerciseName}>
            <div className="G_cell">{itm.exerciseName}</div>
            {months.map(m => {
              const matched = itm.TopReps.filter(r => new Date(r.date).getMonth() + 1 === m && new Date(r.date).getFullYear() === yearFilter);
              return <div key={m} className="G_cell">{bestRep(matched)}</div>;
            })}
          </div>
        );
      });
  }
  if (monthFilter === 14) { //Yearly
    return strengthProgArr
      .filter(itm => groupFilter === "All" || itm.group === groupFilter)
      .filter(itm => itm.TopReps.some(r => r.topRep !== "-"))
      .map(itm => {
        const years = uniqueSorted(itm.TopReps.map(r => new Date(r.date).getFullYear()));
        return (
          <div className="G_row" key={itm.exerciseName}>
            <div className="G_cell">{itm.exerciseName}</div>
            {years.map(y => {
              const matched = itm.TopReps.filter(r => new Date(r.date).getFullYear() === y);
              return <div key={y} className="G_cell">{bestRep(matched)}</div>;
            })}
          </div>
        );
      });
  }
  return strengthProgArr
    .filter(itm => groupFilter === "All" || itm.group === groupFilter)
    .filter(itm => itm.TopReps.some(r => monthYearMatch(r.date, monthFilter, yearFilter) && r.topRep !== "-"))
    .map(itm => (
      <div className="G_row" key={itm.exerciseName}>
        <div className="G_cell">{itm.exerciseName}</div>
        {itm.TopReps.filter(r => monthYearMatch(r.date, monthFilter, yearFilter)).map(r => (
          <div key={r.date} className="G_cell">{r.topRep}</div>
        ))}
      </div>
    )
  );
}