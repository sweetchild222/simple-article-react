import { useState, useRef, useEffect, useContext } from 'react'
import {useNavigate} from 'react-router-dom';

import PrettyButton from "@gui/PrettyButton.js"
import ReactDOM from 'react-dom';
import ProfileImage from "@gui/ProfileImage.js";
import { VscTrash } from "react-icons/vsc";
import {Vertical, Horizental} from "@gui/Flex.js";
import ElapsedTime from "@util/ElapsedTime.js";
import { CiSquareRemove } from "react-icons/ci";
import * as AlarmAPI from '@rest/AlarmAPI.js'
import AuthContext from "@util/AuthContext.js";


export default function({ref, isOpen, onClose, onUpdatedAlarms, alarms}) {
      
  const refDialog = useRef(null)  

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
  const [isApplyLoading, setIsApplyLoading] = useState(false)
  const [newAlarms, setNewAlarms] = useState(structuredClone(alarms))  
  
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


  const userText = (alarm) =>{
    
    if(alarm.id == 67)
      return 'asdfassdfassdfsdfsdsdfsdfsdfasdfsdaklfmsadlfjoasdfjposdfpoasdfjisoajdfoiasjfoaisjdfoijsdaoijdsofijio;fos'

    return alarm.comment
  }

  const onClickDelete = async(id) => {

    if(!validAuth(auth))
        return
    
    // const resDelete = await AlarmAPI.deleteAlarm(auth.jwt, id)

    // if(resDelete.success == false)
    //   return

    const alarms = newAlarms.filter(item => item.id !== id)

    setNewAlarms(alarms)
    onUpdatedAlarms(alarms)
    
    if(alarms.length == 0)
      onClose()

  }

  //style={{alignItems:'center', height:'2.5lh', maxWidth:'500px'}}

  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <Vertical style={{alignItems: 'start', minWidth:'360px', maxWidth:'660px', marginLeft:'10px', marginRight:'10px', marginTop:'5px', marginBottom:'5px'}}>
                  {newAlarms && newAlarms.map((data, index) => 
                      <Horizental key={data.id} style={{marginTop:'10px', marginBottom:'10px', width:'100%'}}>
                        <ProfileImage shape={'rect'} size={48} userId={data.from_user_id} style={{marginRight:'10px'}}/>
                        <Vertical>
                          <Horizental style={{marginBottom:'5px'}}>
                            <div style={{color:'gray', fontSize:'14px', marginRight:'10px'}}>{data.user.nickname}</div>
                            <div style={{color:'gray', fontSize:'14px', whiteSpace:'pre'}}>{ElapsedTime(data.create_at)}</div>
                          </Horizental>
                          <div className={'clamped-text underline-text'} style={{'--line-count':2, height:'2lh'}} onClick={()=> onClickAlarm(data)}>{userText(data)}</div>
                        </Vertical>
                        <Horizental style={{flex:'1'}}></Horizental>
                        <PrettyButton type='transparent' style={{color:'black', height:'fit-content', marginLeft:'10px', alignSelf:'center'}}  onClick={() => onClickDelete(data.id)}>{<CiSquareRemove size={15}/>}</PrettyButton>
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

