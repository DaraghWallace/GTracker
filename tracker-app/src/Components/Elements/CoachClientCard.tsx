import { useState } from "react";
import type { user } from "../../Helpers/customTypes";

import { FaUserLargeSlash } from "react-icons/fa6";


type Props = {
  client: user;
  handleRemove: (clientId: string) => void;
}

export default function CoachClientcard({ client, handleRemove }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  
  return <div className="client_card" >
    <div className="cc_header">
      {client.nickname}

      {confirmRemove?
        <div>
          Are you sure?
          <button onClick={() => handleRemove(client.userId)}>Y</button>
          <button onClick={() => setConfirmRemove(false)}>N</button>
        </div>:
        <button onClick={() => setConfirmRemove(true)}><FaUserLargeSlash/> </button>      
      }
    </div>
    <div className="cc_content">
      Stats-
      <div>Target to current weight</div>
      <div>Height</div>
      Goals-

      Actions:
      <div>create session</div>
      <div>viiw progress</div>
    </div>
  </div>
}