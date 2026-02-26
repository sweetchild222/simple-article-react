import './Profile.css'
import './RotateLoading.css'

import {useContext, useEffect, useRef } from "react";
import * as api from '../util/Api.js'
import * as blobToBase64 from '../util/BlobToBase64.js'
import { useState } from 'react';
import { useNavigate} from 'react-router-dom';

import AuthContext from "../util/AuthContext.js";
import ProfileContext from "../util/ProfileContext.js";
import Modal from "../common/Modal.js"
import BeautyButton from '../common/BeautyButton.js';


export default function() {

    const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, removeProfile} = useContext(ProfileContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [profileHigh, setProfileHigh] = useState(transparent)
    const [isLoading, setIsLoading] = useState(true)

    const coverRef = useRef(null)

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
            
            if(profile == null)
                window.showToast('프로필 가져오기가 실패하였습니다', 'error')
            else
                setProfileHigh(profile)

            setIsLoading(false)
        })
    }, [auth])
    
    const modal_config = {text: '로그 아웃 하시겠습니까?', type: 'yesno'}

    const onYesNo = (yes) => {

        if(yes == true){
            removeAuth()
            removeProfile()
            window.showToast('로그 아웃이 성공하였습니다', 'success')
        }
    }


    const onClickLogout = ()=>{

        setIsModalOpen(true)
    }


    const onClickPasswordChange = ()=>{

        navigate('/changePassword')
    }


    const onClickUserWithdraw = async() =>{

        navigate('/widthdraw')
    }


    const selectFile = async() => {

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
            return await fileHandle.getFile()
        }
        catch(error) {
            return null
        }
    }


    const onClickProfile = async() =>{

        const file = await selectFile()

        if(file == null)
            return

        try{

            const format = await getImageFormat(file)

            if(format == 'unknown') {
                window.showToast('파일을 사용할 수 없습니다', 'error')
                return
            }
                                          
            navigate('/profile_region', {state: file})
        }
        catch(error) {

            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
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
                    resolve('image/gif')
                else
                    resolve('unknown')
            }

            reader.onerror = (event) => {
                reject('error')
            }

            reader.readAsArrayBuffer(file.slice(0, 4))
        })
    }


    return validAuth(auth) ? (
      <div id='profile'>
        <div id='cover' ref={coverRef} className={`${isLoading ? 'rotateLoading': ''}`}  style={{width:'256px', height:'256px'}}>            
            <img alt='image' src={profileHigh} onClick={onClickProfile} style={{borderRadius:'1px'}}/>
        </div>
        <BeautyButton onClick={onClickLogout} type='warning'>로그아웃</BeautyButton>
        <Modal config={modal_config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}></Modal>
        <BeautyButton onClick={onClickPasswordChange} type='default'>비밀번호 변경</BeautyButton>
        <BeautyButton onClick={onClickUserWithdraw} type='danger'>회원 탈퇴</BeautyButton>
      </div>
    ) : null
}

