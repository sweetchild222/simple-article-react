import { useState, useRef, useEffect} from 'react'
import {useNavigate} from 'react-router-dom';
import ReactDOM from 'react-dom';

import PrettyButton from "@gui/PrettyButton.js"
import ProfileImage from "@gui/ProfileImage.js";
import { HPad } from "@gui/Pad.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";


export default function({ref, isOpen, onClose, subscribes}) {

  const refDialog = useRef(null)
  
  const [newSubscribes, setNewSubscribes] = useState(structuredClone(subscribes))
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

  
  const pageCount = 5

  const onClickNext = () => {

    const subscribeLength = newSubscribes.length

    if(subscribeLength > (fromIndex + pageCount))
      setFromIndex(index => index + pageCount)
  }


  const onClickPrev = () =>{

    setFromIndex(index => (index - pageCount < 0) ? 0 : (index - pageCount))

  }

  const onClickNavigateBlog = (blog_id) =>{

    navigate('/blog/' + blog_id)

  }
  
  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px', width:'90%', maxWidth:'512px'}}>
              <Vertical style={{alignItems: 'start', marginLeft:'16px', marginRight:'16px', marginTop:'8px', marginBottom:'8px'}}>
                  {newSubscribes && newSubscribes.slice(fromIndex, fromIndex + pageCount).map((data, index) => 
                      <Horizental key={data.id} style={{alignItems:'center', marginTop:'8px', marginBottom:'8px', width:'100%'}} onClick={() => onClickNavigateBlog(data.blog_id)}>
                        <ProfileImage shape={'circle'} user={data.user} size={32}></ProfileImage>
                        <HPad size={8}/>
                        <div className={'clamped-text'} style={{'--line-count':1, cursor:'pointer', whiteSpace: 'nowrap', color:'black'}}>{data.blog.title}</div>
                      </Horizental>
                  )}
                <Horizental style={{alignItems: 'center', marginTop:'8px', justifyContent:'center', width:'100%', marginBottom:'8px'}}>
                  <div style={{flex:'1'}}/>
                  {newSubscribes.length > pageCount && <PrettyButton type='transparent' disabled={fromIndex - pageCount < 0} style={{color:'black'}} onClick={onClickPrev}><GrPrevious size={20}/></PrettyButton>}
                  <HPad size={16}/>
                  {newSubscribes.length > pageCount && <PrettyButton type='transparent' disabled={!(newSubscribes.length > (fromIndex + pageCount))} style={{color:'black'}} onClick={onClickNext}><GrNext size={20}/></PrettyButton>}
                  <div style={{flex:'1'}}/>
                  <PrettyButton type='cancel' onClick={onClose} style={{width:'64px'}}>닫기</PrettyButton>
                </Horizental>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}

