import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";
import { getRandomQuote } from "../Helpers/seeds";


type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: (userId: string) => Promise<void>;
  // pageStatus: string,
  handleSignOut: () => Promise<void>;
}

export default function Header({ currentUser, setCurrentUser, loadUserData, /*pageStatus,*/ handleSignOut }: Props) {
  const [userInFormOpen, setUserInFormOpen] = useState(false);
  const  bar = getRandomQuote()

  return (
    <div>
      {
        userInFormOpen && <UserInForm 
          setCurrentUser = {setCurrentUser}
          loadUserData = {loadUserData}
        />
      }
      

      <h1>Hello {currentUser?.nickname}</h1>
      <h2>"{bar.quote}" - {bar.author}</h2>
      
      <div>
          <button onClick={() => setUserInFormOpen(true)}>Sign up or sign in</button>
          <button onClick={handleSignOut}>sign out</button>

      </div>
    </div>
  )
}
