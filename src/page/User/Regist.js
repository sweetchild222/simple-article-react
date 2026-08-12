import {useContext, useEffect, useState} from 'react';
import { useNavigate, useLocation} from 'react-router-dom';

import * as RegistAPI from '@rest/RegistAPI.js'
import * as UserAPI from '@rest/UserAPI.js'
import * as validator from './Validator.js'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from "@gui/PrettyButton.js";
import GoBack from "@page/common/GoBack.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";

export default function() {

  const navigate = useNavigate();
  const {auth, updateAuth, validAuth} = useContext(AuthContext)  

  const [passwordValid, setPasswordValid] = useState(false);
  const [isCertified, setIsCertified] = useState(false)

  const [isLoadingSendCode, setIsLoadingSendCode] = useState(false)
  const [isDisabledSendCode, setIsDisabledSendCode] = useState(false)
  const [isLoadingCertify, setIsLoadingCertify] = useState(false)
  const [isLoadingRegist, setIsLoadingRegist] = useState(false)  

  const location = useLocation()
  const comback = location.state != null && location.state.comback == true

  
  const onClickSendCertifyCode = async() => {

    const email = input_email.value
    
    if(!validator.email(email)){
      input_email.focus()
      window.showToast('잘못된 형식의 이메일입니다', 'user-error')
      return
    }

    setIsLoadingSendCode(true)
    input_email.disabled = true
    const success = await sendCertifyCodeCore(email);
    setIsLoadingSendCode(false)
    input_email.disabled = false

    if(success)
      window.showToast('인증 코드 발송이 성공하였습니다', 'info')    
    else
      window.showToast('인증 코드 발송이 실패하였습니다', 'system-error')      
  }


  const sendCertifyCodeCore = async(email) => {
    
    const resExist = await RegistAPI.getExistUser(email)

    if(resExist.success == false)
      return false

    if(resExist.payload.exist == 1){
      window.showToast('이미 가입한 사용자입니다', 'user-error')
      return false
    }

    const resCerify =  await RegistAPI.postCertifyUserJoin(email)

    return resCerify.success
  }


  const onClickRequestCertify = async() => {
    
    const email = input_email.value
    
    if(!validator.email(email)){
      input_email.focus()
      window.showToast('잘못된 형식의 이메일입니다', 'user-error')
      return
    }

    const certifyCode = input_certifyCode.value

    if(!validator.certifyCode(certifyCode)){
      input_certifyCode.focus()
      window.showToast('인증 코드를 잘못 입력하였습니다', 'user-error')
      return
    }
    
    setIsLoadingCertify(true)
    setIsLoadingSendCode(true)
    input_certifyCode.disabled = true

    const success = await requestCertify(email, certifyCode)
    
    input_certifyCode.disabled = false
    setIsLoadingSendCode(false)
    setIsLoadingCertify(false)

    if(success)
      window.showToast('인증에 성공하였습니다', 'info')
    else
      window.showToast('인증에 실패하였습니다', 'system-error')
    
    setIsCertified(success)
  }


  const requestCertify = async(email, certifyCode) => {

    const resEmail = await RegistAPI.patchCertifyUserJoin(email, certifyCode)

    if(resEmail.success == false)
      return false
        
    return resEmail.payload.match
  }


  const onClickRegist = async() => {

    const email = input_email.value
    const password = input_password.value

    if(!(validator.email(email) && validator.password(password)))
      return

    setIsLoadingRegist(true)
    
    const auth = await regist(email, password)

    setIsLoadingRegist(false)
        
    if(auth == null){      
      window.showToast('회원 가입이 실패하였습니다', 'system-error')
      return
    }

    if(!(Object.hasOwn(auth, "jwt") && Object.hasOwn(auth, "user_id"))){

      window.showToast('회원 가입이 실패하였습니다', 'system-error')
      return
    }

    updateAuth(auth)
    
    window.showToast('회원 가입이 성공하였습니다', 'info')
    
    navigate(comback == true ? -1 : '/')
  }


  const getRandomUnsignedInt = (min, max) => {

    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  
  const randomProfile = () =>{    

    const staticProfile = ['bear', 'tiger', 'sheep', 'boar', 'elephant', 'lion', 'sheep', 'rhino', 'cat']
    
    const randomIndex = getRandomUnsignedInt(0, staticProfile.length - 1)    

    return staticProfile[randomIndex]
  }

  
  const regist = async(email, password) => {
      
    const resExist = await RegistAPI.getExistUser(email)

    if(resExist.success == false)
      return null

    if(resExist.payload.exist == 1){
      window.showToast('이미 존재하는 사용자입니다', 'user-error')
      return null
    }
    
    const random = randomProfile()    
    
    const image = process.env.API_TARGET + '/api/blob/profile/' + random + '.webp'
    const nickname = random + ' ' +  Math.floor(Math.random() * 1001)

    const resUser = await RegistAPI.postUser(email, password, image, nickname)

    if(resUser.success == false)
      return null
    
    const resAuthenticate = await UserAPI.postAuthenticate(email, password)
              
    if(resAuthenticate.success == false)
      return null

    if(resUser.payload.id != resAuthenticate.payload.user_id)
      return null

    return resAuthenticate.payload
  }


  const onChangeEmail = (event) => {

    input_certifyCode.value = ''
  }


  const onChangePassword = (event) => {

    const password =  event.target.value

    const confirm_password = input_confirm_password.value;
    
    const valid = (validator.password(password) && confirm_password === password)

    setPasswordValid(valid)    
  }


  const onChangeConfirmPassword = (event) => {

    const confirm_password =  event.target.value

    const password = input_password.value;

    const valid = (validator.password(password) && confirm_password === password)

    setPasswordValid(valid)
  }

  return !validAuth(auth) ? (
    <Vertical style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
      <Vertical>
      <Horizental style={{ alignItems: 'center', width:'100%'}}>
        <input id={'input_email'} disabled={isCertified} type={'text'} onChange={onChangeEmail} placeholder="이메일" maxLength={50} style={{flex:'1', boxSizing:'border-box'}}/>
        <HPad size={8}/>
        <PrettyButton isLoading={isLoadingSendCode} type='success' disabled={isCertified} onClick={onClickSendCertifyCode}>인증 번호 발송</PrettyButton>
      </Horizental>
      <VPad size={8}/>
      <Horizental style={{ alignItems: 'center', width:'100%'}}>
        <input id={'input_certifyCode'} type={'number'} disabled={isCertified} placeholder="인증 코드" style={{flex:'1', boxSizing:'border-box'}}/>
        <HPad size={8}/>
        <PrettyButton isLoading={isLoadingCertify} type='success' disabled={isCertified} onClick={onClickRequestCertify}>인증 번호 확인</PrettyButton>
      </Horizental>
      <VPad size={16}/>
      <Vertical style={{ alignItems: 'center', width:'100%'}}>
        <input id='input_password' type="text" disabled={!isCertified} onChange={onChangePassword} placeholder="비밀번호 (8~20자)" maxLength={20} style={{width:'100%', boxSizing:'border-box'}}/>
        <VPad size={8}/>
        <input id='input_confirm_password' type="text" disabled={!isCertified} onChange={onChangeConfirmPassword} placeholder="비밀번호 확인" maxLength={20} style={{width:'100%', boxSizing:'border-box'}}/>
        <div style={{color:'darkgray', fontStyle:'italic', fontSize:'14px'}}>8~20자 사이 영어 문자열로 대소문자, 숫자, 특수문자 포함</div>
      </Vertical>      
      <VPad size={16}/>
      <PrettyButton isLoading={isLoadingRegist} disabled={!(isCertified && passwordValid)} onClick={onClickRegist} type='success' style={{width:'100%', boxSizing:'border-box'}}>회원 가입</PrettyButton>
    </Vertical>
    </Vertical>
  ) : (<GoBack value={'로그인된 사용자는 접근 할 수 없습니다'}/>)
}
