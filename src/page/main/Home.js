import React from "react";
import axios from 'axios';
import BeautyButton from '../../common/BeautyButton.js'
import {useContext, useState, useRef, useEffect, useCallback} from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';

import * as BlobAPI from '../../api/BlobAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'
import * as UserAPI from '../../api/UserAPI.js'
import * as blobToBase64 from '../../util/BlobToBase64.js'


import AuthContext from "../../util/AuthContext.js";
import Modal from "../../common/Modal.js"


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

  
  const onClickEditor = async() => {

    const query = 'offset=0&limit=1&order=1&posted=0&source_id=none'
    
    const resUserArticles = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, query)

    if(resUserArticles == null)
      return

    console.log(resUserArticles)

    if(resUserArticles.length > 0){
      setArticle(resUserArticles[0])
      setIsCreateExitModalOpen(true)
      return
    }

    const category_id = await getCommonCategory()

    if(category_id == -1)
      return

    const payload = {
      title:'',
      content:'',      
      posted:0,
      thumbnail:'',
      category_id:category_id
    }

    const resArticle = await ArticleAPI.postArticle(auth.jwt, payload)

    if(resArticle == null)
      return

    goEditor({id:resArticle.id, ...payload})
  }

  const goEditor=(state)=>{

    console.log(state)

    navigate('/write', {state:state})
  }

  const getCommonCategory = async()=>{

    const resCategories = await ArticleAPI.getCategories(auth.user_id, 'is_default=1')

    if(resCategories == null)
      return -1

    if(resCategories.length == 0)
      return -1

    return resCategories[0].id
  }


  const onResultCreate = async(result) =>{
    
    if(result){

      const resArticle = await ArticleAPI.getArticle(auth.jwt, article.id)

      if(resArticle == null)
        return      
      
      goEditor(resArticle)
      return
    }

    const category_id = await getCommonCategory()

    if(category_id == -1)
      return
    
    const payload = {
      title:'',
      content:'',      
      posted:0,
      thumbnail:'',
      category_id:category_id
    }
    
    const res = await ArticleAPI.postArticle(auth.jwt, payload)

    if(res == null)
      return

    goEditor({id:res.id, ...payload})
  }


  const postArticle = async() => {

    const payload = {title:'title ㅁㄴㅇㄻㄴㅇㄹvalue', content:'content value', open:1, posted:0, thumbnail:'http://a.jpg', category_id:10, source_id:70}
  
    const res = await ArticleAPI.postArticle(auth.jwt, payload)

    if(res == null)
      return

    console.log(res)
  };


  const getArticle = async() => {

      const res = await ArticleAPI.getArticle(validAuth(auth) ? auth.jwt : null, 7)

      if(res == null)
        return

      console.log(res)

  }


    const deleteArticle = async() => {

      const res = await ArticleAPI.deleteArticle(auth.jwt, 6)

      if(res == null)
        return

      console.log(res)
  }

  const putArticle = async() => {

    const payload = {

      title:'gwegwe',
      content:'wegw',
      posted:0,
      thumbnail:'http://ssaabbb',
      category_id:10,      
    }

    const article_id = 23

    const res = await ArticleAPI.putArticle(auth.jwt, article_id, payload)

    if(res == null)
        return

      console.log(res)
  }


  const getArticles = async() =>{

    const query = 'offset=1&limit=3&order=1'

    const res = await ArticleAPI.getArticles(query)

    if(res == null)
      return

    console.log(res)
  }

  
  const getBlogArticles = async() => {

    const query = 'offset=0&limit=3&order=1&source_id=70'
    
    const res = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, query)

    if(res == null)
      return

    console.log(res)

    
  };


  
  
  const getUserCategories = async() => {
        
    const res = await ArticleAPI.getCategories(auth.user_id)

    if(res == null)
      return

    console.log(res)
  
  };


  const deleteCategory = async() =>{

    const id = 7;    

    const res = await ArticleAPI.deleteCategory(auth.jwt, id)

    if(res == null)
      return

    console.log(res)

  }


  const patchCategory = async() =>{

    const id = 22;

    const payload ={
      name:'gg'
    }

    const res = await ArticleAPI.patchCategory(auth.jwt, id, payload)

    if(res == null)
      return

    console.log(res)
  }


  const postCategory = async() =>{

    const payload = {

      name:'dfgd',
      user_id:auth.user_id
    }

    const res = await ArticleAPI.postCategory(auth.jwt, payload)

    if(res == null)
      return

    console.log(res)
  }
    

  const modifyArticle = async() => {

    const articleId = 69

    const query = 'source_id='+ articleId
    
    const res = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, query)
  
    if(res == null)
      return

    if(res.length == 0){

      const resArticle = await ArticleAPI.getArticle(auth.jwt, articleId)
      
      if(resArticle == null)
        return

      const payload = {
        title:resArticle.title,
        content:resArticle.content,        
        posted:0,
        thumbnail:resArticle.thumbnail,
        category_id:resArticle.category_id,
        source_id:articleId
      }

      const resPostArticle = await ArticleAPI.postArticle(auth.jwt, payload)      

      if(resPostArticle == null)
        return

      goEditor({id:articleId, ...payload})
      return
    }
    
    if(res[0].source_id == articleId){

      setArticle(res[0])
      setIsModifyExitModalOpen(true)
    }
  }


  const onResultModify = async(result) =>{

    if(result){

      const resArticle = await ArticleAPI.getArticle(auth.jwt, article.id)

      if(resArticle == null)
        return

      goEditor(resArticle)
      return
    }

    const resOriArticle = await ArticleAPI.getArticle(auth.jwt, article.source_id)
      
    if(resOriArticle == null)
      return

    const payloadOri = {
      title:resOriArticle.title,
      content:resOriArticle.content,      
      posted:0,
      thumbnail:resOriArticle.thumbnail,
      category_id:resOriArticle.category_id,
      source_id:resOriArticle.source_id
    }

    const resPutArticle = await ArticleAPI.putArticle(auth.jwt, article.id, payloadOri)

    if(resPutArticle == null)
      return    

    goEditor({id:resPutArticle.id, ...payloadOri})
  }


  const deleteComment = async() =>{

    const comment_id = 9;
    
    const res = await ArticleAPI.deleteComment(auth.jwt, comment_id)

    if(res == null)
      return

    console.log(res)
  }


  const postComment = async() =>{

    const payload = {

      comment:'댓글',
      user_id:auth.user_id,
      article_id:45
      //comment_id:10
    }

    
    const res = await ArticleAPI.postComment(auth.jwt, payload)

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
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='default' onClick={onClickEditor}>새글 작성</BeautyButton>
      <Modal title={'이미 작성 중인 글이 있습니다. 이어서 작성하시겠습니까?'} type={'yesno'} isOpen={isCreateExistModalOpen} onResult={onResultCreate} onClose={()=>setIsCreateExitModalOpen(false)}></Modal>
      <Modal title={'이미 수정 중인 글이 있습니다. 이어서 작성하시겠습니까?'} type={'yesno'} isOpen={isModifyExistModalOpen} onResult={onResultModify} onClose={()=>setIsModifyExitModalOpen(false)}></Modal>      
      <BeautyButton disabled={false} isLoading={isLoading} type='default' onClick={modifyArticle}>수정하기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='success' onClick={deleteComment}>댓글 삭제</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='success' onClick={postComment}>댓글 추가</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='warning' onClick={postArticle}>글 넣기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='warning' onClick={getArticle}>글 상세 가져오기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='danger' onClick={deleteArticle}>글 삭제하기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='danger' onClick={putArticle}>글수정</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getArticles}>글목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getBlogArticles}>유저 글 목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUser}>유저 목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUserCategories}>카테고리</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={deleteCategory}>카테고리 삭제</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={patchCategory}>카테고리 수정</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={postCategory}>카테고리 추가</BeautyButton>

      {/* <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>      
      <button ref={refSelect} onClick={test3} className="loadingbutton">
        <span className="btn_text">Save</span></button> */}
    </div>
  );  
}
