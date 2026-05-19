
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
import Comment  from "./Comment.js";
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
    const [replies, setReplies] = useState(null)
    const [replyAddCommentId, setReplyAddCommentId] = useState(-1)
    const [replyModifyCommentId, setReplyModifyCommentId] = useState(-1)
    const [isReplyPostLoading, setIsReplyPostLoading] = useState(false)
    const [isPostLoading, setIsPostLoading] = useState(false)

    const [modifyComment, setModifyComment] = useState(null)
    const [modifyReply, setModifyReply] = useState(null)

    const refCommentText = useRef(null)    
    const refReplyText = useRef(null)
    const refModifyCommentText = useRef(null)
    const refModifyReplyText = useRef(null)
    const navigate = useNavigate()

    useEffect(()=>{

        CommentAPI.getArticleComments(article_id).then((comments) =>{

            if(comments == null){
                window.showToast('댓글을 가져 올 수 없습니다', 'error')
                return
            }

            const upperComments = comments.filter(comment => (comment.comment_id == null))

            for(const upperComment of upperComments)
                upperComment.replies = comments.filter(reply => reply.comment_id == upperComment.id)


            console.log(upperComments)
            
            setComments(upperComments)
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

        const payload = {

            comment:comment,
            article_id:article_id,
            user_id:auth.user_id,
            comment_id:null
        }

        const res = await CommentAPI.postComment(auth.jwt, payload)

        setIsPostLoading(false)

        if(res == null){
            window.showToast('댓글 작성에 실패하였습니다', 'error')
            return
        }

        window.showToast('댓글이 작성 되었습니다', 'info')        

        comments.unshift({id:res.id, replies:[], update_at:null, create_at:Date.now(), ...payload})

        refCommentText.current.value = ''
    }


    const onClickPostReply = async(comment_id) =>{

        if(!validAuth(auth))
            return

        const findComment = comments.find(comment => comment.id == comment_id)

        if(findComment == null)
            return

        if(!refReplyText.current)
            return

        const reply = refReplyText.current.value

        if(reply.length == 0){
            window.showToast('입력된 글이 없습니다', 'error')
            return
        }

        setIsReplyPostLoading(true)

        const payload = {
            comment:reply,
            article_id:article_id,
            user_id:auth.user_id,
            comment_id:comment_id
        }

        const res = await CommentAPI.postComment(auth.jwt, payload)

        setIsReplyPostLoading(false)

        if(res == null){
            window.showToast('대댓글 작성에 실패하였습니다', 'error')
            return
        }

        window.showToast('대댓글이 작성 되었습니다', 'info')
        
        findComment.replies.unshift({id:res.id, ...payload})

        setComments(structuredClone(comments))
        
        setReplyAddCommentId(-1)
    }



    const findReply = (id)=>{

        const comment = comments.find(comment => (
            comment.replies.find(reply => reply.id == id)
        ))

        if(!comment)
            return null

        const reply = comment.replies.find(reply => reply.id == id)

        if(!reply)
            return null

        return reply
    }




    const onInputModifyComment = (event)=>{

        console.log(event)

    }

    const onInputComment = (event) =>{

        console.log(event)
        
    }


    const onInputModifyReply = (event) =>{
        
        console.log(event)
    }


    const onRemoveReply = (id) => {
        
        const comment = comments.find(comment => (
            comment.replies.find(reply => reply.id == id)
        ))
    
        if(!comment)
            return
    
        comment.replies = comment.replies.filter(reply => reply.id != id)                    

        setComments(structuredClone(comments))        
    }


    const onRemoveComment = (id) => {

        setComments(structuredClone(comments.filter(comment => comment.id != id)))
    }


    return comments ? (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'center', width:'100%'}}>
            <textarea ref={refCommentText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}} onInput={onInputComment}/>
            <BeautyButton isLoading={isPostLoading} onClick={()=>onClickPostComment(null)}>{'추가'}</BeautyButton>
            <div style={{width:'100%'}}>
                {comments.map((data, index) => 
                    <div key={data.id} style={{display:'flex', flexDirection: 'column', justifyContent:'left', border:'1px solid lightgray'}}>
                        <Comment key={data.id} comment={data} onRemoved={()=>onRemoveComment(data.id)}/>                        
                        {/* <div style={{display:'flex', flexDirection: 'row', alignItems:'center', border:'1px solid lightgray'}}>
                            <ProfileImage size={64} userId={data.user_id} onClick={()=> onClickNavigateUser(data.user_id)}/>
                            {!modifyComment && <div className={'clamped-text'} style={{'--line-count':3, whiteSpace: 'pre-line'}}>{data.comment}</div>}
                            {!modifyComment && validAuth(auth) && auth.user_id == data.user_id && <BeautyButton type={'warning'} onClick={()=>onClickModifyCommentOpen(data.id)}>{'수정'}</BeautyButton>}
                            {modifyComment && data.id == modifyComment.id && 
                                <div>
                                    <textarea ref={refModifyCommentText} className={'commentEdit'}  placeholder={'댓글을 수정하세요'} defaultValue={modifyComment.comment} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}} onInput={onInputModifyComment}></textarea>
                                    <BeautyButton type={'warning'} onClick={()=>onClickModifyCommentConfirm(data.id)}>{'수정 입력'}</BeautyButton>
                                    <BeautyButton type={'warning'} onClick={()=>onClickModifyCommentCancel(data.id)}>{'수정 취소'}</BeautyButton>
                                    <BeautyButton type={'warning'} onClick={()=>onClickModifyCommentDelete(data.id)}>{'삭제'}</BeautyButton>
                                </div>
                            }
                            <div>{(data.update_at ? '수정됨' : '작성됨') + TimestampToString(data.update_at ? data.update_at : data.create_at)}</div>
                        </div> */}
                        {data.replies.map((data, index) =>
                            <Comment key={data.id} comment={data} style={{paddingLeft:'30px'}} onRemoved={()=>onRemoveReply(data.id)}/>
                        )}

                        {data.id == replyAddCommentId && <BeautyButton onClick={() => onClickPostReplyCancel(data.id)}>{'대댓글 취소'}</BeautyButton>}
                            {data.id != replyAddCommentId && <BeautyButton onClick={() => onClickPostReplyOpen(data.id)}>{'대댓글 추가'}</BeautyButton>}
                            {data.id == replyAddCommentId && <textarea ref={refReplyText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}}/>}
                            {data.id == replyAddCommentId && <BeautyButton isLoading={isReplyPostLoading} onClick={()=> onClickPostReply(data.id)}>{'대댓글 추가'}</BeautyButton>
                        }
                    </div>
                )}
                
            </div>
        </div>
        ) : null
}
