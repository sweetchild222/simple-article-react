import {useState} from "react";

import * as RegistAPI from '@rest/RegistAPI.js'
import * as PasswordResetAPI from '@rest/PasswordResetAPI.js'
import PrettyButton from '@gui/PrettyButton.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";
import { useTranslation } from 'react-i18next';

import * as validator from './Validator.js'

export default function({onClose}) {

    const { t } = useTranslation()
    
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
            window.showToast(t('toast.passwordReset.invalidEmail'), 'user-error')
            return
        }


        const resExist = await RegistAPI.getExistUser(email)

        if(resExist.success == false)
            return

        if(resExist.payload.exist == 0){
            window.showToast(t('toast.passwordReset.noEmail'), 'user-error')
            return
        }


        setIsLoadingSendCode(true)
        input_email.disabled = true
        const success = await sendCertifyCodeCore(email);
        setIsLoadingSendCode(false)
        input_email.disabled = false

        if(success)
            window.showToast(t('toast.passwordReset.successSendVerificationCode'), 'info')
        else
            window.showToast(t('toast.passwordReset.failedSendVerificationCode'), 'system-error')
    }
    

    const sendCertifyCodeCore = async(email) => {
        
        const resCerify =  await PasswordResetAPI.postCertifyPasswordReset(email)

        return resCerify.success
    }


    const onClickRequestCertify = async() => {
    
        const email = input_email.value
        
        if(!validator.email(email)){
            input_email.focus()
            window.showToast(t('toast.passwordReset.invalidEmail'), 'user-error')
            return
        }

        const certifyCode = input_certifyCode.value

        if(!validator.certifyCode(certifyCode)){
            input_certifyCode.focus()
            window.showToast(t('toast.passwordReset.wrongVerificationCode'), 'user-error')
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
            window.showToast(t('toast.passwordReset.successVerified'), 'info')
        else
            window.showToast(t('toast.passwordReset.failedVerified'), 'system-error')
        
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
            window.showToast(t('toast.passwordReset.invalidEmail'), 'user-error')
            return
        }

        setIsLoadingPasswordReset(true)
        
        const res = await PasswordResetAPI.patchPasswordReset(email)

        setIsLoadingPasswordReset(false)
        onClose()

        if(res.success == false){
            window.showToast(t('toast.passwordReset.failedSendingTemporaryPassword'), 'system-error')
            return false
        }

        window.showToast(t('toast.passwordReset.successSendingTemporaryPassword'), 'info')
    }



    return (
        <Vertical>
            <Horizental style={{ alignItems: 'center', width:'100%'}}>
                <input id={'input_email'} type={'text'} onChange={onChangeEmail} disabled={isCertified} placeholder={t('page.user.email')} maxLength={50} style={{flex:'1', boxSizing:'border-box'}}/>
                <HPad size={8}/>
                <PrettyButton isLoading={isLoadingSendCode} disabled={isCertified} onClick={onClickSendCertifyCode} type={'success'}>{t('page.user.sendVerificationCode')}</PrettyButton>
            </Horizental>
            <VPad size={8}/>
            <Horizental style={{ alignItems: 'center', width:'100%'}}>
                <input id={'input_certifyCode'} type={'number'} disabled={isCertified} placeholder={t('page.user.VerificationCode')} style={{flex:'1', boxSizing:'border-box'}}/>
                <HPad size={8}/>
                <PrettyButton isLoading={isLoadingCertify} disabled={isCertified} onClick={onClickRequestCertify} type={'success'}>{t('page.user.confirmVerificationCode')}</PrettyButton>
            </Horizental>
            <VPad size={16}/>
            <PrettyButton isLoading={isLoadingPasswordReset} disabled={!isCertified} onClick={onClickPasswordReset} style={{width:'100%'}} type={'success'}>{t('page.user.sendVerificationCode')}</PrettyButton>
        </Vertical>
    )
}

