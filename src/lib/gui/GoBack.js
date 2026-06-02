
import PrettyButton from './PrettyButton';
import { useNavigate } from 'react-router-dom';

export default function({value}) {

    const navigate = useNavigate()

    const onClickGoBack = () => {

        navigate(-1)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <label>{value}</label>
            <div style={{height:'10px'}}></div>
            <PrettyButton type='success' onClick={onClickGoBack}>뒤로 가기</PrettyButton>
        </div>
    )
}
