
import {useState, useEffect, useRef } from "react";

import PrettyButton from "@gui/PrettyButton.js";
import {isMobile} from "@util/DeviceType.js";
import { HiDotsVertical } from "react-icons/hi";
import { useTranslation } from 'react-i18next';


import './ControlMenu.css'

export default function(props) {
        
    const [isOpenMenu, setIsOpenMenu] = useState(false)
    const refMenu = useRef(null)
    const refButton = useRef(null)

    const { t } = useTranslation()

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


    return (<div style={{position:'relative', display:'inline-block', ...props.style}}>
                <PrettyButton ref={refButton} type={'transparent'} isLoading={props.isLoading} style={{color:'black', margin: '0 auto'}} onClick={()=> setIsOpenMenu(value => !value)}><HiDotsVertical size={16}/></PrettyButton>
                {isOpenMenu && <ul ref={refMenu} className={'popupList'} style={{width:'64px', left:(isMobile() ? '0px' : null)}}>
                    <PrettyButton type={'transparent'} style={{whiteSpace: 'nowrap', color:'black', width:'100%', height:'40px'}} onClick={onClickEdit}>{t('system.modify')}</PrettyButton>
                    <PrettyButton type={'transparent'} style={{whiteSpace: 'nowrap', color:'black', width:'100%', height:'40px'}} onClick={onClickRemove}>{t('system.delete')}</PrettyButton>
                </ul>}
            </div>)
}


