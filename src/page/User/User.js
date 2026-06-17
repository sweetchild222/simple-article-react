import {useContext, useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as UserAPI from '@rest/UserAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'

import Modal from "@gui/Modal.js"
import PrettyButton from '@gui/PrettyButton.js';
import OverlayProgress from '@gui/OverlayProgress.js';
import ProfileImage from '@gui/ProfileImage.js';

import Integer from "@util/Integer.js";
import AuthContext from "@util/AuthContext.js";
import NotFound from '@page/common/NotFound.js';
import {Horizental, Vertical} from "@gui/Flex.js";


export default function() {

    const { id } = useParams()

    const user_id = Integer(id)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [user, setUser] = useState(null)

    const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false)
        
    const navigate = useNavigate()
    
    useEffect(()=> {

        if(!user_id){
            navigate('/notFound')
            return
        }

        UserAPI.getUser(user_id).then((resUser)=>{

            if(resUser.success == false){
                navigate('/notFound')
                return
            }

            //resUser.image = resUser.image != '' ?  (resUser.image + '?size=' + profileWidth + 'x' + profileHeight) : '/image/user.png'
            setUser(resUser.payload)
        })

    }, [user_id])



    const isEditable = () => {

        return (validAuth(auth) && auth.user_id == user_id)
    }


    const onClickNavigateProfile = async() =>{

        if(!isEditable())
            return

        navigate('configuration')
    }


    const onClickNavigateBlog = async() => {

        if(!user)
            return
                
        navigate('/blog/' + user.blog_id)
    }

    const onResultCreate = async(result) =>{

        if(!result)
            return

        if(!isEditable())
            return
        
        if(!user)
            return

        if(user.blog_id != null)
            return
        
        const payload = {
            user_id:auth.user_id
        }

        const res = await BlogAPI.postBlog(auth.jwt, payload)

        if(res.success == false){
            window.showToast('블로그 개설에 실패하였습니다', 'error')
            return
        }
        
        window.showToast('블로그 개설에 성공하였습니다', 'info')
        auth.blog_id = res.payload.id
        updateAuth(auth)
        navigate('/blog/' + auth.blog_id)
    }


    const onClickCreateBlog = async() => {

        setIsCreateBlogModalOpen(true)        
    }


    return user ? (
      <Horizental style={{position:'relative', alignItems:'center'}}>
        <label style={{marginBottom:'10px'}}>{user.nickname}</label>
        <ProfileImage size={256} shape={'rect'} user={user}/>
        {user.blog_id && <PrettyButton onClick={onClickNavigateBlog} type='success'>블로그 구경하기</PrettyButton>}
        {!user.blog_id && validAuth(auth) && auth.user_id == user_id && <PrettyButton onClick={onClickCreateBlog} type='success'>블로그 개설하기</PrettyButton>}
        <Modal title={'블로그를 개설하시겠습니까?'} type={'yesno'} isOpen={isCreateBlogModalOpen} onResult={onResultCreate} onClose={()=>setIsCreateBlogModalOpen(false)}></Modal>

        {isEditable() && <PrettyButton onClick={onClickNavigateProfile} type='default'>회원 정보 수정</PrettyButton>}
      </Horizental>) : <OverlayProgress/>
}

