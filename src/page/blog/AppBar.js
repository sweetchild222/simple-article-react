import {useState, useContext, useEffect, useRef} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as BlobAPI from '@rest/BlobAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import * as UserAPI from '@rest/UserAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'

import AuthContext from "@util/AuthContext.js";
import ProfileImage from "@gui/ProfileImage.js";
import PrettyButton from "@gui/PrettyButton.js";
import CountWithUnit from "@util/CountWithUnit.js";
import Integer from "@util/Integer.js";

import { MdEdit } from "react-icons/md";
import { RiImageAiFill } from "react-icons/ri";
import ImagePicker from "@util/ImagePicker.js";
import {blobFromCanvas} from "@util/ImageUtil.js";
import ImageCropModal from '@gui/ImageCropModal.js'
import {Vertical, Horizental} from "@gui/Flex.js";
import Modal from '@gui/Modal.js'
import {VPad, HPad} from "@gui/Pad.js";


export default function() {

    const { b_id } = useParams()
    
    const blog_id = Integer(b_id)

    const navigate = useNavigate()

    const refLabelTitle = useRef(null)
    const refImageCrop  = useRef(null)

    const [blog, setBlog] = useState(null)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isSubscribe, setIsSubscribe] = useState(null)
    const [isSubscribeLoading, setIsSubscribeLoading] = useState(false)
    const [nickname, setNickname] = useState(null)
    const [subscribeCount, setSubscribeCount] = useState(null)

    useEffect(()=>{

        if(!blog_id){
            navigate('/notFound')
            return
        }


        BlogAPI.getBlog(blog_id).then((resBlog)=> {

            if(resBlog.success == false){
                navigate('/notFound')
                return
            }

            setBlog(resBlog.payload)

            UserAPI.getUser(resBlog.payload.user_id).then((resUser)=>{

                if(resUser.success == false)
                    return

                setNickname(resUser.payload.nickname)
            })
            
            const query = 'blog_id=' + blog_id

            SubscribeAPI.getSubscribe(query).then(res => {

                if(res.success == false)
                    return

                setSubscribeCount(res.payload.length)

                if(!validAuth(auth)){
                    setIsSubscribe(false)
                    return
                }

                setIsSubscribe(res.payload.findIndex(s => s.user_id === auth.user_id) != -1)
            })
        })

    }, [blog_id])


    const onClickNavigateBlog = (event) => {
    
        //event.stopPropagation()

        if(!blog)
            return
        
        navigate('/blog/' + blog.id)
    }



    const isOwner = ()=> {

        return (validAuth(auth) && auth.blog_id == blog_id)
    }
    


    const onClickNavigateHome = (event) =>{

        //event.stopPropagation()

        navigate('/')
    }


    const onClickSubscribe = async(event)=> {

        //event.stopPropagation()

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/', {state:{comback:true}})
            return
        }

        const query = 'user_id=' + auth.user_id + '&blog_id=' + blog_id

        setIsSubscribeLoading(true)

        const res = await SubscribeAPI.getSubscribe(query)

        if(res.success == false){
            setIsSubscribeLoading(false)
            window.showToast('구독 정보를 가져 올 수 없습니다', 'system-error')
            return
        }

        if(res.payload.length > 0){

            const resDelete = await SubscribeAPI.deleteSubscribe(auth.jwt, res.payload[0].id)

            setIsSubscribeLoading(false)

            if(resDelete.success == true){
                setIsSubscribe(false)
                setSubscribeCount(count => count - 1)
                window.showToast('구독을 취소하였습니다', 'info')
            }
            else
                window.showToast('구독 취소에 실패하였습니다', 'system-error')
        }
        else{

            const payload = {
                user_id:auth.user_id,
                blog_id:blog_id
            }

            const resPost = await SubscribeAPI.postSubscribe(auth.jwt, payload)

            setIsSubscribeLoading(false)

            if(resPost.success == true){
                setIsSubscribe(true)
                setSubscribeCount(count => count + 1)
                window.showToast('구독에 성공하였습니다', 'info')
            }
            else{
                window.showToast('구독에 실패하였습니다', 'system-error')
            }
        }
    }
    
    return blog ? (
            <Horizental style={{alignItems:'center', backgroundColor:'#494D5F', width:'100%', boxShadow: '0 4px 2px -2px dimgray', position:'fixed', zIndex:1000, height:'64px', padding:'8px'}}>
                <ProfileImage size={48} shape={'circle'} userId={blog.user_id} onClick={onClickNavigateBlog}/>
                <HPad size={8}/>
                <div className={'clamped-text'} ref={refLabelTitle} style={{'--line-count':1, color:'white', fontSize:'16px', borderColor:'white'}}>{blog.title}</div>
                <div style={{flex:'1'}}/>
                {!isOwner() && isSubscribe != null && <HPad size={8}/>}
                {!isOwner() && isSubscribe != null && <PrettyButton tooltip='구독' type={isSubscribe ? 'cancel' : 'default'} isLoading={isSubscribeLoading} onClick={onClickSubscribe} style={{width:'fit-content'}}>{isSubscribe ? '구독중' : '구독함'}</PrettyButton>}
                <HPad size={8}/>
                <img src='/logo/logo.svg' alt='logo' style={{height:'48px', width:'48px'}} onClick={onClickNavigateHome}/>
            </Horizental>
    ) : <div style={{backgroundColor:'#494D5F', width:'100%', boxShadow: '0 4px 2px -2px dimgray', position:'fixed', zIndex:1000, height:'64px'}}></div>
}
