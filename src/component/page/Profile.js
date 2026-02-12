import axios from 'axios';

import React, {useContext, useEffect, useRef } from "react";


import * as api from '../tool/Api.js'
import * as blobToBase64 from '../tool/BlobToBase64.js'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as validator from '../tool/Validator.js'

import AuthContext from "../tool/AuthContext.js";
import ProfileContext from "../tool/ProfileContext.js";
import Modal, {Type} from "../common/Modal.js"

export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, removeProfile} = useContext(ProfileContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [profileHigh, setProfileHigh] = useState('/image/user.png')


    const img_profile = useRef(null)

    const navigate = useNavigate()


    const getHighQualityProfile = async(auth) =>{

        const resUser = await api.getUser(auth.jwt, auth.user_id)
                
        if(resUser == null)
            return null

        if(resUser.profile == null)
            return '/image/user.png'

        const profileId = resUser.profile + '?size=256x256'
        
        const resProfile = await api.getProfile(auth.jwt, profileId)

        if(resProfile == null)
            return null

        return await blobToBase64.convert(resProfile)

    }

    useEffect(()=>{

        if(!validAuth(auth)){
            navigate('/login', {replace:true})
            return
        }

        getHighQualityProfile(auth).then((profile)=>{
            setProfileHigh(profile)
        })
    }, [auth])

    const modal_config = {text: '로그 아웃?', type: Type.yesno}

    const onYesNo = (yes) => {

        if(yes == true){
            removeAuth()
            removeProfile()
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

    const onClickProfile = async() =>{

        try{
            const options = {
                types: [{
                    description: 'Images',
                    accept: {'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'], 'image/gif': ['.gif']}}
                ],
                excludeAcceptAllOption: false,
                multiple: false
            }

            const [fileHandle] = await window.showOpenFilePicker(options)
            const file = await fileHandle.getFile()

            const format = await getImageFormat(file)


            if(format == 'unknown' || format == 'error'){

                console.log('unknown')
                return
            }
            else{
                navigate('/image_region', {state: file})
            }
        }
        catch(error){
            console.log(error)
        }
    }


    const getImageFormat = (file) => {

        return new Promise((resolve, reject) => {

            const reader = new FileReader()

            reader.onload = (event) => {

                const bytes = new Uint8Array(event.target.result)

                if (bytes[0] === 0xFF && bytes[1] === 0xD8) 
                    resolve('image/jpeg')
                else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47)
                    resolve('image/png')
                else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
                    resolve('image/gif');
                else
                    reject('unknown')
            }

            reader.onerror = (event) => {
                reject('error')
            }

            reader.readAsArrayBuffer(file.slice(0, 4))
        })
    }

    return validAuth(auth) ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img ref={img_profile} alt='logo image' src={profileHigh} onClick={onClickProfile} height='256px' width='256px'/>
        <button id="btn_logout" onClick={onClickLogout} >로그아웃</button>
        <Modal config={modal_config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}></Modal>
        <button id="btn_passwordChange" onClick={onClickPasswordChange} >비밀번호 변경</button>
        <button id="btn_withdraw" onClick={onClickUserWithdraw} >회원 탈퇴</button>
      </div>
    ) : null
}

