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
import ProfileContext from "../../util/ProfileContext.js";
import Modal from "../../common/Modal.js"


export default function Home() {

  let inputEmail = null
  let inputPassword = null
  let verifyCode = null

  const selectRef = useRef(null)

  const navigate = useNavigate();
  const [isDisable, setIsDisable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

  const goEditor = async() => {

    navigate('/editor')
    
  };


  const postArticle = async() => {

    const payload = {title:'title ㅁㄴㅇㄻㄴㅇㄹvalue', content:'content value', open:1, posted:0, thumbnail:'http://a.jpg', category_id:10}
  
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

      title:'43434',
      content:'3434',
      open:1,
      posted:0,
      thumbnail:'http://ssaabbb',      
      category_id:19
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

  
  const getUserArticles = async() => {

    const query = 'category_id=10&offset=0&limit=5&order=1&open=0&posted=1'
    
    const res = await ArticleAPI.getUserArticles(auth.jwt, auth.user_id, query)

    if(res == null)
      return

    console.log(res)

    
  };


  
  
  const getUserCategories = async() => {
        
    const res = await ArticleAPI.getUserCategories(auth.jwt, auth.user_id)

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

    const id = 21;

    const payload ={
      name:'vvv'
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
    

  const getComment = async() => {

    const article_id = 45;

    const res = await ArticleAPI.getArticleComments(article_id)

    if(res == null)
      return

    console.log(res)
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%'}}>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='default' onClick={goEditor}>에디터</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='default' onClick={getComment}>댓글</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='success' onClick={deleteComment}>댓글 삭제</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='success' onClick={postComment}>댓글 추가</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='warning' onClick={postArticle}>글 넣기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='warning' onClick={getArticle}>글 상세 가져오기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='danger' onClick={deleteArticle}>글 삭제하기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='danger' onClick={putArticle}>글수정</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getArticles}>글목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUserArticles}>유저 글 목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUser}>유저 목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUserCategories}>카테고리</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={deleteCategory}>카테고리 삭제</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={patchCategory}>카테고리 수정</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={postCategory}>카테고리 추가</BeautyButton>

      {/* <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>      
      <button ref={selectRef} onClick={test3} className="loadingbutton">
        <span className="btn_text">Save</span></button> */}
    </div>
  );  
}


