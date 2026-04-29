import '../../common/RotateLoading.css'
import LoadingImage from "../../common/LoadingImage.js";

import {useContext, useEffect, useRef } from "react";

import * as UserAPI from '../../api/UserAPI.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as blobToBase64 from '../../util/BlobToBase64.js'
import { useState } from 'react';
import * as ArticleAPI from '../../api/ArticleAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'

import AuthContext from "../../util/AuthContext.js";
import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";
import Modal from "../../common/Modal.js"
import GoLogin from "../../common/GoLogin.js";

import BeautyButton from '../../common/BeautyButton.js';
import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import { Outlet, Link } from 'react-router-dom';
import ImageCropModal from '../../common/ImageCropModal.js'

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useBlocker, useParams} from 'react-router-dom';
import PageNotFound from '../entry/PageNotFound.js';

export default function() {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [userName, setUserName] = useState('...')
        
    const navigate = useNavigate()

    useEffect(()=> {

        if(!validAuth(auth)){
            navigate('/')
            return
        }

        UserAPI.getUser(auth.user_id).then((res)=>{

            if(res == null){
                setUserName('?')
                return
            }

            setUserName(res.username)
        })

    }, [auth])


    const onClickNavigateProfile = async() =>{

        if(!validAuth(auth))
            return

        navigate('profile')
    }


    const onClickNavigateBlog = async() => {

        if(!validAuth(auth))
            return

        navigate('/blog/' + auth.blog_id, {state:{editMode:true}})
    }


    const getCommonCategory = async()=> {
    
        const resCategories = await ArticleAPI.getCategories(auth.user_id, 'is_default=1')
    
        if(resCategories == null)
          return -1
    
        if(resCategories.length == 0)
          return -1
    
        return resCategories[0].id
    }
    

    const onClickNavigateWrite = async() => {

        if(!validAuth(auth))
            return

        const category_id = await getCommonCategory()

        if(category_id == -1){
            window.showToast('카테고리를 가져 올 수 없습니다', 'error')
            return
        }
        
        const payload = {
            title:'',
            content:'',
            open:0,
            posted:0,
            thumbnail:'',
            category_id:category_id
        }
        
        const resArticle = await ArticleAPI.postArticle(auth.jwt, payload)
        
        if(resArticle == null) {
            window.showToast('새 글 생성에 실패 했습니다', 'error')
            return
        }

        const state = {id:resArticle.id, ...payload}
            
        navigate('/write', {state:state})
    }
    

    return validAuth(auth) ? (
      <div style={{position:'relative', alignItems:'center', display:'flex', flexDirection:'column'}}>
        <label>{userName}</label>
        <BeautyButton onClick={onClickNavigateProfile} type='default'>회원 정보 수정</BeautyButton>
        <BeautyButton onClick={onClickNavigateBlog} type='success'>내 블로그</BeautyButton>
        <BeautyButton onClick={onClickNavigateWrite} type='success'>새글 쓰기</BeautyButton>
        <div>작성 중인 글</div>
      </div>) : null
}

