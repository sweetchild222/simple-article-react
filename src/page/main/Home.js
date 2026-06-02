
import {useContext, useState, useRef} from 'react';
import { useNavigate} from 'react-router-dom';

import * as BlobAPI from '@rest/BlobAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CommentAPI from '@rest/CommentAPI.js'
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

    if(res == null)
      return

    console.log(res)
  }




  const getUser=async()=>{

    const query = 'id=158,174,5'
      
    const res = await UserAPI.getUsers(query)

    if(res == null)
      return

    console.log(res)
  }

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%', marginTop:'40px'}}>            
      
      <PrettyButton disabled={false} isLoading={isLoading} type='success' onClick={deleteComment}>댓글 삭제</PrettyButton>      
    
      <PrettyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUser}>유저 목록</PrettyButton>
      

      {/* <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>      
      <button ref={refSelect} onClick={test3} className="loadingbutton">
        <span className="btn_text">Save</span></button> */}
    </div>
  );  
}
