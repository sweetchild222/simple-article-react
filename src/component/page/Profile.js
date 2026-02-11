import axios from 'axios';

import React, {useContext, useEffect, useRef } from "react";


import * as api from '../tool/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../tool/Validator.js'

import AuthContext from "../tool/AuthContext.js";
import ProfileContext from "../tool/ProfileContext.js";
import Modal, {Type} from "../common/Modal.js"



export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, removeProfile} = useContext(ProfileContext)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const img_profile = useRef(null)

    const navigate = useNavigate()

    useEffect(()=>{

        if(!validAuth(auth)){
             navigate('/login', {replace:true})
             return
        }

    },[auth])


    const modal_config = {text: '로그 아웃?', type: Type.yesno}

    const onYesNo = (yes) => {

        if(yes == true){

            removeAuth()
            removeProfile()
            window.showToast('logout 완료', 'success')
        }
    }


    const onClickLogout = ()=>{

        setIsModalOpen(true)
    }


    const onClickPasswordChange = ()=>{

        navigate('/password')
    }


    const onClickUserWithdraw = async() =>{

        navigate('/widthdraw')
    }

    const onClickProfile = async() =>{
        
        navigate('/image_region')
    }

    return validAuth(auth) ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img ref={img_profile} alt='logo image' src={profile} onClick={onClickProfile} height='256px' width='256px'/>
        <button id="btn_logout" onClick={onClickLogout} >로그아웃</button>
        <Modal config={modal_config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}></Modal>
        <button id="btn_passwordChange" onClick={onClickPasswordChange} >비밀번호 변경</button>
        <button id="btn_withdraw" onClick={onClickUserWithdraw} >회원 탈퇴</button>        
      </div>
    ) : null
}

