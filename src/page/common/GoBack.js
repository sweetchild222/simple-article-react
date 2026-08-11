
import PrettyButton from '@gui/PrettyButton';
import { useNavigate } from 'react-router-dom';
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";


export default function({value}) {

    const navigate = useNavigate()

    const onClickGoBack = () => {

        navigate(-1)
    }

    return (
        <Vertical style={{alignItems: 'center'}}>
            <label>{value}</label>
            <VPad size={8}/>
            <PrettyButton type='success' onClick={onClickGoBack}>뒤로 가기</PrettyButton>
        </Vertical>
    )
}
