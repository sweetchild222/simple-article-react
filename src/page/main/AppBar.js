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
import BookmarkModal from "./BookmarkModal.js";
import SubscribeModal from "./SubscribeModal.js";
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
    const [isOpenSubscribeModal, setIsOpenSubscribeModal] = useState(false)
    const [isOpenBookmarkModal, setIsOpenBookmarkModal] = useState(false)

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



    const onClickSubscribe = async(e) => {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account')
            return
        }

        if(subscribes == null)
            return

        if(subscribes.length == 0){
            window.showToast('구독한 블로그가 없습니다', 'info')
            return
        }

        setIsOpenSubscribeModal(true)
    }


    const onClickBookmark = async(e) => {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/account')
            return
        }

        if(bookmarks == null)
            return

        if(bookmarks.length == 0){
            window.showToast('북마크한 글이 없습니다', 'info')
            return
        }

        setIsOpenBookmarkModal(true)
    }



    const onUpdatedAlarms = async(alarms)=>{

        setAlarms(structuredClone(alarms))
    }

    
    return (
        <Horizental style={{alignItems:'center', paddingLeft:'8px', paddingRight:'8px', paddingTop:'8px'}}>
            <img src='/logo/logo.svg' alt='logo' height='48px' width='48px' onClick={onClickNavigateHome}/>
            <div style={{flex:'1'}}/>
            {!validAuth(auth) && <PrettyButton type='success' onClick={onClickLogIn} style={{height:'fit-content'}}>로그인</PrettyButton>}
            {validAuth(auth) && <Horizental style={{alignItems: 'center'}}>

                {bookmarks != null && bookmarks.length > 0 && <PrettyButton type='transparent' style={{color:'black'}} onClick={onClickBookmark}>{<VscBellDot size={32}/>}</PrettyButton>}
                {bookmarks != null && bookmarks.length > 0 && <BookmarkModal isOpen={isOpenBookmarkModal} onClose={() => setIsOpenBookmarkModal(false)} bookmarks={bookmarks}></BookmarkModal>}
                {bookmarks != null && bookmarks.length > 0 && <HPad size={8}/>}

                {subscribes != null && subscribes.length > 0 && <PrettyButton type='transparent' style={{color:'black'}} onClick={onClickSubscribe}>{<VscBellDot size={32}/>}</PrettyButton>}
                {subscribes != null && subscribes.length > 0 && <SubscribeModal isOpen={isOpenSubscribeModal} onClose={() => setIsOpenSubscribeModal(false)} subscribes={subscribes}></SubscribeModal>}
                {subscribes != null && subscribes.length > 0 && <HPad size={8}/>}

                {alarms != null && <PrettyButton  type='transparent' style={{color:'black'}} onClick={onClickAlarm}>{(alarms.filter(item => item.checked == 0).length > 0 ? <VscBellDot size={32}/> : <VscBell size={32}/>)}</PrettyButton>}
                {alarms != null && <AlarmModal isOpen={isOpenAlarmModal} onClose={() => setIsOpenAlarmModal(false)} onUpdatedAlarms={onUpdatedAlarms} alarms={alarms}></AlarmModal>}
                {alarms != null && <HPad size={8}/>}
                <ProfileImage shape={'circle'}  userId={auth.user_id} size={48} onClick={onClickUser} onClickAtError={onClickAtError}/>
                </Horizental>
            }
        </Horizental>
    );
}