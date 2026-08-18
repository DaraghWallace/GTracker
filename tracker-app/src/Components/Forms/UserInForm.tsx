import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../../Helpers/customTypes";

import { login, register, confirm, getUserAttributes } from "../../Helpers/amplify";

import '../../CSS/form.css'
import { FaCheck, FaXmark } from "react-icons/fa6";

type Tab = "login" | "signup" | "confirm";
type UserType = "member" | "trainer";

type Props = {
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
  loadUserData: () => Promise<void>;
  setUserInFormOpen: Dispatch<SetStateAction<boolean>>
}

/*
  UserInForm
    handleLogin: signs the user in, loads their profile + session data, then closes the form
    handleSignUp: registers a new account and moves to the confirm-email tab
    handleConfirm: confirms the verification code and returns to the login tab
*/
export default function UserInForm({ setCurrentUser, loadUserData, setUserInFormOpen }: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [userType, setUserType] = useState<UserType>("member");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  function switchTab(nextTab: Tab) {
    setMessage("");
    setTab(nextTab);
  }

  async function handleLogin() {
    try {
      await login(email, password);
      const attrs = await getUserAttributes();
      setCurrentUser({
        userId: attrs.userId as string,
        email: attrs.email as string,
        nickname: attrs.nickname as string,
        userType: attrs.userType as string,
        cur_weight: 0,
        tar_weight: 0,
      });
      await loadUserData();
      setUserInFormOpen(false)
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleSignUp() {
    try {
      await register(email, password, nickname, userType);
      setPendingEmail(email);
      switchTab("confirm");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleConfirm() {
    try {
      await confirm(pendingEmail, code);
      setMessage("Email confirmed! You can now sign in.");
      switchTab("login");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="form">
      <div className="f_panel">
        {tab !== "confirm" && (
          <div className="f_p_row_c">
            {tab !== "login" && <button className="f_wide_button" onClick={() => switchTab("login")}>Sign in</button>}
            {tab !== "signup" && <button className="f_wide_button" onClick={() => switchTab("signup")}>Sign up</button>}
          </div>
        )}

        {tab === "login" && (
          <div className="f_p_col">
            <div className="thick_text">Welcome Back</div>
            <input type="email" placeholder="Email" aria-label="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" aria-label="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />

            <div className="f_p_row_c">
              <button aria-label="Sign in" onClick={handleLogin}><FaCheck /></button>
              <button aria-label="Cancel" onClick={() => setUserInFormOpen(false)}><FaXmark /></button>
            </div>
          </div>
        )}

        {tab === "signup" && (
          <div className="f_p_col">
            <div className="thick_text">Welcome</div>
            <input type="email" placeholder="Email" aria-label="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="text" placeholder="Nickname" aria-label="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
            <input placeholder="Password" type="password" aria-label="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
            <select value={userType} onChange={e => setUserType(e.target.value as UserType)}>
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
            </select>
            <div className="f_p_row_c">
              <button aria-label="Sign up" onClick={handleSignUp}><FaCheck /></button>
              <button aria-label="Cancel" onClick={() => setUserInFormOpen(false)}><FaXmark /></button>
            </div>
          </div>
        )}

        {tab === "confirm" && (
          <div>
            <p>Check your email for a verification code.</p>
            <input type="text" placeholder="123456" aria-label="Verification code" value={code} onChange={e => setCode(e.target.value)} />
            <button className="f_wide_button" onClick={handleConfirm}>Verify</button>
          </div>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}