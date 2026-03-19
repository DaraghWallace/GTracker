import NewSessionForm from "./Forms/NewSessionForm"
import type { user } from "../Helpers/customTypes";
import { useState } from "react";

type Props = {
  currentUser: user | null;
}
export default function Body({currentUser}: Props){
  const [newSessionFormOpen, setNewSessionFormOpen] = useState(false);
  
  return(
    <div>
      {
        newSessionFormOpen && <NewSessionForm userId={currentUser?.userId ?? ""} />
      }
      
      <div>
        <button onClick={() => setNewSessionFormOpen(true)}>new session</button>
        <button>my progress</button>        
      </div>


      <div>
        <h2>Sessions</h2>

      </div>
      <div>
        <h2>Month reveiw</h2>
        <div>Exercises | M | M | M | M | M | M | M</div>
        <div>Exercise1 | # | # | # | # | # | # | #</div>
        <div>Exercise2 | # | # | # | # | # | # | #</div>
        <div>Exercise3 | # | # | # | # | # | # | #</div>
        <div>Exercise4 | # | # | # | # | # | # | #</div>
      </div>
    </div>
  )
}