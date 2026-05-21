
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
import CommentGreat from "./CommentGreat.js";
import { HiDotsVertical } from "react-icons/hi";
import { FaCommentMedical } from "react-icons/fa6";


import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import * as CommentAPI from '../../api/CommentAPI.js'
import UserImage from "../../common/UserImage.js";
import * as UserRepository from "./UserRepository.js";

import './Comments.css'
import Categories  from "./Categories.js";
import Comment  from "./Comment.js";
import CommentEdit from "./CommentEdit.js";
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
    const [openReplyEditCommentId, setOpenReplyEditCommentId] = useState(-1)
    const [isOpenCommentEdit, setIsOpenCommentEdit] = useState(false)

    const [showReplies, setShowReplies] = useState([])

    const navigate = useNavigate()

    useEffect(()=>{

        CommentAPI.getArticleComments(article_id).then((comments) =>{

            if(comments == null){
                window.showToast('댓글을 가져 올 수 없습니다', 'error')
                return
            }
            
            comments.sort((a, b) => { return b.create_at - a.create_at})

            const userIDList = comments.map(item => item.user_id)
        
            UserRepository.getByIDList([...new Set(userIDList)]).then((resUsers)=>{
                
                if(resUsers == null) {
                    window.showToast('사용자 목록을 가져 올 수 없습니다', 'error')
                    return
                }
                
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



    const onOpenCommentEdit = async() =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{relogin:true}})
            return
        }

        setIsOpenCommentEdit(true)
    }


    const onPostComment = async(text) =>{

        if(!validAuth(auth))
            return false
        
        const payload = {

            comment:text,
            article_id:article_id,
            user_id:auth.user_id,
            comment_id:null
        }

        const res = await CommentAPI.postComment(auth.jwt, payload)        

        if(res == null){
            window.showToast('댓글 작성에 실패하였습니다', 'error')
            return false
        }

        window.showToast('댓글이 작성 되었습니다', 'info')                
        
        const user = await UserRepository.getByID(auth.user_id)

        comments.unshift({id:res.id, replies:[], update_at:null, create_at:Date.now(), dislike_count:0, like_count:0, user:user, ...payload})
        setComments(structuredClone(comments))
        setIsOpenCommentEdit(false)

        return true
    }


    const onClickReplyEditOpen = async(id) =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{relogin:true}})
            return
        }

        setOpenReplyEditCommentId(id)
    }


    const onPostReply = async(text)=>{

        if(!validAuth(auth))
            return false

        const findComment = comments.find(comment => comment.id == openReplyEditCommentId)

        if(findComment == null)
            return false

        const payload = {
            comment:text,
            article_id:article_id,
            user_id:auth.user_id,
            comment_id:openReplyEditCommentId
        }

        const res = await CommentAPI.postComment(auth.jwt, payload)
        
        if(res == null){
            window.showToast('대댓글 작성에 실패하였습니다', 'error')
            return false
        }

        window.showToast('대댓글이 작성 되었습니다', 'info')

        const user = await UserRepository.getByID(auth.user_id)
        
        findComment.replies.unshift({id:res.id, update_at:null, create_at:Date.now(), dislike_count:0, like_count:0, user:user, ...payload})
        setComments(structuredClone(comments))
        setOpenReplyEditCommentId(-1)

        return true
    }


    const onClickNavigateUser = async(userId) =>{
        
        navigate('/user/' + userId)
    }


    const onClickShowReplies = async(comment_id) => {

        if(!showReplies.find(id => comment_id == id))
            setShowReplies([...showReplies, comment_id])
        else
            setShowReplies(showReplies.filter(id => id !== comment_id))
    }

    const isShowReplies = (comment_id) => {

        return showReplies.find(id => comment_id == id)
    }

    return comments ? (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'start', marginTop:'20px', width:'100%'}}>
            {isOpenCommentEdit && <CommentEdit onPostText={onPostComment} onCancel={()=>{setIsOpenCommentEdit(false)}}/>}
            <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <label>{'댓글 (' + comments.length + ')'}</label>
                {!isOpenCommentEdit && <BeautyButton type={'success'} onClick={onOpenCommentEdit}>{'댓글 작성'}</BeautyButton>}
            </div>
            
            {comments.map((data, index) => 
                <div key={data.id} style={{display:'flex', flexDirection: 'column', justifyContent:'left', border:'1px solid lightgray'}}>

                    <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                        <div style={{display:'flex', flexDirection: 'column', justifyContent:'start'}}>
                            <UserImage size={48} user={data.user} onClick={()=> onClickNavigateUser(data.user_id)}/>
                            <div style={{backgroundColor:'gray', flex:'1'}}/>
                        </div>
                        <div style={{display:'flex', flexDirection: 'column', justifyContent:'start', width:'100%'}}>
                            <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                <div style={{fontSize:'14px', marginRight:'10px'}}>{data.user.nickname}</div>
                                <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{TimestampToString(data.create_at) + (data.update_at ? '(수정됨)' : '')}</div>
                            </div>
                            <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                <Comment key={data.id} comment={data} onRemoved={()=>onRemoveComment(data.id)}/>
                                <BeautyButton type={'transparent'} style={{color:'black'}}><HiDotsVertical siz={22}/></BeautyButton>
                            </div>
                            <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                <CommentGreat comment={data}></CommentGreat>
                                <div style={{width:'20px'}}></div>
                                <BeautyButton type={'transparent'} tooltip={'답글 작성'} style={{color:'black'}} onClick={() => onClickReplyEditOpen(data.id)}>{<FaCommentMedical siz={22}/>}</BeautyButton>
                            </div>

                            {data.id == openReplyEditCommentId && <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                    <UserImage size={32} userId={auth.user_id} onClick={()=> onClickNavigateUser(auth.user_id)}/>
                                    <CommentEdit onPostText={onPostReply} onCancel={() =>{setOpenReplyEditCommentId(-1)}}/>
                                </div>                                            
                            }

                            {data.replies.length > 0 &&
                                <BeautyButton type={'transparent'} style={{color:'black', alignSelf:'flex-start'}} onClick={()=> onClickShowReplies(data.id)}>{'답글 (' + data.replies.length + ') ' + (isShowReplies(data.id) ? '∧' : '∨')}</BeautyButton>
                            }
                            
                            {isShowReplies(data.id) && data.replies.map((data, index) =>
                                <div key={data.id} style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                    <div style={{display:'flex', flexDirection: 'column', justifyContent:'start'}}>
                                        <UserImage size={32} user={data.user} onClick={()=> onClickNavigateUser(data.user_id)}/>
                                        <div style={{backgroundColor:'lightgray', flex:'1'}}/>
                                    </div>
                                    <div style={{display:'flex', flexDirection: 'column', justifyContent:'start', width:'100%'}}>
                                        <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                            <div style={{fontSize:'14px', marginRight:'10px'}}>{data.user.nickname}</div>
                                            <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{TimestampToString(data.create_at) + (data.update_at ? '(수정됨)' : '')}</div>
                                        </div>
                                        <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                            <Comment key={data.id} comment={data} onRemoved={()=>onRemoveReply(data.id)}/>
                                            <BeautyButton type={'transparent'} style={{color:'black'}}><HiDotsVertical siz={22}/></BeautyButton>
                                        </div>
                                        <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                            <CommentGreat comment={data}></CommentGreat>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}                
            </div>
        
        ) : null
}
