import { useEffect, useState } from 'react';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user,session } from "./Helpers/customTypes";

import './CSS/App.css';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getUserAttributes } from './Helpers/amplify';
import { getSessions } from './Helpers/APIfunctions';

export default function App() {
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [sessionData, setSessionData] = useState<session[]>([]);
  
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

          const sessions = await getSessions(user.userId);
          setSessionData(sessions);
          console.log(sessionData);
          
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
        />
        </div>
      {/* <div className="app-section">footer</div> */}
    </div>
  )
}

