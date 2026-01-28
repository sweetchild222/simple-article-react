import axios from 'axios';

import React, {useContext, useEffect } from "react";


import * as api from '../util/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../util/Validator.js'

import AuthContext from "../util/AuthContext.js";
import Modal, {Type} from "./Modal.js"


export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(()=>{

        if(!validAuth(auth))
             navigate('/home', {replace:true})        
    },[auth])



    const config = {text: '로그 아웃?', type: Type.yesno}

    const onYesNo = (yes) => {

        if(yes == true){

            removeAuth()
            window.showToast('logout 완료', 'success')
        }
    }


    const onClickLogout = ()=>{

        setIsModalOpen(true)
    }


    const onClickPasswordChange = ()=>{

        navigate('/changePassword')
    }


    const onClickUserWithdraw = async() =>{

        navigate('/widthdraw')
    }


    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/images/user.png" alt='logo image' height='100px' width='100px'/>
        <button id="btn_logout" onClick={onClickLogout} >로그아웃</button>
        <Modal config={config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}></Modal>
        <button id="btn_passwordChange" onClick={onClickPasswordChange} >비밀번호 변경</button>
        <button id="btn_withdraw" onClick={onClickUserWithdraw} >회원 탈퇴</button>

        
      </div>
    );  
}

