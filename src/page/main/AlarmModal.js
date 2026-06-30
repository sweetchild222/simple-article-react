import { useState, useRef, useEffect } from 'react'

import PrettyButton from "@gui/PrettyButton.js"
import ReactDOM from 'react-dom';
import ProfileImage from "@gui/ProfileImage.js";
import { VscTrash } from "react-icons/vsc";
import {Vertical, Horizental} from "@gui/Flex.js";
import ElapsedTime from "@util/ElapsedTime.js";

export default function({ref, isOpen, onClose, alarms}) {
      
  const refDialog = useRef(null)  

  const [isApplyLoading, setIsApplyLoading] = useState(false)  

  

  useEffect(() => {
      
    if(isOpen)
        refDialog.current.showModal()
    else
        refDialog.current.close()

  }, [isOpen]);

  
  const onKeyDownDialog=(event)=>{

      if(event.nativeEvent.key == 'Escape'){
          event.preventDefault()
      }
  }

  
  const onClickAlarm = async(alarm)=>{

    console.log(alarm)
  }


  const userText = (alarm)=> {

    console.log(alarm)


    return 'asdfassdfasfjdakjfdiaosjfwoiejfwoijfwoei<br>fjwoijdfdfsfsdfsdfsdfsfsdfsdsdfsdfssf'
  }


  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <Vertical style={{alignItems: 'start'}}>
                  {alarms && alarms.map((data, index) => 
                      <Horizental key={data.id} style={{alignItems:'center', height:'2.5lh', maxWidth:'500px'}}>
                        <ProfileImage shape={'circle'} size={32} userId={alarms.from_user_id}/>
                        <div style={{width:'100px', color:'gray', fontStyle:'italic'}}>{ElapsedTime(data.create_at)}</div>
                        <div className={'clamped-text underline-text'} style={{'--line-count':2, backgroundColor:'lightblue'}} onClick={()=> onClickAlarm(data)}>{userText(data)}</div>
                        <PrettyButton type='transparent' style={{color:'black'}}>{<VscTrash size={15}/>}</PrettyButton>
                      </Horizental>
                  )}                
                <Horizental style={{alignItems: 'center', alignSelf:'end', marginTop:'10px'}}>
                  <PrettyButton type='danger' onClick={onClose}>닫기</PrettyButton>
                  <div style={{width:'20px'}}></div>
                  <PrettyButton type='success' onClick={onClose}>전체 삭제</PrettyButton>
                </Horizental>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}

