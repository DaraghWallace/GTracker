import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, sessionExercise } from "./Helpers/customTypes";

import { getUserAttributes, logout } from './Helpers/amplify';
import { getExercises, getSessions, getSessionExerciseBySession } from './Helpers/APIfunctions';
// import {seedExercises} from './Helpers/seeds'

import './CSS/App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  
  async function loadUserData(userId: string) {
    const sessions = await getSessions(userId);
    const allSets = await Promise.all(
      sessions.map((session: session) => getSessionExerciseBySession(session.sessionId))
    );
    const allExercises = await getExercises();

    fullSet(allExercises,sessions,allSets )      
  }

  async function fullSet(allExercises: exercise[], sessions: session[], allSessionExercises: sessionExercise[]) {
    setExercises(allExercises);
    setSessionData([...sessions].sort((a, b) => new Date(b.dateDone).getTime() - new Date(a.dateDone).getTime()));
    setSessionExercises(allSessionExercises.flat());
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
          await loadUserData(attrs.userId as string);
        });
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  
  return (
    <div className="App">
      {/* <button onClick={seedExercises}>seed</button> */}
      <div className="app-section">
        <Header
          currentUser = {currentUser}
          setCurrentUser = {setCurrentUser}
          loadUserData = {loadUserData}
          handleSignOut = {handleSignOut}
        />        
      </div>
      
      <div className="app-section">
        {currentUser && 
          <Body
            currentUser = {currentUser}
            sessionData = {sessionData}
            exercises = {exercises}
            sessionExercises = {sessionExercises}
            loadUserData = {loadUserData}
          />        
        }
      </div>
    </div>
  )
}

