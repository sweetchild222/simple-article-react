
import { useState, useRef, useEffect } from 'react'

import PrettyButton from "@gui/PrettyButton.js"
import ReactDOM from 'react-dom';
import { VscTrash } from "react-icons/vsc";
import {Vertical, Horizental} from "@gui/Flex.js";
import { CiSquarePlus } from "react-icons/ci";
import {VPad, HPad} from "@gui/Pad.js";

export default function({ref, isOpen, onClose, onSelect, categories}) {
      
  const refDialog = useRef(null)
  const refListDiv = useRef(null)  
  
  const [newCategories, setNewCategories] = useState(structuredClone(categories))

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


  const onSelectInner = (category) => {

      if(onSelect != null)
        onSelect(category)
      
      if(onClose != null)
        onClose()
  }

  
  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px', width:'90%', maxWidth:'512px'}}>
              <Vertical ref={refListDiv} style={{alignItems: 'center', marginLeft:'16px', marginRight:'16px', marginTop:'8px', marginBottom:'8px', alignItems:'start'}}>
                  {newCategories && newCategories.map((data, index) => 
                    <PrettyButton type={'transparent'} key={data.id} style={{color:'black', marginTop:'4px', marginBottom:'4px', fontSize:'16px'}} onClick={()=>onSelectInner(data)}>{data.name + ' (' + data.article_count + ')'}</PrettyButton>
                  )}                
                <VPad size={8}></VPad>
                <PrettyButton type='cancel' onClick={onClose} style={{width:'64px', alignSelf:'end'}}>닫기</PrettyButton>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}
