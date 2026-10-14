import { useState } from "react";
import type { exercise } from "../../Helpers/customTypes";

import { FaPen, FaTrash, FaXmark, FaCheck } from "react-icons/fa6";
import { deleteExercise, updateExercise } from "../../Helpers/APIfunctions";

/*
  DevExercise.tsx - one exercise row in the DevRoom grid.

  Shows name, group, target muscle and push/pull/hold. The pen toggles edit mode, which
  swaps each cell for an input/dropdown, and the check saves the changes.
  The bin asks for confirmation (a check to confirm, an X to cancel) before deleting.

  Note: updateExercise / deleteExercise are fire-and-forget (not awaited), and this row
  doesn't update any parent state - the exercise list only refreshes when it is re-fetched.
*/

type Props = {
  exercise: exercise;
};

const GROUP_OPTIONS = ["Arms", "Shoulders", "Back", "Chest", "Core", "Legs"]; // Cardio intentionally excluded
const PPL_OPTIONS = ["Push", "Pull", "Hold"];

export default function DevExercise({ exercise }: Props) {
  const [editExercise, setEditExercise] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [exName, setExName] = useState(exercise.name);
  const [exGroup, setExGroup] = useState(exercise.group);
  const [exTarget, setExTarget] = useState(exercise.target);
  const [exPpl, setExPpl] = useState(exercise.ppl);

  // TODO: these try/catch blocks can't catch API errors because the calls aren't awaited
  function handleSubmit() {
    const updated: exercise = {
      exerciseId: exercise.exerciseId, // PK - uuid
      name: exName,
      group: exGroup,
      target: exTarget,
      ppl: exPpl,
      author: exercise.author,
    };

    try {
      updateExercise(updated);
    } catch (error) {
      console.error(`Failed to update exercise ${exercise.exerciseId}:`, error);
    } finally {
      setEditExercise(false);
    }
  }

  function handleDelete() {
    try {
      deleteExercise(exercise.exerciseId);
    } catch (error) {
      console.error(`Failed to Delete exercise ${exercise.exerciseId}:`, error);
    } finally {
      setEditExercise(false);
    }
  }

  return (
    <div className="G_row">
      <div className="G_cell_big">
        {editExercise ? (
          <input type="text" placeholder={exercise.name} onChange={(e) => setExName(e.target.value)} />
        ) : (
          exercise.name
        )}
      </div>

      <div className="G_cell">
        {editExercise ? (
          <select defaultValue={exercise.group} onChange={(e) => setExGroup(e.target.value)}>
            {GROUP_OPTIONS.map((group) => <option key={group}>{group}</option>)}
          </select>
        ) : (
          exercise.group
        )}
      </div>

      <div className="G_cell">
        {editExercise ? (
          <input type="text" placeholder={exercise.target} onChange={(e) => setExTarget(e.target.value)} />
        ) : (
          exercise.target
        )}
      </div>

      <div className="G_cell">
        {editExercise ? (
          <select defaultValue={exercise.ppl} onChange={(e) => setExPpl(e.target.value)}>
            {PPL_OPTIONS.map((ppl) => <option key={ppl}>{ppl}</option>)}
          </select>
        ) : (
          exercise.ppl
        )}
      </div>

      {/* Left button: confirm delete, or toggle edit mode. Right button: save, or toggle delete confirm. */}
      <div className="G_cell">
        {confirmDelete ? (
          <button onClick={handleDelete}><FaCheck /></button>
        ) : (
          <button onClick={() => setEditExercise(!editExercise)}>{editExercise ? <FaXmark /> : <FaPen />}</button>
        )}

        {editExercise ? (
          <button onClick={handleSubmit}><FaCheck /></button>
        ) : (
          <button onClick={() => setConfirmDelete(!confirmDelete)}>{confirmDelete ? <FaXmark /> : <FaTrash />}</button>
        )}
      </div>
    </div>
  );
}