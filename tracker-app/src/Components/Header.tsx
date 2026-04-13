import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";
// import { getRandomQuote } from "../Helpers/seeds";

import '../CSS/Header.css'

type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: (userId: string) => Promise<void>;
  // pageStatus: string,
  handleSignOut: () => Promise<void>;
  setPage: Dispatch<SetStateAction<string>>
}

export default function Header({ currentUser, setCurrentUser, loadUserData, /*pageStatus,*/ handleSignOut, setPage }: Props) {
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
        <div className="h_tb_hello">Hello {currentUser?.nickname}</div>
        {!currentUser && <button onClick={() => setUserInFormOpen(true)}>Sign up or sign in</button>}
        <button onClick={()=> setPage("sessions")}>Sessions</button>
        <button onClick={()=> setPage("progress")}>progress</button>
        {currentUser && <button onClick={handleSignOut}>sign out</button>}
      </div>

      {/* <div className="h_bar">
        <div>"{bar.quote}"</div>
        <div>- {bar.author}</div>        
      </div> */}
    </div>
  )
}
