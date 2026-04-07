
import BeautyButton from '../common/BeautyButton';
import { useNavigate, useLocation} from 'react-router-dom';
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

import AuthContext from "../util/AuthContext.js";
import ProfileContext from "../util/ProfileContext.js";



export default function({onClickGoLoginCustom}) {

    const navigate = useNavigate()

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const {profile, updateProfile, removeProfile} = useContext(ProfileContext)
    

    useEffect(()=>{

        if(validAuth(auth)){
            console.log('valid auth')
            navigate(-1)
        }
        else{
            console.log('intvalue auth')
            removeProfile()
        }
        
    }, [auth])

    


    const onClickGoLogin = () => {

        navigate('/login')
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <label>세션이 만료 되었습니다. 다시 로그인 해주세요</label>
            <BeautyButton type='success' onClick={onClickGoLoginCustom != null ? onClickGoLoginCustom :  onClickGoLogin}>로그인 다시 하기</BeautyButton>
        </div>
    )
}
