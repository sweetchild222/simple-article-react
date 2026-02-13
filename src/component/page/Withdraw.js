import axios from 'axios';

import React, {useContext, useEffect } from "react";


import * as api from '../tool/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../tool/Validator.js'

import AuthContext from "../tool/AuthContext.js";
import Modal from "../common/Modal.js"


export default function() {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const navigate = useNavigate();

    const modal_config = {text: '회원 탈퇴?', type: 'yesno'}

    useEffect(()=>{

        if(!validAuth(auth))
             navigate('/login', {replace:true})
        
    },[auth])

    
    const onClickUserWithdraw = async(event)=> {

        const password = input_widthdraw_password.value

        if(password == '')
            return

        setIsModalOpen(true)
    }


    const onYesNo = async(yes) => {

        if(yes == false)
            return

        const password = input_widthdraw_password.value

        if(password == '')
            return

        btn_widthdraw.disabled = true

        const result = await userWithdraw(password)

        btn_widthdraw.disabled = false

        if(result == null){
            window.showToast('회원 탈퇴 실패', 'error')
            return
        }
        
        removeAuth()

        window.showToast('회원 탈퇴 완료', 'success')
    }

    
    const userWithdraw = async(password) => {
    
        const resPasswordCheck = await api.getUserPasswordCheck(auth.jwt, auth.user_id, password)

        if(resPasswordCheck == null)
            return null

        if(resPasswordCheck.correct == false)
            return null

        const payload = {withdraw:true}

        return await api.patchUser(auth.jwt, auth.user_id, payload)
    }


    return validAuth(auth) ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label htmlFor='input_widthdraw_password'>{'비밀번호'}</label>
        <input id='input_widthdraw_password' type='text'/>
        <button id='btn_widthdraw' onClick={onClickUserWithdraw} >회원탈퇴</button>
        <Modal config={modal_config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}></Modal>
      </div>
    ) : null
}
