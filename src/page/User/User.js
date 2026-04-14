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
import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import { Outlet, Link } from 'react-router-dom';
import ImageCropModal from '../../common/ImageCropModal.js'



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
            
            if(profile == null)
                window.showToast('프로필 가져오기가 실패하였습니다', 'error')
            else
                setProfileImage(profile)
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
            
            const canvas = await ImageScale(imageFile.file, 4096, 4096, 512, 512)

            if(canvas == null){
                window.showToast('파일을 사용할 수 없습니다', 'error')
                return
            }
        
            setImageFile(await blobFromCanvas(canvas))
            
            setIsImageCropModalOpen(true)        
        }
        else{

            setImageFile(imageFile.file)

            setIsImageCropModalOpen(true)
        }
    }



    const canvasToFormData = async(canvas) =>{


    }


    const onClickApply = async() => {

        const rect = refImageCrop.current.rect()
        const image = refImageCrop.current.image()

        const dWidth = 256
        const dHeight = 256

        const canvas = await drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, dWidth, dHeight)
        
        const blob = await blobFromCanvas(canvas)

        const formData = new FormData()
        formData.append('image', blob)
        
        const resProfile = await BlobAPI.postProfile(auth.jwt, formData)

        if(resProfile == null){
            setIsImageCropModalOpen(false)
            window.showToast('프로필 설정에 실패했습니다', 'error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/profile/' + resProfile.id
            
        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, {profile: url})

        if(resUser == null){
            setIsImageCropModalOpen(false)
            window.showToast('프로필 설정에 실패했습니다', 'error')
            return
        }

        const profileId = resProfile.id + '?size=64x64'
        const profile = await BlobAPI.getProfile(auth.jwt, profileId)
    
        if(profile == null){
            setIsImageCropModalOpen(false)
            window.showToast('프로필을 가져 올 수 없습니다', 'error')
            return
        }

        setProfileImage(url)
        updateProfile(url + '?size=64x64')
        setIsImageCropModalOpen(false)
    }


    return validAuth(auth) ? (
      <div id='profile'>
        <LoadingImage src={profileImage} onClick={onClickProfile} width={256} height={256}/>
        {imageFile && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickApply} keepRatio={1}></ImageCropModal>}
        <BeautyButton onClick={onClickLogout} type='warning'>로그아웃</BeautyButton>
        <Modal config={modal_config} isOpen={isModalOpen} onResult={onResult} onClose={()=>setIsModalOpen(false)}></Modal>
        <BeautyButton onClick={onClickPasswordChange} type='default'>비밀번호 변경</BeautyButton>
        <BeautyButton onClick={onClickUserWithdraw} type='danger'>회원 탈퇴</BeautyButton>
      </div>
    ) : (<GoLogin/>)
}

