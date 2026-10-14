import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import "../CSS/progress.css";
import {
  type Bucket,
  type WeightRowItm,
  type StrengthRowItm,
  bestRep,
  buildWeightProgArr,
  buildStrengthProgArr,
  getBuckets,
} from "../Helpers/progressData";

/*
  ProgressGrid.tsx - table view of the Progress page.

  Renders a grid with:
    - a header row of date buckets (from the month/year filter)
    - a row of average body weight per bucket ("-" when no data)
    - one row per exercise showing its best rep per bucket

  Cardio is always excluded, exercises are filtered by groupFilter ("All" = no filter),
  and exercises with no data in range are omitted.
*/

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
};

export default function ProgressGrid({ exercises, sessionData, sessionExercises, monthFilter, yearFilter, groupFilter }: Props) {
  const buckets = getBuckets(monthFilter, yearFilter, sessionData.map((s) => s.dateDone));
  const weightProgArr = buildWeightProgArr(sessionData);
  const strengthProgArr = buildStrengthProgArr(exercises, sessionData, sessionExercises);

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
      {buckets.map((b) => (
        <div key={b.key} className="G_cell_date">{b.label}</div>
      ))}
    </div>
  );
}

function renderWeightRow(buckets: Bucket[], weightProgArr: WeightRowItm[]) {
  return (
    <div className="G_row">
      <div className="G_cell_big">Weight</div>
      {buckets.map((b) => {
        const matched = weightProgArr.filter((w) => b.matches(w.date));
        const avg = matched.reduce((sum, w) => sum + w.userWeight, 0) / matched.length;

        return (
          <div key={b.key} className="G_cell">
            {matched.length ? avg.toFixed(2) : "-"}
          </div>
        );
      })}
    </div>
  );
}

function renderExerciseRows(buckets: Bucket[], strengthProgArr: StrengthRowItm[], groupFilter: string) {
  return strengthProgArr
    .filter((itm) => itm.group !== "Cardio" && (groupFilter === "All" || itm.group === groupFilter))
    .map((itm) => ({
      name: itm.exerciseName,
      reps: buckets.map((b) => bestRep(itm.TopReps.filter((r) => b.matches(r.date)))),
    }))
    .filter(({ reps }) => reps.some((rep) => rep !== "-")) // skip exercises with no data in range
    .map(({ name, reps }) => (
      <div className="G_row" key={name}>
        <div className="G_cell_big">{name}</div>
        {buckets.map((b, i) => (
          <div key={b.key} className="G_cell">{reps[i]}</div>
        ))}
      </div>
    ));
}