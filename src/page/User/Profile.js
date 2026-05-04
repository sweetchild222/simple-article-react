import '../../common/RotateLoading.css'
import LoadingImage from "../../common/LoadingImage.js";

import {useContext, useEffect, useRef } from "react";

import * as UserAPI from '../../api/UserAPI.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as blobToBase64 from '../../util/BlobToBase64.js'
import { useState } from 'react';

import AuthContext from "../../util/AuthContext.js";
import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";

import Modal from "../../common/Modal.js"
import GoLogin from "../../common/GoLogin.js";

import BeautyButton from '../../common/BeautyButton.js';
import Password from './Password.js';
import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import { Outlet, Link } from 'react-router-dom';
import ImageCropModal from '../../common/ImageCropModal.js'
import * as validator from '../../util/Validator.js'

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useBlocker, useParams} from 'react-router-dom';
import PageNotFound from '../entry/PageNotFound.js';

export default function() {
    
    const {auth, updateAuth, validAuth, reloadAuth, removeAuth} = useContext(AuthContext)    
    const [isModalLogout, setIsModalLogout] = useState(false)
    const [isModalPassword, setIsModalPassword] = useState(false)
    const [isModalWithdraw, setIsModalWithdraw] = useState(false)
    const [isModalNickname, setIsModalNickname] = useState(false)
    const [profileImage, setProfileImage] = useState(null)
    const [isModalImageCrop, setIsModalImageCrop] = useState(false)
    const [imageFile, setImageFile] = useState(null)

    const [nickname, setNickname] = useState(null)

    const refImageCrop = useRef(null)

    const navigate = useNavigate()
    
    const isAuthUser = (validAuth(auth))

    useEffect(()=> {

        if(!validAuth(auth)){
            navigate('/')
            return
        }

        UserAPI.getUser(auth.user_id).then((resUser)=> {
            
            if(resUser == null)
                return

            setProfileImage(resUser.image ?  resUser.image : '/image/user.png')

            setNickname(resUser.nickname)            
        })

    }, [auth])
            

    const onResultLogout = (result) => {

        if(result == true){
            removeAuth()            
            window.showToast('로그 아웃이 성공하였습니다', 'success')
            navigate('/')
        }
    }


    const onClickLogout = ()=> {

        setIsModalLogout(true)
    }


    const onClickPassword = ()=>{
        
        setIsModalPassword(true)
    }


    const onClickUserWithdraw = async() =>{

        setIsModalWithdraw(true)
    }


    const onClickUserNickname = async() =>{

        setIsModalNickname(true)
    }


    const onClickProfile = async() =>{

        const imageFile = await pickImageFile()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }

        setImageFile(imageFile.file)
        setIsModalImageCrop(true)        
    }


    const onClickApply = async() => {

        if(!validAuth(auth))            
            return        

        if(!refImageCrop.current)
            return

        const dWidth = 256
        const dHeight = 256

        const canvas = await refImageCrop.current.export(dWidth, dHeight)
        
        const blob = await blobFromCanvas(canvas)

        const formData = new FormData()
        formData.append('image', blob)
        
        const resProfile = await BlobAPI.postProfile(auth.jwt, formData)

        if(resProfile == null){
            setIsModalImageCrop(false)
            window.showToast('프로필 설정에 실패했습니다', 'error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/profile/' + resProfile.id

        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, {image: url})

        if(resUser == null){
            setIsModalImageCrop(false)
            window.showToast('프로필 설정에 실패했습니다', 'error')
            return
        }
        
        setProfileImage(url + '?size=256x256')
        setIsModalImageCrop(false)

        reloadAuth(auth)
    }


    const onInputPassword = async(input) => {

        if(input == ''){
            window.showToast('현재 비밀번호를 입력하세요', 'error')
            return
        }        
        
        if(validator.password(input) == false) {
            window.showToast('비밀번호가 틀렸습니다', 'error')
            return
        }

        const res = await withdraw(input)

        if(res == null){
            window.showToast('회원 탈퇴가 실패하였습니다', 'error')
            return
        }

        window.showToast('회원 탈퇴가 성공하였습니다', 'error')

        removeAuth()        

        navigate('/')
    }




    const onInputNickname = async(input) => {
        
        if(!validAuth(auth))
            return

        if(input == ''){
            window.showToast('닉네임을 입력하세요', 'error')
            return
        }


        if(input == nickname)
            return
        
        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, {nickname: input})

        if(resUser == null) {
            window.showToast('닉네임 수정에 실패 했습니다', 'error')
            return
        }        

        window.showToast('닉네임 수정에 성공했습니다', 'info')
                
        setNickname(input)        

        reloadAuth(auth)
    }



    const withdraw = async(password) => {

        if(!validAuth(auth))
            return
    
        const resPasswordCheck = await UserAPI.getUserPasswordCheck(auth.jwt, auth.user_id, password)

        if(resPasswordCheck == null)
            return null

        if(resPasswordCheck.correct == false)
            return null

        const payload = {withdraw:true}

        return await UserAPI.patchUser(auth.jwt, auth.user_id, payload)
    }

    
    return isAuthUser ? (
      <div style={{position:'relative', alignItems:'center', display:'flex', flexDirection:'column'}}>
        <LoadingImage src={profileImage} onClick={onClickProfile} width={256} height={256}/>
        {imageFile && isModalImageCrop && <ImageCropModal ref={refImageCrop} isOpen={isModalImageCrop} onClose={()=>setIsModalImageCrop(false)} file={imageFile} onClickApply={onClickApply} keepRatio={1}></ImageCropModal>}
        <BeautyButton onClick={onClickLogout} type='warning'>로그아웃</BeautyButton>
        <Modal title={'로그아웃 하시겠습니까?'} type={'yesno'} isOpen={isModalLogout} onResult={onResultLogout} onClose={()=>setIsModalLogout(false)}></Modal>
        <BeautyButton onClick={onClickPassword} type='default'>비밀번호 변경</BeautyButton>
        <Modal type={'custom'} isOpen={isModalPassword} onClose={()=>setIsModalPassword(false)}>
            <Password onClose={() => setIsModalPassword(false)}/>
        </Modal>
        <Modal title={'패스워드를 입력하세요'} type={'input'} isCloseOutsideClick={false} maxLength={20} isOpen={isModalWithdraw} onClose={()=>setIsModalWithdraw(false)} onInput={onInputPassword}/>
        <BeautyButton onClick={onClickUserWithdraw} type='danger'>회원 탈퇴</BeautyButton>
        <Modal title={'닉네임을 입력하세요'} type={'input'} isCloseOutsideClick={false} defaultValue={nickname} maxLength={50} isOpen={isModalNickname} onClose={()=>setIsModalNickname(false)} onInput={onInputNickname}/>
        <BeautyButton onClick={onClickUserNickname} type='success'>닉네임 설정</BeautyButton>
      </div>) : null
}

