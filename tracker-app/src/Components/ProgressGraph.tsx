import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import {
  buildStrengthProgArr,
  groupByMuscleGroup,
  getBuckets,
  bestRep,
} from "../Helpers/progressData";

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  monthFilter: number;
  yearFilter: number;
}

export default function ProgressGraph({ exercises, sessionData, sessionExercises, monthFilter, yearFilter }: Props) {
  const dateArr = sessionData.map(s => s.dateDone);
  const strengthProgArr = buildStrengthProgArr(exercises, sessionData, sessionExercises);
  const buckets = getBuckets(monthFilter, yearFilter, dateArr);
  const grouped = groupByMuscleGroup(strengthProgArr);

  return (
    <div className="Graph_container">
      {grouped.map(({ group, exercises: groupExercises }) => {
        const chartData = buckets.map(b => {
          const point: Record<string, string | number> = { label: b.label };
          groupExercises.forEach(itm => {
            point[itm.exerciseName] = bestRep(itm.TopReps.filter(r => b.matches(r.date)));
          });
          return point;
        });

        return (
          <div className="graph_item" key={group}>
            <div className="gi_header">{group}</div>
            <div>
              {chartData.toString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}