
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
    const refCommentEdit = useRef(null)
    const maxCharLength = 1000    
    

    useImperativeHandle(ref, () => ({

            getComment: () =>{

                if(!refCommentEdit.current)
                    return null
                
                return refCommentEdit.current.value
            }
        }
    ))
        
    
    // useEffect(() =>{

    //     if(refComment.current){
            
    //         const element = refComment.current
            
    //         setIsClamped(element.scrollHeight >  element.clientHeight)
    //     }

    // }, [refComment])

    

    const onInput = (e) => {
                                  
        setInputLength(e.nativeEvent.target.value.length + '/' + maxCharLength)
    }



    useEffect(()=>{

        if(editable){

            if(refCommentEdit.current){
                
                refCommentEdit.current.focus()
                const length = comment.comment.length
                refCommentEdit.current.setSelectionRange(length, length)
                setInputLength(length + '/' + maxCharLength)
            }
        }
        else{

            if(refComment.current){
            
                const element = refComment.current
            
                setIsClamped(element.scrollHeight >  element.clientHeight)
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

                {editable && <div style={{display:'grid', gridTemplateColumns:'1fr', width:'100%'}}>
                    <textarea ref={refCommentEdit} className={'commentEdit'}  placeholder={'글을 입력하세요'} defaultValue={comment.comment} suppressContentEditableWarning={true} maxLength={maxCharLength} style={{boxSizing: 'border-box', width:'100%',  minHeight: '4lh', resize:'none', maxHeight:'6lh', border:'0px solid lightgray', fieldSizing: 'content', overflowY:'auto', padding:'5px', backgroundColor:'green'}} onInput={onInput}/>
                </div>
                }
                {!editable && <div ref={refComment} className={isExpand ? 'none-clamped-text' : 'clamped-text'} style={{boxSizing: 'border-box', '--line-count':5, whiteSpace: 'pre-line', backgroundColor:'lightblue', width:'auto', padding:'5px'}}>
                    {/* {comment.comment + "sdafasdflisdajf\nklsdfjkls\njdfsi\nfwoie\njfwoiejf\nwoiejfiwoejf\noiwejf\noiwejfoiwejf\noiwejf\noiwjfwoiejfoiwjwoi\nejfo\niwjoijwofijwoeijwojwoijwfoijo"} */}
                    {comment.comment}
                </div>
                }
                
                {!editable && isClamped && !isExpand && <div style={{position: 'absolute', alignSelf:'end'}}>
                    <BeautyButton type={'transparent'} style={{color:'black'}} onClick={() => setIsExpand(true)}><RiArrowDownWideLine size={12}/></BeautyButton>
                </div>}

                {editable && <div style={{display:'flex', flexDirection: 'row', justifyContent:'end', width:'100%', alignItems:'center'}}>
                                <label>{inputLength}</label>
                                <div style={{width:'10px'}}/>
                                <BeautyButton type={'transparent'} tooltip={'적용'} style={{color:'black'}} isLoading={isModifyLoading} onClick={onClickModifyCompleteInner}>{<MdOutlineDoneOutline siz={22}/>}</BeautyButton>
                                <div style={{width:'10px'}}></div>
                                <BeautyButton type={'transparent'} tooltip={'취소'} style={{color:'black'}} disabled={isModifyLoading} onClick={onClickModifyCancelInner} >{<MdCancel size={22}/>}</BeautyButton>
                            </div>
                }

            </div>
        ) : null
}


