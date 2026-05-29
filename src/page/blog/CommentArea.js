
import React, {useState, useContext, useEffect, useRef, useImperativeHandle, useCallback } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'
import * as CommentGreatAPI from '../../api/CommentGreatAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import Modal from "../../common/Modal.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import CountWithUnit from "../../util/CountWithUnit.js";


import DOMPurify from 'dompurify';

import ArticleItem from "./ArticleItem.js";
import CommentGreat from "./CommentGreat.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import * as CommentAPI from '../../api/CommentAPI.js'
import UserImage from "../../common/UserImage.js";

import './Comments.css'
import './Comment.css'

import getCaretCoordinates from 'textarea-caret';
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'
import TimestampToString from '../../util/TimestampToString.js'
import * as UserRepository from "./UserRepository.js";

import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { MdThumbDownAlt } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RiArrowDownWideLine } from "react-icons/ri";
import { HiDotsVertical } from "react-icons/hi";
import { MdDownloadDone } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdOutlineDoneOutline } from "react-icons/md";


export default function({ref, comment, atCandidates, onInput, maxCharLength = 1000}) {
        
    const [menuPosition, setMenuPosition] = useState(null)
    const [focusItemIndex, setFocusItemIndex] = useState(null)
            
    const refMenu = useRef(null)
    const refCommentEdit = useRef(null)    
    
    const onInputInner = (e) => {

        const element = e.nativeEvent.target
        const value = element.value

        if(onInput)
            onInput(value)
        
        if(!refMenu.current)
            return
        
        const atIndex = value.lastIndexOf('@', element.selectionStart - 1)

        if(atIndex == -1){
            setFocusItemIndex(null)
            return
        }        

        const atStr = value.substring(atIndex + 1, element.selectionStart)
        
        const hasWhitespace = /\s/.test(atStr)

        if(hasWhitespace){
            setFocusItemIndex(null)
            return
        }
                
        if(atStr == ''){
            setFocusItemIndex(null)
            return
        }
        
        const childNodes = refMenu.current.childNodes

        for(let i = 0; childNodes.length > i; ++i){

            const nickName = childNodes[i].innerText

            if(nickName.indexOf('@' + atStr) != -1){
                setFocusItemIndex(i)
                return
            }
        }

        setFocusItemIndex(null)
        setMenuPosition(null)
    }


    useEffect(()=>{

        const element = refCommentEdit.current

        if(!element)
            return
            
        element.focus()
        const length = comment.length
        element.setSelectionRange(length, length)
        
        element.addEventListener('input', (e) => {
            
            const lastChar = element.selectionStart > 1 ? element.value[element.selectionStart - 2] : ' '

            if (e.data === '@' && (lastChar == ' ' || lastChar == '\n' || lastChar == '\t')) {

                const { top, left } = getCaretCoordinates(element, element.selectionStart)

                const rect = element.getBoundingClientRect()

                const menuHeight = 30 * atCandidates.length

                const topMargin = 30
            
                const menuBottom = rect.y + top - element.scrollTop + menuHeight + topMargin

                const y = top - element.scrollTop + (menuBottom < window.innerHeight ? topMargin : -menuHeight)
                
                setMenuPosition({x:left, y:y})
                setFocusItemIndex(null)
            }
        })
            
    }, [])


    useEffect(()=>{

        if(!refMenu.current)
            return
        
        const childNodes = refMenu.current.childNodes

        if(focusItemIndex != null && focusItemIndex >= childNodes.length)
            return

        for(let i = 0; childNodes.length > i; ++i)
            childNodes[i].style.backgroundColor = i == focusItemIndex ? '#696969' : '#D3D3D3'                

    }, [focusItemIndex])
    

    useImperativeHandle(ref, () => {
    
        return {
            value() {

                if(!refCommentEdit.current)
                    return null

                return refCommentEdit.current.value
            }
        }
    }, [refCommentEdit])
        

    const onClickUser = async(user) =>{
        
        setMenuPosition(null)
        setFocusItemIndex(null)
        putNickName(user.nickname)
    }

    const putNickName = (nickname)=> {

        const element = refCommentEdit.current

        if(!element)
            return

        const value = element.value

        const atIndex = value.lastIndexOf('@', element.selectionStart - 1)

        if(atIndex == -1)
            return

        const atStr = value.substring(atIndex + 1, element.selectionStart)
        
        const hasWhitespace = /\s/.test(atStr)

        if(hasWhitespace)
            return
        
        const nickHead = nickname.substring(0, atStr.length)

        if(atStr == nickHead) {
            const nickFoot = nickname.substring(atStr.length, nickname.length) + ' '
            element.value = value.slice(0, element.selectionStart) + nickFoot + value.slice(element.selectionStart)
        }
        else{
            element.value = value.slice(0, atIndex) + '@' + nickname + ' '
        }

        element.focus()
    }


    const eventKeyDown = useCallback((event) => {

        if(!refMenu.current)
            return
        
        const maxIndex = refMenu.current.childNodes.length

        if(event.code == 'ArrowDown'){
            event.preventDefault()
            setFocusItemIndex(index => index == null ? 0 : ((maxIndex - 1) > index ? index + 1 : index))
        }
        else if(event.code == 'ArrowUp'){
            event.preventDefault()
            setFocusItemIndex(index => index == null ? (maxIndex - 1) : (index > 0 ? index - 1 : index))
        }
        else if(event.code == 'Escape'){
            event.preventDefault()
            setMenuPosition(null)
            setFocusItemIndex(null)
        }
        else if(event.code == 'Backspace'){

            const element = refCommentEdit.current
            
            if(!refCommentEdit.current)
                return

            const lastChar = element.value[element.selectionStart - 1]
            
            if(lastChar == '@'){
                setMenuPosition(null)
                setFocusItemIndex(null)
            }
        }
        else if(event.code == 'Space' || event.code == 'Home' || event.code == 'End' || event.code == 'ArrowLeft' || event.code == 'ArrowRight'){

            setMenuPosition(null)
            setFocusItemIndex(null)
        }
        else if(event.code == 'Enter'){

            setMenuPosition(null)
            setFocusItemIndex(null)
            
            if(focusItemIndex == null)
                return            

            event.preventDefault()

            if(maxIndex > focusItemIndex)
                putNickName(atCandidates[focusItemIndex].nickname)
        }
    })


    useEffect(() => {

        window.addEventListener('keydown', eventKeyDown)
        
        return () => {
            window.removeEventListener('keydown', eventKeyDown)    
        }

    }, [eventKeyDown])



    return comment ? (
            <div style={{width:'100%'}}>
                {<div style={{display:'grid', gridTemplateColumns:'1fr', width:'100%'}}>
                    <textarea ref={refCommentEdit} className={'commentEdit'}  placeholder={'글을 입력하세요'} defaultValue={comment} suppressContentEditableWarning={true} maxLength={maxCharLength} style={{boxSizing: 'border-box', width:'100%',  minHeight: '4lh', resize:'none', maxHeight:'6lh', border:'0px solid lightgray', fieldSizing: 'content', overflowY:'auto', padding:'5px', backgroundColor:'green'}} onInput={onInputInner}/>
                </div>
                }

                {menuPosition &&
                    <ul ref={refMenu} className={'candidate'} style={{left:menuPosition.x, top:menuPosition.y}}>
                        {atCandidates.map((user, index) => user.nickname != '' ? 
                            <BeautyButton key={user.id} type={'transparent'}  style={{color:'black', width:'100%', height:'30px'}} onClick={() => onClickUser(user)}>{'@' + user.nickname}</BeautyButton>
                        :null)}
                    </ul>
                }
            </div>
        ) : null
}