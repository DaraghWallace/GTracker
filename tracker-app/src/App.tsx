import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user, session, exercise, sessionExercise } from "./Helpers/customTypes";
import { getExercises, getSessionExerciseBySession, getSessions } from './Helpers/APIfunctions';
import { getUserAttributes, logout } from './Helpers/amplify';

import './CSS/App.css';
// import { getRandomQuote } from './Helpers/seeds';
// import { seedSessions, seedExercises, seedSessionsExercises } from './Helpers/seeds';

import progPng from "./assets/progress.png"
import seshPng from "./assets/sessions.png"
import Loading from './Components/Elements/Loading';

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
    setExercises(await getExercises())
    
    const sessions: session[] = await getSessions( userId, "2020-1-1", 
      `${date.getFullYear()}-${date.getMonth()}-${LastDay}`,
    );
    console.log(sessions);
    
    setSessionData(sessions);

    //--For of: works but is slow 
    // const allSets: sessionExercise[] = [];
    // for (const session of sessions) {
    //   const sets = await getSessionExerciseBySession(session.sessionId);
    //   if (sets) allSets.push(...sets);
    // }

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
        await loadUserData(user.userId)
      });
    }).catch(() => {});
  }, []);
  
  return (
    <div className="App">
      {/* <Loading message={'Loading Message'}/> */}
      {/* <button onClick={seedExercises}>seedExercises</button> */}
      {/* <button onClick={seedSessions}>seedSessions</button>  */}
      {/* <button onClick={seedSessionsExercises}>seedSessionsExercises</button> */}
      <div className="Header">
        <Header 
          currentUser = {currentUser}
          setCurrentUser = {setCurrentUser}
          loadUserData = {loadUserData}
          handleSignOut = {handleSignOut}
          setPage = {setPage}
          page={page}
        />        
      </div>
      {currentUser ?(
        <div className="Body">
          <Body
            currentUser={currentUser}
            sessionData={sessionData}
            setSessionData={setSessionData}
            exercises={exercises}
            sessionExercises={sessionExercises}
            setSessionExercises={setSessionExercises}
            page={page}
          />
        </div>
      ) : (
        <div className='Body'>
          <div>
            <img src = {seshPng}/>
          </div>
          <br/>
          <div><img src = {progPng}/></div>
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