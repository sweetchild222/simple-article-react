
import axios from 'axios';

import AuthContext from "../../util/AuthContext.js";
import React, { useContext, useEffect, useState} from 'react';


import * as UserAPI from '../../api/UserAPI.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as blobToBase64 from '../../util/BlobToBase64.js'
import { useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../../util/Validator.js'

import BeautyButton from '../../common/BeautyButton.js';
import GoBack from '../../common/GoBack.js';

export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [isLoading, setIsLoading] = useState(false)
    
    const navigate = useNavigate()

    const location = useLocation()
    
    const relogin = location.state != null && location.state.relogin == true

    useEffect(() => {

        if(validAuth(auth)){
            
            if(!relogin)
                navigate('/')
        }        

    }, [auth])

  
    const onClickLogin = async() => {

        const username = input_username.value
        const password = input_password.value
        
        //const username = 'crazygun22@nate.com'
        //const username = 'sweetchild22.ik@gmail.com'
        //const password = 'Sweetchild@22'

        if(username === ''){
            input_username.focus()
            return
        }
        
        if(password === ''){
            input_password.focus()
            return
        }
        
        setIsLoading(true)

        const resAuth = await UserAPI.postAuthenticate(username, password)
        
        if(resAuth == null) {
            setIsLoading(false)
            window.showToast('로그인이 실패하였습니다', 'error')
            return
        }

        setIsLoading(false)
        
        updateAuth(resAuth)

        window.showToast('로그인이 성공하였습니다', 'success')
        
        if(relogin)
            navigate(-1)
    }


    const onKeyDownPassword = async(event)=>{

        if (event.key === 'Enter')
            await onClickLogin()
    }


    const onKeyDownUserName = async(event)=>{

        if (event.key === 'Enter')
            input_password.focus()
    }
    

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <label htmlFor='input_username'>사용자 이름</label>
            <input id='input_username' type='text' defaultValue={'crazygun22@nate.com'} onKeyDown={onKeyDownUserName} maxLength={254}/>
            <label htmlFor='input_password'>비밀번호</label>
            <input id='input_password' type='password' defaultValue={'Sweetchild@22'} onKeyDown={onKeyDownPassword} maxLength={254}/>
            <BeautyButton onClick={onClickLogin}  isLoading={isLoading} type='success'>로그인</BeautyButton>
            {!relogin && <BeautyButton onClick={() => {navigate('regist', {replace:true})}}>회원가입</BeautyButton>}
        </div>
    )
}

