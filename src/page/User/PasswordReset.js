import {useState, useContext, useRef} from "react";

import * as UserAPI from '@rest/UserAPI.js'
import * as RegistAPI from '@rest/RegistAPI.js'
import * as PasswordResetAPI from '@rest/PasswordResetAPI.js'
import * as validator from './Validator.js'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from '@gui/PrettyButton.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import Spinner from "@gui/Spinner.js";


export default function({onClose}) {
    
    const [isLoadingSendCode, setIsLoadingSendCode] = useState(false)    
    const [isLoadingCertify, setIsLoadingCertify] = useState(false)
    const [isLoadingPasswordReset, setIsLoadingPasswordReset] = useState(false)

    const [isCertified, setIsCertified] = useState(false)

    const onChangeEmail = (event) => {

        input_certifyCode.value = ''
    }

    const onClickSendCertifyCode = async() => {

        const email = input_email.value
        
        if(!validator.email(email)){
            input_email.focus()
            window.showToast('잘못된 형식의 이메일입니다', 'user-error')
            return
        }


        const resExist = await RegistAPI.getExistUser(email)

        if(resExist.success == false)
            return

        if(resExist.payload.exist == 0){
            window.showToast('입력한 이메일을 가진 사용자가 없습니다', 'user-error')
            return
        }


        setIsLoadingSendCode(true)
        input_email.disabled = true
        const success = await sendCertifyCodeCore(email);
        setIsLoadingSendCode(false)
        input_email.disabled = false

        if(!success)
            window.showToast('인증 코드 발송이 실패하였습니다', 'system-error')
        else
            window.showToast('인증 코드 발송이 성공하였습니다', 'info')
    }
    

    const sendCertifyCodeCore = async(email) => {
        
        const resCerify =  await PasswordResetAPI.postCertifyPasswordReset(email)

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

        const resEmail = await PasswordResetAPI.patchCertifyPasswordReset(email, certifyCode)

        if(resEmail.success == false)
            return false
            
        return resEmail.payload.match
    }

    const onClickPasswordReset = async() => {

        const email = input_email.value
        
        if(!validator.email(email)){
            input_email.focus()
            window.showToast('잘못된 형식의 이메일입니다', 'user-error')
            return
        }

        setIsLoadingPasswordReset(true)
        
        const res = await PasswordResetAPI.patchPasswordReset(email)

        setIsLoadingPasswordReset(false)
        onClose()

        if(res.success == false){
            window.showToast('임시 비밀 번호 발송에 실패하였습니다', 'system-error')
            return false
        }

        window.showToast('임시 비밀 번호가 발송 되었습니다', 'info')
    }



    return (
        <Vertical>
            <Horizental style={{ alignItems: 'center', width:'100%'}}>
                <input id={'input_email'} type={'text'} onChange={onChangeEmail} disabled={isCertified} placeholder="이메일" maxLength={50} style={{flex:'1', boxSizing:'border-box'}}/>
                <div style={{width:'8px'}}/>
                <PrettyButton isLoading={isLoadingSendCode} disabled={isCertified} onClick={onClickSendCertifyCode}>인증 번호 발송</PrettyButton>
            </Horizental>
            <div style={{height:'8px'}}/>
            <Horizental style={{ alignItems: 'center', width:'100%'}}>
                <input id={'input_certifyCode'} type={'number'} disabled={isCertified} placeholder="인증 코드" style={{flex:'1', boxSizing:'border-box'}}/>
                <div style={{width:'8px'}}/>
                <PrettyButton isLoading={isLoadingCertify} disabled={isCertified} onClick={onClickRequestCertify}>인증 번호 확인</PrettyButton>
            </Horizental>
            <div style={{height:'16px'}}/>
            <PrettyButton isLoading={isLoadingPasswordReset} disabled={!isCertified} onClick={onClickPasswordReset} style={{width:'100%'}}>임시 비밀 번호 발송</PrettyButton>
        </Vertical>
    )
}

