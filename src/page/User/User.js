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
import {Vertical, Horizental} from "@gui/Flex.js";


export default function() {

    const { id } = useParams()

    const user_id = Integer(id)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    
    const [user, setUser] = useState(null)    
        
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




    return user ? (
      <Vertical style={{alignItems:'center', marginTop:'20px'}}>
        <ProfileImage size={128} shape={'rect'} user={user}/>
        <div style={{height:'10px'}}/>
        <label style={{fontSize:'24px', fontWeight:'bold'}}>{user.nickname}</label>
        <label style={{fontSize:'18px', color:'gray'}}>{user.username}</label>
        <div style={{height:'30px'}}/>
        {isEditable() && <PrettyButton onClick={onClickNavigateProfile} type='default' style={{marginBottom:'20px'}}>회원 정보 수정</PrettyButton>}
        {user.blog_id && <PrettyButton onClick={onClickNavigateBlog} type='success'>블로그 구경하기</PrettyButton>}
      </Vertical>) : <OverlayProgress/>
}

