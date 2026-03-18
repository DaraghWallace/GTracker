import { useState, type Dispatch, type SetStateAction } from "react";
import type { user } from "../../Helpers/customTypes";

import { login, register, confirm , getUserAttributes} from "../../Helpers/amplify";

type Tab = "login" | "signup" | "confirm";

type Props = {  
  setCurrentUser: Dispatch<SetStateAction<user | null>>;
}

export default function UserInForm({ setCurrentUser }: Props) {
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
      setCurrentUser({
        userId: attrs.userId as string,
        email: attrs.email as string,
        nickname: attrs.nickname as string,
        userType: attrs.userType as string,
        cur_weight: 0,
        tar_weight: 0,
      });
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
    <div>
      {tab !== "confirm" && (
        <div>
          <button onClick={() => setTab("login")}>Sign in</button>
          <button onClick={() => setTab("signup")}>Sign up</button>
        </div>
      )}

      {tab === "login" && (
        <div>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Sign in</button>
        </div>
      )}

      {tab === "signup" && (
        <div>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
          <select value={userType} onChange={e => setUserType(e.target.value)}>
            <option value="">Select...</option>
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
          </select>
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleSignUp}>Create account</button>
        </div>
      )}

      {tab === "confirm" && (
        <div>
          <p>Check your email for a verification code.</p>
          <input placeholder="123456" value={code} onChange={e => setCode(e.target.value)} />
          <button onClick={handleConfirm}>Verify</button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  )
}

