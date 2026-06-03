import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";
// import { getRandomQuote } from "../Helpers/seeds";

import { FaChartLine, FaDumbbell, FaArrowRightFromBracket,FaArrowRightToBracket , FaDev  } from "react-icons/fa6";

type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: (userId: string) => Promise<void>;
  // pageStatus: string,
  handleSignOut: () => Promise<void>;
  setPage: Dispatch<SetStateAction<string>>
  page: string
}

export default function Header({ currentUser, setCurrentUser, loadUserData, /*pageStatus,*/ handleSignOut, setPage, page }: Props) {
  const [userInFormOpen, setUserInFormOpen] = useState(false);
  // const  bar = getRandomQuote()

  return (
    <div className="Header">
      {
        userInFormOpen && <UserInForm 
          setCurrentUser = {setCurrentUser}
          loadUserData = {loadUserData}
          setUserInFormOpen = {setUserInFormOpen}
        />
      }

      <div className="h_top_bar">
        <div className="h_tb_hello" onClick={()=>console.log(currentUser)}>
          {(currentUser && currentUser.userType == "developer") &&
            <FaDev className="dev_button" onClick={()=> setPage("dev")}/>
          }
          Hello {currentUser?.nickname}
        </div>
        <div className="h_tb_buttons">
          
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

      {/* <div className="h_bar">
        <div>"{bar.quote}"</div>
        <div>- {bar.author}</div>        
      </div> */}
    </div>
  )
}
