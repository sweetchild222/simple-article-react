
import PrettyButton from '@gui/PrettyButton';
import { useNavigate } from 'react-router-dom';
import {Vertical, Horizental} from "@gui/Flex.js";

export default function({value}) {

    const navigate = useNavigate()

    const onClickGoBack = () => {

        navigate(-1)
    }

    return (
        <Vertical style={{alignItems: 'center'}}>
            <label>{value}</label>
            <div style={{height:'8px'}}></div>
            <PrettyButton type='success' onClick={onClickGoBack}>뒤로 가기</PrettyButton>
        </Vertical>
    )
}
