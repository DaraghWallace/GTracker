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
} from "../Helpers/progressData"

// TODO: groupFilter (and StrengthRowItm.group) would ideally be typed as
// `MuscleGroup | "All"` once MuscleGroup is exported from customTypes.ts
// instead of living only in NewExerciseForm.tsx.
type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  monthFilter: number;
  yearFilter: number;
  groupFilter: string;
}

/*
  ProgressGrid
    Renders a date/weight/exercise grid: a header row of date buckets, a row
    of average body weight per bucket, then one row per exercise (filtered
    by groupFilter) showing its best rep per bucket. Exercises with no data
    in range are omitted.
*/
export default function ProgressGrid({ exercises, sessionData, sessionExercises, monthFilter, yearFilter, groupFilter }: Props) {
  const dateArr = sessionData.map(s => s.dateDone);
  const weightProgArr = buildWeightProgArr(sessionData);
  const strengthProgArr = buildStrengthProgArr(exercises, sessionData, sessionExercises);
  const buckets = getBuckets(monthFilter, yearFilter, dateArr);

  return (
    <div className="Grid_container">
      {renderDateRow(buckets)}
      {renderWeightRow(buckets, weightProgArr)}
      {renderExerciseRows(buckets, strengthProgArr, groupFilter)}
    </div>
  );
}

function renderDateRow(buckets: Bucket[]) {
  return (
    <div className="G_row">
      <div className="G_cell_big">Date</div>
      {buckets.map(b => (
        <div key={b.key} className="G_cell_date">{b.label}</div>
      ))}
    </div>
  );
}

function renderWeightRow(buckets: Bucket[], weightProgArr: WeightRowItm[]) {
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

function renderExerciseRows(buckets: Bucket[], strengthProgArr: StrengthRowItm[], groupFilter: string) {
  return strengthProgArr
    .filter(itm => groupFilter === "All" || itm.group === groupFilter)
    // Best rep per bucket, computed once per exercise so the "has any data"
    // filter below and the row rendering don't call bestRep twice each.
    .map(itm => ({
      itm,
      repsByBucket: buckets.map(b => bestRep(itm.TopReps.filter(r => b.matches(r.date)))),
    }))
    .filter(({ repsByBucket }) => repsByBucket.some(rep => rep !== "-"))
    .map(({ itm, repsByBucket }) => (
      <div className="G_row" key={itm.exerciseName}>
        <div className="G_cell_big">{itm.exerciseName}</div>
        {buckets.map((b, i) => (
          <div key={b.key} className="G_cell">{repsByBucket[i]}</div>
        ))}
      </div>
    ));
}