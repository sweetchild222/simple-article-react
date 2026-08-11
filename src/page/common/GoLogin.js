
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from '@gui/PrettyButton';
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";


export default function() {

    const navigate = useNavigate()

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
            
    useEffect(()=> {

        removeAuth()
        
    }, [auth])

    const onClickNavigateLogin = () => {
        
        navigate('/account', {state:{comback:true}})
    }
    
    return (
        <Vertical style={{alignItems: 'center'}}>
            <label>세션이 만료 되었습니다. 다시 로그인 해주세요</label>
            <VPad size={8}/>
            <PrettyButton type='default' onClick={onClickNavigateLogin}>로그인 다시 하기</PrettyButton>
        </Vertical>
    )
}
