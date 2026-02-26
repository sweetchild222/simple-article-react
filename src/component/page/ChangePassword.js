import {useContext, useEffect } from "react";
import * as api from '../util/Api.js'
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import * as validator from '../util/Validator.js'
import AuthContext from "../util/AuthContext.js";
import BeautyButton from '../common/BeautyButton.js';


export default function() {

    const {auth, validAuth} = useContext(AuthContext)

    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate();

    useEffect(()=>{

        if(!validAuth(auth))
             navigate('/login', {replace:true})

    },[auth])


    const onClickPasswordChange = async()=>{
        
        const current_password = input_current_password.value;
        const new_password = input_new_password.value
        const repeat_password = input_repeat_password.value

        if(current_password == ''){
            input_current_password.focus()
            window.showToast('기존 비밀번호를 입력하세요', 'error')
            return
        }

        if(new_password == ''){
            input_new_password.focus()
            window.showToast('새 비밀번호를 입력하세요', 'error')
            return
        }

        if(repeat_password == ''){
            input_repeat_password.focus()
            window.showToast('새 비밀번호 확인을 입력하세요', 'error')
            return
        }

        if(new_password != repeat_password){
            window.showToast('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다', 'error')
            return
        }

        const valid = (validator.password(new_password))

        if(valid == false) {
            window.showToast('새 비밀번호가 조건에 맞지 않습니다', 'error')
            return
        }

        setIsLoading(true)
        input_current_password.disabled = true
        input_new_password.disabled = true
        input_repeat_password.disabled = true
        
        const result = await passwordChange(current_password, new_password)

        input_current_password.disabled = false
        input_new_password.disabled = false
        input_repeat_password.disabled = false
        setIsLoading(false)

        if(result == null){
            window.showToast('비밀번호 변경이 실패하였습니다', 'error')
            return
        }

        navigate(-1)

        window.showToast('비밀번호 변경이 성공하였습니다', 'success')
    }
    

    const passwordChange = async(current_password, new_password)=>{
        
        const resPasswordCheck = await api.getUserPasswordCheck(auth.jwt, auth.user_id, current_password)

        if(resPasswordCheck == null)
            return null
        
        if(resPasswordCheck.correct == false)
            return null

        const payload = {password: new_password}

        const resUser = await api.patchUser(auth.jwt, auth.user_id, payload)

        if(resUser == null)
            return null

        return resUser
    }

    
    const onKeyDownRepeat = (event) =>{

        if (event.key === 'Enter')
            onClickPasswordChange()
    }


    const onKeyDownCurrent = (event) =>{

        if (event.key === 'Enter')
            input_new_password.focus()
    }


    const onKeyDownNew = (event) =>{

        if (event.key === 'Enter')
            input_repeat_password.focus()
    }


    return validAuth(auth) ? (

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <label htmlFor='input_current_password'>기존 비밀번호</label>
        <input id='input_current_password' type='text' onKeyDown={onKeyDownCurrent}/>
        <label>비밀번호 조건: 8자 ~ 20자 사이 문자열로 영어소문자, 영어대문자, 숫자, 특수문자 포함</label>
        <label htmlFor='input_new_password' >새 비밀번호</label>
        <input id='input_new_password' type='text' onKeyDown={onKeyDownNew}/>
        <label htmlFor='input_repeat_password'>새 비밀번호 확인</label>
        <input id='input_repeat_password' type='text' onKeyDown={onKeyDownRepeat}/>
        <BeautyButton type="confirm" isLoading={isLoading} onClick={onClickPasswordChange}>비밀번호 변경</BeautyButton>
      </div>
    ) : null
}

