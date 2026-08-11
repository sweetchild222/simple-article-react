import { useState, useRef, useEffect, useContext } from 'react'
import {useNavigate} from 'react-router-dom';
import PrettyButton from "@gui/PrettyButton.js"


import ReactDOM from 'react-dom';
import ProfileImage from "@gui/ProfileImage.js";
import { VscTrash } from "react-icons/vsc";
import {Vertical, Horizental} from "@gui/Flex.js";
import ElapsedTime from "@util/ElapsedTime.js";

import * as AlarmAPI from '@rest/AlarmAPI.js'
import AuthContext from "@util/AuthContext.js";
import { MdVisibility } from 'react-icons/md';

import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";
import {VPad, HPad} from "@gui/Pad.js";


export default function({ref, isOpen, onClose, onUpdatedAlarms, alarms}) {
      
  const refDialog = useRef(null)  

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
  const [isApplyLoading, setIsApplyLoading] = useState(false)
  const [newAlarms, setNewAlarms] = useState(structuredClone(alarms))

  const [fromIndex, setFromIndex] = useState(0)

  const navigate = useNavigate()
  
  useEffect(() => {
      
    if(isOpen){
      setFromIndex(0)      
      refDialog.current.showModal()
    }
    else
      refDialog.current.close()

  }, [isOpen]);



  
  const onKeyDownDialog=(event)=>{

      if(event.nativeEvent.key == 'Escape'){
          event.preventDefault()
      }
  }

  
  const onClickAlarm = async(alarm)=> {
        
    if(validAuth(auth)) {
      const payload = { checked:1 }
      const res = await AlarmAPI.patchAlarm(auth.jwt, alarm.id, payload)
    }
    
    navigate('/blog/' + alarm.blog_id + '/article/' + alarm.article_id, {state:{comment_id:alarm.comment_id}})
  }


  const onClickDelete = async(id) => {

    if(!validAuth(auth))
        return
    
    const resDelete = await AlarmAPI.deleteAlarm(auth.jwt, id)

    if(resDelete.success == false)
      return

    const alarms = newAlarms.filter(item => item.id !== id)

    setNewAlarms(alarms)
    onUpdatedAlarms(alarms)
    
    if(alarms.length == 0)
      onClose()
  }

  const pageCount = 5

  const onClickNext = () => {

    const alarmLength = newAlarms.length

    if(alarmLength > (fromIndex + pageCount))
      setFromIndex(index => index + pageCount)
  }


  const onClickPrev = () =>{

    setFromIndex(index => (index - pageCount < 0) ? 0 : (index - pageCount))

  }  
  
  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <Vertical style={{alignItems: 'start', width:'512px', minWidth:'512px', maxWidth:'512px', marginLeft:'16px', marginRight:'16px', marginTop:'8px', marginBottom:'8px'}}>
                  {newAlarms && newAlarms.slice(fromIndex, fromIndex + pageCount).map((data, index) => 
                      <Horizental key={data.id} style={{marginTop:'8px', marginBottom:'8px', width:'100%'}}>
                        <ProfileImage shape={'rect'} gray={data.checked == 1} size={48} userId={data.from_user_id}/>
                        <Vertical style={{marginLeft:'8px'}}>
                          <Horizental style={{marginBottom:'4px'}}>
                            <div style={{color:'gray', fontSize:'14px', marginRight:'8px'}}>{data.user.nickname}</div>
                            <div style={{color:'gray', fontSize:'14px', whiteSpace:'pre'}}>{ElapsedTime(data.create_at)}</div>
                          </Horizental>
                          <div className={'clamped-text underline-text'} style={{'--line-count':2, height:'2lh', color:(data.checked == 0 ? 'black' : 'darkgray')}} dangerouslySetInnerHTML={{ __html: data.seenComment}} onClick={()=> onClickAlarm(data)}></div>
                        </Vertical>
                        <Horizental style={{flex:'1'}} onClick={()=> onClickAlarm(data)}></Horizental>
                        <PrettyButton type='transparent' style={{color:'black', height:'fit-content', marginLeft:'8px', alignSelf:'center'}}  onClick={() => onClickDelete(data.id)}>{<VscTrash size={25}/>}</PrettyButton>
                      </Horizental>
                  )}
                <Horizental style={{alignItems: 'center', marginTop:'8px', justifyContent:'center', width:'100%', marginBottom:'8px'}}>
                  <div style={{flex:'1'}}/>
                  {newAlarms.length > pageCount && <PrettyButton type='transparent' disabled={fromIndex - pageCount < 0} style={{color:'black'}} onClick={onClickPrev}><GrPrevious size={20}/></PrettyButton>}
                  <HPad size={16}/>
                  {newAlarms.length > pageCount && <PrettyButton type='transparent' disabled={!(newAlarms.length > (fromIndex + pageCount))} style={{color:'black'}} onClick={onClickNext}><GrNext size={20}/></PrettyButton>}
                  <div style={{flex:'1'}}/>
                  <PrettyButton type='cancel' onClick={onClose} style={{width:'64px'}}>닫기</PrettyButton>
                </Horizental>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}

