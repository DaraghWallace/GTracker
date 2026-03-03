import './CSS/App.css'

import { createExercise } from './APIfunctions';

function App() {
  return (
    <>
      <div>
        <button onClick={handleCreateExersise}>make exersise</button>
        <button onClick={handleCreateSession}>make session</button>
        <button onClick={handleCreateSet}>make set</button>        
      </div>

      <div>
        {}
      </div>
    </>
  )
}

async function handleCreateExersise() {
  createExercise()
}

function handleCreateSession() {
  console.log("createSession");
}

function handleCreateSet() {
  console.log("createSet");
}

export default App
