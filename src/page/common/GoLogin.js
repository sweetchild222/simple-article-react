
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from '@gui/PrettyButton';
import {Vertical, Horizental} from "@gui/Flex.js";



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
            <div style={{height:'10px'}}></div>
            <PrettyButton type='success' onClick={onClickNavigateLogin}>로그인 다시 하기</PrettyButton>
        </Vertical>
    )
}
