
import React, {useState, useContext, useEffect, useRef } from "react";

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

export default function(props) {

    const onRemoved = props.onRemoved

    const combinedStyle = { ...props.style }
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isModifyLoading, setIsModifyLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const [isModify, setIsModify] = useState(false)
    const [comment, setComment] = useState(props.comment)
    const [isGreatLoading, setIsGreatLoading] = useState(false)
    const [isClamped, setIsClamped] = useState(false)
    const [isExpand, setIsExpand] = useState(false)

    const refComment = useRef(null)
    
    const navigate = useNavigate()


    const onClickNavigateUser = async(userId) =>{
        
        navigate('/user/' + userId)
    }


    useEffect(() =>{

        if(!refComment.current)
            return

        const element = refComment.current
        
        setIsClamped(element.scrollHeight >  element.clientHeight)
                
    }, [])


    const onClickModifyConfirm = async()=>{

        if(!(validAuth(auth) && auth.user_id == comment.user_id))
            return

        if(!refText.current)
            return

        const modifiedComment = refText.current.value

        if(modifiedComment.length == 0) {
            window.showToast('입력된 글이 없습니다', 'error')
            return
        }    

        if(modifiedComment == comment.comment){
            window.showToast('수정된 내용이 없습니다', 'error')
            return
        }

        const payload = {
            comment:modifiedComment
        }

        setIsModifyLoading(true)

        const res = await CommentAPI.putComment(auth.jwt, comment.id, payload)

        setIsModifyLoading(false)

        if(res == null){
            window.showToast('댓글 수정에 실패하였습니다', 'error')
            return
        }

        window.showToast('댓글 수정에 성공하였습니다', 'info')

        comment.comment = modifiedComment
        comment.update_at = Date.now()
        setIsModify(false)
    }


    const onClickModifyDelete = async()=>{

        if(!(validAuth(auth) && auth.user_id == comment.user_id))
            return

        setIsDeleteLoading(true)

        const res = await CommentAPI.deleteComment(auth.jwt, comment.id)

        setIsDeleteLoading(false)

        if(res == null){
            window.showToast('댓글 삭제에 실패하였습니다', 'error')
            return
        }

        window.showToast('댓글 삭제에 성공하였습니다', 'info')

        if(onRemoved)
            onRemoved()
        
        setIsModify(false)
    }


    const onClickModifyCancel = async(id)=>{
        
        setIsModify(false)
    }


    const onClickModifyOpen = () =>{
        
        setIsModify(true)
    }


    const onClickExpand = ()=> {
        
        setIsExpand(true)
    }


    return comment ? (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'end', backgroundColor:'orange', alignItems:'end'}}>
            <div ref={refComment} className={isExpand ? 'none-clamped-text' : 'clamped-text'} style={{'--line-count':5, whiteSpace: 'pre-line', backgroundColor:'lightblue'}}>{comment.comment}</div>
            {isClamped && !isExpand && <div style={{position: 'absolute'}}>
                <BeautyButton type='transparent' style={{color:'black'}} onClick={onClickExpand}><RiArrowDownWideLine size={12}/></BeautyButton>
            </div>}
        </div>
        ) : null
        



    // return comment ? (
    //         <div style={{display:'flex', flexDirection: 'row', alignItems:'start', justifyContent:'start', border:'0px', ...combinedStyle}}>
    //             <div className={'clamped-text'} style={{'--line-count':3, whiteSpace: 'pre-line', marginTop:'10px', marginBottom:'10px', backgroundColor:'lightblue'}}>{comment.comment}</div>
                    
                
    //             {/* {!isModify && validAuth(auth) && auth.user_id == comment.user_id && <BeautyButton type={'success'} onClick={()=>onClickModifyOpen()}>{'수정'}</BeautyButton>}
    //             {isModify &&
    //             <div>
    //                 <textarea ref={refText} className={'commentEdit'}  placeholder={'댓글을 수정하세요'} defaultValue={comment.comment} maxLength={1000} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px', fieldSizing: 'content', overflowY:'auto'}}></textarea>
    //                 <BeautyButton type={'warning'} isLoading={isModifyLoading} onClick={()=>onClickModifyConfirm()}>{'수정 입력'}</BeautyButton>
    //                 <BeautyButton type={'warning'} onClick={()=>onClickModifyCancel()}>{'수정 취소'}</BeautyButton>
    //                 <BeautyButton type={'warning'} isLoading={isDeleteLoading} onClick={()=>onClickModifyDelete()}>{'삭제'}</BeautyButton>
    //             </div>
    //             } */}
    //             </div>
    //         ) : null
}


