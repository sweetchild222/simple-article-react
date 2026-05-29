
import {useState, useEffect, useRef } from "react";

import BeautyButton from "../../../common/BeautyButton.js";
import { HiDotsVertical } from "react-icons/hi";

import './ControlMenu.css'




export default function(props) {

    const combinedStyle = { ...props.style }
    
    const [isOpenMenu, setIsOpenMenu] = useState(false)
    const refMenu = useRef(null)
    const refButton = useRef(null)


    useEffect(()=>{

        if(!isOpenMenu)
            return
        
        const handleClick = (event) => { 

            if (!(refMenu.current.contains(event.target) || refButton.current.contains(event.target)))
                setIsOpenMenu(false)
        }

        document.addEventListener('mouseup', handleClick)

        return () => {

            document.removeEventListener('mouseup', handleClick)
        }

    }, [isOpenMenu])


    const onClickEdit = ()=>{

        setIsOpenMenu(false)

        if(props.onModify)
            props.onModify()
    }

    const onClickRemove = ()=>{

        setIsOpenMenu(false)

        if(props.onRemove)
            props.onRemove()
    }
    
        
    return (<div style={{position:'relative', display:'inline-block', ...combinedStyle}}>
                <BeautyButton ref={refButton} type={'transparent'} isLoading={props.isLoading} style={{color:'black', margin: '0 auto'}} onClick={()=> setIsOpenMenu(value => !value)}><HiDotsVertical size={22}/></BeautyButton>
                {isOpenMenu && <ul ref={refMenu} className={'popupList'} style={{width:'60px'}}>
                    <BeautyButton type={'transparent'} style={{whiteSpace: 'nowrap', color:'black', width:'100%', height:'50px'}} onClick={onClickEdit}>수정</BeautyButton>
                    <BeautyButton type={'transparent'} style={{whiteSpace: 'nowrap', color:'black', width:'100%', height:'50px'}} onClick={onClickRemove}>삭제</BeautyButton>
                </ul>}
            </div>)

}


