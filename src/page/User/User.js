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
import Integer from "../../util/Integer.js";

import BeautyButton from '../../common/BeautyButton.js';
import {scale, blobFromCanvas, drawImage} from "../../util/ImageUtil.js";
import { Outlet, Link } from 'react-router-dom';
import ImageCropModal from '../../common/ImageCropModal.js'

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useBlocker, useParams} from 'react-router-dom';
import PageNotFound from '../entry/PageNotFound.js';
import UserImage from "../../common/UserImage.js";
import OverlayLoading from '../../common/OverlayLoading.js';

export default function() {

    const { id } = useParams()

    const user_id = Integer(id)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [user, setUser] = useState(null)

    const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false)
        
    const navigate = useNavigate()

    const profileWidth = 256
    const profileHeight = 256
    
    useEffect(()=> {

        if(!user_id){
            navigate('/pageNotFound')
            return
        }

        UserAPI.getUser(user_id).then((resUser)=>{

            if(resUser == null){
                navigate('/pageNotFound')
                return
            }

            resUser.image = resUser.image != '' ?  (resUser.image + '?size=' + profileWidth + 'x' + profileHeight) : '/image/user.png'
            setUser(resUser)
        })

    }, [user_id])



    const isEditable = () => {

        return (validAuth(auth) && auth.user_id == user_id)
    }


    const onClickNavigateProfile = async() =>{

        if(!isEditable())
            return

        navigate('setting')
    }



    const onClickNavigateBlog = async() => {

        if(!user)
            return
                
        navigate('/blog/' + user.blog_id)
    }

    const onResultCreate = async(result) =>{

        if(!result)
            return

        if(!isEditable())
            return
        
        if(!user)
            return

        if(user.blog_id != null)
            return
        
        const payload = {
            user_id:auth.user_id
        }

        const res = await BlogAPI.postBlog(auth.jwt, payload)

        if(res == null){
            window.showToast('블로그 개설에 실패하였습니다', 'error')
            return
        }
        
        window.showToast('블로그 개설에 성공하였습니다', 'info')
        auth.blog_id = res.id
        updateAuth(auth)
        navigate('/blog/' + auth.blog_id)
    }


    const onClickCreateBlog = async() => {

        setIsCreateBlogModalOpen(true)        
    }


    return user ? (
      <div style={{position:'relative', alignItems:'center', display:'flex', flexDirection:'column'}}>
        <label style={{marginBottom:'10px'}}>{user.nickname}</label>
        <LoadingImage src={user.image} width={profileWidth} height={profileHeight}/>
        {user.blog_id && <BeautyButton onClick={onClickNavigateBlog} type='success'>블로그 구경하기</BeautyButton>}
        {!user.blog_id && validAuth(auth) && auth.user_id == user_id && <BeautyButton onClick={onClickCreateBlog} type='success'>블로그 개설하기</BeautyButton>}
        <Modal title={'블로그를 개설하시겠습니까?'} type={'yesno'} isOpen={isCreateBlogModalOpen} onResult={onResultCreate} onClose={()=>setIsCreateBlogModalOpen(false)}></Modal>

        {isEditable() && <BeautyButton onClick={onClickNavigateProfile} type='default'>회원 정보 수정</BeautyButton>}
      </div>) : <OverlayLoading/>
}

