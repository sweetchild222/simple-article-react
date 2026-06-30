import {useState, useContext, useEffect, } from "react";
import { useNavigate } from 'react-router-dom';

import AuthContext from "@util/AuthContext.js";
import ElapsedTime from "@util/ElapsedTime.js";
import PrettyButton from "@gui/PrettyButton.js";
import ProfileImage from "@gui/ProfileImage.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import * as CommentAPI from '@rest/CommentAPI.js'
import * as AlarmAPI from '@rest/AlarmAPI.js'

import Great from "./Great.js";
import ReplyLine from "./ReplyLine.js";
import Comment  from "./Comment.js";
import Writer from "./Writer.js";
import ControlMenu from "./ControlMenu.js";
import * as UserRepository from "./UserRepository.js";

import { FaCommentMedical } from "react-icons/fa6";
import { SlArrowDown } from "react-icons/sl";
import { SlArrowUp } from "react-icons/sl";


export default function({article_id, article_user_id}) {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [comments, setComments] = useState(null)
    const [openReplyEditCommentId, setOpenReplyEditCommentId] = useState(-1)
    const [isOpenCommentEdit, setIsOpenCommentEdit] = useState(false)
    const [modifyModeCommentId, setModifyModeCommentId] = useState(-1)
    const [atCandidates, setAtCandidates] = useState([])
    const [showReplies, setShowReplies] = useState([])
    const [isShowComments, setIsShowComments] = useState(true)

    const navigate = useNavigate()

    useEffect(()=>{

        CommentAPI.getArticleComments(article_id).then((comments) =>{

            if(comments.success == false){
                window.showToast('댓글을 가져 올 수 없습니다', 'error')
                return
            }            

            comments.payload.sort((a, b) => { return b.create_at - a.create_at})

            const userIDList = comments.payload.map(item => item.user_id)
        
            UserRepository.getByIDList([...new Set(userIDList)]).then((resUsers)=>{
                
                if(resUsers == null) {
                    window.showToast('사용자 목록을 가져 올 수 없습니다', 'error')
                    return
                }
                
                setAtCandidates(resUsers.filter(item=> item.nickname != ''))
                
                comments.payload.forEach((item, index) =>{

                    const user = resUsers.find(user => (user.id == item.user_id))

                    if(user != null)
                        item.user = user
                })

                const upperComments = comments.payload.filter(comment => (comment.comment_id == null))

                for(const upperComment of upperComments)
                    upperComment.replies = comments.payload.filter(reply => reply.comment_id == upperComment.id)
            
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
        
        if(res.success == false){
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
            navigate('/account', {state:{comback:true}})
            return
        }

        setIsOpenCommentEdit(true)
        setOpenReplyEditCommentId(-1)
        setModifyModeCommentId(-1)        
    }



    const postAlarmCore = async(to_user_id, type, comment_id)=>{
        
        if(!validAuth(auth))
            return

        if(auth.user_id == to_user_id)
            return
        
        const payload = {

            from_user_id:auth.user_id,
            to_user_id:to_user_id,
            type:type,
            comment_id:comment_id
        }

        const res = await AlarmAPI.postAlarm(auth.jwt, payload)
    }


    const onPostComment = async(comment) => {

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

        if(res.success == false){
            window.showToast('댓글 작성에 실패하였습니다', 'error')
            return false
        }

        window.showToast('댓글이 작성 되었습니다', 'info')

        const user = await UserRepository.getByID(auth.user_id)

        comments.unshift({id:res.payload.id, replies:[], update_at:null, create_at:Date.now(), dislike_count:0, like_count:0, user:user, ...payload})
        setComments(structuredClone(comments))
        setIsOpenCommentEdit(false)
        setIsShowComments(true)

        if(user && user.nickname != '' && !atCandidates.find(item => item.id == user.id))
            setAtCandidates([...atCandidates, user])

        
        await postAlarmCore(article_user_id, 'COMMENT', res.payload.id)

        const mention_user_ids = getMentionUserIds(comment, article_user_id)
        
        await postMentionAlarm(mention_user_ids, res.payload.id)
                
        return true
    }


    const getMentionUserIds = (comment, except_user_id) =>{

        const regex = /<user>([^<]+)<\/user>/g;
        const matches = [...comment.matchAll(regex)];
        const user_ids = matches.map(match => parseInt(match[1]))

        return user_ids.filter(id => id !== except_user_id)

    }


    const postMentionAlarm = async(user_ids, comment_id) => {
                        
        for (const [index, user_id] of user_ids.entries()) {           
            await postAlarmCore(user_id, 'MENTION', comment_id)
        }        
    }


    const onClickReplyEditOpen = async(id) =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{comback:true}})
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
        
        if(res.success == false){
            window.showToast('대댓글 작성에 실패하였습니다', 'error')
            return false
        }

        window.showToast('대댓글이 작성 되었습니다', 'info')

        const user = await UserRepository.getByID(auth.user_id)
        
        findComment.replies.unshift({id:res.payload.id, update_at:null, create_at:Date.now(), dislike_count:0, like_count:0, user:user, ...payload})
        setComments(structuredClone(comments))

        if(!showReplies.find(id => openReplyEditCommentId == id))
            setShowReplies([...showReplies, openReplyEditCommentId])
            
        setOpenReplyEditCommentId(-1)

        if(user && !atCandidates.find(item => item.id == user.id))
            setAtCandidates([...atCandidates, user])
        
        await postAlarmCore(findComment.user_id, 'REPLY', res.payload.id)

        if(findComment.user_id != article_user_id)
            await postAlarmCore(article_user_id, 'COMMENT', res.payload.id)

        const mention_user_ids = getMentionUserIds(comment, findComment.user_id)
        
        await postMentionAlarm(mention_user_ids, res.payload.id)
        
        return true
    }


    const onClickNavigateBlog = async(blog_id) =>{
                        
        navigate('/blog/' + blog_id)
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

        if(res.success == false){
            window.showToast('수정에 실패하였습니다', 'error')
            return
        }
    
        window.showToast('수정에 성공하였습니다', 'info')
    
        setModifyModeCommentId(-1)
        comment.comment = modifiedComment
        comment.update_at = Date.now()
        setComments(structuredClone(comments))

        const mention_user_ids = getMentionUserIds(modifiedComment, comment.user_id)
        
        await postMentionAlarm(mention_user_ids, comment.id)
    }


    const onClickModifyCancel = async(comment_id) => {

        setModifyModeCommentId(-1)
    }


    return comments ? (
        <Vertical style={{marginTop:'20px', width:'100%'}}>
            {isOpenCommentEdit && <Writer onPostText={onPostComment} atCandidates={atCandidates} onCancel={()=>{setIsOpenCommentEdit(false)}}/>}
            <Horizental style={{justifyContent:'end', alignItems:'center', marginBottom:'10px'}}>
                {comments.length > 0 && 
                    <PrettyButton type={'transparent'} style={{color:'black', alignSelf:'flex-start'}} onClick={()=> setIsShowComments(item => !item)}>
                        <Horizental>
                            {'댓글 (' + comments.length + ')'}
                        </Horizental>
                        <div style={{width:'10px'}}/>
                        {isShowComments ? <SlArrowUp size={16}/> : <SlArrowDown size={16}/>}
                    </PrettyButton>
                }

                <div style={{flex:'1'}}></div>
                {!isOpenCommentEdit && <PrettyButton type={'success'}  onClick={onOpenCommentEdit}>{'댓글 작성'}</PrettyButton>}
            </Horizental>
            
            {isShowComments && comments.map((data, index) => 
                <Vertical key={data.id} style={{marginBottom:'20px'}}>
                    <Horizental>
                        <Vertical style={{marginRight:'10px'}}>
                            <ProfileImage shape={'circle'} size={48} user={data.user} onClick={()=> onClickNavigateBlog(data.user.blog_id)}/>
                            <ReplyLine isShowReplies={isShowReplies(data.id)} editableId={modifyModeCommentId}/>
                        </Vertical>
                        
                        <Vertical style={{width:'100%'}}>
                            <Horizental>
                                <div style={{fontSize:'14px', marginRight:'10px', color:'gray'}}>{data.user.nickname}</div>
                                <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{ElapsedTime(data.create_at) + (data.update_at ? '(수정됨)' : '')}</div>
                            </Horizental>
                            
                            <div style={{height:'5px'}}/>

                            <Horizental style={{justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                <Comment atCandidates={atCandidates} key={data.id} comment={data} editable={modifyModeCommentId == data.id} onClickModifyComplete={(modifiedComment)=> onClickModifyComplete(data.id, modifiedComment)} onClickModifyCancel={()=>onClickModifyCancel(data.id)}/>
                                <ControlMenu style={{visibility: (validAuth(auth) && auth.user_id == data.user_id) ? 'visible' : 'hidden'}} onRemove={()=>onRemoveComment(data.id)} onModify={()=>onModifyComment(data.id)}/>
                            </Horizental>

                            <div style={{height:'5px'}}/>
                            
                            {!(modifyModeCommentId == data.id) && 
                                <Horizental style={{justifyContent:'space-between', marginBottom:'5px'}}>
                                    <Great comment_id={data.id} like_count={data.like_count} dislike_count={data.dislike_count}></Great>
                                    <PrettyButton type={'success'} tooltip={'답글 작성'} onClick={() => onClickReplyEditOpen(data.id)}>{'답글 작성'}</PrettyButton>
                                </Horizental>
                            }

                            {data.id == openReplyEditCommentId && 
                                <Horizental style={{marginBottom:'5px'}}>
                                    <ProfileImage shape={'circle'} size={32} userId={auth.user_id} onClick={()=> onClickNavigateBlog(auth.blog_id)}/>
                                    <div style={{width:'10px'}}></div>
                                    <Writer onPostText={onPostReply} atCandidates={atCandidates} onCancel={() =>{setOpenReplyEditCommentId(-1)}}/>                                    
                                </Horizental>
                            }

                            {data.replies.length > 0 &&
                                <PrettyButton id={'replyButton'} type={'transparent'} style={{marginBottom:'10px', color:'black', alignSelf:'flex-start'}} onClick={()=> onClickShowReplies(data.id)}>                                    
                                    {'답글 (' + data.replies.length + ')'}
                                    <div style={{width:'10px'}}/>
                                    {isShowReplies(data.id) ? <SlArrowUp size={16}/> : <SlArrowDown size={16}/>}
                                </PrettyButton>
                            }
                            
                            {isShowReplies(data.id) && data.replies.map((reply, index) =>
                                <Horizental key={reply.id} id={'replyDiv'}>
                                    <Vertical style={{marginRight:'10px'}}>
                                        <ProfileImage shape={'circle'} id={'replyUser'} size={32} user={reply.user} onClick={()=> onClickNavigateBlog(reply.user.blog_id)}/>
                                        <div style={{flex:'1'}}/>
                                    </Vertical>
                                    <Vertical style={{width:'100%'}}>
                                        <Horizental>
                                            <div style={{fontSize:'14px', marginRight:'10px', color:'gray'}}>{reply.user.nickname}</div>
                                            <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{ElapsedTime(reply.create_at) + (reply.update_at ? '(수정됨)' : '')}</div>
                                        </Horizental>

                                        <div style={{height:'5px'}}/>

                                        <Horizental style={{justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                            <Comment key={reply.id} comment={reply} atCandidates={atCandidates} editable={modifyModeCommentId == reply.id} onClickModifyComplete={(modifiedComment)=> onClickModifyComplete(reply.id, modifiedComment)} onClickModifyCancel={()=>onClickModifyCancel(reply.id)}/>
                                            <ControlMenu style={{visibility: (validAuth(auth) && auth.user_id == reply.user_id) ? 'visible' : 'hidden'}} onRemove={()=>onRemoveReply(reply.id)} onModify={()=>onModifyComment(reply.id)}/>
                                        </Horizental>

                                        <div style={{height:'5px'}}/>

                                        {!(modifyModeCommentId == reply.id) && <Horizental style={{marginBottom:'5px'}}>
                                            <Great comment_id={reply.id} like_count={reply.like_count} dislike_count={reply.dislike_count}></Great>
                                        </Horizental>
                                        }
                                    </Vertical>
                                </Horizental>
                            )}
                        </Vertical>
                    </Horizental>
                </Vertical>
            )}
            </Vertical>
        
        ) : null
}
