import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import * as UserAPI from '../../api/UserAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import ProfileImage from "../../common/ProfileImage.js";
import BeautyButton from "../../common/BeautyButton.js";

export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [reloadKey, setReloadKey] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {

        if(validAuth(auth))
            setReloadKey(prev => prev + 1)

    }, [auth])



    const onKeyDown = (e) => {

        if(e.key === 'Enter')
            onClickSearch(inputElement.value)
    }


    const onClickLogIn = (e) =>{

        navigate("/account")
    }


    const onClickUser = (e) =>{

        if(validAuth(auth))
            navigate('/user/' + auth.user_id)
        else
            navigate('/account')
    }


    const onClickSearch = (e) => {

    }


    const onClickHome = (e) =>{

        navigate('/')
    }
    

    return (
            <div style={{ display: 'flex', alignItems: 'center', padding:'10px 10px 10px 10px', backgroundColor:' #494D5F', boxShadow: '0 4px 3px -3px black'}}>
                <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickHome}/>
                <div style={{flexGrow:1, backgroundColor:'blue'}} />
                <BeautyButton  type='success' onClick={onClickSearch} style={{margin:'0px 5px 0 5px'}}>검색</BeautyButton>
                <input id="search" placeholder="검색" maxLength="256" style={{width:'300px', minWidth:'50px', margin:'0px 5px 0 5px'}} onKeyDown={onKeyDown} ></input>
                <div style={{margin:'0px 0px 0px 10px', width:'64px'}}>
                    {!validAuth(auth) && <BeautyButton type='confirm' onClick={onClickLogIn}>로그인</BeautyButton>}
                    {validAuth(auth) && <ProfileImage key={reloadKey} userId={auth.user_id} onClick={onClickUser}/>}
                </div>
            </div>
    )
}
