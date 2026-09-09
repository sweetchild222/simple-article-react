import {useContext, useEffect, useState} from 'react';
import { useNavigate, useLocation} from 'react-router-dom';

import AuthContext from "@util/AuthContext.js";
import * as UserAPI from '@rest/UserAPI.js'
import PrettyButton from '@gui/PrettyButton.js';
import Modal from '@gui/Modal.js';
import {VPad} from "@gui/Pad.js";
import {Vertical} from "@gui/Flex.js";

import PasswordReset from './PasswordReset';

export default function() {

    const {auth, updateAuth, validAuth} = useContext(AuthContext)    
    const [isLoading, setIsLoading] = useState(false)
    const [isModalPasswordReset, setIsModalPasswordReset] = useState(false)
    
    const navigate = useNavigate()

    const location = useLocation()
    
    const comback = location.state != null && location.state.comback == true

    useEffect(() => {

        if(validAuth(auth)){
        
            if(!comback)
                navigate('/')
        }

    }, [auth])

  
    const onClickLogin = async() => {

        const username = input_username.value
        const password = input_password.value
        
        if(username === ''){
            input_username.focus()
            return
        }
        
        if(password === ''){
            input_password.focus()
            return
        }
        
        setIsLoading(true)

        const resAuth = await UserAPI.postAuthenticate(username, password)

        setIsLoading(false)
        
        if(resAuth.success == false) {
            window.showToast(t('toast.login.failedLogin'), 'system-error')
            return
        }
        
        if(!(Object.hasOwn(resAuth.payload, "jwt") && Object.hasOwn(resAuth.payload, "user_id"))){

            window.showToast(t('toast.login.failedLogin'), 'system-error')
            return
        }
        
        updateAuth(resAuth.payload)

        window.showToast(t('toast.login.successLogin'), 'info')
        
        if(comback)
            navigate(-1)
    }


    const onKeyDownPassword = async(event)=>{

        if (event.key === 'Enter')
            await onClickLogin()
    }


    const onKeyDownUserName = async(event)=>{

        if (event.key === 'Enter')
            input_password.focus()
    }

    
    return (
            <Vertical style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
                <label htmlFor='input_username'>{t('page.user.userName')}</label>
                <VPad size={4}/>
                <input id='input_username' type='text' onKeyDown={onKeyDownUserName} maxLength={254} style={{width:'256px'}}/>
                <VPad size={16}/>
                <label htmlFor='input_password'>{t('page.user.password')}</label>
                <VPad size={4}/>
                <input id='input_password' type='password' onKeyDown={onKeyDownPassword} maxLength={254} style={{width:'256px'}}/>
                <VPad size={16}/>
                <Vertical>
                    <PrettyButton onClick={onClickLogin}  isLoading={isLoading} type='success'>{t('page.user.login')}</PrettyButton>
                    <VPad size={16}/>
                    <PrettyButton onClick={() => {navigate('regist', {state:{comback:comback}, replace:true})}}>{t('page.user.registUser')}</PrettyButton>
                    <VPad size={16}/>
                    <PrettyButton onClick={() => setIsModalPasswordReset(true)} style={{width:'100%'}}>{t('page.user.findPassword')}</PrettyButton>
                </Vertical>
                {isModalPasswordReset && <Modal type={'custom'} isOpen={isModalPasswordReset} onClose={()=>setIsModalPasswordReset(false)} isCloseOutsideClick={true}>
                    <PasswordReset onClose={() => setIsModalPasswordReset(false)}/>
                </Modal>
                }
            </Vertical>
    )
}
