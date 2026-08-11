import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import "../CSS/progress.css"
import {
  type Bucket,
  type WeightRowItm,
  type StrengthRowItm,
  bestRep,
  buildWeightProgArr,
  buildStrengthProgArr,
  getBuckets,
} from "../Helpers/ProgressData"

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  monthFilter: number;
  yearFilter: number;
  groupFilter: string;
}

export default function ProgressGrid({ exercises, sessionData, sessionExercises, monthFilter, yearFilter, groupFilter }: Props) {
  const dateArr = sessionData.map(s => s.dateDone);
  const weightProgArr = buildWeightProgArr(sessionData);
  const strengthProgArr = buildStrengthProgArr(exercises, sessionData, sessionExercises);
  const buckets = getBuckets(monthFilter, yearFilter, dateArr);

  return (
    <div className="Grid_container">
      {dateRow(buckets)}
      {weightRow(buckets, weightProgArr)}
      {exerciseRows(buckets, strengthProgArr, groupFilter)}
    </div>
  );
}

function dateRow(buckets: Bucket[]) {
  return (
    <div className="G_row">
      <div className="G_cell_big">Date</div>
      {buckets.map(b => (
        <div key={b.key} className="G_cell">{b.label}</div>
      ))}
    </div>
  );
}

function weightRow(buckets: Bucket[], weightProgArr: WeightRowItm[]) {
  return (
    <div className="G_row">
      <div className="G_cell_big">Weight</div>
      {buckets.map(b => {
        const matched = weightProgArr.filter(w => b.matches(w.date));
        if (!matched.length) return <div key={b.key} className="G_cell">-</div>;
        const avg = matched.reduce((s, w) => s + w.userWeight, 0) / matched.length;
        return <div key={b.key} className="G_cell">{avg.toFixed(2)}</div>;
      })}
    </div>
  );
}

function exerciseRows(buckets: Bucket[], strengthProgArr: StrengthRowItm[], groupFilter: string) {
  return strengthProgArr
    .filter(itm => groupFilter === "All" || itm.group === groupFilter)
    .filter(itm => buckets.some(b => bestRep(itm.TopReps.filter(r => b.matches(r.date))) !== "-"))
    .map(itm => (
      <div className="G_row" key={itm.exerciseName}>
        <div className="G_cell_big">{itm.exerciseName}</div>
        {buckets.map(b => {
          const matched = itm.TopReps.filter(r => b.matches(r.date));
          return <div key={b.key} className="G_cell">{bestRep(matched)}</div>;
        })}
      </div>
    ));
}