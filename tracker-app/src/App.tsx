import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import "./CSS/App.css"

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, sessionExercise } from "./Helpers/customTypes";
import { getExercises, getSessionExerciseBySession, getSessions } from './Helpers/APIfunctions';
import { getUserAttributes, logout } from './Helpers/amplify';


import progPng from "./assets/progress.png"
import seshPng from "./assets/sessions.png"
import Loading from './Components/Elements/Loading';

/*
  loadUserData: Funtion that runs scripts from "Helpers/APIfunctions" to get data to be displayed
  handleSignOut: Removes user credentilas and data from session
  useEffect
    fetchAuthSession: Build user info and signs the in, here to maintian login if theyve used the sight before
      getUserAttributes
      setCurrentUser

  batchRequests: fetches data 10 at a time to for performance

  Display
    App
      Header: Handles sign in and page select
      Body: Priamary content display + add content   
*/

export default function App() {
  const [pageState, setPageState] = useState("start");
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  const [page, setPage] = useState("sessions");

  async function loadUserData() {
    const date = new Date()
    const LastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    setPageState("loading")
    setExercises(await getExercises())
    
    const sessions: session[] = await getSessions( "2024-01-01", 
      `${date.getFullYear()}-${date.getMonth() + 1}-${LastDay}`,
    );
    
    setSessionData(sessions);

    const allSets = await batchRequests(sessions);
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
        await loadUserData()
      });
    }).catch(() => {});
  }, []);
  
  return (
    <div className="App">
      <Header 
        currentUser = {currentUser}
        setCurrentUser = {setCurrentUser}
        loadUserData = {loadUserData}
        handleSignOut = {handleSignOut}
        setPage = {setPage}
        page={page}
      />

      {currentUser ?(
        <Body
          currentUser={currentUser}
          sessionData={sessionData}
          setSessionData={setSessionData}
          exercises={exercises}
          sessionExercises={sessionExercises}
          setSessionExercises={setSessionExercises}
          page={page}
        />
      ) : (
        <div className='hello'>
          Welcome to My Gym tracking App, A web app to simplify tracking sessions and progress. Sign in to get started and keep an eye out for new features and updates like:
          <div>- Cardio tracking</div>
          <div>- Helpful Graphs</div>
          <div>- Trainer / client features</div>

          <div className='imgs'>
            <img src = {seshPng}/>
            <img src = {progPng}/>
          </div>
        </div>
      )}
      {pageState=="loading" && <Loading message={'Loading User data'}/>}
    </div>
  )
}

async function batchRequests(sessions: session[]): Promise<sessionExercise[]> {
  const batchSize = 10
  const results: sessionExercise[] = [];

  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    const batchResults = (await Promise.all(
      batch.map(session =>
        getSessionExerciseBySession(session.sessionId).catch((error) => {
          console.error(`Failed for session ${session.sessionId}:`, error);
          return [];
        })
      )
    )).flat();
    results.push(...batchResults);
  }
  return results;
}