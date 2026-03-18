import axios from 'axios';


import {useState, useContext, useEffect} from "react";
import { useNavigate } from 'react-router-dom';


import * as UserAPI from '../api/UserAPI.js'
import AuthContext from "../util/AuthContext.js";
import ProfileContext from "../util/ProfileContext.js";
import Modal from "../common/Modal.js"
import BeautyButton from '../common/BeautyButton.js';

export default function() {
    
    const {auth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate();

    const modal_config = {text: '회원 탈퇴를 하시겠습니까?', type: 'yesno', isCloseOutsideClick: true}

    useEffect(()=>{

        if(!validAuth(auth))
             navigate('/login', {replace:true})
        
    },[auth])

    
    const onClickUserWithdraw = async()=> {

        const password = input_widthdraw_password.value

        if(password == ''){
            window.showToast('현재 비밀번호를 입력하세요', 'error')
            return
        }

        setIsModalOpen(true)
    }


    const onResult = async(result) => {

        if(result == false)
            return

        const password = input_widthdraw_password.value

        if(password == ''){
            window.showToast('현재 비밀번호를 입력하세요', 'error')
            return
        }

        setIsLoading(true)

        const resultWidthdraw = await userWithdraw(password)

        setIsLoading(false)

        if(resultWidthdraw == null){
            window.showToast('회원 탈퇴가 실패하였습니다', 'error')
            return
        }
        
        removeAuth()
        removeProfile()

        window.showToast('회원 탈퇴가 성공하였습니다', 'success')
    }

    
    const userWithdraw = async(password) => {
    
        const resPasswordCheck = await UserAPI.getUserPasswordCheck(auth.jwt, auth.user_id, password)

        if(resPasswordCheck == null)
            return null

        if(resPasswordCheck.correct == false)
            return null

        const payload = {withdraw:true}

        return await UserAPI.patchUser(auth.jwt, auth.user_id, payload)
    }


    return validAuth(auth) ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label htmlFor='input_widthdraw_password'>비밀번호</label>
        <input id='input_widthdraw_password' type='text'/>
        <BeautyButton onClick={onClickUserWithdraw} isLoading={isLoading}>회원탈퇴</BeautyButton>
        <Modal config={modal_config} isOpen={isModalOpen} onResult={onResult} onClose={()=>setIsModalOpen(false)}></Modal>
      </div>
    ) : null
}
