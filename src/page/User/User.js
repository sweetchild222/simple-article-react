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
import ProfileImage from "../../common/ProfileImage.js";

export default function() {

    const { id } = useParams()
    const user_id = parseInt(id)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [user, setUser] = useState(null)
        
    const navigate = useNavigate()
    
    useEffect(()=> {

        if(!validUserId(user_id)){
            navigate('/pageNotFound')
            return
        }


        UserAPI.getUser(user_id).then((res)=>{

            if(res == null){
                navigate('/pageNotFound')
                return
            }

            setUser(res)
        })

    }, [user_id])



    const isEditable = () => {

        return (validAuth(auth) && auth.user_id == user_id)
    }


    const validUserId = (user_id) =>{

        if(user_id == null)
            return false
        
        if(!Number.isInteger(user_id))
            return false

        return true
    }


    const onClickNavigateProfile = async() =>{

        if(!isEditable())
            return

        navigate('profile')
    }



    const onClickNavigateBlog = async() => {

        if(!user)
            return
        
        navigate('/blog/' + user.blog_id)
    }


    return validUserId(user_id) ? (
      <div style={{position:'relative', alignItems:'center', display:'flex', flexDirection:'column'}}>
        <label style={{marginBottom:'10px'}}>{user ? user.nickname : '...'}</label>
        <LoadingImage src={user ? user.image : null} width={256} height={256}/>
        <BeautyButton onClick={onClickNavigateBlog} type='success'>블로그 구경하기</BeautyButton>
        {isEditable() && <BeautyButton onClick={onClickNavigateProfile} type='default'>회원 정보 수정</BeautyButton>}
      </div>) : null
}

