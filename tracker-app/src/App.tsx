import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, sessionExercise } from "./Helpers/customTypes";

import { getUserAttributes, logout } from './Helpers/amplify';

import './CSS/App.css';
import { fetchFromTable } from './Helpers/APIfunctions';
// import { seedSessions, seedExercises, seedSessionsExercises } from './Helpers/seeds';

export default function App() {
  // const [securityToken, setSecurityToken] = useState("");
  const [pageState, setPageState] = useState("start");
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  const [page, setPage] = useState("sessions");
  // const bar = getRandomQuote()

  async function loadUserData(userId: string) {
    const date = new Date()
    const LastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    setPageState("loading")
    setExercises(await fetchFromTable(userId, "exercises","","",""))
    
    const sessions: session[] = await fetchFromTable( userId, "sessions", "2024-1-1", 
      `${date.getFullYear()}-${date.getMonth()}-${LastDay}`, ""
    );
    setSessionData(sessions);

    const allSets: sessionExercise[] = await Promise.all(
      sessions.map(session => fetchFromTable(userId, "set", "", "", session.sessionId))
    );

    setSessionExercises(allSets.flat())
    setPageState("ready")
  }

  async function handleSignOut() {
    await logout();
    setCurrentUser(null);
    setSessionData([]);
    setSessionExercises([]);
    setExercises([]);
  }

  useEffect(() => {
    fetchAuthSession().then(session => {
      if (!session.tokens) return;
      getUserAttributes().then(async attrs => {
        const user = {
          userId: attrs.userId as string,
          email: attrs.email as string,
          nickname: attrs.nickname as string,
          userType: attrs.userType as string,
          cur_weight: 0,
          tar_weight: 0,
        };
        setCurrentUser(user);
        await loadUserData(user.userId)
      });
    }).catch(() => {});
  }, []);
  
  return (
    <div className="App">
      {/* <button onClick={seedExercises}>seedExercises</button>
      <button onClick={seedSessions}>seedSessions</button>
      <button onClick={seedSessionsExercises}>seedSessionsExercises</button> */}
      <div className="app-section">
        <Header
          currentUser = {currentUser}
          setCurrentUser = {setCurrentUser}
          loadUserData = {loadUserData}
          handleSignOut = {handleSignOut}
          setPage = {setPage}
          page={page}
        />        
      </div>
      
      {pageState !== "start" ?(
        <div className="app-section">
          {pageState === "loading" ? (
            <div>
              Loading
              {/*<div>{bar.quote}</div>
              <div>{bar.author}</div>*/}
            </div>

          ) : (
            <Body
              currentUser={currentUser}
              sessionData={sessionData}
              setSessionData={setSessionData}
              exercises={exercises}
              sessionExercises={sessionExercises}
              setSessionExercises={setSessionExercises}
              page={page}
            />
          )}
        </div>
      ):(
        <div className="app-section">sign in</div>
      )
      }
    </div>
  )
}