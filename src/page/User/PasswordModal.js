import {useState, useContext, useRef} from "react";

import * as UserAPI from '@rest/UserAPI.js'
import * as validator from './Validator.js'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from '@gui/PrettyButton.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import Spinner from "@gui/Spinner.js";


export default function({onClose}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isSpinner, setIsSpinner] = useState(false)

    const refCurPassword = useRef(null)
    const refNewPassword = useRef(null)
    const refRepeatPassword = useRef(null)

    if(refCurPassword.current)
        refCurPassword.current.value = ''

    if(refNewPassword.current)
        refNewPassword.current.value = ''

    if(refRepeatPassword.current)
        refRepeatPassword.current.value = ''


    const onClickPasswordChange = async()=>{

        if(!validAuth(auth))
            return

        if(!refCurPassword.current || !refNewPassword.current || !refRepeatPassword.current)
            return
        
        const current_password = refCurPassword.current.value;
        const new_password = refNewPassword.current.value
        const repeat_password = refRepeatPassword.current.value

        if(current_password == ''){
            refCurPassword.current.focus()
            window.showToast('기존 비밀번호를 입력하세요', 'user-error')
            return
        }

        if(new_password == ''){
            refNewPassword.current.focus()
            window.showToast('새 비밀번호를 입력하세요', 'user-error')
            return
        }

        if(repeat_password == ''){
            refRepeatPassword.current.focus()
            window.showToast('비밀번호 확인을 입력하세요', 'user-error')
            return
        }

        if(new_password != repeat_password){
            window.showToast('새 비밀번호와 비밀번호 확인이 일치하지 않습니다', 'user-error')
            return
        }

        const valid = (validator.password(new_password))

        if(valid == false) {
            window.showToast('새 비밀번호가 조건에 맞지 않습니다', 'user-error')
            return
        }

        setIsSpinner(true)
        
        const result = await passwordChange(current_password, new_password)
        
        setIsSpinner(false)

        if(result == null){
            window.showToast('비밀번호 변경이 실패하였습니다', 'system-error')
            return
        }
        
        window.showToast('비밀번호 변경이 성공하였습니다', 'info')
        onClose()
    }
    

    const passwordChange = async(current_password, new_password)=>{
        
        const resPasswordCheck = await UserAPI.getUserPasswordCheck(auth.jwt, auth.user_id, current_password)

        if(resPasswordCheck.success == false)
            return null
        
        if(resPasswordCheck.payload.correct == false)
            return null

        const payload = {password: new_password}

        const resUser = await UserAPI.patchUser(auth.jwt, auth.user_id, payload)

        if(resUser.success == false)
            return null

        return resUser.payload
    }

    
    const onKeyDownRepeat = (event) =>{

        if (event.key === 'Enter')
            onClickPasswordChange()
    }


    const onKeyDownCurrent = (event) =>{

        if (event.key === 'Enter'){
            if(refNewPassword.current)
                refNewPassword.current.focus()
        }
    }


    const onKeyDownNew = (event) =>{

        if (event.key === 'Enter')
            if(refRepeatPassword.current)
                refRepeatPassword.current.focus()
    }


    return (
        <Vertical style={{alignItems: 'start', position:'relative'}}>
            {isSpinner && <Spinner type={'absolute'} radius={100} spinnerWidth={15}/>}
            <label htmlFor='input_current_password'>기존 비밀번호</label>
            <div style={{height:'4px'}}/>
            <input ref={refCurPassword} id='input_current_password' type='password' maxLength={20} style={{width:'100%', boxSizing:'border-box'}} onKeyDown={onKeyDownCurrent}/>
            <div style={{color:'darkgray', fontStyle:'italic', fontSize:'14px'}}>8~20자 사이 영어 문자열로 대소문자, 숫자, 특수문자 포함</div>
            <div style={{height:'16px'}}/>
            <label htmlFor='input_new_password'>새 비밀번호</label>
            <div style={{height:'4px'}}/>
            <input ref={refNewPassword} id='input_new_password' type='password' maxLength={20} style={{width:'100%', boxSizing:'border-box'}} onKeyDown={onKeyDownNew}/>
            <div style={{height:'16px'}}/>
            <label htmlFor='input_repeat_password'>비밀번호 확인</label>
            <div style={{height:'4px'}}/>
            <input ref={refRepeatPassword} id='input_repeat_password' type='password' maxLength={20} style={{width:'100%', boxSizing:'border-box'}} onKeyDown={onKeyDownRepeat}/>
            <div style={{height:'16px'}}/>
            <Horizental style={{justifyContent:'end', width:'100%'}}>
                <PrettyButton type="confirm" onClick={onClickPasswordChange} type='confirm' style={{width:'64px'}}>변경</PrettyButton>
                <div style={{width:'16px'}}/>
                <PrettyButton type="confirm" onClick={onClose} type='cancel' style={{width:'64px'}}>취소</PrettyButton>
            </Horizental>
        </Vertical>

    )
}

