import {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';

import AuthContext from "@util/AuthContext.js";
import PrettyButton from "@gui/PrettyButton.js";
import CountWithUnit from "@util/CountWithUnit.js";
import {Vertical, Horizental} from "@gui/Flex.js";

import { FaRegThumbsDown } from "react-icons/fa";
import { FaRegThumbsUp } from "react-icons/fa";
import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";

import * as CommentGreatAPI from '@rest/CommentGreatAPI.js'

export default function({comment_id, greatSet, style}) {
    
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [isDislikeLoading, setIsDislikeLoading] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)            
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    

    const navigate = useNavigate()        

    const postGreat = async(jwt, user_id, comment_id, like) =>{

        const payload = {
            user_id:auth.user_id,
            comment_id:comment_id,
            great:like
        }
        
        const res = await CommentGreatAPI.postCommentGreat(auth.jwt, payload)

        return res
    }


    const getGreat = async(user_id, comment_id) =>{

        const query = 'user_id=' + user_id + '&comment_id=' + comment_id

        const res = await CommentGreatAPI.getCommentGreat(query)

        return res
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
                
        const resGreat = await getGreat(auth.user_id, comment_id)

        if(resGreat.success == false)
            return false

        if(resGreat.payload.length > 0){

            if(resGreat.payload[0].great != great) {
                
                const res = await patchGreat(auth.jwt, resGreat.payload[0].id, great)

                if(res.success == false){
                    window.showToast((great == 1 ? '좋아요 에서 싫어요로' : '싫어요 에서 좋아요로') + '로 변경에 실패 하였습니다', 'error')
                    return false
                }

                if(great == 1){
                    greatSet.great = 1
                    greatSet.like_count += 1
                    greatSet.dislike_count -= 1
                    setReloadKey(prev => prev + 1)
                }
                else if(great == -1){
                    greatSet.great = -1
                    greatSet.like_count -= 1
                    greatSet.dislike_count += 1
                    setReloadKey(prev => prev + 1)
                }
                else 
                    return false

                window.showToast((great == 1 ? '좋아요 에서 싫어요로' : '싫어요 에서 좋아요로') + '로 변경 하였습니다', 'info')
                return true

            }else {

                const res = await deleteGreat(auth.jwt, resGreat.payload[0].id)

                if(res.success == false){
                    window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 실패 하였습니다', 'error')
                    return false
                }

                if(great == 1){
                    greatSet.great = 0
                    greatSet.like_count -= 1
                    setReloadKey(prev => prev + 1)
                }
                else if(great == -1){
                    greatSet.great = 0
                    greatSet.dislike_count -= 1
                    setReloadKey(prev => prev + 1)
                }
                else 
                    return false

                window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 성공 하였습니다', 'info')
                return true
            }
        }
        else{
            
            const res = await postGreat(auth.jwt, auth.user_id, comment_id, great)

            if(res.success == false){
                window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 실패 하였습니다', 'error')
                return false
            }
            
            if(great == 1){
                greatSet.great = 1
                greatSet.like_count += 1
                setReloadKey(prev => prev + 1)
            }
            else if(great == -1){
                greatSet.great = -1
                greatSet.dislike_count += 1
                setReloadKey(prev => prev + 1)
            }
            else
                return false

            window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 성공 하였습니다', 'info')
            return true
        }
    }


    const onClickGreatLike = async() => {
        
        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{comback:true}})
            return
        }
        setIsLikeLoading(true)
        await updateGreat(1)
        setIsLikeLoading(false)
    }


    const onClickGreatDislike = async() => {
        
        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{comback:true}})
            return
        }

        setIsDislikeLoading(true)
        await updateGreat(-1)
        setIsDislikeLoading(false)
    }
    

    return greatSet ? (
        <Horizental key={reloadKey} style={{alignItems:'center', ...style}}>
            <PrettyButton isLoading={isLikeLoading} disabled={isDislikeLoading} type={'transparent'} title={'좋아요'} style={{color:'black', display: 'flex', flexDirection: 'row'}} onClick={onClickGreatLike}>
                {greatSet.great == 1 && <FaThumbsUp size={22}/>}
                {greatSet.great != 1 && <FaRegThumbsUp size={22}/>}
                <div style={{width:'4px'}}/>
                <div>{CountWithUnit(greatSet.like_count)}</div>
            </PrettyButton>
            <div style={{width:'16px'}}></div>
            <PrettyButton isLoading={isDislikeLoading} disabled={isLikeLoading} type={'transparent'} title={'싫어요'} style={{color:'black', display: 'flex', flexDirection: 'row'}} onClick={onClickGreatDislike}>
                {greatSet.great == -1 && <FaThumbsDown size={22}/>}
                {greatSet.great != -1 && <FaRegThumbsDown size={22}/>}
                <div style={{width:'4px'}}/>
                <div>{CountWithUnit(greatSet.dislike_count)}</div>
            </PrettyButton>
        </Horizental>
    ) : null
}
