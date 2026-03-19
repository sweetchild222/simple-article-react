import React from "react";
import axios from 'axios';
import BeautyButton from '../../common/BeautyButton.js'
import {useContext, useState, useRef, useEffect, useCallback} from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';

import * as BlobAPI from '../../api/BlobAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'
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

      const res = await ArticleAPI.getArticle(auth.jwt, 7)

      if(res == null)
        return

      console.log(res)

      const res2 = await ArticleAPI.getArticleOpen(7)

      if(res2 == null)
        return

      console.log(res2)
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

    const id = 19;

    const res = await ArticleAPI.deleteCategory(auth.jwt, id)

    if(res == null)
      return

    console.log(res)

  }





  const test5 = async() => {

    //const file = await selectFile()

    //const path = '/image/test1.jpg'
    //const path = '/image/h_long.png'
    //const path = '/image/4.1M.jpg'
    //const path = '/image/2.4M.jpg'
    const path = '/robotos.txt'

    const canvas = await scaledImage(path, 512, 512, 64, 64);

    if(canvas == null)
      return
    
    canvas.toBlob(async(blob) => {
        
      const formData = new FormData()
      formData.append('image', blob)

      // const resArticleImage = await api.postArticleImage(auth.jwt, formData)

      console.log(resArticleImage)

    })
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






  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%'}}>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='default' onClick={goEditor}>에디터</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='default' onClick={test5}>이미지</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='warning' onClick={postArticle}>글 넣기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='warning' onClick={getArticle}>글 상세 가져오기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='danger' onClick={deleteArticle}>글 삭제하기</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='danger' onClick={putArticle}>글수정</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getArticles}>글목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUserArticles}>유저 글 목록</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={getUserCategories}>카테고리</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={deleteCategory}>카테고리 삭제</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='cancel' onClick={patchCategory}>카테고리 수정</BeautyButton>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='success' onClick={test5}>success</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='success' onClick={test5}>success</BeautyButton>
      {/* <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>      
      <button ref={selectRef} onClick={test3} className="loadingbutton">
        <span className="btn_text">Save</span></button> */}
    </div>
  );  
}


