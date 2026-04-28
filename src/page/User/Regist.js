import React from "react";
import axios from 'axios';

import {useContext, useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import ProfileContext from "../../util/ProfileContext.js";


import * as RegistAPI from '../../api/RegistAPI.js'
import * as UserAPI from '../../api/UserAPI.js'
import * as validator from '../../util/Validator.js'
import BeautyButton from "../../common/BeautyButton.js";
import GoBack from "../../common/GoBack.js";


export default function() {

  const navigate = useNavigate();
  const {auth, updateAuth, validAuth} = useContext(AuthContext)
  const {profile, updateProfile, removeProfile} = useContext(ProfileContext)

  const [passwordValid, setPasswordValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false)
  const [isLoadingSendCode, setIsLoadingSendCode] = useState(false)
  const [isDisabledSendCode, setIsDisabledSendCode] = useState(false)

  const [isLoadingVerify, setIsLoadingVerify] = useState(false)
  const [isDisabledVerify, setIsDisabledVerify] = useState(false)

  const [isLoadingRegist, setIsLoadingRegist] = useState(false)
  const [isDisabledRegist, setIsDisabledRegist] = useState(false)

  useEffect(() => {

    if(isVerified == true){
      input_email.disabled = true
      input_verifyCode.disabled = true
      setIsDisabledVerify(true)
      setIsDisabledSendCode(true)
    }
    else
      setIsDisabledRegist(true)

  }, [isVerified])



  const onClickSendVerifyCode = async() => {

    const email = input_email.value
    
    if(!validator.email(email)){
      input_email.focus()
      window.showToast('잘못된 형식의 이메일입니다', 'error')
      return
    }
    

    setIsLoadingSendCode(true)
    input_email.disabled = true
    const success = await sendVerifyCodeCore(email);
    setIsLoadingSendCode(false)
    input_email.disabled = false

    if(!success)
      window.showToast('인증 코드 발송이 실패하였습니다', 'error')
    else
      window.showToast('인증 코드 발송이 성공하였습니다', 'success')
  }


  const sendVerifyCodeCore = async(email) => {
    
    const resExist = await RegistAPI.getExistUser(email)

    if(resExist == null)
      return false

    if(resExist.exist == 1){
      window.showToast('이미 가입한 사용자입니다', 'error')
      return false
    }

    const resVerifyEmail =  await RegistAPI.postVerifyEmail(email)

    return (resVerifyEmail != null)
  }


  const onClickRequestVerify = async() => {
    
    const email = input_email.value
    
    if(!validator.email(email)){
      input_email.focus()
      window.showToast('잘못된 형식의 이메일입니다', 'error')
      return
    }

    const verifyCode = input_verifyCode.value

    if(!validator.verifyCode(verifyCode)){
      input_verifyCode.focus()
      window.showToast('인증 코드를 잘못 입력하였습니다', 'error')      
      return
    }
    

    setIsLoadingVerify(true)
    setIsLoadingSendCode(true)
    input_verifyCode.disabled = true

    const success = await requestVerify(email, verifyCode)
    
    input_verifyCode.disabled = false
    setIsLoadingSendCode(false)
    setIsLoadingVerify(false)

    if(success)
      window.showToast('인증에 성공하였습니다', 'success')
    else
      window.showToast('인증에 실패하였습니다', 'error')
    
    setIsVerified(success)
  }


  const requestVerify = async(email, verifyCode) => {

    const resVerifyEmail = await RegistAPI.getVerifyEmail(email, verifyCode)

    if(resVerifyEmail == null)
      return false
        
    return resVerifyEmail.match
  }


  const onClickRegist = async() => {

    const email = input_email.value
    const password = input_password.value

    if(!(validator.email(email) && validator.password(password)))
      return

    setIsLoadingRegist(true)

    const auth = await regist(email, password)
        
    if(auth == null){
      setIsLoadingRegist(false)
      window.showToast('회원 가입이 실패하였습니다', 'error')
      return
    }

    updateAuth(auth)    
        
    const resUser = await UserAPI.getUser(auth.user_id)

    setIsLoadingRegist(false)

    if(resUser == null) {
        window.showToast('회원 정보를 가져 올 수 없습니다', 'error')
        return
    }

    window.showToast('회원 가입이 성공하였습니다', 'success')
    
    updateProfile(resUser)
    navigate('/')
  }

  
  const regist = async(email, password) => {
      
    const resExist = await RegistAPI.getExistUser(email)

    if(resExist == null)
      return null

    if(resExist.exist == 1){
      window.showToast('이미 존재하는 사용자입니다', 'error')
      return null
    }

    const resUser = await RegistAPI.postUser(email, password)

    if(resUser == null)
      return null
    
    const resAuthenticate = await UserAPI.postAuthenticate(email, password)
              
    if(resAuthenticate == null)
      return null

    if(resUser.id != resAuthenticate.user_id)
      return null

    return resAuthenticate
  }


  const onChangeEmail = (event) => {

    input_verifyCode.value = ''
  }


  const onChangeVerifyCode = (event) => {

    const verifyCode = event.target.value

    const valid = validator.verifyCode(verifyCode)

    setIsDisabledVerify(!valid)
  }


  const onChangePassword = (event) => {

    const password =  event.target.value

    const confirm_password = input_confirm_password.value;
    
    const valid = (validator.password(password) && confirm_password === password)

    setPasswordValid(valid)

    if(isVerified == true)
      setIsDisabledRegist(!valid)
      
  }


  const onChangeConfirmPassword = (event) => {

    const confirm_password =  event.target.value

    const password = input_password.value;

    const valid = (validator.password(password) && confirm_password === password)

    setPasswordValid(valid)
  
    if(isVerified == true)
      setIsDisabledRegist(!valid)
  }

  return !validAuth(auth) ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <input id='input_email' type="text" maxLength="254" onChange={onChangeEmail} placeholder="이메일"/>
        <BeautyButton isLoading={isLoadingSendCode} disabled={isDisabledSendCode} onClick={onClickSendVerifyCode}>인증 번호 발송</BeautyButton>
      </div>

      <input id='input_verifyCode' type="number" maxLength="6" onChange={onChangeVerifyCode} placeholder="인증 코드"/>
      <BeautyButton isLoading={isLoadingVerify} disabled={isDisabledVerify} onClick={onClickRequestVerify}>인증 번호 확인</BeautyButton>
      <label>{isVerified ? '인증 완료' : '미 인증'}</label>

      <div style={{height:100}}></div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <input id='input_password' type="text" onChange={onChangePassword} placeholder="비밀번호 (8~20자)"/>
      </div>
      <input id='input_confirm_password' type="text" onChange={onChangeConfirmPassword} placeholder="비밀번호 확인"/>
      <label>비밀번호 조건: 소문자, 대문자, 숫자, 특수문자 각 1개 이상 포함</label>
      <label>{passwordValid ? '유효한 패스워드' : '무효한 패스워드'}</label>
      <BeautyButton isLoading={isLoadingRegist} disabled={isDisabledRegist} onClick={onClickRegist} type='confirm'>회원 가입</BeautyButton>
    </div>
  ) : (<GoBack value={'이미 로그인된 사용자입니다'}/>)
}


