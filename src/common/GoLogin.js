
import BeautyButton from '../common/BeautyButton';
import { useNavigate, useLocation} from 'react-router-dom';
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

import AuthContext from "../util/AuthContext.js";
import ProfileContext from "../util/ProfileContext.js";



export default function() {

    const navigate = useNavigate()

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
        
    useEffect(()=> {

        removeAuth()
        removeProfile()
        
    }, [auth])

    const onClickNavigateLogin = () => {
        
        navigate('/login', {state:{relogin:true}})
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <label>세션이 만료 되었습니다. 다시 로그인 해주세요</label>
            <div style={{height:'10px'}}></div>
            <BeautyButton type='success' onClick={onClickNavigateLogin}>로그인 다시 하기</BeautyButton>
        </div>
    )
}
