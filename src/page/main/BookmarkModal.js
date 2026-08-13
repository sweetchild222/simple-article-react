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


export default function({ref, isOpen, onClose, bookmarks}) {

  const refDialog = useRef(null)

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)  
  const [newBookmarks, setNewBookmarks] = useState(structuredClone(bookmarks))
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

  
  const onClickSubscribe = async(subscribe)=> {
        
    if(!validAuth(auth)) 
      return
    
  }


  const pageCount = 5

  const onClickNext = () => {

    const newBookmarkLength = newBookmarks.length

    if(newBookmarkLength > (fromIndex + pageCount))
      setFromIndex(index => index + pageCount)
  }


  const onClickPrev = () =>{

    setFromIndex(index => (index - pageCount < 0) ? 0 : (index - pageCount))

  }

  
  const onClickNavigateArticle = (article) => {
  
      navigate('/blog/' + article.blog_id  + '/article/' + article.id)
  }
  
  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px', width:'90%', maxWidth:'512px'}}>
              <Vertical style={{alignItems: 'start', marginLeft:'16px', marginRight:'16px', marginTop:'8px', marginBottom:'8px'}}>
                  {newBookmarks && newBookmarks.slice(fromIndex, fromIndex + pageCount).map((data, index) => 
                    <Horizental key={data.id} style={{alignItems:'center', marginTop:'8px', marginBottom:'8px'}} onClick={() => onClickNavigateArticle(data.article)}>
                        <ProfileImage shape={'circle'} user={data.article.user} size={32}></ProfileImage>
                        <HPad size={8}/>
                        <div className={'clamped-text'} style={{'--line-count':1, cursor:'pointer', whiteSpace: 'nowrap', color:'black'}}>{data.article.title}</div>
                    </Horizental>                      
                  )}
                <Horizental style={{alignItems: 'center', marginTop:'8px', justifyContent:'center', width:'100%', marginBottom:'8px'}}>
                  <div style={{flex:'1'}}/>
                  {newBookmarks.length > pageCount && <PrettyButton type='transparent' disabled={fromIndex - pageCount < 0} style={{color:'black'}} onClick={onClickPrev}><GrPrevious size={20}/></PrettyButton>}
                  <HPad size={16}/>
                  {newBookmarks.length > pageCount && <PrettyButton type='transparent' disabled={!(newBookmarks.length > (fromIndex + pageCount))} style={{color:'black'}} onClick={onClickNext}><GrNext size={20}/></PrettyButton>}
                  <div style={{flex:'1'}}/>
                  <PrettyButton type='cancel' onClick={onClose} style={{width:'64px'}}>닫기</PrettyButton>
                </Horizental>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}

