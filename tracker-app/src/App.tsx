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
  const [pageState, setPageState] = useState("loading");
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  const [page, setPage] = useState("sessions");
  // const bar = getRandomQuote()

  async function loadUserData(userId: string) {
    setPageState("loading")
    setExercises(await fetchFromTable(userId, "exercises","",""))
    // setSessionData(await fetchFromTable(userId, "sessions"))
    // if (sessionData) {
    //   const seshEx = await fetchFromTable(userId, "sets")
    //   setSessionExercises(seshEx)
    // }

    // fullSet(allExercises,sessions,allSets ) 
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
    const date = new Date
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const lastDay = new Date(year, month, 0).getDate();

    fetchAuthSession().then(session => {
      if (session.tokens) {
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

          setExercises(await fetchFromTable(user.userId, "exercises","",""))

          let monthMinus = 0;
          let result: session[] = [];

          while (result.length <= 0 && monthMinus <= 12) {
            result = await fetchFromTable(
              user.userId,
              "sessions",
              `${year}-${String(month - monthMinus).padStart(2, '0')}-01`,
              `${year}-${String(month).padStart(2, '0')}-${lastDay}`
            );
            if (result.length <= 0) monthMinus++;
          }

          if (result.length > 0) {
            setSessionData(result)
            const seshEx = await fetchFromTable(
              user.userId,
              "sets",
              `${year}-${String(month - monthMinus).padStart(2, '0')}-01`,
              `${year}-${String(month - monthMinus).padStart(2, '0')}-${lastDay}`
            );
            setSessionExercises(seshEx);     
          };

          setPageState("ready")

          setSessionData(await fetchFromTable(user.userId, "sessions","2024-1-1",`${year}-${String(month - monthMinus).padStart(2, '0')}-${lastDay}`))
          setSessionExercises(await fetchFromTable(user.userId, "sets","2024-1-1",`${year}-${String(month - monthMinus).padStart(2, '0')}-${lastDay}`))
        });
      }
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
    </div>
  )
}
