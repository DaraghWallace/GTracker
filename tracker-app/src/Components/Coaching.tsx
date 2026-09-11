import type { user } from "../Helpers/customTypes";

type Props = {
  user: user;
}

export default function Coaching({user}: Props) {
  switch (user.userType) {
    case "trainer":
      return <>{trainerDisplay()}</>
    case "member":
      return <>{memberDisplay()}</>
    case "developer":
      return <>
        {trainerDisplay()}
        {memberDisplay()}
      </>  
    default:
      break;
  }
}

function trainerDisplay() {
  return <div>
    <div>ADD Client</div>
    <div>Veiw Client</div>
    <div>Create Session</div>
  </div>
}

function memberDisplay() {
  return <div>
    <div>Veiw Coach</div>
    <div>Veiw Sessions</div>
  </div>
}