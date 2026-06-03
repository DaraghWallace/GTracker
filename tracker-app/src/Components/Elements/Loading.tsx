import {  FaDumbbell  } from "react-icons/fa6";

//<Loading message = {"Message"}/>
export default function Loading({ message }: { message: string }) {
  return(
    <div className="Loading">
      <div className="L_panel">
        <div className='weightSlide'><FaDumbbell/></div>
        <div className='L_p_text'>{message}</div>
      </div>
    </div>
  )
}