import {useContext, useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as UserAPI from '@rest/UserAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'

import Modal from "@gui/Modal.js"
import PrettyButton from '@gui/PrettyButton.js';
import Spinner from '@gui/Spinner.js';
import ProfileImage from '@gui/ProfileImage.js';

import Integer from "@util/Integer.js";
import AuthContext from "@util/AuthContext.js";
import NotFound from '@page/common/NotFound.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";


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
      <Vertical style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
        <label style={{fontSize:'24px', fontWeight:'bold'}}>{user.nickname}</label>
        <VPad size={8}/>
        <ProfileImage size={256} shape={'rect'} user={user}/>
        <VPad size={4}/>
        <label style={{fontSize:'18px', color:'gray'}}>{user.username}</label>
        <VPad size={32}/>
        <Vertical>
            {isEditable() && <PrettyButton onClick={onClickNavigateProfile} type='default' style={{marginBottom:'32px'}}>회원 정보 수정</PrettyButton>}
            {user.blog_id && <PrettyButton onClick={onClickNavigateBlog} type='default'>블로그 구경하기</PrettyButton>}
        </Vertical>
    </Vertical>
      ) : <Spinner/>
}
