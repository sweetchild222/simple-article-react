
import axios from 'axios';

import AuthContext from "../util/AuthContext.js";
import ProfileContext from "../util/ProfileContext.js";
import React, { useContext, useEffect, useState} from 'react';

import * as api from '../util/Api.js'
import * as blobToBase64 from '../util/BlobToBase64.js'
import { useNavigate} from 'react-router-dom';
import * as validator from '../util/Validator.js'

import BeautyButton from '../common/BeautyButton.js';

export default function() {

    const {auth, updateAuth, validAuth} = useContext(AuthContext)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
    const [isLoading, setIsLoading] = useState(false)
    
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

        if(username === ''){
            input_username.focus()
            return
        }
        
        if(password === ''){
            input_password.focus()
            return
        }

        setIsLoading(true)

        const resAuth = await api.postAuthenticate(username, password)
        
        if(resAuth == null) {
            setIsLoading(false)            
            window.showToast('로그인이 실패하였습니다', 'error')
            return
        }
        
        const resUser = await api.getUser(resAuth.jwt, resAuth.user_id)
        
        if(resUser == null) {
            setIsLoading(false)
            window.showToast('로그인이 실패하였습니다', 'error')
            return
        }

        if(resUser.profile == null){            
            removeProfile()
            updateAuth(resAuth)
            setIsLoading(false)
            window.showToast('로그인이 성공하였습니다', 'success')
            return
        }

        const profileId = resUser.profile + '?size=64x64'

        const resProfile = await api.getProfile(resAuth.jwt, profileId)

        setIsLoading(false)
        
        if(resProfile == null){
            window.showToast('로그인이 실패하였습니다', 'error')
            return
        }

        const base64 = await blobToBase64.convert(resProfile)
        updateProfile(base64)
        updateAuth(resAuth)
        window.showToast('로그인이 성공하였습니다', 'success')
    }


    const onKeyDownPassword = async(event)=>{
        if (event.key === 'Enter')
            await onClickLogin()
    }


    const onKeyDownUserName = async(event)=>{

        if (event.key === 'Enter')
            input_password.focus()

    }
    

    return !validAuth(auth) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label htmlFor='input_username'>사용자 이름</label>
            <input id='input_username' type='text' onKeyDown={onKeyDownUserName}/>
            <label htmlFor='input_password'>비밀번호</label>
            <input id='input_password' type='password' onKeyDown={onKeyDownPassword}/>
            <BeautyButton onClick={onClickLogin}  isLoading={isLoading} type='success'>로그인</BeautyButton>
            <BeautyButton onClick={() => {navigate('/regist', {replace:true})}}>회원가입</BeautyButton>
        </div>
    ) : null
}
