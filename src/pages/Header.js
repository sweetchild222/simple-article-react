import React, {useContext, useEffect } from "react";
import axios from 'axios';

import * as api from '../util/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';

import AuthContext from "../util/AuthContext.js";

export default function ({onClickSearch}) {

    const {auth, updateAuth, validAuth} = useContext(AuthContext)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {

        setIsLoggedIn(validAuth(auth))

    }, [auth]);


    useEffect(() => {

        if(isLoggedIn){

            api.getUser(auth.jwt, auth.user_id).then((payload) =>{

                if(payload == null)
                    return

                if(payload.profile == null)
                    img_profile.src = "/images/user.png"
                else
                    img_profile.src = payload.profile

                console.log(payload)
            })
        }

    }, [isLoggedIn])


    const onKeyDown = (e) => {

        if(e.key === 'Enter')
            onClickSearch(inputElement.value)
    }


    const onClickLogIn = (e) =>{

        console.log('asdfasf')

        navigate("/login", {state: false})
    }


    const onClickProfile = (e) =>{

        console.log("go profile")
    
        navigate('/profile');

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
        {!isLoggedIn && <button style={{backgroundColor:'red',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={onClickLogIn}>로그인</button>}
        {isLoggedIn && <img id="img_profile"  height='100%' width='60px' onClick={onClickProfile}/>}
        
        </div>
    );    
}
