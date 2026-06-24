
import {useContext, useState, useRef} from 'react';
import { useNavigate} from 'react-router-dom';

import * as BlobAPI from '@rest/BlobAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CommentAPI from '@rest/CommentAPI.js'
import * as AlarmAPI from '@rest/AlarmAPI.js'
import * as UserAPI from '@rest/UserAPI.js'
import * as blobToBase64 from '@util/BlobToBase64.js'
import PrettyButton from '@gui/PrettyButton.js'

import AuthContext from "@util/AuthContext.js";

export default function Home() {

  let inputEmail = null
  let inputPassword = null
  let verifyCode = null

  const refSelect = useRef(null)

  const navigate = useNavigate();
  const [isDisable, setIsDisable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateExistModalOpen, setIsCreateExitModalOpen] = useState(false)
  const [isModifyExistModalOpen, setIsModifyExitModalOpen] = useState(false)
  const [article, setArticle] = useState(false)

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)


  const deleteComment = async() =>{

    const comment_id = 9;
    
    const res = await CommentAPI.deleteComment(auth.jwt, comment_id)

    if(res.success == false)
      return

    console.log(res.payload)
  }



  const getUser=async()=>{

    const query = 'id=158,174,5'
      
    const res = await UserAPI.getUsers(query)

    if(res.success == false)
      return

    console.log(res.payload)
  }


  const postAlarm = async()=>{

    const payload = {

      user_id:auth.user_id,
      type:'ARTICLE',//'MENTION', 'COMMENT'
      article_id:84,
      comment_id:null
    }

    const res = await AlarmAPI.postAlarm(auth.jwt, payload)

    console.log(res)

  }


  const getAlarm = async() =>{    

    const res = await AlarmAPI.getAlarm(auth.jwt, auth.user_id)

    console.log(res)
  }

  const deleteAlarm = async() =>{

    const alarm_id = 12

    const res = await AlarmAPI.deleteAlarm(auth.jwt, alarm_id)

    console.log(res)
    
  }



  const patchAlarm = async()=>{

    const alarm_id = 1

    const payload = {
      checked:1 
    }

    const res = await AlarmAPI.patchAlarm(auth.jwt, alarm_id, payload)

    console.log(res)

  }

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%', marginTop:'40px'}}>            
      
      <PrettyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getAlarm}>알람 가져오기</PrettyButton>
      <PrettyButton disabled={false} isLoading={isLoading} type='success' onClick={postAlarm}>알람 추가</PrettyButton>
      <PrettyButton disabled={false} isLoading={isLoading} type='success' onClick={deleteAlarm}>알람 삭제</PrettyButton>
      <PrettyButton disabled={false} isLoading={isLoading} type='success' onClick={patchAlarm}>알람 수정</PrettyButton>
      
      

      {/* <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>      
      <button ref={refSelect} onClick={test3} className="loadingbutton">
        <span className="btn_text">Save</span></button> */}
    </div>
  );  
}
