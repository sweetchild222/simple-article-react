import React, { useState, useContext, useEffect} from 'react';

import AuthContext from "@util/AuthContext.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import PrettyButton from '@gui/PrettyButton.js';
import { RiMenuUnfold3Line } from "react-icons/ri";
import { RiMenuFold3Line } from "react-icons/ri";
import {useNavigate} from 'react-router-dom';
import * as AlarmAPI from '@rest/AlarmAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'
import * as BookmarkAPI from '@rest/BookmarkAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import ProfileImage from "@gui/ProfileImage.js";
import AlarmModal from "./AlarmModal.js";
import { VscBellDot } from "react-icons/vsc";
import { VscBell } from "react-icons/vsc";
import * as ReplaceUserTag from "@util/ReplaceUserTag.js";
import * as UserRepository from "@util/UserRepository.js";
import { IoIosArrowDown } from "react-icons/io";
import {VPad, HPad} from "@gui/Pad.js";

export default function Sidebar() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [alarms, setAlarms] = useState(null)
    const [isOpenAlarmModal, setIsOpenAlarmModal] = useState(false)
    const [subscribes, setSubscribes] = useState(null)
    const [bookmarks, setBookmarks] = useState(null)        
    const navigate = useNavigate()

    useEffect(() => {

        if(validAuth(auth)) {

            loadAlarms().then(alarms=>{                

                if(alarms != null)
                    setAlarms(alarms)
            })

            loadSubscribe().then(subscribes =>{

                if(subscribes != null)
                    setSubscribes(subscribes)
            })

            loadBookmarks().then(bookmarks =>{

                if(bookmarks != null)
                    setBookmarks(bookmarks)
            })
        }
        else {
            setAlarms(null)            
        }

    }, [auth])

    
    const loadBookmarks = async() => {

        if(!validAuth(auth))
            return null

        const resBookmarks = await BookmarkAPI.getUserBookmark(auth.jwt, auth.user_id, null)

        if(resBookmarks.success == false)
            return null

        const bookmarks = resBookmarks.payload

        bookmarks.sort((a, b)=> b.id - a.id)

        const articleIdList = bookmarks.map(item => item.article_id);

        const articles = []

        const limit = 100
        let startIndex = 0

        while(articleIdList.length > startIndex){

            const list = articleIdList.slice(startIndex, startIndex + limit)

            const resArticles = await ArticleAPI.getArticles('id=' + list)

            if(resArticles.success == true)
                resArticles.payload.map(item=>articles.push(item))

            startIndex += limit
        }

        bookmarks.forEach((item, index) => {
            item.article = articles.find(article => (article.id == item.article_id))
        })

        const user_ids = bookmarks.map(({article}) => article.user_id)
        
        const users = await UserRepository.getByIDList([...new Set(user_ids)])

        if(users == null)
            return null
        
        bookmarks.forEach((item, index) => {
            item.article.user = users.find(user => (user.id == item.article.user_id))
        })
                
        return bookmarks
    }
    

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
                
        resSubscribe.payload.sort((a, b)=> b.id - a.id)
        
        const blogIdList = resSubscribe.payload.map(item => item.blog_id)

        const limit = 100
        let startIndex = 0
        const blogs = []

        while(blogIdList.length > startIndex){

            const list = blogIdList.slice(startIndex, startIndex + limit)

            const resBlog = await BlogAPI.getBlogs('id=' + list)

            if(resBlog.success == true)
                resBlog.payload.forEach(item=>blogs.push(item))
            
            startIndex += limit
        }
        
        resSubscribe.payload.forEach((item, index) =>{
            item.blog = blogs.find(blog => (blog.id == item.blog_id))
        })

        const userIdList = resSubscribe.payload.filter(item => item.blog !== null).map(item => item.blog.user_id)
    
        const resUsers = await UserRepository.getByIDList([...new Set(userIdList)])

        if(resUsers == null)
            return

        resSubscribe.payload.forEach((item, index) =>{
            item.user = resUsers.find(user => (user.id == item.blog.user_id))
        })
                
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

        if(alarms.length == 0){
            window.showToast('알람이 없습니다', 'info')
            return
        }

        setIsOpenAlarmModal(true)
    }


    const onCloseAlarmModal = async() => {
        
        setIsOpenAlarmModal(false)
    }

    const onUpdatedAlarms = async(alarms)=>{

        setAlarms(structuredClone(alarms))
    }

    
    return (
        <div>
            <Vertical style={{justifyContent:'space-between'}}>
                <Horizental style={{alignItems:'center'}}>
                    {!validAuth(auth) && <PrettyButton type='success' onClick={onClickLogIn} style={{height:'fit-content'}}>로그인</PrettyButton>}
                    {validAuth(auth) && <Horizental style={{alignItems: 'center'}}>
                        <ProfileImage shape={'circle'}  userId={auth.user_id} size={48} onClick={onClickUser} onClickAtError={onClickAtError}/>                        
                        {alarms != null && <div style={{width:'8px'}}/>}
                        {alarms != null && <PrettyButton  type='transparent' style={{color:'black'}} onClick={onClickSearch} onClick={onClickAlarm}>{(alarms.filter(item => item.checked == 0).length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}
                        {alarms != null && <AlarmModal isOpen={isOpenAlarmModal} onClose={onCloseAlarmModal} onUpdatedAlarms={onUpdatedAlarms} alarms={alarms}></AlarmModal>}
                        </Horizental>
                    }
                    </Horizental>
            </Vertical>          

        <div style={{flex:'1'}}/>
        <Horizental style={{justifyContent:'center'}}>
            <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickNavigateHome}/>
        </Horizental>
        <VPad size={32}/>
        </div>
    );
}