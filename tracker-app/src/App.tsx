import { useState } from 'react';

import Header from './Components/Header';
import Body from './Components/Body';

import type { user } from "./Helpers/customTypes";

import './CSS/App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState<user | null>(null);

  return (
    <div className="App">
      <div className="app-section">
        <Header
          currentUser = {currentUser}
          setCurrentUser = {setCurrentUser}
        />
      </div>
      <div className="app-section"><Body/></div>
      {/* <div className="app-section">footer</div> */}
    </div>
  )
}