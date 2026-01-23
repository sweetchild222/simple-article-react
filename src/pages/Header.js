import React, {useContext, useEffect } from "react";
import axios from 'axios';

import * as api from '../util/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import AuthContext from "../util/AuthContext.js";

export default function ({onClickSearch}) {

    const {auth, updateAuth, removeAuth} = useContext(AuthContext)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        
        if(auth == null)
            console.log('nononononon')

        if(auth === ''){
            console.log('empty')
            setIsLoggedIn(false)
            return
        }

        if(Date.now() > auth.expire_time){
            removeAuth()
            setIsLoggedIn(false)            
            console.log('exptime')
            return
        }

        setIsLoggedIn(true)

    }, [auth]);


    useEffect(() => {

        if(isLoggedIn){

            api.getUser(auth.user_id, auth.jwt).then((payload) =>{

                if(payload == null)
                    return

                console.log(payload)
            })        
        }


    }, [isLoggedIn])


    const onKeyDown = (e) => {

        

        if(e.key === 'Enter')
            onClickSearch(inputElement.value)
    }


    const onClickLogIn = (e) =>{

        navigate("/login", {state: false})
    }


    const onClickLogOut = (e) =>{

        removeAuth()
        navigate('/home');
    }


    const onClickTest = (e) =>{

        //const key = 'auth'

        //const value = 'close'

        //console.log(storageData)

        removeAuth()

        //localStorage.setItem(key, value);
        //setStorageData(value);

        //setIsLoggedIn(false)
        //console.log('logout')
        
    }


    const searchClick = (e) => {

        const key = 'auth'

        const value = 'close'

        localStorage.setItem(key, value);
        setStorageData(value);
        
        //const inputElement = document.getElementById('myInput');

        //onClickSearch(inputElement.value)
    }


    const goHome = (e) =>{

        navigate('/home');
    }


    return (
        <div style={{ display: 'flex', alignItems: 'center', height:'60px', backgroundColor: 'gray', paddingLeft:'30px'}}>

        <img src="/images/a.jpg" alt='logo image' height='100%' width='60px' onClick={goHome}/>
        <div style={{flexGrow:1, backgroundColor:'green'}} ></div>
        <input id="myInput" placeholder="검색" style={{color:'green', height:'50px', width:'100px'}} onKeyDown={onKeyDown}></input>
        <button style={{backgroundColor:'red',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={searchClick}>검색</button>

        <button style={{backgroundColor:'red',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={onClickTest}>테스트</button>

        {!isLoggedIn && <button style={{backgroundColor:'red',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={onClickLogIn}>로그인</button>}
        {isLoggedIn && <button style={{backgroundColor:'blue',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={onClickLogOut}>로그아웃</button>}
        </div>
    );    
}
