
import axios from 'axios';

import AuthContext from "../tool/AuthContext.js";
import React, { useContext, useState, useEffect} from 'react';

import * as api from '../tool/Api.js'
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import * as validator from '../tool/Validator.js'

export default function() {

    const {auth, updateAuth, validAuth} = useContext(AuthContext)
    
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

        const res = await api.postAuthenticate(username, password)

        btn_login.disabled = false
        
        if(res != null){
            updateAuth(res)        
            window.showToast('login 완료', 'success')
        }
    }

    const onKeyDownEnter = async(event)=>{
        if (event.key === 'Enter')
            await onClickLogin()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label htmlFor='input_username'>Username</label>
            <input id='input_username' type='text'/>
            <label htmlFor='input_password'>Password</label>
            <input id='input_password' type='password' onKeyDown={onKeyDownEnter}/>
            <button id='btn_login' onClick={onClickLogin} >로그인</button>
            <button id='btn_regist' onClick={() => {navigate('/regist', {replace:true})}}>회원가입</button>
        </div>
    );    
}
