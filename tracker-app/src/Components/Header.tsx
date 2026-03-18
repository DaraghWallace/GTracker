import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../Helpers/customTypes";
import UserInForm from "./Forms/UserInForm";
import { logout } from "../Helpers/amplify";

type Props = {
  currentUser: user | null;
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
}

export default function Header({ currentUser, setCurrentUser }: Props) {
  const [userInFormOpen, setUserInFormOpen] = useState(false);
  
  return (
    <div>
      {
        userInFormOpen && <UserInForm setCurrentUser = {setCurrentUser}/>
      }
      

      <h1>Hello {currentUser?.nickname}</h1>
      <h2>Bar eg: "Whos gunna Carry the boats!" or sumthin</h2>
      
      <div>
        <button onClick={() => setUserInFormOpen(true)}>Sign up or sign in</button>
        <button onClick={() => console.log(currentUser)}>Huh?</button>
        <button onClick={logout}>sign out</button>
      </div>

    </div>
  )
}