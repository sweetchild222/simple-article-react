import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";
import ProfileContext from "../../util/ProfileContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import * as UserAPI from '../../api/UserAPI.js'
import { PiTrash } from "react-icons/pi";
import { CiYoutube } from "react-icons/ci";

export default function() {

    const { id } = useParams();
    
    //const location = useLocation()
    //const state = location.state

    const refTitle = useRef(null)
    const [title, setTitle] = useState(null)
    const [titleEditMode, setTitleEditMode] = useState(false)

    const [profileImage, setProfileImage] = useState(null)
    

            
    const navigate = useNavigate()

    useEffect(()=>{
        
        BlogAPI.getBlog(id).then((blog)=> {

            console.log(blog)

            setTitle(blog.title)

        })



        // UserAPI.getUser(state.user_id).then((resUser)=> {
                
        //     if(resUser == null)
        //         return
    
        //     setProfileImage(resUser.profile ?  resUser.profile : '/image/user.png')
        // })
    }, [id])


    const onClickNavigateBlog = () =>{


        console.log('sdfa')
    }


    useEffect(()=>{

        if(refTitle.current)
            refTitle.current.focus()

    }, [titleEditMode])

    const onClickEditTitle = () =>{

        setTitleEditMode(true)
    }


    const onClickApplyTitle = () => {

        setTitleEditMode(false)
    }


    return (
            <div style={{backgroundColor:' #494D5F', height:'256px', backgroundImage:`url(` + profileImage + `)`, backgroundSize:'cover', backgroundPosition:'center'}}>
                <div style={{backgroundColor:'#00000030', display: 'flex', alignItems: 'center', width:'100%', height:'100%'}}>
                    <LoadingImage src={profileImage} height={64} width={64} borderWidth={0} borderRadius={32} onClick={onClickNavigateBlog}/>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        {titleEditMode && <input ref={refTitle} style={{backgroundColor:'#00000000', color:'white', fontSize:'48px', borderColor:'white', fieldSizing:'content', maxWidth:'512px'}} placeholder="제목" maxLength="32" defaultValue={title}></input>}
                        {!titleEditMode && <label style={{backgroundColor:'#00000000', color:'white', fontSize:'48px', paddingLeft:'9px', paddingRight:'9px', borderColor:'white', display:'flex', alignItems:'center'}}>{title}</label>}
                        {titleEditMode && <BeautyButton type='transparent' style={{}} onClick={onClickApplyTitle}><PiTrash size={30}/></BeautyButton>}
                        {!titleEditMode && <BeautyButton type='transparent' style={{}} onClick={onClickEditTitle}><CiYoutube size={30}/></BeautyButton>}
                    </div>
                    
                    <div style={{flexGrow:1, backgroundColor:'blue'}} ></div>
                    <BeautyButton  type='success' style={{margin:'0px 5px 0 5px'}}><PiTrash size={100}/></BeautyButton>
                
                    <div style={{margin:'0px 5px 0 5px', width:'64px'}}>
                    </div>
                </div>
            </div>
    )

    

    // return (
    //         <div style={{ display: 'flex', position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent:'center', height:'128px'}}>
    //             <div className={`rotateLoading`} style={{position: 'absolute', width:'100%', height:'100%', zIndex:'0', backgroundColor:'rgba(0, 0, 0, 0.5)' }}>
    //             <img src={profileImage} style={{position: 'absolute', width:'100%', height:'100%', zIndex:'0', backgroundColor:'rgba(0, 0, 0, 0.5)' }}/>
    //             <div style={{position: 'absolute', backgroundColor:'green'}}>
    //                 <LoadingImage src={profileImage} height={64} width={64} borderWidth={0} borderRadius={32} onClick={onClickNavigateBlog}/>
    //             </div>
    //             <div style={{flexGrow:1, backgroundColor:'blue'}} ></div>
    //             <div style={{margin:'0px 5px 0 5px', width:'64px'}}>
    //                 {/* {!isLoggedIn && <BeautyButton type='confirm' onClick={onClickLogIn}>로그인</BeautyButton>}
    //                 {isLoggedIn && <LoadingImage src={profile} height={64} width={64} borderWidth={0} borderRadius={32} onClick={onClickUser}/>} */}
    //             </div>
    //             </div>
    //         </div>
    // );    
}
