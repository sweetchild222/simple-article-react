
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
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'
import TimestampToString from '../../util/TimestampToString.js'

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


export default function({ref, comment, editable, onClickModifyComplete, onClickModifyCancel}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [isClamped, setIsClamped] = useState(false)
    const [isExpand, setIsExpand] = useState(false)
    const [isModifyLoading, setIsModifyLoading] = useState(false)
    const [inputLength, setInputLength] = useState('0/1000')
    
    const refComment = useRef(null)
    const maxCharLength = 1000
    

    useImperativeHandle(ref, () => ({

            getComment: () =>{

                if(!refComment.current)
                    return null
                
                return refComment.current.innerText
            }
        }
    ));
        
    
    useEffect(() =>{

        if(refComment.current){
            
            const element = refComment.current
            
            setIsClamped(element.scrollHeight >  element.clientHeight)
        }

    }, [refComment])

    

    const onInput = (e) => {
                          
        setInputLength(e.target.innerText.length + '/' + maxCharLength)
    }

    const onKeydown = (e) => {        

        if(['Backspace', 'Delete', 'Control', 'Insert', 'Home', 'End', 'PageUp', 'PageDown','ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
            return

        if(e.target.innerText.length >= maxCharLength)
            e.preventDefault()
    }


    const onPaste = (e) => {

        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        const currentLen = e.target.innerText.length
        const remaining = maxCharLength - currentLen
  
        if (remaining > 0)    
            document.execCommand('insertText', false, text.substring(0, remaining))        
    }


    useEffect(()=>{

        if(editable){
            if(refComment.current){
                refComment.current.addEventListener('input', onInput)
                refComment.current.addEventListener('keydown', onKeydown)
                refComment.current.addEventListener('paste', onPaste)
                setInputLength(comment.comment.length + '/1000')
                refComment.current.focus()
            }
        }
        else{
            if(refComment.current){
                refComment.current.removeEventListener('input', onInput)
                refComment.current.removeEventListener('keydown', onKeydown)
                refComment.current.removeEventListener('paste', onPaste)
                refComment.current.innerText = comment.comment
                
            }
        }

    }, [editable])






    const onClickModifyCompleteInner = async() => {

        if(onClickModifyComplete)
            setIsModifyLoading(true)
            await onClickModifyComplete()
            setIsModifyLoading(false)
    }


    const onClickModifyCancelInner = async() => {

        if(onClickModifyCancel)
            onClickModifyCancel()
    }





    return comment ? (
            <div style={{display:'flex', flexDirection: 'column', justifyContent:'end', backgroundColor:'orange', alignItems:'start', width:editable ? '100%' : 'auto'}}>
                <div ref={refComment} className={editable ? 'edit-text' : (isExpand ? 'none-clamped-text' : 'clamped-text')} contentEditable={editable} suppressContentEditableWarning={true} style={{boxSizing: 'border-box', '--line-count':5, whiteSpace: 'pre-line', backgroundColor:'lightblue', width:editable ? '100%' : 'auto', padding:'5px'}}>
                    {/* {comment.comment + "sdafasdflisdajf\nklsdfjkls\njdfsi\nfwoie\njfwoiejf\nwoiejfiwoejf\noiwejf\noiwejfoiwejf\noiwejf\noiwjfwoiejfoiwjwoi\nejfo\niwjoijwofijwoeijwojwoijwfoijo"} */}
                    {/* {comment.comment} */}
                </div>
                
                {!editable && isClamped && !isExpand && <div style={{position: 'absolute', alignSelf:'end'}}>
                    <BeautyButton type={'transparent'} style={{color:'black'}} onClick={() => setIsExpand(true)}><RiArrowDownWideLine size={12}/></BeautyButton>
                </div>}


                {editable && <div style={{display:'flex', flexDirection: 'row', justifyContent:'end', width:'100%', alignItems:'center'}}>
                                <label>{inputLength}</label>
                                <div style={{width:'10px'}}/>
                                <BeautyButton type={'transparent'} tooltip={'적용'} style={{color:'black'}} isLoading={isModifyLoading} onClick={onClickModifyCompleteInner}>{<MdOutlineDoneOutline siz={22}/>}</BeautyButton>
                                <div style={{width:'20px'}}></div>
                                <BeautyButton type={'transparent'} tooltip={'취소'} style={{color:'black'}} disabled={isModifyLoading} onClick={onClickModifyCancelInner} >{<MdCancel size={22}/>}</BeautyButton>
                            </div>
                }

            </div>
        ) : null
}


