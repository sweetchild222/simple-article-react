import axios from 'axios';

import React, {useContext, useEffect } from "react";


import * as api from '../util/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../util/Validator.js'

import AuthContext from "../util/AuthContext.js";


export default function() {

    console.log('home')
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        
        setIsLoggedIn(validAuth(auth))

    }, [auth]);


    useEffect(() => {

        if(!isLoggedIn)
            navigate('/home', {replace:true})

    }, [isLoggedIn])


    

    const onClickPasswordChage = async(event)=>{

        const current_password = input_current_password.value;
        const new_password = input_new_password.value
        const repeat_password = input_repeat_password.value

        if(current_password == '' || new_password == '' || repeat_password == '')
            retrun

        const valid = (validator.password(new_password) && new_password === repeat_password)

        if(valid == false)
            return

        const resPasswordCheck = await api.getUserPasswordCheck(auth.jwt, auth.user_id, current_password)

        if(resPasswordCheck == null)
            return

        if(resPasswordCheck.correct == false)
            return

        const payload = {password: new_password}

        const resUser = await api.patchUser(auth.jwt, auth.user_id, payload)

        if(resUser == null)
            return

        navigate(-1)

        console.log(resUser)
    }


 

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <label htmlFor="input_current_password">Password</label>
        <input id="input_current_password" type="text"/>

        <label htmlFor="input_new_password">New Password</label>
        <input id="input_new_password" type="text"/>

        <label htmlFor="input_repeat_password">Repeat Password</label>
        <input id="input_repeat_password" type="text"/>

        <button id="btn_passwordChange" onClick={onClickPasswordChage} >비밀번호 변경</button>
      </div>
    );  
}

