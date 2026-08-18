import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import {
  buildStrengthProgArr,
  groupByMuscleGroup,
  getBuckets,
  bestRep,
} from "../Helpers/progressData";

import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

import "../CSS/progress.css";

// Scoped to this component's charts (passed via `options`, not
// ChartJS.defaults) so it can't leak styling into charts rendered elsewhere
// in the app, e.g. ProgressGrid, if either ever adds its own Chart.js usage.
const CHART_OPTIONS: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  color: "#b2bac9",
  font: { size: 18 },
  scales: {
    x: { grid: { color: "#b2bac9", lineWidth: 1 } },
    y: { grid: { color: "#b2bac9", lineWidth: 1 } },
  },
  elements: {
    point: {
      pointStyle: "star",
      radius: 8,
      hoverRadius: 8,
      borderWidth: 2,
    },
  },
};

const PALETTE = [
  "#00c8ff", "#00ff88", "#33ff00", "#9dff00", "#ffc400", "#ff1e00",
  "#0059ff", "#b700ff", "#ff008c",
];

type Props = {
  exercises: exercise[];
  sessionData: session[];
  sessionExercises: sessionExercise[];
  monthFilter: number;
  yearFilter: number;
}

/*
  ProgressGraph
    Renders one line-chart card per muscle group, plotting each of that
    group's exercises' best rep across the date buckets implied by the
    month/year filter. Groups/exercises with no data in range are skipped.
*/
export default function ProgressGraph({ exercises, sessionData, sessionExercises, monthFilter, yearFilter }: Props) {
  const dateArr = sessionData.map(s => s.dateDone);
  const strengthProgArr = buildStrengthProgArr(exercises, sessionData, sessionExercises);
  const buckets = getBuckets(monthFilter, yearFilter, dateArr);
  const grouped = groupByMuscleGroup(strengthProgArr);

  return (
    <div className="Graph_container">
      {grouped.map(({ group, exercises: groupExercises }) => {
        // Best rep per bucket, computed once per exercise so the "has any
        // data" filter below and the chart data build don't redo the work.
        const repsByExercise = new Map(
          groupExercises.map(itm => [
            itm.exerciseName,
            buckets.map(b => bestRep(itm.TopReps.filter(r => b.matches(r.date)))),
          ])
        );

        const activeExercises = groupExercises.filter(itm =>
          repsByExercise.get(itm.exerciseName)!.some(rep => rep !== "-")
        );

        if (!activeExercises.length) return null; // whole group has no data in range, skip the card too

        const chartData = buckets.map((b, bucketIndex) => {
          const point: Record<string, string | number> = { label: b.label };
          activeExercises.forEach(itm => {
            point[itm.exerciseName] = repsByExercise.get(itm.exerciseName)![bucketIndex];
          });
          return point;
        });

        return (
          <div className="graph_item" key={group}>
            <div className="gi_header">{group}</div>
            <div className="gi_chart_wrap">
              <Line
                data={toChartJsData(chartData, activeExercises.map(e => e.exerciseName))}
                options={CHART_OPTIONS}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function colorForIndex(i: number) {
  return PALETTE[i % PALETTE.length];
}

function toChartJsData(
  chartData: Record<string, string | number>[],
  exerciseNames: string[]
): ChartData<"line"> {
  return {
    labels: chartData.map(d => d.label as string),
    datasets: exerciseNames.map((name, i) => {
      const color = colorForIndex(i);
      return {
        label: name,
        data: chartData.map(d => (d[name] === "-" ? null : Number(d[name]))),
        spanGaps: true,
        tension: 0.3,
        borderColor: color,
        backgroundColor: color,
        pointBackgroundColor: color,
      };
    }),
  };
}