import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";

import "../CSS/Header.css"

import { FaChartLine, FaDumbbell, FaArrowRightFromBracket, FaArrowRightToBracket, FaFrog, FaCircleQuestion } from "react-icons/fa6";

type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  setPage: Dispatch<SetStateAction<string>>;
  page: string;
  setHelpOpen: Dispatch<SetStateAction<boolean>>;
}

/*
  Header
    Handles sign in and page select
*/
export default function Header({ currentUser, setCurrentUser, loadUserData, handleSignOut, setPage, page, setHelpOpen }: Props) {
  const [userInFormOpen, setUserInFormOpen] = useState(false);

  const isDeveloper = currentUser?.userType === "developer";

  return (
    <div className="Header">
      {userInFormOpen &&
        <UserInForm
          setCurrentUser={setCurrentUser}
          loadUserData={loadUserData}
          setUserInFormOpen={setUserInFormOpen}
        />
      }

      <div className="h_hello">
        Hey {currentUser?.nickname}
      </div>

      <div className="h_buttons">
        <button aria-label="Help" onClick={() => setHelpOpen(true)}><FaCircleQuestion /></button>

        {currentUser && isDeveloper &&
          <button aria-label="Dev page" onClick={() => setPage("dev")}><FaFrog /></button>
        }

        {currentUser && (page === "sessions" ?
          <button aria-label="View progress" onClick={() => setPage("progress")}><FaChartLine /></button>
          :
          <button aria-label="View sessions" onClick={() => setPage("sessions")}><FaDumbbell /></button>
        )}

        {currentUser ?
          <button aria-label="Sign out" onClick={handleSignOut}><FaArrowRightFromBracket /></button>
          :
          <button aria-label="Sign in" onClick={() => setUserInFormOpen(true)}><FaArrowRightToBracket /></button>
        }
      </div>
    </div>
  )
}