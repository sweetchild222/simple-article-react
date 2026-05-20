
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

export default function(props) {

    const navigate = useNavigate()
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [isDislikeLoading, setIsDislikeLoading] = useState(false)

    const [comment, setComment] = useState(props.comment)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    
    const postGreat = async(jwt, user_id, comment_id, like) =>{

        const payload = {
            user_id:auth.user_id,
            comment_id:comment_id,
            great:like
        }
        
        const res = await CommentGreatAPI.postCommentGreat(auth.jwt, payload)        

        if(res == null)
            return null

        return res
    }


    const getGreat = async(user_id, comment_id) =>{

        const query = 'user_id=' + user_id + '&comment_id=' + comment_id

        const resGreat = await CommentGreatAPI.getCommentGreat(query)        

        if(resGreat == null)
            return null

        return resGreat
    }


    const deleteGreat = async(jwt, id) =>{        

        const res = await CommentGreatAPI.deleteCommentGreat(auth.jwt, id)

        return res
    }


    const patchGreat = async(jwt, id, great) =>{

        const payload = {
            great:great
        }
        
        const res = await CommentGreatAPI.patchCommentGreat(auth.jwt, id, payload)

        return res
    }


    const updateGreat = async(great) =>{
                
        const resGreat = await getGreat(auth.user_id, comment.id)

        if(resGreat == null)
            return false

        if(resGreat.length > 0){

            if(resGreat[0].great != great) {
                
                const res = await patchGreat(auth.jwt, resGreat[0].id, great)

                if(res == null){
                    window.showToast((great == 1 ? '좋아요 에서 싫어요로' : '싫어요 에서 좋아요로') + '로 변경에 실패 하였습니다', 'error')
                    return false
                }

                if(great == 1){
                    comment.like_count += 1
                    comment.dislike_count -= 1
                }
                else if(great == -1){
                    comment.like_count -= 1
                    comment.dislike_count += 1
                }
                else 
                    return false

                window.showToast((great == 1 ? '좋아요 에서 싫어요로' : '싫어요 에서 좋아요로') + '로 변경 하였습니다', 'info')                
                setComment(structuredClone(comment))

                return true

            }else {

                const res = await deleteGreat(auth.jwt, resGreat[0].id)

                if(res == null){
                    window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 실패 하였습니다', 'error')
                    return false
                }

                if(great == 1)
                    comment.like_count -= 1
                else if(great == -1)
                    comment.dislike_count -= 1
                else 
                    return false

                window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 성공 하였습니다', 'info')
                setComment(structuredClone(comment))

                return true
            }
        }
        else{
            
            const res = await postGreat(auth.jwt, auth.user_id, comment.id, great)

            if(!res){
                window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 실패 하였습니다', 'error')
                return false
            }
            
            if(great == 1)
                comment.like_count += 1
            else if(great == -1)
                comment.dislike_count += 1
            else
                return false
                        
            window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 성공 하였습니다', 'info')
            setComment(structuredClone(comment))
            
            return true
        }
    }


    const onClickGreatLike = async() => {
        
        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{relogin:true}})
            return
        }
        setIsLikeLoading(true)
        await updateGreat(1)
        setIsLikeLoading(false)
    }


    const onClickGreatDislike = async() => {
        
        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{relogin:true}})
            return
        }

        setIsDislikeLoading(true)
        await updateGreat(-1)
        setIsDislikeLoading(false)
    }

    return (
        <div style={{display:'flex', flexDirection: 'row', justifyContent:'start'}}>
            <BeautyButton isLoading={isLikeLoading} disabled={isDislikeLoading} type={'transparent'} title={'좋아요'} style={{color:'black', display: 'flex', flexDirection: 'row'}} onClick={onClickGreatLike}>
                <MdThumbUpAlt size={16}/>
                <div style={{width:'10px'}}/>
                <div>{CountWithUnit(comment.like_count)}</div>
            </BeautyButton>
            <div style={{width:'20px'}}></div>
            <BeautyButton isLoading={isDislikeLoading} disabled={isLikeLoading} type={'transparent'} title={'싫어요'} style={{color:'black', display: 'flex', flexDirection: 'row'}} onClick={onClickGreatDislike}>                
                <MdThumbDownAlt size={16}/>
                <div style={{width:'10px'}}/>
                <div>{CountWithUnit(comment.dislike_count)}</div>
            </BeautyButton>
        </div>
    )
}
