import {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';

import { FaRegThumbsDown } from "react-icons/fa";
import { FaRegThumbsUp } from "react-icons/fa";
import { FaThumbsDown } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";

import * as ArticleGreatAPI from '@rest/ArticleGreatAPI.js'
import AuthContext from "@util/AuthContext.js";
import CountWithUnit from "@util/CountWithUnit.js";

import PrettyButton from "@gui/PrettyButton.js";
import {Vertical, Horizental} from "@gui/Flex.js";


export default function({article_id, like_count, dislike_count, style}) {

    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [isDislikeLoading, setIsDislikeLoading] = useState(false)
    
    const [likeCount, setLikeCount] = useState(like_count)
    const [dislikeCount, setDislikeCount] = useState(dislike_count)    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [currentGreat, setCurrentGreat] = useState(null)
    const navigate = useNavigate()


    useEffect(()=>{

        if(!validAuth(auth))
            return

        getGreat(auth.user_id, article_id).then(res=>{

            if(res.success == false)
                return

            if(res.payload.length > 0)
                setCurrentGreat(res.payload[0].great)
            else
                setCurrentGreat(0)
        })

    },[article_id])


    

    const postGreat = async(jwt, user_id, article_id, like) =>{

        const payload = {
            user_id:auth.user_id,
            article_id:article_id,
            great:like
        }        

        const res = await ArticleGreatAPI.postArticleGreat(auth.jwt, payload)

        return res
    }


    const getGreat = async(user_id, article_id) =>{

        const query = 'user_id=' + user_id + '&article_id=' + article_id

        const res = await ArticleGreatAPI.getArticleGreat(query)

        return res
    }


    const deleteGreat = async(jwt, id) =>{

        const res = await ArticleGreatAPI.deleteArticleGreat(auth.jwt, id)

        return res
    }


    const patchGreat = async(jwt, id, great) =>{

        const payload = {
            great:great
        }
        
        const res = await ArticleGreatAPI.patchArticleGreat(auth.jwt, id, payload)

        return res

    }


    const updateGreat = async(great) =>{
        
        const resGreat = await getGreat(auth.user_id, article_id)

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
                    setCurrentGreat(1)
                    setLikeCount(item => item + 1)
                    setDislikeCount(item => item - 1)
                }
                else if(great == -1){
                    setCurrentGreat(-1)
                    setLikeCount(item => item - 1)
                    setDislikeCount(item => item + 1)
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
                    setCurrentGreat(0)
                    setLikeCount(item => item - 1)
                }
                else if(great == -1){
                    setCurrentGreat(0)
                    setDislikeCount(item => item - 1)
                }
                else 
                    return false

                window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 성공 하였습니다', 'info')
                return true
            }
        }
        else{
            
            const res = await postGreat(auth.jwt, auth.user_id, article_id, great)

            if(res.success == false){
                window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 실패 하였습니다', 'error')
                return false
            }
            
            if(great == 1){
                setCurrentGreat(1)
                setLikeCount(item => item + 1)
            }
            else if(great == -1){
                setCurrentGreat(-1)
                setDislikeCount(item => item + 1)
            }
            else
                return false
            
            window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 성공 하였습니다', 'info')
            return true
        }
    }


    const onClickGreatLike = async() =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{comback:true}})
            return
        }
        setIsLikeLoading(true)
        await updateGreat(1)
        setIsLikeLoading(false)        
    }


    const onClickGreatDislike = async() =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{comback:true}})
            return
        }

        setIsDislikeLoading(true)
        await updateGreat(-1)
        setIsDislikeLoading(false)
    }

    return (
            <Horizental style={{justifyContent:'center', alignItems:'center', ...style}}>
                <PrettyButton isLoading={isLikeLoading} disabled={isDislikeLoading} type={'transparent'} title={'좋아요'} style={{color:'black', display: 'flex', flexDirection: 'row'}} onClick={onClickGreatLike}>
                    {currentGreat != null && currentGreat == 1 && <FaThumbsUp size={22}/>}
                    {currentGreat != null && (currentGreat != 1) && <FaRegThumbsUp size={22}/>}
                    <div style={{width:'5px'}}/>
                    <div>{CountWithUnit(likeCount)}</div>
                </PrettyButton>
                <div style={{width:'20px'}}></div>
                <PrettyButton isLoading={isDislikeLoading} disabled={isLikeLoading} type={'transparent'} title={'싫어요'} style={{color:'black', display: 'flex', flexDirection: 'row'}} onClick={onClickGreatDislike}>
                    {currentGreat != null && currentGreat == -1 && <FaThumbsDown size={22}/>}
                    {currentGreat != null && (currentGreat != -1) && <FaRegThumbsDown size={22}/>}
                    <div style={{width:'5px'}}/>
                    <div>{CountWithUnit(dislikeCount)}</div>
                </PrettyButton>
            </Horizental>
        )
}
