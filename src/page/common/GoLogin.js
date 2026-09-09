
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react'
import AuthContext from "@util/AuthContext.js";
import PrettyButton from '@gui/PrettyButton';
import {Vertical} from "@gui/Flex.js";
import {VPad} from "@gui/Pad.js";
import { useTranslation } from 'react-i18next';

export default function() {

    const { t } = useTranslation()

    const navigate = useNavigate()

    const {auth, removeAuth} = useContext(AuthContext)
            
    useEffect(()=> {

        removeAuth()
        
    }, [auth])

    const onClickNavigateLogin = () => {
        
        navigate('/account', {state:{comback:true}})
    }
    
    return (
        <Vertical style={{alignItems: 'center'}}>
            <label>{t('page.common.sessionTimeout')}</label>
            <VPad size={8}/>
            <PrettyButton type='default' onClick={onClickNavigateLogin}>{t('page.common.relogin')}</PrettyButton>
        </Vertical>
    )
}
