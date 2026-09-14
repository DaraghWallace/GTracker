import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";

type Props = {
  user: user;
}

export default function Coaching({user}: Props) {
  const [findClient, setFindClient] = useState(false)
  const [createSessionPlan, setCreateSessionPlan] = useState(false)
  switch (user.userType) {
    case "trainer":
      return <>{trainerDisplay(findClient, setFindClient, createSessionPlan, setCreateSessionPlan)}</>
    case "member":
      return <>{memberDisplay()}</>
    case "developer":
      return <>
        {trainerDisplay(findClient, setFindClient, createSessionPlan, setCreateSessionPlan)}
        {/* {memberDisplay()} */}
      </>  
    default:
      break;
  }
}

function trainerDisplay(
    findClient: boolean, setFindClient: Dispatch<SetStateAction<boolean>>,
    createSessionPlan: boolean, setCreateSessionPlan: Dispatch<SetStateAction<boolean>>
  ) {
  return <div>
    <button onClick={() => setFindClient(!findClient)}>{findClient? "x":"+"}</button>
    {findClient && 
      <div>
        Email:<input/>
        Nickname:<input/>
        <button onClick={findUser}>?</button>
      </div>
    }

    <div>Veiw Client</div>
    
    <button onClick={() => setCreateSessionPlan(!createSessionPlan)}>{createSessionPlan? "x":"+"}</button>
    {createSessionPlan && 
      <div>
        Focus:<input/>
        <div>
          exercise:<input/>
          Num of Sets:<input/>
          To Failure?:<input/>
        </div>
      </div>
    }
  </div>
}

function findUser() {
  console.log("finding User");
}

function memberDisplay() {
  return <div>
    <div>Veiw Coach</div>
    <div>Veiw Sessions</div>
  </div>
}
