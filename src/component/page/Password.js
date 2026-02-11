import axios from 'axios';

import React, {useContext, useEffect } from "react";


import * as api from '../tool/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../tool/Validator.js'
import AuthContext from "../tool/AuthContext.js";


export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const navigate = useNavigate();

    useEffect(()=>{

        if(!validAuth(auth))
             navigate('/login', {replace:true})
            
    },[auth])

    const onClickPasswordChange = async(event)=>{

        const current_password = input_current_password.value;
        const new_password = input_new_password.value
        const repeat_password = input_repeat_password.value

        if(current_password == '' || new_password == '' || repeat_password == '')
            return

        const valid = (validator.password(new_password) && new_password === repeat_password)

        if(valid == false)
            return

        btn_passwordChange.disabled = true

        const result = await passwordChange(current_password, new_password)

        btn_passwordChange.disabled = false

        if(result == null){
            window.showToast('비밀번호 변경 실패', 'error')
            return
        }

        navigate(-1)

        window.showToast('비밀번호 변경 완료', 'success')
    }
    

    const passwordChange = async(current_password, new_password)=>{
        
        const resPasswordCheck = await api.getUserPasswordCheck(auth.jwt, auth.user_id, current_password)

        if(resPasswordCheck == null)
            return null
        
        if(resPasswordCheck.correct == false)
            return null

        const payload = {password: new_password}

        const resUser = await api.patchUser(auth.jwt, auth.user_id, payload)

        if(resUser == null)            
            return null

        return resUser
    }


    return validAuth(auth) ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <label htmlFor='input_current_password'>Password</label>
        <input id='input_current_password' type='text'/>

        <label htmlFor='input_new_password'>New Password</label>
        <input id='input_new_password' type='text'/>

        <label htmlFor='input_repeat_password'>Repeat Password</label>
        <input id='input_repeat_password' type='text'/>

        <button id='btn_passwordChange' onClick={onClickPasswordChange}>비밀번호 변경</button>
      </div>
    ) : null
}

