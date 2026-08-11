import {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';

import * as BookmarkAPI from '@rest/BookmarkAPI.js'
import AuthContext from "@util/AuthContext.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import PrettyButton from "@gui/PrettyButton.js";
import CountWithUnit from "@util/CountWithUnit.js";

import { IoMdHeart } from "react-icons/io";
import { IoIosHeartEmpty } from "react-icons/io";
import {VPad, HPad} from "@gui/Pad.js";

export default function({article_id, count}) {

    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isBookmark, setIsBookmark] = useState(null)
    const [bookmarkCount, setBookmarkCount] = useState(count)

    const navigate = useNavigate()

    useEffect(()=>{

        if(!validAuth(auth)){
            setIsBookmark(false)
            return
        }

        BookmarkAPI.getUserBookmark(auth.jwt, auth.user_id, 'article_id=' + article_id).then(res => {
            
            if(res.success == false)
                return
                        
            setIsBookmark(res.payload.length > 0)            
        })

    }, [auth, article_id])



    const onClickBookmark = async() => {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account', {state:{comback:true}})
            return
        }

        setIsBookmarkLoading(true)

        const res = await BookmarkAPI.getUserBookmark(auth.jwt, auth.user_id, 'article_id=' + article_id)

        if(res.success == false){
            setIsBookmarkLoading(false)
            window.showToast('북마크를 가져오기에 싶패하였습니다', 'system-error')
            return
        }

        if(res.payload.length > 0){
            
            const resDelete = await BookmarkAPI.deleteBookmark(auth.jwt, res.payload[0].id)
            setIsBookmarkLoading(false)

            if(resDelete.success == true){                
                setIsBookmark(false)
                setBookmarkCount(count => count - 1)
                window.showToast('북마크를 취소하였습니다', 'info')
            }
            else
                window.showToast('북마크를 취소에 실패하였습니다', 'system-error')
        }
        else{

            const payload = {

                article_id:article_id,
                user_id:auth.user_id
            }

            const resPost = await BookmarkAPI.postBookmark(auth.jwt,  payload)
            setIsBookmarkLoading(false)

            if(resPost.success == true){
                setIsBookmark(true)
                setBookmarkCount(count => count + 1)
                window.showToast('북마크에 성공하였습니다', 'info')
            }
            else{
                window.showToast('북마크에 실패하였습니다', 'system-error')
            }
        }
    }
    
    
    return ( isBookmark != null ? <Horizental style={{alignItems:'center'}}>
                <PrettyButton type={'transparent'} isLoading={isBookmarkLoading} style={{color:'black'}} onClick={onClickBookmark}>
                    {isBookmark ? <IoMdHeart size={22}/> : <IoIosHeartEmpty size={22}/>}
                    <HPad size={4}/>
                    <div>{CountWithUnit(bookmarkCount)}</div>
                </PrettyButton>
            </Horizental>
            : null
    )
}
