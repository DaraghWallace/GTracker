import { useEffect, useMemo, useState } from "react";
import type { exercise, session, sessionExercise } from "../Helpers/customTypes";
import { buildStrengthProgArr, groupByMuscleGroup, getBuckets, bestRep } from "../Helpers/progressData";

import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";

import "../CSS/progress.css";

/*
  ProgressGraph.tsx - line-chart view of the Progress page.

  Renders one chart card per muscle group (Cardio is skipped), with one line per exercise
  plotting its best rep in each date bucket implied by the month/year filter.
  Exercises with no data in range are dropped, and groups with nothing left get no card.

  Also contains:
    - useIsMobile: tracks the app's 750px breakpoint so chart sizing switches with the CSS
    - getLineChartOptions: Chart.js styling, passed per-chart (not via ChartJS.defaults)
      so it can't leak into other charts in the app
    - toChartJsData: converts per-exercise best reps into Chart.js datasets
*/

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const MOBILE_BREAKPOINT = 750; // matches the breakpoint used across the app's CSS
const TEXT_COLOR = "#dddddd";
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
};

type Series = { name: string; reps: ReturnType<typeof bestRep>[] };

export default function ProgressGraph({ exercises, sessionData, sessionExercises, monthFilter, yearFilter }: Props) {
  const isMobile = useIsMobile();
  const chartOptions = useMemo(() => getLineChartOptions(isMobile), [isMobile]);

  const strengthProgArr = buildStrengthProgArr(exercises, sessionData, sessionExercises);
  const buckets = getBuckets(monthFilter, yearFilter, sessionData.map((s) => s.dateDone));
  const grouped = groupByMuscleGroup(strengthProgArr);

  return (
    <div className="Graph_container">
      {grouped.map(({ group, exercises: groupExercises }) => {
        if (group === "Cardio") return null;

        // Best rep per bucket for each exercise, keeping only those with any data in range
        const series: Series[] = groupExercises
          .map((itm) => ({
            name: itm.exerciseName,
            reps: buckets.map((b) => bestRep(itm.TopReps.filter((r) => b.matches(r.date)))),
          }))
          .filter(({ reps }) => reps.some((rep) => rep !== "-"));

        if (!series.length) return null;

        return (
          <div className="graph_item" key={group}>
            <div className="gi_header">{group}</div>
            <div className="gi_chart_wrap">
              <Line data={toChartJsData(buckets.map((b) => b.label), series)} options={chartOptions} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** True when the viewport is below the breakpoint; updates on resize/rotate. */
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

function getLineChartOptions(isMobile: boolean): ChartOptions<"line"> {
  const fontSize = isMobile ? 15 : 18;
  const gridColor = isMobile ? "#dddddd33" : TEXT_COLOR; // faint on mobile, solid on desktop
  const ticks = { color: TEXT_COLOR, font: { size: fontSize } };

  return {
    responsive: true,
    maintainAspectRatio: false,
    color: TEXT_COLOR,
    borderColor: TEXT_COLOR,
    font: { size: fontSize },
    scales: {
      x: {
        grid: { color: gridColor, lineWidth: isMobile ? 1 : 2 },
        ticks: { ...ticks, maxRotation: 0, autoSkip: true, maxTicksLimit: isMobile ? 4 : undefined },
      },
      y: {
        grid: { color: gridColor, lineWidth: 1 },
        ticks: { ...ticks, maxTicksLimit: isMobile ? 5 : undefined },
        min: 0,
      },
    },
    plugins: {
      legend: {
        labels: {
          ...ticks,
          boxWidth: isMobile ? 10 : 20,
          boxHeight: isMobile ? 10 : 12,
          padding: isMobile ? 8 : 10,
        },
      },
      tooltip: {
        titleColor: TEXT_COLOR,
        bodyColor: TEXT_COLOR,
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
      line: { borderWidth: isMobile ? 1.5 : 2 },
    },
  };
}

function toChartJsData(labels: string[], series: Series[]): ChartData<"line"> {
  return {
    labels,
    datasets: series.map(({ name, reps }, i) => {
      const color = PALETTE[i % PALETTE.length];
      return {
        label: name,
        data: reps.map((rep) => (rep === "-" ? null : Number(rep))), // "-" = no data, drawn as a gap
        spanGaps: true,
        tension: 0.3,
        borderColor: color,
        backgroundColor: color,
        pointBackgroundColor: color,
      };
    }),
  };
}