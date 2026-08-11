import {useState, useContext, useRef, useEffect, useLayoutEffect} from "react";
import { useNavigate, useLocation } from 'react-router-dom';

import AuthContext from "@util/AuthContext.js";
import ElapsedTime from "@util/ElapsedTime.js";
import PrettyButton from "@gui/PrettyButton.js";
import ProfileImage from "@gui/ProfileImage.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import * as CommentAPI from '@rest/CommentAPI.js'
import * as AlarmAPI from '@rest/AlarmAPI.js'
import * as CommentGreatAPI from '@rest/CommentGreatAPI.js'


import Great from "./Great.js";
import ReplyLine from "./ReplyLine.js";
import Comment  from "./Comment.js";
import Writer from "./Writer.js";
import ControlMenu from "./ControlMenu.js";
import * as UserRepository from "@util/UserRepository.js";

import { FaCommentMedical } from "react-icons/fa6";
import { SlArrowDown } from "react-icons/sl";
import { SlArrowUp } from "react-icons/sl";


export default function({article_id, article_user_id}) {

    const location = useLocation()

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [comments, setComments] = useState(null)
    const [greats, setGreats] = useState(null)
    const [openReplyEditCommentId, setOpenReplyEditCommentId] = useState(-1)
    const [isOpenCommentEdit, setIsOpenCommentEdit] = useState(false)
    const [modifyModeCommentId, setModifyModeCommentId] = useState(-1)
    const [atCandidates, setAtCandidates] = useState([])
    const [showReplies, setShowReplies] = useState([])
    const [isShowComments, setIsShowComments] = useState(true)
    const [scrollCommentId, setScrollCommentId] = useState(location.state != null ? location.state.comment_id : null)

    const commentRef = useRef(new Map())    

    const navigate = useNavigate()

    useEffect(()=>{

        loadComments(article_id).then((comments) =>{

            if(comments == null){
                window.showToast('댓글을 가져오기에 실패하였습니다', 'system-error')
                return
            }
            
            loadGreat(article_id).then(greats => {

                comments.forEach((item, index) => {

                    const great = greats.find(great => (great.comment_id == item.id))

                    if(great != null)
                        item.greatSet = great
                    else
                        item.greatSet = {article_id:article_id, comment_id:item.id, great:0}

                    item.greatSet.like_count = item.like_count
                    item.greatSet.dislike_count = item.dislike_count
                })

                const upperComments = comments.filter(comment => (comment.comment_id == null))

                for(const upperComment of upperComments)
                    upperComment.replies = comments.filter(reply => reply.comment_id == upperComment.id)

                setComments(upperComments)
                autoShowReplies(upperComments, scrollCommentId)
            })            
        })

    }, [article_id])


    const loadComments = async(article_id) => {

        const resComments = await CommentAPI.getArticleComments(article_id)

        if(resComments.success == false)
            return null
        
        const comments = resComments.payload

        comments.sort((a, b) => { return b.create_at - a.create_at})

        const userIDList = comments.map(item => item.user_id)
        
        const resUsers = await UserRepository.getByIDList([...new Set(userIDList)])
                
        if(resUsers == null)
            return null

        setAtCandidates(resUsers.filter(item => {

            if(validAuth(auth)) {

                if(item.id == auth.user_id)
                    return false
            }

            return item.nickname != ''
        }))
                
        comments.forEach((item, index) => {
            item.user = resUsers.find(user => (user.id == item.user_id))
        })

        return comments
    }


    const autoShowReplies = (comments, comment_id) =>{

        const findComment = comments.find(comment => comment.replies.find(reply => reply.id == comment_id))

        if(findComment != null)
            onClickShowReplies(findComment.id)
    }

    useEffect(()=>{
        
        if(comments != null && scrollCommentId != null){

            if(scrollCommentId != null)
                window.history.replaceState(null, '')
            
            const node = commentRef.current.get(scrollCommentId)

            if(node){
                setTimeout(()=>{

                    slowScrollTo(node)

                    setTimeout(()=>{

                        setScrollCommentId(null)

                    }, 4000)
                    
                }, 400)
            }            
        }

    }, [comments])


    const loadGreat = async(article_id) =>{

        if(!validAuth(auth))
            return []

        const query = 'user_id=' + auth.user_id + '&article_id=' + article_id

        const res = await CommentGreatAPI.getCommentGreat(query)

        if(res.success == false)
            return []

        return res.payload
    }


    const slowScrollTo = async(targetElement, duration = 500) => {

        const targetTop = targetElement.getBoundingClientRect().top
        const startPos = window.scrollY
        const distance = targetTop
        let startTime = null

        const animation = (currentTime) => {

            if (startTime === null) 
                startTime = currentTime

            const timeElapsed = currentTime - startTime
                        
            const progress = Math.min(timeElapsed / duration, 1)
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

            window.scrollTo(0, startPos + (distance * ease))

            if(timeElapsed < duration)
                requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation)
    }



    const removeComment = async(comment_id) => {

        const comment = findComment(comment_id)

        if(comment == null)
            return

        if(!(validAuth(auth) && auth.user_id == comment.user_id))
            return false
        
        const res = await CommentAPI.deleteComment(auth.jwt, comment_id)
        
        if(res.success == false){
            window.showToast('댓글 삭제에 실패하였습니다', 'system-error')
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
            window.showToast('입력된 글이 없습니다', 'user-error')
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
            window.showToast('댓글 작성에 실패하였습니다', 'system-error')
            return false
        }

        window.showToast('댓글이 작성 되었습니다', 'info')

        const user = await UserRepository.getByID(auth.user_id)

        const greatSet = {article_id:article_id, comment_id:res.payload.id, great:0, like_count:0, dislike_count:0}

        comments.unshift({id:res.payload.id, replies:[], update_at:null, create_at:Date.now(), dislike_count:0, like_count:0, user:user, greatSet:greatSet, ...payload})
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
                        
        for (const [index, user_id] of user_ids.entries())
            await postAlarmCore(user_id, 'MENTION', comment_id)    
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
            window.showToast('입력된 글이 없습니다', 'user-error')
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
            window.showToast('대댓글 작성에 실패하였습니다', 'system-error')
            return false
        }

        window.showToast('대댓글이 작성 되었습니다', 'info')

        const greatSet = {article_id:article_id, comment_id:res.payload.id, great:0, like_count:0, dislike_count:0}

        const user = await UserRepository.getByID(auth.user_id)
        
        findComment.replies.unshift({id:res.payload.id, update_at:null, create_at:Date.now(), dislike_count:0, like_count:0, user:user, greatSet:greatSet, ...payload})
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
            window.showToast('입력된 글이 없습니다', 'user-error')
            return
        }

        if(modifiedComment == comment.comment){
            window.showToast('수정된 내용이 없습니다', 'user-error')
            return
        }

        const payload = {
            comment:modifiedComment
        }        

        const res = await CommentAPI.putComment(auth.jwt, comment.id, payload)        

        if(res.success == false){
            window.showToast('수정에 실패하였습니다', 'system-error')
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


    const findGreatValue = (comment_id)=>{

        if(greats == null)
            return 0

        const find = greats.find(great => great.comment_id == comment_id)        

        if(find == null)
            return 0

        return find.great
    }


    const onUpdateGreat = (comment_id, great, like_count, dislike_count) =>{
                
        const findGreat = greats.find(great => great.comment_id == comment_id)
                            
        if(findGreat != null){
            findGreat.great = great
            setGreats(structuredClone(greats))
        }
        else
            greats.push({article_id:article_id, comment_id:comment_id, great:great, user_id:auth.user_id, id:5})
        
        const comment = findComment(comment_id)

        if(comment != null){
            comment.like_count = like_count
            comment.dislike_count = dislike_count
            setComments(comments)
        }
    }


    return comments ? (
        <Vertical style={{marginTop:'16px', width:'100%'}}>
            {isOpenCommentEdit && <Writer onPostText={onPostComment} atCandidates={atCandidates} onCancel={()=>{setIsOpenCommentEdit(false)}}/>}
            <Horizental style={{justifyContent:'end', alignItems:'center', marginBottom:'8px'}}>
                {comments.length > 0 && 
                    <PrettyButton type={'transparent'} style={{color:'black', alignSelf:'flex-start'}} onClick={()=> setIsShowComments(item => !item)}>
                        <Horizental>
                            {'댓글 (' + comments.length + ')'}
                        </Horizental>
                        <div style={{width:'8px'}}/>
                        {isShowComments ? <SlArrowUp size={16}/> : <SlArrowDown size={16}/>}
                    </PrettyButton>
                }

                <div style={{flex:'1'}}></div>
                {!isOpenCommentEdit && <PrettyButton type={'default'}  onClick={onOpenCommentEdit}>{'댓글 작성'}</PrettyButton>}
            </Horizental>
            
            {isShowComments && comments.map((data, index) => 
                <Vertical key={data.id} style={{marginBottom:'16px'}}
                    ref={(node) => { node ? commentRef.current.set(data.id, node) : commentRef.current.delete(data.id)}}
                >
                    <Horizental>
                        <Vertical style={{marginRight:'8px'}}>
                            <ProfileImage shape={'circle'} size={48} user={data.user} onClick={()=> onClickNavigateBlog(data.user.blog_id)}/>
                            <ReplyLine isShowReplies={isShowReplies(data.id)} editableId={modifyModeCommentId}/>
                        </Vertical>
                        
                        <Vertical style={{width:'100%'}}>
                            <Horizental>
                                <div style={{fontSize:'14px', marginRight:'8px', color:'gray'}}>{data.user != null ? data.user.nickname : '알수없음'}</div>
                                <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{ElapsedTime(data.create_at) + (data.update_at ? '(수정됨)' : '')}</div>
                            </Horizental>
                            
                            <div style={{height:'4px'}}/>

                            <Horizental style={{justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                <Comment atCandidates={atCandidates} key={data.id} comment={data} editable={modifyModeCommentId == data.id} onClickModifyComplete={(modifiedComment)=> onClickModifyComplete(data.id, modifiedComment)} onClickModifyCancel={()=>onClickModifyCancel(data.id)} backgroundSmooth={scrollCommentId == data.id}/>
                                <ControlMenu style={{visibility: (validAuth(auth) && auth.user_id == data.user_id) ? 'visible' : 'hidden'}} onRemove={()=>onRemoveComment(data.id)} onModify={()=>onModifyComment(data.id)}/>
                            </Horizental>

                            <div style={{height:'4px'}}/>
                            
                            {!(modifyModeCommentId == data.id) && 
                                <Horizental style={{justifyContent:'space-between', marginBottom:'4px'}}>
                                    <Great comment_id={data.id} greatSet={data.greatSet}></Great>
                                    <PrettyButton type={'default'} tooltip={'답글 작성'} onClick={() => onClickReplyEditOpen(data.id)}>{'답글 작성'}</PrettyButton>
                                </Horizental>
                            }

                            {data.id == openReplyEditCommentId && 
                                <Horizental style={{marginBottom:'4px'}}>
                                    <ProfileImage shape={'circle'} size={32} userId={auth.user_id} onClick={()=> onClickNavigateBlog(auth.blog_id)}/>
                                    <div style={{width:'8px'}}></div>
                                    <Writer onPostText={onPostReply} atCandidates={atCandidates} onCancel={() =>{setOpenReplyEditCommentId(-1)}}/>
                                </Horizental>
                            }

                            {data.replies.length > 0 &&
                                <PrettyButton id={'replyButton'} type={'transparent'} style={{marginBottom:'10px', color:'black', alignSelf:'flex-start'}} onClick={()=> onClickShowReplies(data.id)}>
                                    {'답글 (' + data.replies.length + ')'}
                                    <div style={{width:'8px'}}/>
                                    {isShowReplies(data.id) ? <SlArrowUp size={16}/> : <SlArrowDown size={16}/>}
                                </PrettyButton>
                            }
                            
                            {isShowReplies(data.id) && data.replies.map((reply, index) =>
                                <Horizental key={reply.id} id={'replyDiv'}
                                    ref={(node) => { node ? commentRef.current.set(reply.id, node) : commentRef.current.delete(reply.id)}}
                                >
                                    <Vertical style={{marginRight:'8px'}}>
                                        <ProfileImage shape={'circle'} id={'replyUser'} size={32} user={reply.user} onClick={()=> onClickNavigateBlog(reply.user.blog_id)}/>
                                        <div style={{flex:'1'}}/>
                                    </Vertical>
                                    <Vertical style={{width:'100%'}}>
                                        <Horizental>
                                            <div style={{fontSize:'14px', marginRight:'8px', color:'gray'}}>{reply.user != null ? data.user.nickname : '알수없음'}</div>
                                            <div style={{fontSize:'14px', color:'gray', whiteSpace:'pre'}}>{ElapsedTime(reply.create_at) + (reply.update_at ? '(수정됨)' : '')}</div>
                                        </Horizental>

                                        <div style={{height:'4px'}}/>

                                        <Horizental style={{justifyContent:'space-between', width:'100%', alignItems:'start'}}>
                                            <Comment key={reply.id} comment={reply} atCandidates={atCandidates} editable={modifyModeCommentId == reply.id} onClickModifyComplete={(modifiedComment)=> onClickModifyComplete(reply.id, modifiedComment)} onClickModifyCancel={()=>onClickModifyCancel(reply.id)} backgroundSmooth={scrollCommentId == reply.id}/>
                                            <ControlMenu style={{visibility: (validAuth(auth) && auth.user_id == reply.user_id) ? 'visible' : 'hidden'}} onRemove={()=>onRemoveReply(reply.id)} onModify={()=>onModifyComment(reply.id)}/>
                                        </Horizental>

                                        <div style={{height:'4px'}}/>

                                        {!(modifyModeCommentId == reply.id) && <Horizental style={{marginBottom:'4px'}}>
                                            <Great comment_id={reply.id} greatSet={reply.greatSet}></Great>
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
