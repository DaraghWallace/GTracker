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

const HISTORY_START_DATE = "2024-01-01";

const BATCH_SIZE = 10;

type PageState = "start" | "loading" | "ready" | "error";

/*
  loadUserData: loads exercises, sessions, and their exercises, then marks page ready
  handleSignOut: logs out and clears local state
  batchRequests: fetches session exercises BATCH_SIZE sessions at a time
  getCurrentMonthEnd: returns the last day of the current month as YYYY-MM-DD
  useEffect: restores login on page load and triggers loadUserData

  Display
    App
      Header: sign in/out, page switcher
      Body: main content (signed in) / welcome message (signed out)
      Loading: shown while pageState === "loading"
*/


export default function App() {
  const [pageState, setPageState] = useState<PageState>("start");
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  const [sessionExercises, setSessionExercises] = useState<sessionExercise[]>([]);
  const [exercises, setExercises] = useState<exercise[]>([]);
  const [page, setPage] = useState<string>("sessions");

  const [helpOpen, setHelpOpen] = useState(false);


  async function loadUserData() {
    setPageState("loading");

    try {
      const [fetchedExercises, sessions] = await Promise.all([
        getExercises(),
        getSessions(HISTORY_START_DATE, getCurrentMonthEnd()),
      ]);

      setExercises(fetchedExercises);
      setSessionData(sessions);

      const allSets = await batchRequests(sessions);
      setSessionExercises(allSets.flat());

      setPageState("ready");
    } catch (error) {
      console.error("Failed to load user data:", error);
      setPageState("error");
    }
  }

  async function handleSignOut() {
    await logout();
    setCurrentUser(null);
    setSessionData([]);
    setSessionExercises([]);
    setExercises([]);
    setPageState("start");
  }

  useEffect(() => {
    fetchAuthSession()
      .then(session => {
        if (!session.tokens) return;

        getUserAttributes().then(async attrs => {
          const user: user = {
            userId: attrs.userId as string,
            email: attrs.email as string,
            nickname: attrs.nickname as string,
            userType: attrs.userType as string,
            cur_weight: 0,
            tar_weight: 0,
          };
          setCurrentUser(user);
          await loadUserData();
        });
      })
      .catch(error => {
        // No valid session on load is expected for signed-out users;
        // anything else is worth knowing about during development.
        console.error("Failed to restore auth session:", error);
      });
  }, []);

  return (
    <div className="App">
      <Header
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        loadUserData={loadUserData}
        handleSignOut={handleSignOut}
        setPage={setPage}
        page={page}
        setHelpOpen={setHelpOpen}
      />

      {currentUser ? (
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
          <br />
          <div className='imgs'>
            <div>Track your sessions</div>
            <img src={dtSeshPng} className='dt_img' />
            <img src={mobSeshPng} className='mob_img' />

            <div>Review your Progress</div>
            <img src={dtProgPng} className='dt_img' />
            <img src={mobProgPng} className='mob_img' />
          </div>

          And keep an eye out for new features and updates like:
          <div>- Cardio tracking</div>
          <div>- Trainer / client features</div>
        </div>
      )}
      {pageState === "loading" && <Loading message={'Loading User data'} />}
      {pageState === "error" && (
        <div className="error-banner" role="alert">
          Something went wrong loading your data. Please try refreshing the page.
        </div>
      )}
      {helpOpen && <HelpWindow setHelpOpen={setHelpOpen} />}
    </div>
  )
}

async function batchRequests(sessions: session[]): Promise<sessionExercise[]> {
  const results: sessionExercise[] = [];

  for (let i = 0; i < sessions.length; i += BATCH_SIZE) {
    const batch = sessions.slice(i, i + BATCH_SIZE);
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

function getCurrentMonthEnd(): string {
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(lastDay).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}