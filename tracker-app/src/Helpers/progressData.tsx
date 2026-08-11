import type { exercise, session, sessionExercise } from "../Helpers/customTypes";

export type WeightRowItm = { date: string; userWeight: number };
export type StrengthRep = { date: string; topRep: string };
export type StrengthRowItm = { exerciseName: string; TopReps: StrengthRep[]; group: string };
export type Bucket = { key: string; label: string; matches: (date: string) => boolean };

export const monthYearMatch = (dateStr: string, monthFilter: number, yearFilter: number) => {
  const d = new Date(dateStr);
  const matchedMo = monthFilter === 0 || d.getMonth() + 1 === monthFilter;
  return matchedMo && d.getFullYear() === yearFilter;
};

export const uniqueSorted = (arr: number[]) => [...new Set(arr)].sort((a, b) => a - b);

export const bestRep = (reps: StrengthRep[]) => {
  const vals = reps.filter((r: StrengthRep) => r.topRep !== "-").map((r: StrengthRep) => Number(r.topRep));
  return vals.length ? Math.max(...vals) : "-";
};

export const displayDate = (date: string): string => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export function buildWeightProgArr(sessionData: session[]): WeightRowItm[] {
  return sessionData.map((s: session) => ({ date: s.dateDone, userWeight: s.userWeight }));
}

export function buildStrengthProgArr(
  exercises: exercise[],
  sessionData: session[],
  sessionExercises: sessionExercise[]
): StrengthRowItm[] {
  return exercises.map((e: exercise) => ({
    exerciseName: e.name,
    group: e.group,
    TopReps: sessionData.map((s: session) => {
      const se = sessionExercises.find((se: sessionExercise) => se.sessionId === s.sessionId && se.exerciseId === e.exerciseId);
      const topRep = se
        ? String(Math.max(...se.sets.split(',').map((set: string) => Number(set.split('x')[0]))))
        : "-";
      return { date: s.dateDone, topRep };
    })
  })).sort((a: StrengthRowItm, b: StrengthRowItm) => a.exerciseName.localeCompare(b.exerciseName));
}

// Shared bucketing logic: turns the monthFilter/yearFilter combo into a list
// of buckets, each with a label and a matcher fn. Used by both the grid
// (columns) and the graph (x-axis points).
export function getBuckets(monthFilter: number, yearFilter: number, dates: string[]): Bucket[] {
  if (monthFilter === 13) { // monthly view
    const months = uniqueSorted(
      dates.filter((d: string) => new Date(d).getFullYear() === yearFilter).map((d: string) => new Date(d).getMonth() + 1)
    );
    return months.map((m: number) => ({
      key: String(m),
      label: new Date(yearFilter, m - 1).toLocaleString('default', { month: 'short' }),
      matches: (d: string) => new Date(d).getMonth() + 1 === m && new Date(d).getFullYear() === yearFilter,
    }));
  }
  if (monthFilter === 14) { // yearly view
    const years = uniqueSorted(dates.map((d: string) => new Date(d).getFullYear()));
    return years.map((y: number) => ({
      key: String(y),
      label: String(y),
      matches: (d: string) => new Date(d).getFullYear() === y,
    }));
  }
  // single month/year view -> one bucket per session date
  return dates
    .filter((d: string) => monthYearMatch(d, monthFilter, yearFilter))
    .map((d: string) => ({ key: d, label: displayDate(d), matches: (dd: string) => dd === d }));
}

export type GroupedExercises = { group: string; exercises: StrengthRowItm[] };

// Groups strength rows by muscle group, optionally filtered to a single group.
export function groupByMuscleGroup(strengthProgArr: StrengthRowItm[], groupFilter = "All"): GroupedExercises[] {
  const groups: string[] = groupFilter === "All"
    ? [...new Set(strengthProgArr.map((itm: StrengthRowItm) => itm.group))].sort()
    : [groupFilter];

  return groups.map((group: string) => ({
    group,
    exercises: strengthProgArr.filter((itm: StrengthRowItm) => itm.group === group),
  }));
}