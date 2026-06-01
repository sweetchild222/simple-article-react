import {useState, useContext, useEffect, } from "react";
import { useNavigate } from 'react-router-dom';

import AuthContext from "@util/AuthContext.js";
import ElapsedTime from "@util/ElapsedTime.js";
import BeautyButton from "@gui/BeautyButton.js";
import UserImage from "@gui/UserImage.js";

import * as CommentAPI from '@rest/CommentAPI.js'

import Great from "./Great.js";
import ReplyLine from "./ReplyLine.js";
import Comment  from "./Comment.js";
import Writer from "./Writer.js";
import ControlMenu from "./ControlMenu.js";
import * as UserRepository from "./UserRepository.js";

import { FaCommentMedical } from "react-icons/fa6";
import { SlArrowDown } from "react-icons/sl";
import { SlArrowUp } from "react-icons/sl";


export default function({article_id}) {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [comments, setComments] = useState(null)
    const [openReplyEditCommentId, setOpenReplyEditCommentId] = useState(-1)
    const [isOpenCommentEdit, setIsOpenCommentEdit] = useState(false)
    const [modifyModeCommentId, setModifyModeCommentId] = useState(-1)
    const [atCandidates, setAtCandidates] = useState([])
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
                
                setAtCandidates(resUsers.filter(item=> item.nickname != ''))
                
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


    const removeComment = async(comment_id) => {

        const comment = findComment(comment_id)

        if(comment == null)
            return

        if(!(validAuth(auth) && auth.user_id == comment.user_id))
            return false
        
        const res = await CommentAPI.deleteComment(auth.jwt, comment_id)
        
        if(res == null){
            window.showToast('댓글 삭제에 실패하였습니다', 'error')
            return false
        }

        window.showToast('댓글 삭제에 성공하였습니다', 'info')

        return true
    }


    const findComment = (comment_id) =>{

        const comment = comments.find(item => item.id == comment_id)
        
        if(comment)
            return comment
        
        for(const comment of comments){

            const reply = comment.replies.find(replyItem => replyItem.id == comment_id)

            if(reply)
                return reply
        }

        return null
    }


    const onRemoveComment = async(comment_id) => {

        if(await removeComment(comment_id))
            setComments(structuredClone(comments.filter(item => item.id != comment_id)))
    }

    const onRemoveReply = async(comment_id) => {
            
        const comment = comments.find(commentItem => (
            commentItem.replies.find(replyItem => replyItem.id == comment_id)
        ))
    
        if(!comment)
            return

        if(await removeComment(comment_id)){
            comment.replies = comment.replies.filter(replyItem => replyItem.id != comment_id)
            setComments(structuredClone(comments))
        }
    }


    const onOpenCommentEdit = async() =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{relogin:true}})
            return
        }

        setIsOpenCommentEdit(true)
        setOpenReplyEditCommentId(-1)
        setModifyModeCommentId(-1)
    }


    const onPostComment = async(comment) =>{

        if(!validAuth(auth))
            return false

        if(comment.length == 0) {
            window.showToast('입력된 글이 없습니다', 'error')
            return false
        }
        
        const payload = {

            comment:comment,
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

        if(user && user.nickname != '' && !atCandidates.find(item => item.id == user.id))
            setAtCandidates([...atCandidates, user])

        return true
    }


    const onClickReplyEditOpen = async(id) =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{relogin:true}})
            return
        }

        setOpenReplyEditCommentId(id)
        setModifyModeCommentId(-1)
        setIsOpenCommentEdit(false)
    }


    const onPostReply = async(comment)=>{

        if(!validAuth(auth))
            return false

        if(comment.length == 0) {
            window.showToast('입력된 글이 없습니다', 'error')
            return false
        }

        const findComment = comments.find(comment => comment.id == openReplyEditCommentId)

        if(findComment == null)
            return false

        const payload = {
            comment:comment,
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

        if(!showReplies.find(id => openReplyEditCommentId == id))
            setShowReplies([...showReplies, openReplyEditCommentId])                    
            
        setOpenReplyEditCommentId(-1)

        if(user && !atCandidates.find(item => item.id == user.id))
            setAtCandidates([...atCandidates, user])

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

        setModifyModeCommentId(-1)
    }


    const isShowReplies = (comment_id) => {

        const find = showReplies.find(id => comment_id == id)

        return find != null
    }

    
    const onModifyComment = async(comment_id) => {

        setModifyModeCommentId(comment_id)
        setOpenReplyEditCommentId(-1)   
        setIsOpenCommentEdit(false)
    }


    const onClickModifyComplete = async(comment_id, modifiedComment) => {

        const comment = findComment(comment_id)

        if(comment == null)
            return

        if(!(validAuth(auth) && auth.user_id == comment.user_id))
            return false
        
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

        const res = await CommentAPI.putComment(auth.jwt, comment.id, payload)        

        if(res == null){
            window.showToast('수정에 실패하였습니다', 'error')
            return
        }
    
        window.showToast('수정에 성공하였습니다', 'info')
    
        setModifyModeCommentId(-1)
        comment.comment = modifiedComment
        comment.update_at = Date.now()
        setComments(structuredClone(comments))
    }


    const onClickModifyCancel = async(comment_id) => {

        setModifyModeCommentId(-1)
    }

    
    return comments ? (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'start', marginTop:'20px', width:'100%'}}>
            {isOpenCommentEdit && <Writer onPostText={onPostComment} atCandidates={atCandidates} onCancel={()=>{setIsOpenCommentEdit(false)}}/>}
            <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <label>{'댓글 (' + comments.length + ')'}</label>
                {!isOpenCommentEdit && <BeautyButton type={'success'} onClick={onOpenCommentEdit}>{'댓글 작성'}</BeautyButton>}
            </div>
            
            {comments.map((data, index) => 
                <div key={data.id} style={{display:'flex', flexDirection: 'column', justifyContent:'left', border:'1px solid lightgray'}}>
                    <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                        <div style={{display:'flex', flexDirection: 'column', justifyContent:'start'}}>
                            <UserImage size={48} user={data.user} onClick={()=> onClickNavigateUser(data.user_id)}/>
                            <ReplyLine isShowReplies={isShowReplies(data.id)} editableId={modifyModeCommentId}/>
                        </div>
                        <div style={{display:'flex', flexDirection: 'column', justifyContent:'start', width:'100%'}}>
                            <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                <div style={{fontSize:'14px', marginRight:'10px'}}>{data.user.nickname}</div>
                                <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{ElapsedTime(data.create_at) + (data.update_at ? '(수정됨)' : '')}</div>
                            </div>
                            
                            <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                <Comment atCandidates={atCandidates} key={data.id} comment={data} editable={modifyModeCommentId == data.id} onClickModifyComplete={(modifiedComment)=> onClickModifyComplete(data.id, modifiedComment)} onClickModifyCancel={()=>onClickModifyCancel(data.id)}/>
                                <ControlMenu style={{visibility: (validAuth(auth) && auth.user_id == data.user_id) ? 'visible' : 'hidden'}} onRemove={()=>onRemoveComment(data.id)} onModify={()=>onModifyComment(data.id)}/>
                            </div>

                            {!(modifyModeCommentId == data.id) && <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                <Great comment_id={data.id} like_count={data.like_count} dislike_count={data.dislike_count}></Great>                                
                                <div style={{width:'20px'}}></div>
                                <BeautyButton type={'transparent'} tooltip={'답글 작성'} style={{color:'black'}} onClick={() => onClickReplyEditOpen(data.id)}>{<FaCommentMedical size={22}/>}</BeautyButton>
                            </div>
                            }

                            {data.id == openReplyEditCommentId && <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                <UserImage size={32} userId={auth.user_id} onClick={()=> onClickNavigateUser(auth.user_id)}/>
                                <Writer onPostText={onPostReply} atCandidates={atCandidates} onCancel={() =>{setOpenReplyEditCommentId(-1)}}/>
                            </div>
                            }

                            {data.replies.length > 0 &&
                                <BeautyButton id={'replyButton'} type={'transparent'} style={{color:'black', alignSelf:'flex-start'}} onClick={()=> onClickShowReplies(data.id)}>
                                    <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                        {'답글 (' + data.replies.length + ')'}
                                    </div>
                                    <div style={{width:'10px'}}/>
                                    {isShowReplies(data.id) ? <SlArrowUp size={16}/> : <SlArrowDown size={16}/>}
                                </BeautyButton>
                            }
                            
                            {isShowReplies(data.id) && data.replies.map((reply, index) =>
                                <div key={reply.id} id={'replyDiv'} style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                    <div style={{display:'flex', flexDirection: 'column', justifyContent:'start'}}>
                                        <UserImage id={'replyUser'} size={32} user={reply.user} onClick={()=> onClickNavigateUser(reply.user_id)}/>
                                        <div style={{flex:'1'}}/>
                                    </div>
                                    <div style={{display:'flex', flexDirection: 'column', justifyContent:'start', width:'100%'}}>
                                        <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                            <div style={{fontSize:'14px', marginRight:'10px'}}>{reply.user.nickname}</div>
                                            <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{ElapsedTime(reply.create_at) + (reply.update_at ? '(수정됨)' : '')}</div>
                                        </div>

                                        <div style={{display:'flex', flexDirection: 'row', justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                            <Comment key={reply.id} comment={reply} atCandidates={atCandidates} editable={modifyModeCommentId == reply.id} onClickModifyComplete={(modifiedComment)=> onClickModifyComplete(reply.id, modifiedComment)} onClickModifyCancel={()=>onClickModifyCancel(reply.id)}/>
                                            <ControlMenu style={{visibility: (validAuth(auth) && auth.user_id == reply.user_id) ? 'visible' : 'hidden'}} onRemove={()=>onRemoveReply(reply.id)} onModify={()=>onModifyComment(reply.id)}/>
                                        </div>                                        
                                        {!(modifyModeCommentId == reply.id) && <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
                                            <Great comment_id={reply.id} like_count={reply.like_count} dislike_count={reply.dislike_count}></Great>
                                        </div>
                                        }
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
