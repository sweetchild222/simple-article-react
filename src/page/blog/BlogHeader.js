import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import ProfileContext from "../../util/ProfileContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import * as UserAPI from '../../api/UserAPI.js'

export default function() {
    
    const location = useLocation()
    const state = location.state

    const [profileImage, setProfileImage] = useState(null)

    if(state == null)
        return (<div>잘못된 방식으로 접근하였습니다</div>)
            
    const navigate = useNavigate()

    useEffect(()=>{

        UserAPI.getUser(state.user_id).then((resUser)=> {
                
            if(resUser == null)
                return
    
            setProfileImage(resUser.profile ?  resUser.profile : '/image/user.png')
        })
    })



    const onClickNavigateBlog = () =>{


        console.log('sdfa')
    }




    





    return (
            <div style={{ display: 'flex', position: 'relative', flexDirection: 'row', alignItems: 'center', backgroundColor:'green', height:'100px'}}>
                <div className={`rotateLoading`} style={{position: 'absolute', width:'100%', height:'100%', zIndex:'0', backgroundColor:'rgba(0, 0, 0, 0.5)' }}>
                    <img src={profileImage} style={{position: 'absolute', width:'100%', height:'100%', zIndex:'0', backgroundColor:'rgba(0, 0, 0, 0.5)' }}/>
                </div>

                <LoadingImage src={profileImage} height={64} width={64} borderWidth={0} borderRadius={32} style={{zIndex:'1000'}}onClick={onClickNavigateBlog}/>
                <div style={{flexGrow:1, backgroundColor:'blue'}} ></div>
                <div style={{margin:'0px 5px 0 5px', width:'64px'}}>
                    {/* {!isLoggedIn && <BeautyButton type='confirm' onClick={onClickLogIn}>로그인</BeautyButton>}
                    {isLoggedIn && <LoadingImage src={profile} height={64} width={64} borderWidth={0} borderRadius={32} onClick={onClickUser}/>} */}
                </div>
            </div>
    );    
}
