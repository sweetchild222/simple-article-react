
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


export default function({ref, comment, editable, onClickModifyComplete, onClickModifyCancel, atCandidateList}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isClamped, setIsClamped] = useState(false)
    const [isExpand, setIsExpand] = useState(false)
    const [isModifyLoading, setIsModifyLoading] = useState(false)
    const [inputLength, setInputLength] = useState('0/1000')
    const [seenComment, setSeenComment] = useState(null)
    const [editingComment, setEditingComment] = useState(null)
    const [modifiedComment, setModifiedComment] = useState(null)    
    const [menuPosition, setMenuPosition] = useState(null)
    const [focusItemIndex, setFocusItemIndex] = useState(null)
        
    const refComment = useRef(null)
    const refMenu = useRef(null)

    const refCommentEdit = useRef(null)
    const maxCharLength = 1000
    
    const onInput = (e) => {

        const element = e.nativeEvent.target

        const value = element.value

        setInputLength(value.length + '/' + maxCharLength)

        if(!refMenu.current)
            return
        
        const atIndex = value.lastIndexOf('@', element.selectionStart - 1)        

        if(atIndex == -1){
            setFocusItemIndex(null)
            return
        }        

        const input = value.substring(atIndex + 1, element.selectionStart)        
        
        const hasWhitespace = /\s/.test(input)

        if(hasWhitespace){
            setFocusItemIndex(null)
            return
        }
                
        if(input == ''){
            setFocusItemIndex(null)
            return
        }
        
        const childNodes = refMenu.current.childNodes        

        for(let i = 0; childNodes.length > i; ++i){

            const nickName = childNodes[i].innerText            

            if(nickName.indexOf('@' + input) != -1){                
                setFocusItemIndex(i)
                return
            }
        }

        setFocusItemIndex(null)
        setMenuPosition(null)
    }

    useEffect(()=>{

        const rawComment = comment.comment
        const regex = /\<user\>(.*?)\<\/user\>/g

        replaceAsync(rawComment, regex, toUserLink).then(replaceString =>
            setSeenComment(DOMPurify.sanitize(replaceString))
        )

        replaceAsync(rawComment, regex, toUserNickname).then(replaceString =>
            setEditingComment(replaceString)
        )

    }, [comment])


    useEffect(()=>{

        if(!editable)
            return

        const element = refCommentEdit.current

        if(!element)
            return
            
        element.focus()
        const length = editingComment.length
        element.setSelectionRange(length, length)
        setInputLength(length + '/' + maxCharLength)

        element.addEventListener('input', (e) => {
            
            const lastChar = element.selectionStart > 1 ? element.value[element.selectionStart - 2] : ' '        

            if (e.data === '@' && (lastChar == ' ' || lastChar == '\n' || lastChar == '\t')) {

                const { top, left } = getCaretCoordinates(element, element.selectionStart)

                const rect = element.getBoundingClientRect()

                const menuHeight = 30 * atCandidateList.length

                const topMargin = 30
            
                const menuBottom = rect.y + top - element.scrollTop + menuHeight + topMargin

                const y = top - element.scrollTop + (menuBottom < window.innerHeight ? topMargin : -menuHeight)
                
                setMenuPosition({x:left, y:y})
                setFocusItemIndex(null)
            }
        })
            
    }, [editable])


    useEffect(()=>{

        if(!refMenu.current)
            return
        
        const childNodes = refMenu.current.childNodes

        if(focusItemIndex != null && focusItemIndex >= childNodes.length)
            return

        for(let i = 0; childNodes.length > i; ++i){

            if(i == focusItemIndex)
                childNodes[i].style.backgroundColor = '#696969'
            else
                childNodes[i].style.backgroundColor = '#D3D3D3'
        }

    }, [focusItemIndex])

    

    useEffect(()=>{

        if(refComment.current && seenComment){
            
            const element = refComment.current
            
            setIsClamped(element.scrollHeight >  element.clientHeight)
        }

    }, [seenComment])



    async function replaceAsync(str, regex, asyncFn) {

        const promises = []
    
        str.replace(regex, (match, ...args) => {
            promises.push(asyncFn(match, ...args))
            return match
        })
  
        const data = await Promise.all(promises)
        return str.replace(regex, () => data.shift())
    }
    

    const toUserLink = async(matched)=>{
        
        const match = matched.match(/\<user\>(.*?)\<\/user\>/)

        if(!match)
            return matched
        
        if(match.length > 0){

            const id = match[1]

            const user = await UserRepository.getByID(id)

            const host = 'http://' + window.location.host

            if(user == null)
                return '@알수없음'
                        
            const link = '<a href=\"' + host + '/user/' + id + '\">'+ '@' + user.nickname +'</a>'
        
            return link
        }

        return matched
    }

    
    const toUserNickname = async(matched)=>{

        const match = matched.match(/\<user\>(.*?)\<\/user\>/)

        if(!match)
            return

        if(match.length > 0){

            const id = match[1]

            const user = await UserRepository.getByID(id)

            if(user == null)
                return '@알수없음'
            
            return '@' + user.nickname            
        }

        return matched
    }


    const onClickModifyCompleteInner = async() => {

        if(onClickModifyComplete){

            if(!refCommentEdit.current)
                return
                
            let value = refCommentEdit.current.value + ' '
            
            for(const candidate of atCandidateList){

                if(candidate.nickname != '')
                    value = value.replaceAll('@' + candidate.nickname + ' ', ('<user>' + candidate.id + '</user> '))
            }
            
            value = value.substring(0, value.length - 1)

            setIsModifyLoading(true)
            await onClickModifyComplete(value)
            setIsModifyLoading(false)
        }
    }

    const onClickModifyCancelInner = async() => {

        if(onClickModifyCancel)
            onClickModifyCancel()
    }
    

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

        const input = value.substring(atIndex + 1, element.selectionStart)
        
        const hasWhitespace = /\s/.test(input)

        if(hasWhitespace)
            return
        
        const nickHead = nickname.substring(0, input.length)

        if(input == nickHead) {
            const nickFoot = nickname.substring(input.length, nickname.length) + ' '
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
                putNickName(atCandidateList[focusItemIndex].nickname)
        }
    })


    useEffect(() => {

        window.addEventListener('keydown', eventKeyDown)
        
        return () => {
            window.removeEventListener('keydown', eventKeyDown)    
        }

    }, [eventKeyDown])



    return seenComment ? (
            <div style={{position:'relative', display:'flex', flexDirection: 'column', justifyContent:'end', backgroundColor:'orange', alignItems:'start', width:editable ? '100%' : 'auto'}}>

                {editable && <div style={{display:'grid', gridTemplateColumns:'1fr', width:'100%'}}>
                    <textarea ref={refCommentEdit} className={'commentEdit'}  placeholder={'글을 입력하세요'} defaultValue={editingComment} suppressContentEditableWarning={true} maxLength={maxCharLength} style={{boxSizing: 'border-box', width:'100%',  minHeight: '4lh', resize:'none', maxHeight:'6lh', border:'0px solid lightgray', fieldSizing: 'content', overflowY:'auto', padding:'5px', backgroundColor:'green'}} onInput={onInput}/>
                </div>
                }

                {editable && menuPosition &&
                    <ul ref={refMenu} className={'candidate'} style={{left:menuPosition.x, top:menuPosition.y}}>
                        {atCandidateList.map((user, index) => user.nickname != '' ? 
                            <BeautyButton key={user.id} type={'transparent'}  style={{color:'black', width:'100%', height:'30px'}} onClick={() => onClickUser(user)}>{'@' + user.nickname}</BeautyButton>
                        :null)}
                    </ul>
                }

                {!editable && <div ref={refComment} dangerouslySetInnerHTML={{ __html: seenComment}} className={isExpand ? 'none-clamped-text' : 'clamped-text'} style={{boxSizing: 'border-box', '--line-count':5, whiteSpace: 'pre-line', backgroundColor:'lightblue', width:'auto', padding:'5px'}}>
                    {/* {comment.comment + "sdafasdflisdajf\nklsdfjkls\njdfsi\nfwoie\njfwoiejf\nwoiejfiwoejf\noiwejf\noiwejfoiwejf\noiwejf\noiwjfwoiejfoiwjwoi\nejfo\niwjoijwofijwoeijwojwoijwfoijo"} */}
                    {/* {comment.comment} */}
                </div>
                }
                
                {!editable && isClamped && !isExpand && <div style={{position: 'absolute', alignSelf:'end'}}>
                    <BeautyButton type={'transparent'} style={{color:'black'}} onClick={() => setIsExpand(true)}><RiArrowDownWideLine size={12}/></BeautyButton>
                </div>}

                {editable && <div style={{display:'flex', flexDirection: 'row', justifyContent:'end', width:'100%', alignItems:'center'}}>
                    <label>{inputLength}</label>
                    <div style={{width:'10px'}}/>
                    <BeautyButton type={'transparent'} tooltip={'적용'} style={{color:'black'}} disabled={isModifyLoading} onClick={onClickModifyCompleteInner} >{<MdOutlineDoneOutline size={22}/>}</BeautyButton>
                    <div style={{width:'10px'}}></div>
                    <BeautyButton type={'transparent'} tooltip={'취소'} style={{color:'black'}} disabled={isModifyLoading} onClick={onClickModifyCancelInner} >{<MdCancel size={22}/>}</BeautyButton>
                </div>
                }

            </div>
        ) : null
}


