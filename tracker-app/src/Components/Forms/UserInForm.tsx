import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../../Helpers/customTypes";

import { login, register, confirm , getUserAttributes} from "../../Helpers/amplify";

import "../../CSS/App.css";
import "../../CSS/Form.css";

import { FaCheck, FaXmark  } from "react-icons/fa6";

type Tab = "login" | "signup" | "confirm";

type Props = {  
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: (userId: string) => Promise<void>;
  setUserInFormOpen: Dispatch<SetStateAction<boolean>>
}

export default function UserInForm({ setCurrentUser, loadUserData , setUserInFormOpen}: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [userType, setUserType] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  async function handleLogin() {
    try {
      await login(email, password);
      const attrs = await getUserAttributes();
      console.log("attrs", attrs);
      setCurrentUser({
        userId: attrs.userId as string,
        email: attrs.email as string,
        nickname: attrs.nickname as string,
        userType: attrs.userType as string,
        cur_weight: 0,
        tar_weight: 0,
        // clients: []
      });
      loadUserData(attrs.userId as string)
      console.log("userId", attrs.userId);  
      setUserInFormOpen(false)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleSignUp() {
    try {
      await register(email, password, nickname, userType);
      setPendingEmail(email);
      setTab("confirm");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleConfirm() {
    try {
      await confirm(pendingEmail, code);
      setMessage("Email confirmed! You can now sign in.");
      setTab("login");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="Form">
      <div className="F_feildCont">
        {tab !== "confirm" && (
          <div>
            <button className="wide_button" onClick={() => setTab("login")}>Sign in</button>
            <button className="wide_button" onClick={() => setTab("signup")}>Sign up</button>
          </div>
        )}

        {tab === "login" && (
          <div className="f_fc_Column">
            <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            
            <div className="f_fc_Row">
              <button className="green_button" onClick={handleLogin}><FaCheck/></button>
              <button className="red_button" onClick={() => setUserInFormOpen(false)}><FaXmark/></button>            
            </div>  
          </div>
        )}

        {tab === "signup" && (
          <div className="f_fc_Column">
            <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="text" placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <select value={userType} onChange={e => setUserType(e.target.value)}>
              <option value="">Select...</option>
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
            </select>
            <div className="f_fc_Row">
              <button className="green_button" onClick={handleSignUp}><FaCheck/></button>
              <button className="red_button" onClick={() => setUserInFormOpen(false)}><FaXmark/></button>               
            </div>
          </div>
        )}

        {tab === "confirm" && (
          <div>
            <p>Check your email for a verification code.</p>
            <input type="text" placeholder="123456" value={code} onChange={e => setCode(e.target.value)} />
            <button className="wide_button" onClick={handleConfirm}>Verify</button>
          </div >
        )}

        {message && <p>{message}</p>}        
      </div>
    </div>
  )
}

