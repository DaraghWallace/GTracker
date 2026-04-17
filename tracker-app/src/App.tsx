import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, sessionExercise } from "./Helpers/customTypes";

import { getUserAttributes, logout } from './Helpers/amplify';
// import { getExercises, getSessions, getSessionExerciseBySession, /*getToken*/ } from './Helpers/APIfunctions';

// import {seedExercises, getRandomQuote} from './Helpers/seeds'

import './CSS/App.css';
import { fetchFromTable } from './Helpers/APIfunctions';
// import { seedSessions, seedExercises, seedSessionsExercises } from './Helpers/seeds';

export default function App() {
  // const [securityToken, setSecurityToken] = useState("");
  const [pageState, setPageState] = useState("");
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  const [page, setPage] = useState("sessions");
  // const bar = getRandomQuote()

  async function loadUserData(userId: string) {
    setExercises(await fetchFromTable(userId, "exercises"))
    setSessionData(await fetchFromTable(userId, "sessions"))
    if (sessionData) {
      const seshEx = await fetchFromTable(userId, "sets")
      setSessionExercises(seshEx)
    }

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
          setExercises(await fetchFromTable(user.userId, "exercises"))
          setSessionData(await fetchFromTable(user.userId, "sessions"))
          if (sessionData) {
            const seshEx = await fetchFromTable(user.userId, "sets")
            setSessionExercises(seshEx)
          }

          setPageState("ready")
        });
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
