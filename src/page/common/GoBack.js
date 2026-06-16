
import PrettyButton from '@gui/PrettyButton';
import { useNavigate } from 'react-router-dom';
import {Horizental, Vertical} from "@gui/Flex.js";

export default function({value}) {

    const navigate = useNavigate()

    const onClickGoBack = () => {

        navigate(-1)
    }

    return (
        <Horizental style={{alignItems: 'center'}}>
            <label>{value}</label>
            <div style={{height:'10px'}}></div>
            <PrettyButton type='success' onClick={onClickGoBack}>뒤로 가기</PrettyButton>
        </Horizental>
    )
}
