
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as UserAPI from '../../api/UserAPI.js'
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
import UserImage from "../../common/UserImage.js";

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

    const [users, setUsers] = useState(null)

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

            const userIDList = []

            comments.forEach((item, index) => {
                userIDList.push(item.user_id)
            })                        

            getUsers([...new Set(userIDList)]).then((resUsers)=>{
                
                if(resUsers == null){
                    window.showToast('사용자 목록을 가져 올 수 없습니다', 'error')
                    return
                }

                setUsers(resUsers)

                comments.forEach((item, index) =>{

                    const user = resUsers.find(user => (user.id == item.user_id))

                    if(user != null)
                        item.user = user
                })

                const upperComments = comments.filter(comment => (comment.comment_id == null))

                for(const upperComment of upperComments)
                    upperComment.replies = comments.filter(reply => reply.comment_id == upperComment.id)
            
                setComments(upperComments)
            })
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

        let findUser = users.find((item) => item.id == auth.user_id)

        if(findUser == null) {
            const users = await getUsers([auth.user_id])
            if(users.length > 0){
                findUser = users[0]
                setUsers([...users, findUser])
            }
        }

        comments.unshift({id:res.id, replies:[], update_at:null, create_at:Date.now(), user:findUser, ...payload})

        setComments(structuredClone(comments))

        refCommentText.current.value = ''                        
    }



    const getUsers = async(userIDList) =>{

        return await UserAPI.getUsers('id=' + userIDList)        
    }


    const onClickPostReplyAdd = async(comment_id) =>{

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

        let findUser = users.find((item) => item.id == auth.user_id)

        if(findUser == null){
            const users = await getUsers([auth.user_id])
            if(users.length > 0){                
                findUser = users[0]
                setUsers([...users, findUser])
            }
        }
        
        findComment.replies.unshift({id:res.id, update_at:null, create_at:Date.now(), user:findUser, ...payload})

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


    const onClickPostReplyOpen = async(id) =>{

        setReplyAddCommentId(id)
    }


    const onClickPostReplyCancel = async(id) =>{

        setReplyAddCommentId(-1)
    }


    return comments ? (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'center', width:'100%'}}>
            <textarea ref={refCommentText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}} onInput={onInputComment}/>
            <BeautyButton isLoading={isPostLoading} onClick={()=>onClickPostComment(null)}>{'추가'}</BeautyButton>
            <div style={{width:'100%'}}>
                {comments.map((data, index) => 
                    <div key={data.id} style={{display:'flex', flexDirection: 'column', justifyContent:'left', border:'1px solid lightgray'}}>
                        <Comment key={data.id} comment={data} onRemoved={()=>onRemoveComment(data.id)}/>
                        {data.replies.map((data, index) =>
                            <Comment key={data.id} comment={data} style={{paddingLeft:'30px'}} onRemoved={()=>onRemoveReply(data.id)}/>
                        )}

                        {data.id == replyAddCommentId && <BeautyButton onClick={() => onClickPostReplyCancel(data.id)}>{'대댓글 취소'}</BeautyButton>}
                        {data.id != replyAddCommentId && <BeautyButton onClick={() => onClickPostReplyOpen(data.id)}>{'대댓글 추가'}</BeautyButton>}
                        {data.id == replyAddCommentId && <textarea ref={refReplyText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={100} style={{width:'100%', resize:'none', maxHeight:'200px', minHeight:'100px', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}}/>}
                        {data.id == replyAddCommentId && <BeautyButton isLoading={isReplyPostLoading} onClick={()=> onClickPostReplyAdd(data.id)}>{'대댓글 추가'}</BeautyButton>}
                    </div>
                )}
                
            </div>
        </div>
        ) : null
}
