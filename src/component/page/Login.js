
import axios from 'axios';

import AuthContext from "../util/AuthContext.js";
import ProfileContext from "../util/ProfileContext.js";
import React, { useContext, useState, useEffect} from 'react';

import * as api from '../util/Api.js'
import * as blobToBase64 from '../util/BlobToBase64.js'
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import * as validator from '../util/Validator.js'

export default function() {

    const {auth, updateAuth, validAuth} = useContext(AuthContext)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
    
    const navigate = useNavigate();

    useEffect(() => {
        
        if(validAuth(auth))
            navigate('/home', {replace:true})

    }, [auth])

  
    const onClickLogin = async() => {

        //const username = input_username.value
        //const password = input_password.value
        
        const username = 'crazygun22@nate.com'
        const password = 'Sweetchild@22'
                
        if(!validator.email(username)){
            input_username.focus()
            return
        }
        
        if(!validator.password(password)){
            input_password.focus()
            return
        }

        btn_login.disabled = true

        const resAuth = await api.postAuthenticate(username, password)
        
        if(resAuth == null) {
            btn_login.disabled = false
            window.showToast('login 실패', 'error')
            return
        }
        
        const resUser = await api.getUser(resAuth.jwt, resAuth.user_id)
        
        if(resUser == null) {
            btn_login.disabled = false
            window.showToast('login 실패', 'error')
            return
        }

        if(resUser.profile == null){
            btn_login.disabled = false
            removeProfile()
            updateAuth(resAuth)
            window.showToast('login 완료', 'success')
            return
        }

        const profileId = resUser.profile + '?size=64x64'

        const resProfile = await api.getProfile(resAuth.jwt, profileId)

        btn_login.disabled = false
        
        if(resProfile == null){            
            window.showToast('login 실패', 'error')
            return
        }
                
        const base64 = await blobToBase64.convert(resProfile)
        updateProfile(base64)
        updateAuth(resAuth)
        window.showToast('login 완료', 'success')
    }

    const onKeyDownEnter = async(event)=>{
        if (event.key === 'Enter')
            await onClickLogin()
    }
    

    return !validAuth(auth) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label htmlFor='input_username'>Username</label>
            <input id='input_username' type='text'/>
            <label htmlFor='input_password'>Password</label>
            <input id='input_password' type='password' onKeyDown={onKeyDownEnter}/>
            <button id='btn_login' className='theme-btn' onClick={onClickLogin} >로그인</button>
            <button id='btn_regist' onClick={() => {navigate('/regist', {replace:true})}}>회원가입</button>
        </div>
    ) : null
}
