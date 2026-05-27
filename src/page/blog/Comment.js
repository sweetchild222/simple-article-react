
import React, {useState, useContext, useEffect, useRef, useImperativeHandle } from "react";

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
        
    const refComment = useRef(null)
    const refCommentEdit = useRef(null)
    const maxCharLength = 1000    
    
    const onInput = (e) => {
                                  
        setInputLength(e.nativeEvent.target.value.length + '/' + maxCharLength)
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

        if(refCommentEdit.current){
            
            refCommentEdit.current.focus()
            const length = comment.comment.length
            refCommentEdit.current.setSelectionRange(length, length)
            setInputLength(length + '/' + maxCharLength)


            refCommentEdit.current.addEventListener('input', (e) => {
                if (e.data === '@') {

                    const { top, left } = getCaretCoordinates(refCommentEdit.current, refCommentEdit.current.selectionStart)
                    const rect = refCommentEdit.current.getBoundingClientRect()
                    console.log(top, left, rect)
                }
            })

        }
        
    }, [editable])


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

            const host = 'http://' + window.location.host;

            if(user == null)
                return '<a href=\"' + host + '/pageNotFound' + '\">'+ '@알수없음' +'</a>'
                        
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

            for(const candidate of atCandidateList)
                value = value.replaceAll('@' + candidate.nickname + ' ', ('<user>' + candidate.id + '</user> '))
            
            value = value.substring(0, value.length-1)

            setIsModifyLoading(true)
            await onClickModifyComplete(value)
            setIsModifyLoading(false)
        }
            
    }


    const onClickModifyCancelInner = async() => {

        if(onClickModifyCancel)
            onClickModifyCancel()
    }


    return seenComment ? (
            <div style={{display:'flex', flexDirection: 'column', justifyContent:'end', backgroundColor:'orange', alignItems:'start', width:editable ? '100%' : 'auto'}}>

                {editable && <div style={{display:'grid', gridTemplateColumns:'1fr', width:'100%'}}>
                    <textarea ref={refCommentEdit} className={'commentEdit'}  placeholder={'글을 입력하세요'} defaultValue={editingComment} suppressContentEditableWarning={true} maxLength={maxCharLength} style={{boxSizing: 'border-box', width:'100%',  minHeight: '4lh', resize:'none', maxHeight:'6lh', border:'0px solid lightgray', fieldSizing: 'content', overflowY:'auto', padding:'5px', backgroundColor:'green'}} onInput={onInput}/>
                </div>
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


