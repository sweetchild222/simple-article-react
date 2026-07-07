import React, { useState, useContext, useEffect} from 'react';
import './Side.css';
import AuthContext from "@util/AuthContext.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import PrettyButton from '@gui/PrettyButton.js';
import { RiMenuUnfold3Line } from "react-icons/ri";
import { RiMenuFold3Line } from "react-icons/ri";
import {useNavigate} from 'react-router-dom';
import * as AlarmAPI from '@rest/AlarmAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import ProfileImage from "@gui/ProfileImage.js";
import AlarmModal from "./AlarmModal.js";
import { VscBellDot } from "react-icons/vsc";
import { VscBell } from "react-icons/vsc";
import * as ReplaceUserTag from "@util/ReplaceUserTag.js";

import * as UserRepository from "@util/UserRepository.js";

// 1. Define navigation links array
const NAV_ITEMS = [

  { name: 'Dashboard', icon: '📊', path: '#dashboard' },
  { name: 'Analytics', icon: '📈', path: '#analytics' },
  { name: 'Messages', icon: '✉️', path: '#messages' },
  { name: 'Settings', icon: '⚙️', path: '#settings' },
];

export default function Sidebar() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [alarms, setAlarms] = useState(null)
    const [subscribes, setSubscribes] = useState(null)
    const [isOpenAlarmModal, setIsOpenAlarmModal] = useState(false)

    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {

        if(validAuth(auth)) {

            loadAlarms().then(alarms=>{

                if(alarms != null)
                    setAlarms(alarms)
            })

            loadSubscribe().then(subscribes =>{

                if(subscribes != null){
                    setSubscribes(subscribes)
                }
            })
        }
        else{

            setAlarms(null)
            setIsOpenAlarmModal(false)
        }

    }, [auth])
    

    const loadAlarms = async()=>{

        if(!validAuth(auth))
            return null
        
        const resAlarms = await AlarmAPI.getAlarm(auth.jwt, auth.user_id)

        if(resAlarms.success == false)
            return null

        const alarms = resAlarms.payload

        alarms.sort((a, b)=> b.id - a.id)

        const promises = []

        alarms.map(alarm => promises.push(alarm.checked == 0 ? ReplaceUserTag.toUserNicknameGreen(alarm.comment) : ReplaceUserTag.toUserNicknameGray(alarm.comment)))

        const resPromise = await Promise.all(promises)

        if(resPromise.length != alarms.length)
            return null

        resPromise.map((data, index) => alarms[index].seenComment = data)

        const user_ids = alarms.map(({from_user_id}) => from_user_id)

        const users = await UserRepository.getByIDList([...new Set(user_ids)])
                            
        for(const alarm of alarms)
            alarm.user = users.find(user => user.id == alarm.from_user_id)
                
        return alarms
    }


    const loadSubscribe = async() => {

        if(!validAuth(auth))
            return null

        const query = 'user_id=' + auth.user_id

        const resSubscribe = await SubscribeAPI.getSubscribe(query)

        if(resSubscribe.success == false)
            return null

        const blogIdList = resSubscribe.payload.map(item => item.blog_id)

        const resBlog = await BlogAPI.getBlogs('id=' + blogIdList)

        if(resBlog.success == false)
            return null
        
        resSubscribe.payload.forEach((item, index) =>{
            item.blog = resBlog.payload.find(blog => (blog.id == item.blog_id))
        })

        const userIdList = resSubscribe.payload.filter(item => item.blog !== null).map(item => item.blog.user_id)
    
        const resUsers = await UserRepository.getByIDList([...new Set(userIdList)])

        if(resUsers == null)
            return


        resSubscribe.payload.forEach((item, index) =>{
            item.user = resUsers.find(user => (user.id == item.blog.user_id))
        })

        console.log(resSubscribe.payload)

        
        return resSubscribe.payload
    }


    const onClickNavigateHome = (e) =>{

        navigate('/')
    }
    


    

    const onKeyDown = (e) => {

        if(e.key === 'Enter')
            onClickSearch(inputElement.value)
    }


    const onClickLogIn = (e) =>{

        navigate("/account")
    }


    const onClickUser = (e) =>{

        if(validAuth(auth))
            navigate('/user/' + auth.user_id)
        else
            navigate('/account')
    }


    const onClickSearch = (e) => {

    }

    const onClickAtError= (e) => {

        removeAuth()
        navigate('/account')
    }


    const onClickHome = (e) =>{

        navigate('/')
    }


    const onClickAlarm = async(e) => {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account')
            return
        }

        if(alarms == null)
            return

        if(alarms.length == 0)
            return

        setIsOpenAlarmModal(true)
    }


    const onCloseAlarmModal = async() => {        

        
        setIsOpenAlarmModal(false)
    }

    const onUpdatedAlarms = async(alarms)=>{

        setAlarms(structuredClone(alarms))
    }

    const onClickNavigateMyBlog = async() =>{

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/', {state:{comback:true}})
            return
        }
    
        navigate("/blog/" + auth.blog_id)
    }

    const subscribeMoreCount = 2
    const [subscribeCount, setSubscribeCount] = useState(subscribeMoreCount)

    const onClickMore = async () => {

        

        if(subscribeCount >= subscribes.length)
            return
              
        setSubscribeCount(item => item + subscribeMoreCount)
    }

    

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{padding:'8px'}}>
            <Horizental style={{justifyContent:'space-between'}}>
                {isOpen && <Horizental style={{alignItems:'center'}}>
                    {!validAuth(auth) && <PrettyButton type='confirm' onClick={onClickLogIn} style={{height:'fit-content'}}>로그인</PrettyButton>}
                    {validAuth(auth) && <Horizental style={{alignItems: 'center'}}>
                        <ProfileImage shape={'circle'}  userId={auth.user_id} size={48} onClick={onClickUser} onClickAtError={onClickAtError}/>
                        {alarms != null && <div style={{width:'8px'}}/>}
                        {alarms != null && <PrettyButton  type='transparent' style={{color:'white'}} onClick={onClickSearch} onClick={onClickAlarm}>{(alarms.filter(item => item.checked == 0).length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}
                        {alarms != null && <AlarmModal isOpen={isOpenAlarmModal} onClose={onCloseAlarmModal} onUpdatedAlarms={onUpdatedAlarms} alarms={alarms}></AlarmModal>}
                        </Horizental>
                    }
                    </Horizental>
                }
                <PrettyButton type={'transparent'} style={{height:'64px', width:'64px'}} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <RiMenuFold3Line size={32}/> : <RiMenuUnfold3Line size={32}/>}
                </PrettyButton>
            </Horizental>

            {validAuth(auth) && <div style={{borderBottom: '1px solid #2d2d44', borderTop: '1px solid #2d2d44'}}>
                    <PrettyButton style={{marginTop:'8px', marginBottom:'8px', width:'100%'}} onClick={onClickNavigateMyBlog}>{'내 블로그'}</PrettyButton>
                </div>
            }            
        
            {validAuth(auth) && subscribes && <Vertical>
                <label style={{color:'white'}}>{'구독한 블로그'}</label>
            
                {subscribes.slice(0, subscribeCount).map((data, index) => 
                    <Horizental key={data.id} style={{alignItems:'center'}}>
                        <ProfileImage user={data.user} size={32}></ProfileImage>
                        <div style={{width:'16px', maxWidth:'16px', minWidth:'16px'}}/>
                        <div  className={'clamped-text'} style={{'--line-count':1, cursor:'pointer', marginTop:'10px', marginBottom:'10px', whiteSpace: 'nowrap'}}>{data.blog.title}</div>
                    </Horizental>
                )}
                {subscribes.length > subscribeCount && <PrettyButton onClick={onClickMore}>{'더 보기'}</PrettyButton>}

            </Vertical>}

            {/* <nav className="sidebar-nav">
                <ul>
                {NAV_ITEMS.map((item, index) => (
                    <li key={index} className="nav-item">
                    <a href={item.path} className="nav-link">
                        <span className="nav-icon">{item.icon}</span>
                        {isOpen && <span className="nav-text">{item.name}</span>}
                    </a>
                    </li>
                ))}
                </ul>
            </nav> */}
            <label style={{color:'white'}}>북마크</label>

        <div style={{flex:'1'}}/>
        <Horizental style={{justifyContent:'center'}}>
            <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickNavigateHome}/>        
        </Horizental>
        <div style={{height:'16px'}}/>
        </div>
    );
}