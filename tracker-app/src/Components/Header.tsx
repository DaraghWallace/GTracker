import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";

import "../CSS/Header.css"

import { FaChartLine, FaDumbbell, FaArrowRightFromBracket,FaArrowRightToBracket , FaFrog , FaCircleQuestion   } from "react-icons/fa6";

/*
  Header
    Handles sign in and page select
*/

type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: (userId: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
  setPage: Dispatch<SetStateAction<string>>
  page: string
  setHelpOpen: Dispatch<SetStateAction<boolean>>
}

export default function Header({ currentUser, setCurrentUser, loadUserData,handleSignOut, setPage, page, setHelpOpen }: Props) {
  const [userInFormOpen, setUserInFormOpen] = useState(false);

  return (
    <div className="Header">
      {userInFormOpen && 
        <UserInForm 
          setCurrentUser = {setCurrentUser}
          loadUserData = {loadUserData}
          setUserInFormOpen = {setUserInFormOpen}
        />
      }

      <div className="h_hello">
        Hey {currentUser?.nickname}
      </div>

      <div className="h_buttons">
        <button onClick={()=> setHelpOpen(true)}><FaCircleQuestion/></button>
        {(currentUser && currentUser.userType == "developer") &&
          <button  onClick={()=> setPage("dev")}> <FaFrog /> </button>
        }
        {currentUser && (page == "sessions" ?
          <button onClick={()=> setPage("progress")}><FaChartLine /></button>
          :
          <button onClick={()=> setPage("sessions")}><FaDumbbell /></button>
        )}
        
        {currentUser ?
          <button onClick={handleSignOut}><FaArrowRightFromBracket /></button>
          :
          <button onClick={() => setUserInFormOpen(true)}><FaArrowRightToBracket /></button>
        }          
      </div>
    </div>
  )
}
