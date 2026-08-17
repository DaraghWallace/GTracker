import { useState, type Dispatch, type SetStateAction } from "react";

import { FaPlus, FaPen, FaCheck, FaXmark, FaTrash, FaDumbbell, FaChartLine, FaTableList } from "react-icons/fa6";

import newSession from "../../assets/helpNewSession.png"
import sessionForm from "../../assets/helpSessionForm.png"
import editSession from "../../assets/helpEditSession.png"
import editSessionForm from "../../assets/helpEditSessionForm.png"

import newExercise from "../../assets/helpNewExercise.png"
import editExercise_1 from "../../assets/helpEditExToggle.png"
import editExercise_2 from "../../assets/helpEditExForm.png"

// import gridHeader from "../../assets/helpGridFilter.png"
import gridSession from "../../assets/helpReadGrid.png"
import graphEg from "../../assets/helpReadGraph.png"


type Props = {
  setHelpOpen: Dispatch<SetStateAction<boolean>>
}

export default function HelpWindow( {setHelpOpen}: Props) {
  const [page, setPage] = useState("sessions");
  const [subPage, setSubPage] = useState("1");
  
  return(
    <div className="form">
      <div className="f_panel">
        <div className="f_p_row_c">
          <button onClick={() => setPage("sessions")} className="f_wide_button"><FaDumbbell/> Sessions</button>
          <button onClick={() => setPage("graphs")}className="f_wide_button"><FaChartLine/> Graphs</button>
        </div>

        <div className="help_header">How to use the Tracker</div>
        
        {page == "sessions" && 
          <div className="f_p_row_c">
            <button onClick={() => setSubPage("1")} className="f_wide_button"><FaPlus/> Add Item</button>
            <button onClick={() => setSubPage("2")} className="f_wide_button"><FaPen/> Edit Item</button>          
          </div>
        }
        
        {page == "graphs" && 
          <div className="f_p_row_c">
            <button onClick={() => setSubPage("1")} className="f_wide_button"><FaTableList/> Spread Sheet</button>
            <button onClick={() => setSubPage("2")} className="f_wide_button"><FaChartLine/> Graphs</button>          
          </div>
        }
        {displayContent(page, subPage)}

        <button className="corner_button" onClick={() => setHelpOpen(false)}> <FaXmark/> </button>
      </div>
    </div>
  )
}

function displayContent(page: string, subPage: string) {
  switch (page) {
    case "sessions":
      switch (subPage) {
        case "1":
          return (
            <>
              <div className="help_fields">
                <div className="thick_text">Creating a Session</div>
                <div className="help_text_feilds">
                  Each time you head to the gym press the <FaPlus/> button to create an entry.
                  In the form enter the relevent information (at least the date).
                </div>
                <img src={newSession}/>
                <img src={sessionForm}/>
              </div>

              <div className="help_fields">
                <div className="thick_text">Creating an Exercise</div>
                <div className="help_text_feilds">
                  Each new exercise you complete log it in your session, press the <FaPen/> in the header
                  then on your session press the <FaPlus/>
                </div>

                <div className="help_text_feilds">
                  while this form is open follow these steps;
                  <ol>
                    <li>Select your exercise</li>
                    <li>Add the amount of reps</li>
                    <li>As you complete sets hit the check box to lick in the set</li>
                    <li>Laslty hit the <FaCheck/></li>
                  </ol>
                </div>

                <img src={newExercise}/>
              </div>
            </>
          );
        case "2":
          return (
            <>
              <div className="help_fields">
                <div className="thick_text">Edit a Session</div>

                <div className="help_text_feilds">
                  After pressing the <FaPen/> press the <FaPen/> that just appeared on your session to enable editing.
                </div>

                <img src={editSession}/>

                <div className="help_text_feilds">
                  From here you can change the date, Focus and current weight of the entry.
                </div>

                <img src={editSessionForm}/>

                <div className="help_text_feilds">
                  Once you have completed the edits hit the <FaCheck/> to save your changes.
                  You could also hit the <FaTrash/> to delete the item or the <FaXmark/> to cancel
                </div>
              </div>

              <div className="help_fields">
                <div className="thick_text">Edit an Exercise</div>

                <div className="help_text_feilds">
                  After pressing the <FaPen/> press the <FaPen/> that just appeared on your session to enable editing.
                </div>

                <img src={editExercise_1}/>

                <div className="help_text_feilds">
                  From here you can edit the exercise, the weights and the reps.
                  <ul>To save your changes press the <FaCheck /></ul>
                  <ul>To delete the exercise hit the <FaTrash /> then Y to confirm</ul>
                </div>
                <img src={editExercise_2}/>
              </div>
            </>
          );
        default: return null;
      }

    case "graphs":
      switch (subPage) {
        case "1":
          return (
            <div className="help_fields">
              <div className="thick_text">Reading the Grid</div>
              <div className="help_text_feilds">
                The info on the grid can be a lot to take in so we'll got from the top cell down.
              </div>
              <img src={gridSession}/>
              <div className="help_text_feilds">
                <ul>
                  <li>
                    Date: This Row idetifies the range the data displayed is pulling from. In the below image we are pulling 
                    from a single day. This can change from all sessions withing a month or year.
                  </li>
                  <li>
                    Weight: This Row shows the users body weight for the data below. This will change depending on the filters.
                    If the date filter is set to be monthly or annualy the weight is measured by an average rather than at 
                    it's highest or lowest.
                  </li>
                  <li>
                    Exercises: Each exercise completed within the selected date range will display the Highest Weight moved.
                  </li>
                </ul> 
              </div>
            </div>
          );
        case "2":
          return (
            <div className="help_fields">
              <div className="thick_text">Reading the Graph</div>
              <div className="help_text_feilds">
                The Graph Shows your muscle groups progression. In the below example the filter is set to show 
                the year of 2026 up to august. the dates are visible along the bottom of the graph and the the 
                weights(kgs) along the left hand side.
              </div>

              <img src={graphEg}/>
            </div>
          );
        default:
          return null;
      }

    default:
      return null;
  }
}