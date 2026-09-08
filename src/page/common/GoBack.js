
import PrettyButton from '@gui/PrettyButton';
import { useNavigate } from 'react-router-dom';
import {Vertical} from "@gui/Flex.js";
import {VPad} from "@gui/Pad.js";
import { useTranslation } from 'react-i18next';


export default function({value}) {

    const navigate = useNavigate()

    const onClickGoBack = () => {

        navigate(-1)
    }

    return (
        <Vertical style={{alignItems: 'center'}}>
            <label>{value}</label>
            <VPad size={8}/>
            <PrettyButton type='success' onClick={onClickGoBack}>{t('system.goback')}</PrettyButton>
        </Vertical>
    )
}
