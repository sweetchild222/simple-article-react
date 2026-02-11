import axios from 'axios';

import React, {useContext, useEffect, useRef } from "react";


import * as api from '../tool/Api.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../tool/Validator.js'

import AuthContext from "../tool/AuthContext.js";
import Modal, {Type} from "../common/Modal.js"



export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const profile = useRef(null)


    //const [profileUrl, setProfileUrl] = useState('/image/user.png');


    const navigate = useNavigate()

    useEffect(()=>{

        if(!validAuth(auth)){
             navigate('/login', {replace:true})
             return
        }

        console.log('zzz')

        api.getUser(auth.jwt, auth.user_id).then((payload) =>{

            if(payload == null)
                return
            
            if(payload.profile == null)
                profile.current.src = '/image/user.png'
            else{
    
                const id = payload.profile + '?size=256x256'

                console.log(id)

                api.getProfile(auth.jwt, id).then((payload) => {
                    
                    if(payload == null)
                        return
                                        
                    profile.current.src = URL.createObjectURL(payload)
                })
            }
        })

    },[auth])




    


    useEffect(()=>{


        console.log('adsfaf')



    })

    const modal_config = {text: '로그 아웃?', type: Type.yesno}

    const onYesNo = (yes) => {

        if(yes == true){

            removeAuth()
            window.showToast('logout 완료', 'success')
        }
    }


    const onClickLogout = ()=>{

        setIsModalOpen(true)
    }


    const onClickPasswordChange = ()=>{

        navigate('/password')
    }


    const onClickUserWithdraw = async() =>{

        navigate('/widthdraw')
    }

    return validAuth(auth) ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img ref={profile} alt='logo image' src='/image/user.png' height='256px' width='256px'/>
        <button id="btn_logout" onClick={onClickLogout} >로그아웃</button>
        <Modal config={modal_config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}></Modal>
        <button id="btn_passwordChange" onClick={onClickPasswordChange} >비밀번호 변경</button>
        <button id="btn_withdraw" onClick={onClickUserWithdraw} >회원 탈퇴</button>        
      </div>
    ) : null
}

