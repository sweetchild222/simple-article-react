
import AuthContext from "@util/AuthContext.js";

import {useContext, useEffect, useState} from 'react';

import * as UserAPI from '@rest/UserAPI.js'
import { useNavigate, useLocation} from 'react-router-dom';
import PrettyButton from '@gui/PrettyButton.js';
import Modal from '@gui/Modal.js';
import PasswordReset from './PasswordReset';
import {Vertical, Horizental} from "@gui/Flex.js";


export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
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
            window.showToast('로그인이 실패하였습니다', 'system-error')
            return
        }
        
        if(!(Object.hasOwn(resAuth.payload, "jwt") && Object.hasOwn(resAuth.payload, "user_id"))){

            window.showToast('로그인이 실패하였습니다', 'system-error')
            return
        }
        
        updateAuth(resAuth.payload)

        window.showToast('로그인이 성공하였습니다', 'info')
        
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
                <label htmlFor='input_username'>사용자 이름</label>
                <div style={{height:'4px'}}/>
                <input id='input_username' type='text' defaultValue={'crazygun22@nate.com'} onKeyDown={onKeyDownUserName} maxLength={254} style={{width:'256px'}}/>
                <div style={{height:'16px'}}/>
                <label htmlFor='input_password'>비밀번호</label>
                <div style={{height:'4px'}}/>
                <input id='input_password' type='password' defaultValue={'Sweetchild@22'} onKeyDown={onKeyDownPassword} maxLength={254} style={{width:'256px'}}/>
                <div style={{height:'16px'}}/>
                <Vertical>
                    <PrettyButton onClick={onClickLogin}  isLoading={isLoading} type='success'>로그인</PrettyButton>
                    <div style={{height:'16px'}}/>
                    <PrettyButton onClick={() => {navigate('regist', {state:{comback:comback}, replace:true})}}>회원가입</PrettyButton>
                    <div style={{height:'16px'}}/>
                    <PrettyButton onClick={() => setIsModalPasswordReset(true)} style={{width:'100%'}}>비밀번호 찾기</PrettyButton>
                </Vertical>
                {isModalPasswordReset && <Modal type={'custom'} isOpen={isModalPasswordReset} onClose={()=>setIsModalPasswordReset(false)} isCloseOutsideClick={true}>
                    <PasswordReset onClose={() => setIsModalPasswordReset(false)}/>
                </Modal>
                }
            </Vertical>
    )
}
