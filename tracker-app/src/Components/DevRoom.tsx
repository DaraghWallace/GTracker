import { useState, useMemo } from "react";
import NewExerciseForm from "./Forms/NewExerciseForm";
import type { exercise, user } from "../Helpers/customTypes";

import { FaArrowDownAZ } from "react-icons/fa6";
import { LuBicepsFlexed } from "react-icons/lu";

import "../CSS/dev.css";
import "../CSS/progress.css";
import DevExercise from "./Elements/DevExercise";

type Props = {
  user: user;
  exercises: exercise[];
};

const ALL = "all";

/** Unique, non-empty, sorted values of one exercise field (for dropdown options). */
const uniqueSorted = (exercises: exercise[], key: "group" | "ppl") =>
  [...new Set(exercises.map((e) => e[key]).filter(Boolean))].sort();

export default function DevRoom({ user, exercises }: Props) {
  const [newExercise, setNewExercise] = useState(false);
  const [display, setDisplay] = useState<"exercises" | "users">("exercises");

  const [groupFilter, setGroupFilter] = useState(ALL);
  const [pushPullFilter, setPushPullFilter] = useState(ALL);
  const [sortAlpha, setSortAlpha] = useState(false);

  const groupOptions = useMemo(() => uniqueSorted(exercises, "group"), [exercises]);
  const pushPullOptions = useMemo(() => uniqueSorted(exercises, "ppl"), [exercises]);

  const filteredExercises = useMemo(() => {
    const result = exercises.filter(
      (e) =>
        (groupFilter === ALL || e.group === groupFilter) &&
        (pushPullFilter === ALL || e.ppl === pushPullFilter)
    );
    return sortAlpha ? result.sort((a, b) => a.name.localeCompare(b.name)) : result;
  }, [exercises, groupFilter, pushPullFilter, sortAlpha]);

  return (
    <div className="dev_cont">
      {display !== "exercises" && (
        <div>
          <button onClick={() => setDisplay("exercises")}><LuBicepsFlexed /></button>
        </div>
      )}
      {/* {display !== "users" && (
        <div>
          <button onClick={() => setDisplay("users")}><FaAddressBook /></button>
          <button onClick={() => setNewExercise(true)}><FaPlus /></button>
        </div>
      )} */}

      {display === "exercises" && (
        <div>
          <div className="Grid_container">
          <div className="G_row">
            <div className="G_cell_big">
              Name
              <button className="wide_button" onClick={() => setSortAlpha((prev) => !prev)}>
                {sortAlpha ? <FaArrowDownAZ /> : "-"}
              </button>
            </div>

            <div className="G_cell">
              <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                <option value={ALL}>Groups</option>
                {groupOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="G_cell_wide">Target Muscle</div>

            <div className="G_cell_small">
              <select value={pushPullFilter} onChange={(e) => setPushPullFilter(e.target.value)}>
                <option hidden>P/P/L</option>
                <option value={ALL}>All</option>
                {pushPullOptions.map((pp) => <option key={pp} value={pp}>{pp}</option>)}
              </select>
            </div>

            <div className="G_cell_big">Edit/Del</div>
          </div>

          {filteredExercises.map((exercise) => (
            <DevExercise key={exercise.exerciseId} exercise={exercise} />
          ))}
          </div>
        </div>
      )}

      {display === "users" && (
        <div>
          <button className="wide_button">Fetch Users</button>
        </div>
      )}

      {newExercise && <NewExerciseForm user={user} setNewExercise={setNewExercise} exercises={exercises} />}
    </div>
  );
}