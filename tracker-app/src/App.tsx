// import { useEffect, useState } from 'react';

import { 
  //createExercise, createSession, createSet,
  // getExercises , getSessions, getSets
  // createUser
} from './Helpers/APIfunctions';
import { register, confirm, login, logout, } from './Helpers/amplify';
import { getCurrentUser  } from "aws-amplify/auth";

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
      <button onClick={handleSignUp}>Sign up</button>
      <button onClick={handleConfirm}>confirm</button>
      <button onClick={handleLogin}>Sign in</button>
      <button onClick={logout}>Sign out</button>
      <button onClick={getUser}>get userdata</button>

      <h1>User</h1>
      <div>username: </div>
      <div>Email: </div>
      <div>Current Weight: </div>
      <div>Target Weight: </div>
    </div>
  )
}

async function handleSignUp() {
  const response = await register(
    "daraghwallace99@gmail.com", 
    "Password1"
  )
  console.log(response);
}

async function handleConfirm() {
  const response = await confirm("daraghwallace99@gmail.com","357328")
  console.log(response);

  // createUser()
}

async function handleLogin() {
  const response = await login("daraghwallace99@gmail.com","Password1")
  console.log(response);
}

async function getUser() {
  const response = await getCurrentUser();
  console.log(response);
}
export default App
