
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../../api/BlobAPI.js'
import * as BlogAPI from '../../../api/BlogAPI.js'
import * as ArticleAPI from '../../../api/ArticleAPI.js'
import * as CommentGreatAPI from '../../../api/CommentGreatAPI.js'

import AuthContext from "../../../util/AuthContext.js";
import LoadingImage from "../../../common/LoadingImage.js";
import Modal from "../../../common/Modal.js";
import BeautyButton from "../../../common/BeautyButton.js";
import ToInteger from "../../../util/ToInteger.js";
import CountWithUnit from "../../../util/CountWithUnit.js";

import CommentGreat from "./CommentGreat.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../../common/CategoryModal.js'
import OverlayLoading from "../../../common/OverlayLoading.js";
import * as CommentAPI from '../../../api/CommentAPI.js'
import UserImage from "../../../common/UserImage.js";


import './CommentMenu.css'


import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { MdThumbDownAlt } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RiArrowDownWideLine } from "react-icons/ri";
import { HiDotsVertical } from "react-icons/hi";

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
    
        
    return (<div style={{position:'relative', display:'inline-block', backgroundColor:'red', ...combinedStyle}}>
                <BeautyButton ref={refButton} type={'transparent'} isLoading={props.isLoading} style={{color:'black', margin: '0 auto'}} onClick={()=> setIsOpenMenu(value => !value)}><HiDotsVertical size={22}/></BeautyButton>
                {isOpenMenu && <ul ref={refMenu} className={'popupList'} style={{width:'60px'}}>
                    <BeautyButton type={'transparent'} style={{whiteSpace: 'nowrap', color:'black', width:'100%', height:'50px'}} onClick={onClickEdit}>수정</BeautyButton>
                    <BeautyButton type={'transparent'} style={{whiteSpace: 'nowrap', color:'black', width:'100%', height:'50px'}} onClick={onClickRemove}>삭제</BeautyButton>
                </ul>}
            </div>)

}


