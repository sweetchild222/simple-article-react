import {useContext, useEffect, useState} from 'react';
import { useNavigate, useLocation} from 'react-router-dom';

import * as RegistAPI from '@rest/RegistAPI.js'
import * as UserAPI from '@rest/UserAPI.js'
import * as validator from './Validator.js'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from "@gui/PrettyButton.js";
import GoBack from "@page/common/GoBack.js";
import {Vertical, Horizental} from "@gui/Flex.js";

export default function() {

  const navigate = useNavigate();
  const {auth, updateAuth, validAuth} = useContext(AuthContext)  

  const [passwordValid, setPasswordValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false)
  const [isLoadingSendCode, setIsLoadingSendCode] = useState(false)
  const [isDisabledSendCode, setIsDisabledSendCode] = useState(false)

  const [isLoadingVerify, setIsLoadingVerify] = useState(false)
  const [isDisabledVerify, setIsDisabledVerify] = useState(false)

  const [isLoadingRegist, setIsLoadingRegist] = useState(false)
  const [isDisabledRegist, setIsDisabledRegist] = useState(false)

  const location = useLocation()
  const comback = location.state != null && location.state.comback == true

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

    if(resExist.success == false)
      return false

    if(resExist.payload.exist == 1){
      window.showToast('이미 가입한 사용자입니다', 'error')
      return false
    }

    const resVerifyEmail =  await RegistAPI.postVerifyEmail(email)

    return resVerifyEmail.success
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

    if(resVerifyEmail.success == false)
      return false
        
    return resVerifyEmail.payload.match
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
      window.showToast('회원 가입이 실패하였습니다', 'error')
      return
    }

    if(!(Object.hasOwn(auth, "jwt") && Object.hasOwn(auth, "user_id"))){

      window.showToast('회원 가입이 실패하였습니다', 'error')
      return
    }

    updateAuth(auth)
    
    window.showToast('회원 가입이 성공하였습니다', 'success')
    
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
      window.showToast('이미 존재하는 사용자입니다', 'error')
      return null
    }

    
    const random = randomProfile()
    const timestamp = Date.now()
    
    const image = process.env.API_TARGET + '/api/blob/profile/' + random + '.webp'
    const nickname = random + ' ' + timestamp

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
    <Vertical style={{alignItems: 'center' }}>
      <Horizental style={{ alignItems: 'center' }}>
        <input id='input_email' type="text" maxLength="254" onChange={onChangeEmail} placeholder="이메일" maxLength={254}/>
        <PrettyButton isLoading={isLoadingSendCode} disabled={isDisabledSendCode} onClick={onClickSendVerifyCode}>인증 번호 발송</PrettyButton>
      </Horizental>

      <input id='input_verifyCode' type="number" maxLength="6" onChange={onChangeVerifyCode} placeholder="인증 코드"/>
      <PrettyButton isLoading={isLoadingVerify} disabled={isDisabledVerify} onClick={onClickRequestVerify}>인증 번호 확인</PrettyButton>
      <label>{isVerified ? '인증 완료' : '미 인증'}</label>

      <div style={{height:100}}></div>
      <Horizental style={{alignItems: 'center' }}>
        <input id='input_password' type="text" onChange={onChangePassword} placeholder="비밀번호 (8~20자)" maxLength={20}/>
      </Horizental>
      <input id='input_confirm_password' type="text" onChange={onChangeConfirmPassword} placeholder="비밀번호 확인" maxLength={20}/>
      <label>비밀번호 조건: 소문자, 대문자, 숫자, 특수문자 각 1개 이상 포함</label>
      <label>{passwordValid ? '유효한 패스워드' : '무효한 패스워드'}</label>
      <PrettyButton isLoading={isLoadingRegist} disabled={isDisabledRegist} onClick={onClickRegist} type='confirm'>회원 가입</PrettyButton>
    </Vertical>
  ) : (<GoBack value={'로그인된 사용자는 접근 할 수 없습니다'}/>)
}
