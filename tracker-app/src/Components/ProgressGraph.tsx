import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import {
  buildStrengthProgArr,
  groupByMuscleGroup,
  getBuckets,
  bestRep,
} from "../Helpers/ProgressData";

import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartData } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

ChartJS.defaults.font.size = 18;
ChartJS.defaults.color = "#b2bac9";
ChartJS.defaults.scale.grid.color = "#b2bac9";
ChartJS.defaults.scale.grid.lineWidth = 1;

ChartJS.defaults.elements.point.pointStyle = "star";
ChartJS.defaults.elements.point.radius = 8;
ChartJS.defaults.elements.point.hoverRadius = 8;
ChartJS.defaults.elements.point.borderWidth = 2;

import "../CSS/progress.css";

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
        const activeExercises = groupExercises.filter(itm =>
          buckets.some(b => bestRep(itm.TopReps.filter(r => b.matches(r.date))) !== "-")
        );

        if (!activeExercises.length) return null; // whole group has no data in range, skip the card too

        const chartData = buckets.map(b => {
          const point: Record<string, string | number> = { label: b.label };
          activeExercises.forEach(itm => {
            point[itm.exerciseName] = bestRep(itm.TopReps.filter(r => b.matches(r.date)));
          });
          return point;
        });

        return (
          <div className="graph_item" key={group}>
            <div className="gi_header">{group}</div>
            <div className="gi_chart_wrap">
              <Line
                data={toChartJsData(chartData, activeExercises.map(e => e.exerciseName))}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}



const PALETTE = [
  "#00c8ff", "#00ff88", "#33ff00", "#9dff00", "#ffc400", "#ff1e00",
  "#0059ff", "#b700ff", "#ff008c",
];

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