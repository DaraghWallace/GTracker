import { useEffect, useMemo, useState } from "react";
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

// Matches the breakpoint used throughout the app's CSS (see progress.css,
// Body.css, etc.) so the chart and its surrounding layout switch together.
const MOBILE_BREAKPOINT = 750;

// Tracks whether we're below the breakpoint and re-renders on resize/rotate.
function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}

// Scoped to this component's charts (passed via `options`, not
// ChartJS.defaults) so it can't leak styling into charts rendered elsewhere
// in the app, e.g. ProgressGrid, if either ever adds its own Chart.js usage.
function getLineChartOptions(isMobile: boolean): ChartOptions<"line"> {
  const fontSize = isMobile ? 15 : 18;
  const gridColor = isMobile ? "#dddddd33" : "#dddddd"; // faint on mobile, solid on desktop

  return {
    responsive: true,
    maintainAspectRatio: false,
    color: "#dddddd",
    font: { size: fontSize },
    scales: {
      x: {
        grid: { color: gridColor, lineWidth: isMobile ? 1 : 2 },
        ticks: {
          color: "#dddddd",
          font: { size: fontSize },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 4 : undefined,
        },
      },
      y: {
        grid: { color: gridColor, lineWidth: 1 },
        ticks: {
          color: "#dddddd",
          font: { size: fontSize },
          maxTicksLimit: isMobile ? 5 : undefined,
        },
        min: 0,
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#dddddd",
          font: { size: fontSize },
          boxWidth: isMobile ? 10 : 20,
          boxHeight: isMobile ? 10 : 12,
          padding: isMobile ? 8 : 10,
        },
      },
      tooltip: {
        titleColor: "#dddddd",
        bodyColor: "#dddddd",
        titleFont: { size: fontSize },
        bodyFont: { size: fontSize },
      },
    },
    elements: {
      point: {
        pointStyle: "star",
        radius: isMobile ? 4 : 8,
        hoverRadius: isMobile ? 6 : 8,
        borderWidth: isMobile ? 1 : 2,
      },
      line: {
        borderWidth: isMobile ? 1.5 : 2,
      },
    },
    borderColor: "#dddddd",
  };
}

const PALETTE = [
  "#ff0000", "#ff7300", "#fbff00", "#73ff00", "#00ffbf", "#00c8ff", "#cc00ff", 
  "#ff80b5", "#ffbb83", "#bfffc7", "#00aa17", "#4586ff",
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
  const isMobile = useIsMobile();
  const chartOptions = useMemo(() => getLineChartOptions(isMobile), [isMobile]);

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

        if (group != "Cardio") {
          return (
            <div className="graph_item" key={group}>
              <div className="gi_header">{group}</div>
              <div className="gi_chart_wrap">
                <Line
                  data={toChartJsData(chartData, activeExercises.map(e => e.exerciseName))}
                  options={chartOptions}
                />
              </div>
            </div>
          );          
        }

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