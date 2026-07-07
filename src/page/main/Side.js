import React, { useState, useContext, useEffect} from 'react';
import './Side.css';
import AuthContext from "@util/AuthContext.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import PrettyButton from '@gui/PrettyButton.js';
import { RiMenuUnfold3Line } from "react-icons/ri";
import { RiMenuFold3Line } from "react-icons/ri";
import {useNavigate} from 'react-router-dom';
import * as AlarmAPI from '@rest/AlarmAPI.js'
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
    const [isOpenAlarmModal, setIsOpenAlarmModal] = useState(false)

    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {

        if(validAuth(auth)) {            

            AlarmAPI.getAlarm(auth.jwt, auth.user_id).then(res=>{

                if(res.success == false)
                    return

                const alarms = res.payload

                alarms.sort((a, b)=> b.id - a.id)

                const promises = []

                alarms.map(alarm => promises.push(alarm.checked == 0 ? ReplaceUserTag.toUserNicknameGreen(alarm.comment) : ReplaceUserTag.toUserNicknameGray(alarm.comment)))

                Promise.all(promises).then(res => {

                    if(res.length != alarms.length)
                        return

                    res.map((data, index) => alarms[index].seenComment = data)                                    

                    const user_ids = alarms.map(({from_user_id}) => from_user_id)
        
                    UserRepository.getByIDList([...new Set(user_ids)]).then(users => {
                                        
                    for(const alarm of alarms)
                        
                        alarm.user = users.find(user => user.id == alarm.from_user_id)
                        
                        setAlarms(alarms)
                    })
                })
            })
        }
        else{
            setAlarms(null)
            setIsOpenAlarmModal(false)
        }

    }, [auth])
    


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

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            {!validAuth(auth) && <PrettyButton type='confirm' onClick={onClickLogIn}>로그인</PrettyButton>}
            {validAuth(auth) && <Horizental style={{alignItems: 'center'}}>
                <PrettyButton onClick={onClickNavigateMyBlog}>{'내 블로그'}</PrettyButton>
                <div style={{width:'8px'}}/>
                {alarms != null && <PrettyButton  type='transparent' style={{color:'black'}} onClick={onClickSearch} onClick={onClickAlarm}>{(alarms.filter(item => item.checked == 0).length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}
                {alarms != null && <div style={{width:'8px'}}/>}
                {alarms != null && <AlarmModal isOpen={isOpenAlarmModal} onClose={onCloseAlarmModal} onUpdatedAlarms={onUpdatedAlarms} alarms={alarms}></AlarmModal>}
                <ProfileImage shape={'circle'}  userId={auth.user_id} size={48} onClick={onClickUser} onClickAtError={onClickAtError}/>
                </Horizental>
            }
            <Horizental style={{justifyContent:'space-between'}}>
                {isOpen && <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' style={{backgroundColor:'red'}}onClick={onClickNavigateHome}/>}
                <PrettyButton type={'transparent'} style={{height:'64px', width:'64px'}} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <RiMenuFold3Line size={32}/> : <RiMenuUnfold3Line size={32}/>}
                </PrettyButton>
            </Horizental>

            <div style={{height:'1px', backgroundColor:'#2d2d44', width:'100%'}}></div>

            {/* Navigation List */}
            <nav className="sidebar-nav">
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
            </nav>
        </div>
    );
}