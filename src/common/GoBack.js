
import BeautyButton from './BeautyButton';
import { useNavigate, useLocation} from 'react-router-dom';
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

export default function({value}) {

    const navigate = useNavigate()

    const onClickGoBack = () => {

        navigate(-1)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <label>{value}</label>
            <div style={{height:'10px'}}></div>
            <BeautyButton type='success' onClick={onClickGoBack}>뒤로 가기</BeautyButton>
        </div>
    )
}
