import { useState, type Dispatch, type SetStateAction } from "react";

import { FaPlus, FaPen, FaCheck, FaXmark, FaTrash } from "react-icons/fa6";

import newSession from "../../assets/helpNewSession.png"
import sessionForm from "../../assets/helpSessionForm.png"
import editSession from "../../assets/helpEditSession.png"
import editSessionForm from "../../assets/helpEditSessionForm.png"
import newExercise from "../../assets/helpNewExercise.png"
import editExercise_1 from "../../assets/helpEditExToggle.png"
import editExercise_2 from "../../assets/helpEditExForm.png"


type Props = {
  setHelpOpen: Dispatch<SetStateAction<boolean>>
}

export default function HelpWindow( {setHelpOpen}: Props) {
  const [page, setPage] = useState("sessions");
  const [subPage, setSubPage] = useState("new");
  
  return(
    <div className="form">
      <div className="f_panel">
        <div className="f_p_row_c">
          <button onClick={() => setPage("sessions")} className="f_wide_button">Sessions</button>
          <button onClick={() => setPage("graphs")}className="f_wide_button">Graphs</button>
        </div>

        <div className="help_header">How to use the Tracker</div>
        
        {page == "sessions" && 
          <div className="f_p_row_c">
            <button onClick={() => setSubPage("new")} className="f_wide_button"><FaPlus/> Add Item</button>
            <button onClick={() => setSubPage("edit")} className="f_wide_button"><FaPen/> Edit Item</button>          
          </div>
        }
        
        {displayContent(page, subPage)}

        <button className="corner_button" onClick={() => setHelpOpen(false)}> <FaXmark/> </button>
      </div>
    </div>
  )
}

function displayContent(page: string, subPage: string){
  switch (page) {
    case "sessions":
      switch (subPage) {
        case "new":
          return(
            <>
              <div className="help_fields">
                <div className="thick_text">Creating a Session</div>
                <div className="help_text_feilds" >
                  Each time you head to the gym press the <FaPlus/> button to create an entry.
                  In the form enter the relevent information (at least the date).
                </div>   

                <img src={newSession}/>
                <img src={sessionForm}/>
              </div>    

              <div className="help_fields">
                <div className="thick_text">Creating an Exercise</div>
                <div className="help_text_feilds" >
                  Each new exercise you complete log it in your session, press the <FaPen/> in the header 
                  then on your session press the <FaPlus/> 
                </div>  


                <div className="help_text_feilds" >
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
          )   
        case "edit":
          return(
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

          )
    default:
      break;
    }
  }
}