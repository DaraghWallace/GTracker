import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import "./CSS/App.css"

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, sessionExercise } from "./Helpers/customTypes";
import { getExercises, getSessionExerciseBySession, getSessions } from './Helpers/APIfunctions';
import { getUserAttributes, logout } from './Helpers/amplify';


import dtProgPng from "./assets/progress.png"
import dtSeshPng from "./assets/sessions.png"
import mobSeshPng from "./assets/mobileSesh.png"
import mobProgPng from "./assets/mobileProg.png"

import Loading from './Components/Elements/Loading';
import HelpWindow from './Components/Elements/HelpWindow';


/*
  loadUserData: loads exercises, sessions, and their exercises, then marks page ready
  handleSignOut: logs out and clears local state
  batchRequests: fetches session exercises 10 sessions at a time
  useEffect: restores login on page load and triggers loadUserData

  Display
    App
      Header: sign in/out, page switcher
      Body: main content (signed in) / welcome message (signed out)
      Loading: shown while pageState === "loading"
*/


export default function App() {
  const [pageState, setPageState] = useState("start");
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  const [page, setPage] = useState("sessions"); // sessions / progress 

  const [helpOpen, setHelpOpen] = useState(false);
  

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
        setHelpOpen={setHelpOpen}
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
          Welcome to My Gym tracking App, A web app to simplify tracking sessions and progress. Sign in to get started
          <br/>
          <div className='imgs'>
            <div>Track your sessions</div>
            <img src = {dtSeshPng} className='dt_img'/>
            <img src = {mobSeshPng} className='mob_img'/>
            
            <div>Review your Progress</div>
            <img src = {dtProgPng} className='dt_img'/>
            <img src = {mobProgPng} className='mob_img'/>
          </div>

          And keep an eye out for new features and updates like:
          <div>- Cardio tracking</div>
          <div>- Trainer / client features</div>
        </div>
      )}
      {pageState=="loading" && <Loading message={'Loading User data'}/>}
      {helpOpen && <HelpWindow setHelpOpen = {setHelpOpen}/>}
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