
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import Modal from "../../common/Modal.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import CountWithUnit from "../../util/CountWithUnit.js";


import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import * as CommentAPI from '../../api/CommentAPI.js'
import ProfileImage from "../../common/ProfileImage.js";

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

export default function(props) {

    const comment = props.comment
    const onRemoved = props.onRemoved

    const combinedStyle = {
    
    ...props.style // The passed style object
    }
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isModifyLoading, setIsModifyLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const [isModify, setIsModify] = useState(false)    

    const refText = useRef(null)
    
    const navigate = useNavigate()

    const onClickNavigateUser = async(userId) =>{
        
        navigate('/user/' + userId)
    }


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


    return comment ? (
            <div style={{display:'flex', flexDirection: 'row', alignItems:'center', border:'1px solid lightgray', ...combinedStyle}}>
                <div style={{display:'flex', flexDirection: 'column', justifyContent:'start'}}>
                    <ProfileImage size={64} userId={comment.user_id} onClick={()=> onClickNavigateUser(comment.user_id)}/>
                    <div>{(comment.update_at ? '수정됨' : '작성됨') + TimestampToString(comment.update_at ? comment.update_at : comment.create_at)}</div>
                </div>

                <div className={'clamped-text'} style={{'--line-count':3, whiteSpace: 'pre-line'}}>{comment.comment}</div>
                {!isModify && validAuth(auth) && auth.user_id == comment.user_id && <BeautyButton type={'success'} onClick={()=>onClickModifyOpen()}>{'수정'}</BeautyButton>}
                {isModify &&
                <div>
                    <textarea ref={refText} className={'commentEdit'}  placeholder={'댓글을 수정하세요'} defaultValue={comment.comment} maxLength={1000} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}}></textarea>
                    <BeautyButton type={'warning'} isLoading={isModifyLoading} onClick={()=>onClickModifyConfirm()}>{'수정 입력'}</BeautyButton>
                    <BeautyButton type={'warning'} onClick={()=>onClickModifyCancel()}>{'수정 취소'}</BeautyButton>
                    <BeautyButton type={'warning'} isLoading={isDeleteLoading} onClick={()=>onClickModifyDelete()}>{'삭제'}</BeautyButton>
                </div>
                }
                </div>
            ) : null
}
