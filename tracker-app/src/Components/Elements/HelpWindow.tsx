import { useState, type Dispatch, type SetStateAction } from "react";

import { FaPlus, FaPen, FaCheck, FaXmark, FaTrash, FaDumbbell, FaChartLine, FaTableList } from "react-icons/fa6";

import "../../CSS/help.css";

import newSession from "../../assets/helpNewSession.png";
import sessionForm from "../../assets/helpSessionForm.png";
import editSession from "../../assets/helpEditSession.png";
import editSessionForm from "../../assets/helpEditSessionForm.png";

import newExercise from "../../assets/helpNewExercise.png";
import editExercise_1 from "../../assets/helpEditExToggle.png";
import editExercise_2 from "../../assets/helpEditExForm.png";

import gridSession from "../../assets/helpReadGrid.png";
import graphEg from "../../assets/helpReadGraph.png";

/*
  HelpWindow.tsx - modal walkthrough of the app.

  Two tabs (Sessions, Graphs), each with two sub-pages:
    - Sessions: "Add Item" (create a session/exercise) and "Edit Item" (edit/delete them)
    - Graphs:   "Spread Sheet" (reading the progress grid) and "Graphs" (reading the chart)

  The tab buttons come from SUB_TABS and the page bodies from HELP_CONTENT (one small
  component per sub-page, defined below). The sub-page is not reset when switching tabs.
*/

type PageKey = "sessions" | "graphs";
type SubPageKey = "1" | "2";

type Props = {
  setHelpOpen: Dispatch<SetStateAction<boolean>>;
};

const SUB_TABS: Record<PageKey, { key: SubPageKey; icon: React.ReactNode; label: string }[]> = {
  sessions: [
    { key: "1", icon: <FaPlus aria-hidden="true" />, label: "Add Item" },
    { key: "2", icon: <FaPen aria-hidden="true" />, label: "Edit Item" },
  ],
  graphs: [
    { key: "1", icon: <FaTableList aria-hidden="true" />, label: "Spread Sheet" },
    { key: "2", icon: <FaChartLine aria-hidden="true" />, label: "Graphs" },
  ],
};

export default function HelpWindow({ setHelpOpen }: Props) {
  const [page, setPage] = useState<PageKey>("sessions");
  const [subPage, setSubPage] = useState<SubPageKey>("1");

  return (
    <div className="help">
      <div className="h_panel">
        <div className="f_p_row_c">
          <button onClick={() => setPage("sessions")} className="f_wide_button"><FaDumbbell aria-hidden="true" /> Sessions</button>
          <button onClick={() => setPage("graphs")} className="f_wide_button"><FaChartLine aria-hidden="true" /> Graphs</button>
        </div>

        <div className="help_header">How to use the Tracker</div>

        <div className="f_p_row_c">
          {SUB_TABS[page].map(({ key, icon, label }) => (
            <button key={key} onClick={() => setSubPage(key)} className="f_wide_button">{icon} {label}</button>
          ))}
        </div>

        <div className="help_content">{HELP_CONTENT[page][subPage]}</div>

        <button className="corner_button" aria-label="Close help" onClick={() => setHelpOpen(false)}> <FaXmark /> </button>
      </div>
    </div>
  );
}

function AddItemHelp() {
  return (
    <>
      <div className="help_fields">
        <div className="thick_text">Creating a Session</div>
        <div className="help_text_feilds">
          Each time you head to the gym press the <FaPlus aria-hidden="true" /> button to create an entry.
          In the form enter the relevant information (at least the date).
        </div>
        <img src={newSession} alt="The new session button on the sessions page" />
        <img src={sessionForm} alt="The new session form" />
      </div>

      <div className="help_fields">
        <div className="thick_text">Creating an Exercise</div>
        <div className="help_text_feilds">
          Each new exercise you complete log it in your session, press the <FaPen aria-hidden="true" /> in the header
          then on your session press the <FaPlus aria-hidden="true" />
        </div>

        <div className="help_text_feilds">
          while this form is open follow these steps;
          <ol>
            <li>Select your exercise</li>
            <li>Add the amount of reps</li>
            <li>As you complete sets hit the check box to lock in the set</li>
            <li>Lastly hit the <FaCheck aria-hidden="true" /></li>
          </ol>
        </div>

        <img src={newExercise} alt="The new exercise form within a session" />
      </div>
    </>
  );
}

function EditItemHelp() {
  return (
    <>
      <div className="help_fields">
        <div className="thick_text">Edit a Session</div>

        <div className="help_text_feilds">
          After pressing the <FaPen aria-hidden="true" /> press the <FaPen aria-hidden="true" /> that just appeared on your session to enable editing.
        </div>

        <img src={editSession} alt="The edit button that appears on a session" />

        <div className="help_text_feilds">
          From here you can change the date, Focus and current weight of the entry.
        </div>

        <img src={editSessionForm} alt="The session edit form with date, focus, and weight fields" />

        <div className="help_text_feilds">
          Once you have completed the edits hit the <FaCheck aria-hidden="true" /> to save your changes.
          You could also hit the <FaTrash aria-hidden="true" /> to delete the item or the <FaXmark aria-hidden="true" /> to cancel
        </div>
      </div>

      <div className="help_fields">
        <div className="thick_text">Edit an Exercise</div>

        <div className="help_text_feilds">
          After pressing the <FaPen aria-hidden="true" /> press the <FaPen aria-hidden="true" /> that just appeared on your session to enable editing.
        </div>

        <img src={editExercise_1} alt="The edit toggle for exercises within a session" />

        <div className="help_text_feilds">
          From here you can edit the exercise, the weights and the reps.
          <ul>
            <li>To save your changes press the <FaCheck aria-hidden="true" /></li>
            <li>To delete the exercise hit the <FaTrash aria-hidden="true" /> then Y to confirm</li>
          </ul>
        </div>
        <img src={editExercise_2} alt="The exercise edit form with weight and reps fields" />
      </div>
    </>
  );
}

function ReadGridHelp() {
  return (
    <div className="help_fields">
      <div className="thick_text">Reading the Grid</div>
      <div className="help_text_feilds">
        The info on the grid can be a lot to take in so we'll go from the top cell down.
      </div>
      <img src={gridSession} alt="An example progress grid" />
      <div className="help_text_feilds">
        <ul>
          <li>
            Date: This row identifies the range the data displayed is pulling from. In the below image we are pulling
            from a single day. This can change to all sessions within a month or year.
          </li>
          <li>
            Weight: This row shows the user's body weight for the data below. This will change depending on the filters.
            If the date filter is set to be monthly or annually the weight is measured by an average rather than at
            it's highest or lowest.
          </li>
          <li>
            Exercises: Each exercise completed within the selected date range will display the Highest Weight moved.
          </li>
        </ul>
      </div>
    </div>
  );
}

function ReadGraphHelp() {
  return (
    <div className="help_fields">
      <div className="thick_text">Reading the Graph</div>
      <div className="help_text_feilds">
        The Graph shows your muscle groups' progression. In the below example the filter is set to show
        the year of 2026 up to August. The dates are visible along the bottom of the graph and the
        weights (kgs) along the left hand side.
      </div>

      <img src={graphEg} alt="An example progress graph" />
    </div>
  );
}

const HELP_CONTENT: Record<PageKey, Record<SubPageKey, React.ReactNode>> = {
  sessions: { "1": <AddItemHelp />, "2": <EditItemHelp /> },
  graphs: { "1": <ReadGridHelp />, "2": <ReadGraphHelp /> },
};