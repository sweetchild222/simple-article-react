import {useState, useEffect, useRef} from "react";
import ReactDOM from 'react-dom';


import * as UserAPI from '@rest/UserAPI.js'
import PrettyButton from '@gui/PrettyButton.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";
import { useTranslation } from 'react-i18next';

import * as validator from './Validator.js'

export default function({isOpen, onClose}) {

    const { t } = useTranslation()

    const refDialog = useRef(null)
    
    const [isLoadingSendCode, setIsLoadingSendCode] = useState(false)
    const [isLoadingCertify, setIsLoadingCertify] = useState(false)

    
    useEffect(() => {

        if(isOpen)
            refDialog.current.showModal()
        else
            refDialog.current.close()

    }, [isOpen])
    
    
    const onKeyDownDialog=(event)=>{

        if(event.nativeEvent.key == 'Escape'){
            event.preventDefault()
        }
    }
    
        

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


        const resExist = await UserAPI.getExistUser(email)

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
        
        const resCerify =  await UserAPI.postCertifyPasswordReset(email)

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

        const success = await requestCertify(email, certifyCode)

        if(!success){
            window.showToast(t('toast.passwordReset.failedVerified'), 'system-error')
            setIsLoadingSendCode(false)
            setIsLoadingCertify(false)
            return
        }

        const res = await UserAPI.patchPasswordReset(email)

        if(res.success == false){
            window.showToast(t('toast.passwordReset.failedSendingTemporaryPassword'), 'system-error')
            onClose()
            return
        }

        window.showToast(t('toast.passwordReset.successSendingTemporaryPassword'), 'info')
        onClose()
    }


    const requestCertify = async(email, certifyCode) => {

        const resEmail = await UserAPI.patchCertifyPasswordReset(email, certifyCode)

        if(resEmail.success == false)
            return false

        return resEmail.payload.match
    }
    
    return (
        ReactDOM.createPortal(
            <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'8px'}}>
                <Vertical style={{alignItems: 'start', position:'relative'}}>
                    <Horizental style={{ alignItems: 'center', width:'100%'}}>
                        <input id={'input_email'} type={'text'} onChange={onChangeEmail} disabled={isLoadingSendCode} placeholder={t('page.user.email')} maxLength={50} style={{flex:'1', boxSizing:'border-box'}}/>
                        <HPad size={8}/>
                        <PrettyButton isLoading={isLoadingSendCode}  onClick={onClickSendCertifyCode} type={'success'}>{t('page.user.sendVerificationCode')}</PrettyButton>
                    </Horizental>
                    <VPad size={8}/>
                    <Horizental style={{ alignItems: 'center', width:'100%'}}>
                        <input id={'input_certifyCode'} type={'number'} disabled={isLoadingCertify} placeholder={t('page.user.VerificationCode')} style={{flex:'1', boxSizing:'border-box'}}/>
                        <HPad size={8}/>
                        <PrettyButton isLoading={isLoadingCertify} onClick={onClickRequestCertify} type={'success'}>{t('page.user.confirmVerificationCode')}</PrettyButton>
                    </Horizental>
                    <VPad size={8}/>
                    <PrettyButton type='cancel' onClick={onClose} style={{alignSelf: 'end'}}>{t('system.cancel')}</PrettyButton>
                </Vertical>
            </dialog>,
            document.getElementById('modal-root'))
        )
}

