import React, {useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as api from '../tool/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../tool/AuthContext.js";
import ProfileContext from "../tool/ProfileContext.js";

export default function() {

    const {auth, updateAuth, validAuth} = useContext(AuthContext)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
        
    const navigate = useNavigate()

    useEffect(() => {

        setIsLoggedIn(validAuth(auth))

    }, [auth])


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



    const onClickSearch = (e) => {

    }


    const onClickHome = (e) =>{

        navigate('/home');
    }


    return (
        <div style={{ display: 'flex', alignItems: 'center', height:'64px', backgroundColor: 'gray', paddingLeft:'30px'}}>
        <img src='/image/logo.svg' alt='logo image' height='100%' width='64px' onClick={onClickHome}/>
        <div style={{flexGrow:1, backgroundColor:'green'}} ></div>
        <input id="myInput" placeholder="검색" style={{color:'green', height:'50px', width:'100px'}} onKeyDown={onKeyDown}></input>
        <button style={{backgroundColor:'red',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={onClickSearch}>검색</button>
        {!isLoggedIn && <button style={{backgroundColor:'red',  whiteSpace: 'nowrap', textAlign: 'center', flexGrow:0, margin:'10px', padding:'10px'}} onClick={onClickLogIn}>로그인</button>}
        {isLoggedIn && <img src={profile} height='100%' width='64px' onClick={onClickProfile}/>}
        
        </div>
    );    
}
