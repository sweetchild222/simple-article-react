import {useState, useContext, useEffect, useRef} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import AuthContext from "@util/AuthContext.js";

import * as UserAPI from '@rest/UserAPI.js'
import * as BlobAPI from '@rest/BlobAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'

import ImagePicker from "@util/ImagePicker.js";
import PrettyButton from '@gui/PrettyButton.js';
import Spinner from '@gui/Spinner.js';
import Modal from '@gui/Modal.js';
import PasswordModal from './PasswordModal.js';
import {blobFromCanvas} from "@util/ImageUtil.js";
import ImageCropModal from '@gui/ImageCropModal.js'
import ProfileImage from '@gui/ProfileImage.js'
import {Vertical, Horizental} from "@gui/Flex.js";
import * as validator from './Validator.js'
import { LuImageUp } from "react-icons/lu";
import Integer from "@util/Integer.js";


export default function() {
    
    const {auth, updateAuth, validAuth, reloadAuth, removeAuth} = useContext(AuthContext)
    const [isModalLogout, setIsModalLogout] = useState(false)
    const [isModalPassword, setIsModalPassword] = useState(false)
    const [isModalWithdraw, setIsModalWithdraw] = useState(false)    
    
    const [isModalNickname, setIsModalNickname] = useState(false)    
    const [isModalImageCrop, setIsModalImageCrop] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [user, setUser] = useState(null)

    const profileSize = 256
    const refImageCrop = useRef(null)
    const navigate = useNavigate() 

    const { id } = useParams()

    const user_id = Integer(id)

    useEffect(()=> {

        if(!validAuth(auth)){
            navigate('/')
            return
        }

        if(user_id != auth.user_id){
            navigate('/')
            return
        }

        UserAPI.getUser(auth.user_id).then((resUser)=> {
            
            if(resUser.success == false)
                return

            setUser(resUser.payload)
        })

    }, [auth])
            

    const onResultLogout = (result) => {

        if(result == true){
            removeAuth()
            window.showToast('로그 아웃이 성공하였습니다', 'info')
            navigate('/')
        }
    }


    const onClickLogout = ()=> {

        setIsModalLogout(true)
    }


    const onClickPassword = ()=>{
        
        setIsModalPassword(true)
    }


    const onClickUserWithdraw = async() => {

        setIsModalWithdraw(true)
    }


    const onClickUserNickname = async() =>{

        setIsModalNickname(true)
    }


    const onClickProfile = async() =>{

        const imageFile = await ImagePicker()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'user-error')
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

        const dWidth = profileSize
        const dHeight = profileSize

        const canvas = await refImageCrop.current.export(dWidth, dHeight)
        
        const blob = await blobFromCanvas(canvas)

        const formData = new FormData()
        formData.append('image', blob)
        
        const resProfile = await BlobAPI.postProfile(auth.jwt, formData)

        if(resProfile.success == false){
            setIsModalImageCrop(false)
            window.showToast('프로필 설정에 실패하였습니다', 'system-error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/profile/' + resProfile.payload.id

        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, {image: url})

        if(resUser.success == false){
            setIsModalImageCrop(false)
            window.showToast('프로필 설정에 실패하였습니다', 'system-error')
            return
        }        
    
        user.image = url
        setUser(structuredClone(user))
        
        setIsModalImageCrop(false)

        reloadAuth(auth)
    }


    const onInputPasswordForUser = async(input) => {

        if(!validAuth(auth))
            return

        if(input == ''){
            window.showToast('현재 비밀번호를 입력하세요', 'user-error')
            return
        }        
        
        if(validator.password(input) == false) {
            window.showToast('비밀번호가 틀렸습니다', 'user-error')
            return
        }

        const res = await withdraw(input)

        if(res.success == false){
            window.showToast('회원 탈퇴가 실패하였습니다', 'system-error')
            return
        }

        window.showToast('회원 탈퇴가 성공하였습니다', 'info')

        removeAuth()

        setUser(null)

        navigate('/')
    }


    const onInputNickname = async(input) => {
        
        if(!validAuth(auth))
            return

        if(input == ''){
            window.showToast('닉네임을 입력하세요', 'user-error')
            return
        }

        if(input == user.nickname)
            return
        
        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, {nickname: input})

        if(resUser.success == false) {
            window.showToast('닉네임 수정에 실패하였습니다', 'system-error')
            return
        }        

        window.showToast('닉네임 수정 되었습니다', 'info')

        user.nickname = input
        setUser(structuredClone(user))
        
        reloadAuth(auth)
    }



    const withdraw = async(password) => {

        if(!validAuth(auth))
            return
    
        const resPasswordCheck = await UserAPI.getUserPasswordCheck(auth.jwt, auth.user_id, password)

        if(resPasswordCheck.success == false)
            return null

        if(resPasswordCheck.payload.correct == false)
            return null

        const payload = {withdraw:true}

        return await UserAPI.patchUser(auth.jwt, auth.user_id, payload)
    }

    
    
    return user ? (
      <Vertical style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
        <div style={{position:'relative'}} onClick={onClickProfile}>
            <ProfileImage user={user} size={256}/>
            <Horizental style={{position:'absolute', zIndex:1, inset: 0, backgroundColor:'rgba(0, 0, 0, 0.4)', color:'white', borderRadius:'3px', justifyContent:'end', alignItems:'end'}}>
                <LuImageUp size={64}/>
            </Horizental>
        </div>
        
        {imageFile && isModalImageCrop && <ImageCropModal ref={refImageCrop} isOpen={isModalImageCrop} onClose={()=>setIsModalImageCrop(false)} file={imageFile} onClickApply={onClickApply} keepRatio={1}></ImageCropModal>}
        <div style={{height:'16px'}}/>
        <Vertical>
            <Modal title={'닉네임을 입력하세요'} type={'input'} isCloseOutsideClick={false} defaultValue={user.nickname} maxLength={50} isOpen={isModalNickname} onClose={()=>setIsModalNickname(false)} onInput={onInputNickname}/>
            <PrettyButton onClick={onClickUserNickname} type='default'>닉네임 설정</PrettyButton>            
            <div style={{height:'16px'}}/>
            <PrettyButton onClick={onClickPassword} type='default'>비밀번호 변경</PrettyButton>
            <Modal type={'custom'} isOpen={isModalPassword} onClose={()=>setIsModalPassword(false)} isCloseOutsideClick={false}>
                <PasswordModal onClose={() => setIsModalPassword(false)}/>
            </Modal>            
            <div style={{height:'16px'}}/>
            <PrettyButton onClick={onClickLogout} type='warning'>로그아웃</PrettyButton>
            <Modal title={'로그아웃 하시겠습니까?'} type={'yesno'} isOpen={isModalLogout} onResult={onResultLogout} onClose={()=>setIsModalLogout(false)}></Modal>
            <div style={{height:'16px'}}/>            
            <Modal title={'패스워드를 입력하세요'} description={user.blog_id ? '회원을 탈퇴하더라도 블로그는 남습니다' : null} type={'input'} isCloseOutsideClick={false} maxLength={20} isOpen={isModalWithdraw} onClose={()=>setIsModalWithdraw(false)} onInput={onInputPasswordForUser}/>
            <PrettyButton onClick={onClickUserWithdraw} type='danger'>회원 탈퇴</PrettyButton>
        </Vertical>
      </Vertical>) : <Spinner/>
}

