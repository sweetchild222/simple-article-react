import React from "react";
import axios from 'axios';

import {useContext, useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AuthContext from "../util/AuthContext.js";

import * as api from '../util/Api.js'
import * as validator from '../util/Validator.js'

export default function() {

  const navigate = useNavigate();
  const {auth, updateAuth, validAuth} = useContext(AuthContext)

  const [passwordValid, setPasswordValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    
    if(validAuth(auth))
        navigate('/home', {replace:true})

  }, [auth]);

  
  useEffect(() => {

    if(isVerified == true){
      input_email.disabled = true
      input_verifyCode.disabled = true
      btn_requestVerify.disabled = true
      btn_sendVerifyCode.disabled = true
    }
    else
      btn_regist.disabled = true

  }, [isVerified])



  const onClickSendVerifyCode = async() => {

    const email = input_email.value
    
    if(!validator.email(email)){
      window.showToast('잘못된 형식의 이메일', 'error')
      return
    }
    
    btn_sendVerifyCode.disabled = true
    input_email.disabled = true

    const success = await sendVerifyCodeCore(email);

    btn_sendVerifyCode.disabled = false
    input_email.disabled = false

    if(!success)
      window.showToast('인증 코드 발송 실패', 'error')
    else
      window.showToast('인증 코드 발송 성공', 'success')
  }


  const sendVerifyCodeCore = async(email) => {
    
    const resExist = await api.getExistUser(email)

    if(resExist == null)
      return false

    if(resExist.exist == 1){
      window.showToast('이미 존재하는 사용자', 'error')
      return false
    }

    const resVerifyEmail =  await api.postVerifyEmail(email)

    return (resVerifyEmail != null)
  }


  const onClickRequestVerify = async() => {
    
    const email = input_email.value
    
    if(!validator.email(email)){
      window.showToast('잘못된 형식의 이메일', 'error')
      return
    }

    const verifyCode = input_verifyCode.value

    if(!validator.verifyCode(verifyCode)){
      window.showToast('잘못된 형식의 인증 코드', 'error')      
      return
    }
    
    btn_requestVerify.disabled = true
    input_verifyCode.disabled = true

    const success = await requestVerify(email, verifyCode)

    btn_requestVerify.disabled = false
    input_verifyCode.disabled = false

    if(success)
      window.showToast('인증 성공', 'success')
    else
      window.showToast('인증 실패', 'error')
    
    setIsVerified(success)
  }


  const requestVerify = async(email, verifyCode) => {

    const resVerifyEmail = await api.getVerifyEmail(email, verifyCode)

    if(resVerifyEmail == null)
      return false
        
    return resVerifyEmail.match
  }


  const onClickRegist = async() => {

    const email = input_email.value
    const password = input_password.value

    if(!(validator.email(email) && validator.password(password)))
      return
    
    btn_regist.disabled = true

    const auth = await regist(email, password)

    btn_regist.disabled = false

    if(auth == null){
      window.showToast('회원 가입 실패', 'error')
      return
    }
                
    updateAuth(auth)
    window.showToast('회원 가입 성공', 'success')
  }

  
  const regist = async(email, password) => {
      
    const resExist = await api.getExistUser(email)

    if(resExist == null)
      return null

    if(resExist.exist == 1){
      window.showToast('이미 존재하는 사용자', 'error')
      return null
    }

    const resUser = await api.postUser(email, password)

    if(resUser == null)
      return null
    
    const resAuthenticate = await api.postAuthenticate(email, password)
              
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

    btn_requestVerify.disabled = !valid
  }


  const onChangePassword = (event) => {

    const password =  event.target.value

    const confirm_password = input_confirm_password.value;
    
    const valid = (validator.password(password) && confirm_password === password)

    setPasswordValid(valid)

    if(isVerified == true)
      btn_regist.disabled = !valid    
  }


  const onChangeConfirmPassword = (event) => {

    const confirm_password =  event.target.value

    const password = input_password.value;

    const valid = (validator.password(password) && confirm_password === password)

    setPasswordValid(valid)
  
    if(isVerified == true)
      btn_regist.disabled = !valid
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <input id='input_email' type="text" maxLength="254" onChange={onChangeEmail} placeholder="이메일"/>
        <button id='btn_sendVerifyCode' onClick={onClickSendVerifyCode}>인증 번호 발송</button>          
      </div>

      <input id='input_verifyCode' type="number" maxLength="6" onChange={onChangeVerifyCode} placeholder="인증 코드"/>
      <button id='btn_requestVerify'  onClick={onClickRequestVerify}>인증 번호 확인</button>
      <label>{isVerified ? '인증 완료' : '미 인증'}</label>

      <div style={{height:100}}></div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <input id='input_password' type="text" onChange={onChangePassword} placeholder="비밀번호 (8~20자)"/>          
      </div>
      <input id='input_confirm_password' type="text" onChange={onChangeConfirmPassword} placeholder="비밀번호 확인"/>        
      <label>비밀번호 조건: 소문자, 대문자, 숫자, 특수문자 각 1개 이상 포함</label>
      <label>{passwordValid ? '유효한 패스워드' : '무효한 패스워드'}</label>
      <button id='btn_regist' onClick={onClickRegist}>회원 가입</button>

      <div style={{height:30}}></div>
    </div>
  );
}


