import { useState, useRef, useEffect } from 'react'

import PrettyButton from "@gui/PrettyButton.js"
import ReactDOM from 'react-dom';
import { VscTrash } from "react-icons/vsc";

export default function({ref, isOpen, onClose, alarms}) {
      
  const refDialog = useRef(null)
  const refListDiv = useRef(null)

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



  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
                <div ref={refListDiv} style={{ display: 'flex', flexDirection: 'column'}}>
                  {alarms && alarms.map((data, index) => 
                      <PrettyButton key={data.id} onClick={()=> onClickAlarm(data)} >{data.type}</PrettyButton>
                  )}
                </div>
                <div syle={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <PrettyButton type='cancel' onClick={onClose}>닫기</PrettyButton>
                  <PrettyButton type='cancel' onClick={onClose}>전체 삭제</PrettyButton>
                </div>
              </div>
          </dialog>,
          document.getElementById('modal-root')
        )
}

