import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";
import { logout } from "../Helpers/amplify";
import { getRandomQuote } from "../Helpers/seeds";


type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
}

export default function Header({ currentUser, setCurrentUser }: Props) {
  const [userInFormOpen, setUserInFormOpen] = useState(false);
  const  bar = getRandomQuote()

  return (
    <div>
      {userInFormOpen && <UserInForm setCurrentUser = {setCurrentUser}/>}
      

      <h1>Hello {currentUser?.nickname}</h1>
      <h2>"{bar.quote}" - {bar.author}</h2>
      
      <div>
        <button onClick={() => setUserInFormOpen(true)}>Sign up or sign in</button>
        <button onClick={() => console.log(currentUser)}>Huh?</button>
        <button onClick={logout}>sign out</button>
      </div>

    </div>
  )
}

