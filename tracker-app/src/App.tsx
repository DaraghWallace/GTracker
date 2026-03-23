import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, set } from "./Helpers/customTypes";

import { getUserAttributes } from './Helpers/amplify';
import { getExercises, getSessions, getSetBySession } from './Helpers/APIfunctions';
import {seedExercises} from './Helpers/seeds'

import './CSS/App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [setData, setSetData] = useState<set[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  
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
            // clients: []
          };
          setCurrentUser(user);

          const sessions = await getSessions(user.userId);
          setSessionData(sessions);
          
          const allSets = await Promise.all(
            sessions.map((session: session) => getSetBySession(session.sessionId))
          );
          setSetData(allSets.flat());
          
          const allExercises = await getExercises();
          setExercises(allExercises);
        });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="App">
      <div className="app-section">
        <Header
          currentUser = {currentUser}
          setCurrentUser = {setCurrentUser}
        />
      </div>
      <div className="app-section">
        <Body
          currentUser = {currentUser}
          sessionData = {sessionData}
          exercises = {exercises}
          setData = {setData}
        />
        </div>
      <div className="app-section">
        <button onClick={seedExercises}>seed exercises</button>
        <button onClick={()=>console.log(exercises)}>log exercises</button>
      </div>
    </div>
  )
}
