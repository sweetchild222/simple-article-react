import './Profile.css'
import './RotateLoading.css'

import {useContext, useEffect, useRef } from "react";

import * as UserAPI from '../api/UserAPI.js'
import * as BlobAPI from '../api/BlobAPI.js'
import * as blobToBase64 from '../util/BlobToBase64.js'
import { useState } from 'react';
import { useNavigate} from 'react-router-dom';

import AuthContext from "../util/AuthContext.js";
import {pickImage, getImageFormat} from "../util/ImagePicker.js";
import ProfileContext from "../util/ProfileContext.js";
import Modal from "../common/Modal.js"

import BeautyButton from '../common/BeautyButton.js';
import ImageScale from "../util/ImageScale.js";


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

        const resUser = await UserAPI.getUser(auth.user_id)

        console.log(resUser)
                
        if(resUser == null)
            return null

        if(resUser.profile == null)
            return '/image/user.png'

        const profileId = resUser.profile + '?size=256x256'

        const resProfile = await BlobAPI.getProfile(auth.jwt, profileId)

        if(resProfile == null){
            return '/image/user.png'
        }

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
    
    const modal_config = {text: '로그 아웃 하시겠습니까?', type: 'yesno', isCloseOutsideClick: true}

    const onResult = (result) => {

        if(result == true){
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


    const onClickProfile = async() =>{

        const file = await pickImage()

        if(file == null)
            return

        try{

            const format = await getImageFormat(file)

            if(format == 'unknown') {
                window.showToast('파일을 사용할 수 없습니다', 'error')
                return
            }

            if(file.size > 1000 * 1000 * 30) { //downscaling to smooth moving region select on large file

                const canvas = await ImageScale(file, 4096, 4096, 512, 512)

                if(canvas == null)
                    return
                
                const blob = await getBlob(canvas)
                
                navigate('/profile_region', {state: blob})
            }
            else{
                navigate('/profile_region', {state: file})
            }
        }
        catch(error) {

            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }
    }


      const getBlob = (canvas) => {
    
        return new Promise((resolve) => {
    
          canvas.toBlob((blob) => {
    
              resolve(blob)

          })
        })
      }


    return validAuth(auth) ? (
      <div id='profile'>
        <div id='cover' ref={coverRef} onClick={onClickProfile} className={`${isLoading ? 'rotateLoading': ''}`}  style={{width:'256px', height:'256px'}}>
            <img alt='image' src={profileHigh}  style={{borderRadius:'1px'}}/>
        </div>
        <BeautyButton onClick={onClickLogout} type='warning'>로그아웃</BeautyButton>
        <Modal config={modal_config} isOpen={isModalOpen} onResult={onResult} onClose={()=>setIsModalOpen(false)}></Modal>
        <BeautyButton onClick={onClickPasswordChange} type='default'>비밀번호 변경</BeautyButton>
        <BeautyButton onClick={onClickUserWithdraw} type='danger'>회원 탈퇴</BeautyButton>
      </div>
    ) : null
}

