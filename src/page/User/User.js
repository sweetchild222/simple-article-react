import './User.css'
import '../../common/RotateLoading.css'
import LoadingImage from "../../common/LoadingImage.js";

import {useContext, useEffect, useRef } from "react";

import * as UserAPI from '../../api/UserAPI.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as blobToBase64 from '../../util/BlobToBase64.js'
import { useState } from 'react';
import { useNavigate} from 'react-router-dom';

import AuthContext from "../../util/AuthContext.js";
import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";
import ProfileContext from "../../util/ProfileContext.js";
import Modal from "../../common/Modal.js"
import GoLogin from "../../common/GoLogin.js";

import BeautyButton from '../../common/BeautyButton.js';
import ImageScale, {getBlob} from "../../util/ImageScale.js";
import { Outlet, Link } from 'react-router-dom';
import ImageCropModal from '../../common/ImageCropModal.js'

import { PiTrash } from "react-icons/pi";


export default function() {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [profileImage, setProfileImage] = useState(null)
    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)
    const [imageFile, setImageFile] = useState(null)

    const refImageCrop = useRef(null)

    const navigate = useNavigate()

    const getHighQualityProfile = async(auth) =>{

        const resUser = await UserAPI.getUser(auth.user_id)

        if(resUser == null)
            return null

        if(resUser.profile == null)
            return '/image/user.png'
        

        return resUser.profile
    }

    useEffect(()=>{

        if(!validAuth(auth)){
            navigate(-1)
            return
        }
        
        getHighQualityProfile(auth).then((profile)=>{

            console.log(profile)
            
            if(profile == null)
                window.showToast('프로필 가져오기가 실패하였습니다', 'error')
            else
                setProfileImage('aa')
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

        //setIsModalOpen(true)

        setProfileImage('http://13.124.193.201:8080/api/blob/profile/20260407051945-752ae5d6-354b-4beb-b1d3-1b78c0229047.png')
    }


    const onClickPasswordChange = ()=>{

        navigate('change_password')
    }


    const onClickUserWithdraw = async() =>{

        navigate('widthdraw')
    }


    const onClickProfile = async() =>{
        
        const imageFile = await pickImageFile()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }

        if(imageFile.file.size > 1000 * 1000 * 30) { //downscaling to smooth moving region select on large file

            const blob = await ImageScale(imageFile.file, 4096, 4096, 512, 512)

            setImageFile(blob)
            
            setIsImageCropModalOpen(true)
        }
        else{

            setImageFile(imageFile.file)

            setIsImageCropModalOpen(true)
        }
    }



    const canvasToFormData = async(canvas) =>{

        const blob = await getBlob(canvas)

        const formData = new FormData()
        formData.append('image', blob)

        return formData
    }


    const onClickApply = async(rect) => {

        if(rect == null)
            return

        const image = refImageCrop.current.image()

        const canvasWidth = 256
        const canvasHeight = 256

        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        const ctx = canvas.getContext('2d')

        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, canvasWidth, canvasHeight)

        const formData = await canvasToFormData(canvas)

        const resProfile = await BlobAPI.postProfile(auth.jwt, formData)

        if(resProfile == null)
            return

        const url = process.env.API_TARGET + '/api/blob/profile/' + resProfile.id
            
        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, {profile: url})

        if(resUser == null)
            return

        const profileId = resProfile.id + '?size=64x64'
        const profile = await BlobAPI.getProfile(auth.jwt, profileId)
    
        if(profile == null)
            return

        setProfileImage(url)
        updateProfile(url + '?size=64x64')
        setIsImageCropModalOpen(false)
    }


    return validAuth(auth) ? (
      <div id='profile'>
        <LoadingImage src={profileImage} onClick={onClickProfile} width={256} height={256}/>
        {imageFile && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickApply}></ImageCropModal>}
        <BeautyButton onClick={onClickLogout} type='warning'>로그아웃</BeautyButton>
        <Modal config={modal_config} isOpen={isModalOpen} onResult={onResult} onClose={()=>setIsModalOpen(false)}></Modal>
        <BeautyButton onClick={onClickPasswordChange} type='default'>비밀번호 변경</BeautyButton>
        <BeautyButton onClick={onClickUserWithdraw} type='danger'>회원 탈퇴</BeautyButton>
      </div>
    ) : (<GoLogin/>)
}

