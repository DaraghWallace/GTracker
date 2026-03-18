// import { useEffect, useState } from 'react';

import { 
  //createExercise, createSession, createSet,
  // getExercises , getSessions, getSets
  // createUser
} from './Helpers/APIfunctions';
// import { register, confirm, login, logout, } from './Helpers/amplify';
import { login, } from './Helpers/amplify';
import { fetchAuthSession  } from "aws-amplify/auth";

function App() {
  // useEffect(() => {
  //   try {
  //     (async () => {

  //     })()      
  //   } catch (error) {
  //     console.error("problem with fetchData: " + error);
  //   }
  // }, []);
  
  return (
    <div>
      <button onClick={handleLogin}>Sign in</button>
      <button onClick={getUser}>get userdata</button>

      <button onClick={getUser}>Create user profile</button>

      <h1>User</h1>
      <div>username: </div>
      <div>Email: </div>
      <div>Current Weight: #</div>
      <div>Target Weight: #</div>
      <div>Goals: string</div>
    </div>
  )
}



async function handleLogin() {
  const logInResponse = await login("daraghwallace99@gmail.com","Password1")
  console.log(logInResponse);
}

async function getUser() {
  const session = await fetchAuthSession();
  const payload = session.tokens?.idToken?.payload;
  console.log(payload?.nickname);
  console.log(payload?.["custom:userType"]);
}
export default App
