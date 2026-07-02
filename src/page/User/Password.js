import {useState, useContext, useRef} from "react";

import * as UserAPI from '@rest/UserAPI.js'
import * as validator from './Validator.js'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from '@gui/PrettyButton.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import OverlayProgress from "@gui/OverlayProgress.js";


export default function({onClose}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isOverlayProgress, setIsOverlayProgress] = useState(false)

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
            window.showToast('기존 비밀번호를 입력하세요', 'error')
            return
        }

        if(new_password == ''){
            refNewPassword.current.focus()
            window.showToast('새 비밀번호를 입력하세요', 'error')
            return
        }

        if(repeat_password == ''){
            refRepeatPassword.current.focus()
            window.showToast('비밀번호 확인을 입력하세요', 'error')
            return
        }

        if(new_password != repeat_password){
            window.showToast('새 비밀번호와 비밀번호 확인이 일치하지 않습니다', 'error')
            return
        }

        const valid = (validator.password(new_password))

        if(valid == false) {
            window.showToast('새 비밀번호가 조건에 맞지 않습니다', 'error')
            return
        }

        setIsOverlayProgress(true)
        
        const result = await passwordChange(current_password, new_password)
        
        setIsOverlayProgress(false)

        if(result == null){
            window.showToast('비밀번호 변경이 실패하였습니다', 'error')            
            return
        }
        
        window.showToast('비밀번호 변경이 성공하였습니다', 'success')
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
        <Vertical style={{flex:1, backgroundColor:'rgba(255,255,0,0.3)', alignItems: 'center'}}>
            {isOverlayProgress && <OverlayProgress type={'relative'}/>}
            <label htmlFor='input_current_password'>기존 비밀번호</label>
            <input ref={refCurPassword} id='input_current_password' type='text' maxLength={20} onKeyDown={onKeyDownCurrent}/>
            <label>비밀번호 조건: 8자 ~ 20자 사이 문자열로 영어소문자, 영어대문자, 숫자, 특수문자 포함</label>
            <label htmlFor='input_new_password'>새 비밀번호</label>
            <input ref={refNewPassword} id='input_new_password' type='text' maxLength={20} onKeyDown={onKeyDownNew}/>
            <label htmlFor='input_repeat_password'>비밀번호 확인</label>
            <input ref={refRepeatPassword} id='input_repeat_password' type='text' maxLength={20} onKeyDown={onKeyDownRepeat}/>
            <PrettyButton type="confirm" onClick={onClickPasswordChange}>비밀번호 변경</PrettyButton>
            <PrettyButton type="confirm" onClick={onClose} type='danger'>취소</PrettyButton>
        </Vertical>
    )
}

