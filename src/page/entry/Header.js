import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import ProfileContext from "../../util/ProfileContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";

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

        navigate("/login")
    }


    const onClickUser = (e) =>{


        if(validAuth(auth))
            navigate('/user')
        else
            navigate('/login')


    }


    const onClickSearch = (e) => {

    }


    const onClickHome = (e) =>{

        navigate('/');
    }


    return (
            <div style={{ display: 'flex', alignItems: 'center', padding:'10px 10px 10px 10px', backgroundColor:' #494D5F'}}>
                <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickHome}/>
                <div style={{flexGrow:1, backgroundColor:'blue'}} ></div>
                <BeautyButton  type='success' onClick={onClickSearch} style={{margin:'0px 5px 0 5px'}}>검색</BeautyButton>
                <input id="search" placeholder="검색" maxLength="256" style={{width:'300px', minWidth:'50px', margin:'0px 5px 0 5px'}} onKeyDown={onKeyDown}></input>
                <div style={{margin:'0px 5px 0 5px', width:'64px'}}>
                    {!isLoggedIn && <BeautyButton type='confirm' onClick={onClickLogIn}>로그인</BeautyButton>}
                    {isLoggedIn && <LoadingImage src={profile} height={64} width={64} borderWidth={0} borderRadius={32} onClick={onClickUser}/>}
                </div>
            </div>
    );    
}
