
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

export default function({article_id}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [comments, setComments] = useState(null)
    const [replyOpenCommentId, setReplyOpenCommentId] = useState(-1)
    const [isReplyPostLoading, setIsReplyPostLoading] = useState(false)
    const [isPostLoading, setIsPostLoading] = useState(false)
    const refCommentText = useRef(null)
    const refReplyText = useRef(null)
    const navigate = useNavigate()

    useEffect(()=>{

        CommentAPI.getArticleComments(article_id).then((comments) =>{

            if(comments == null){
                window.showToast('댓글을 가져 올 수 없습니다', 'error')
                return
            }
            console.log(comments)
            setComments(comments)

        })
        

    }, [article_id])




    const onClickPostComment = async(comment_id) =>{

        if(!validAuth(auth))
            return

        if(!refCommentText.current)
            return

        const comment = refCommentText.current.value

        if(comment.length == 0)
            return

        setIsPostLoading(true)

        const res = postCommentCore(comment, article_id, auth.user_id, null)

        setIsPostLoading(false)

        if(res == null){
            window.showToast('댓글 작성에 실패하였습니다', 'error')
            return
        }

        window.showToast('댓글이 작성 되었습니다', 'info')
    }


    const postCommentCore = async(comment, article_id, user_id, comment_id) =>{

        const payload = {
            comment:comment,
            article_id:article_id,
            user_id:user_id,
            comment_id:comment_id
        }

        return await CommentAPI.postComment(auth.jwt, payload)

    }


    const onClickPostReply = async(comment_id) =>{

        if(!validAuth(auth))
            return

        if(!refReplyText.current)
            return

        const reply = refReplyText.current.value

        if(reply.length == 0)
            return

        setIsReplyPostLoading(true)

        const res = await postCommentCore(reply, article_id, auth.user_id, comment_id)

        setIsReplyPostLoading(false)

        if(res == null){
            window.showToast('대댓글 작성에 실패하였습니다', 'error')
            return
        }

        window.showToast('대댓글이 작성 되었습니다', 'info')
        
        setReplyOpenCommentId(-1)
    }


    const onClickNavigateUser = async(userId) =>{

        console.log(userId)

        navigate('/user/' + userId)
    }


    const onClickModify = async(id)=> {
        
        console.log(id)
    }


    const onClickPostReplyOpen = async(id) =>{

        setReplyOpenCommentId(id)
    }


    const onClickPostReplyClose = async(id) =>{

        setReplyOpenCommentId(-1)
    }


    return comments ? (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'center', width:'100%'}}>
            <textarea ref={refCommentText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}}/>
            <BeautyButton isLoading={isPostLoading} onClick={()=>onClickPostComment(null)}>{'추가'}</BeautyButton>
            <div style={{width:'100%'}}>
                {comments.map((data, index) => 
                    <div key={data.id} style={{display:'flex', flexDirection: 'row', alignItems:'center', border:'1px solid lightgray'}}>
                        <ProfileImage size={64} userId={data.user_id} onClick={()=> onClickNavigateUser(data.user_id)}/>
                        <div className={'clamped-text'} style={{'--line-count':3, whiteSpace: 'pre-line'}}>{data.comment}</div>
                        <div>{(data.update_at ? '수정됨' : '작성됨') + TimestampToString(data.update_at ? data.update_at : data.create_at)}</div>
                        {data.id == replyOpenCommentId && <BeautyButton onClick={() => onClickPostReplyClose(data.id)}>{'대댓글 닫기'}</BeautyButton>}
                        {data.id != replyOpenCommentId && <BeautyButton onClick={() => onClickPostReplyOpen(data.id)}>{'대댓글 열기'}</BeautyButton>}
                        {data.id == replyOpenCommentId && <textarea ref={refReplyText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}}/>}
                        {data.id == replyOpenCommentId && <BeautyButton isLoading={isReplyPostLoading} onClick={()=> onClickPostReply(data.id)}>{'대댓글 추가'}</BeautyButton>}
                        {validAuth(auth) && auth.user_id == data.user_id && <BeautyButton type={'warning'} onClick={()=>onClickModify(data.id)}>{'수정'}</BeautyButton>}
                    </div>
                )}
                
            </div>
        </div>
        ) : null
}
