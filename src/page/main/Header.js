import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import ProfileImage from "../../common/ProfileImage.js";
import BeautyButton from "../../common/BeautyButton.js";

export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [reloadKey, setReloadKey] = useState(0)
    const [loggedUserId, setLoggedUserId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        
        if(validAuth(auth)){
            setLoggedUserId(auth.user_id)
            setReloadKey(prev => prev + 1)
        }
        else
            setLoggedUserId(null)

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
        else{            
            navigate('/login')
        }
    }


    const onClickSearch = (e) => {

    }


    const onClickHome = (e) =>{

        navigate('/')
    }
        

    return (
            <div style={{ display: 'flex', alignItems: 'center', padding:'10px 10px 10px 10px', backgroundColor:' #494D5F'}}>
                <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickHome}/>
                <div style={{flexGrow:1, backgroundColor:'blue'}} />
                <BeautyButton  type='success' onClick={onClickSearch} style={{margin:'0px 5px 0 5px'}}>검색</BeautyButton>
                <input id="search" placeholder="검색" maxLength="256" style={{width:'300px', minWidth:'50px', margin:'0px 5px 0 5px'}} onKeyDown={onKeyDown} ></input>
                <div style={{margin:'0px 0px 0px 10px', width:'64px'}}>
                    {!loggedUserId && <BeautyButton type='confirm' onClick={onClickLogIn}>로그인</BeautyButton>}
                    {loggedUserId && <ProfileImage key={reloadKey} userId={loggedUserId} onClick={onClickUser}/>}
                </div>
            </div>
    )
}
