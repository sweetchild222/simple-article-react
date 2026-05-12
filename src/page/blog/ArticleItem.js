import {useContext, useEffect, useRef } from "react";
import * as UserAPI from '../../api/UserAPI.js'
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import * as validator from '../../util/Validator.js'
import AuthContext from "../../util/AuthContext.js";
import BeautyButton from '../../common/BeautyButton.js';
import GoLogin from "../../common/GoLogin.js";
import OverlayLoading from "../../common/OverlayLoading.js";
import LoadingImage from "../../common/LoadingImage.js";
import * as ArticleAPI from '../../api/ArticleAPI.js'
import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";


export default function(props) {
    
    const article = props.article
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const navigate = useNavigate()

    if(article.id == 162)
        article.head = 'asdfasdfaskldfjsadklfjsdlkfjsdklfjwoiefweojfiwejfoiwejfoiwjfoiwejfoiwejfoiwejfoiwejfoiwejfoiwejfoiwejfoiwejfiosdjlkdsjsdflkasdjlksadjlkasdjlaksdjalksdfjlk;ldsfakjlsadkfjlaskdfjslakdfjsalkdfjasldkfjsalkdfjasldkfjsalkdfjaslsdfsdfsdfsdkfjsalkdfjasldsdfsdfkfjf'
    
    const combinedStyle = {
        ...props.style
    }

    const numberUnit = (count) => {

        if(count > 1000){
            if(count > 1000000)
                return (count / 1000000).toFixed(1) + 'M'

            return (count / 1000).toFixed(1) + 'K'
        }

        return count
    }


    const calcDayBefore = (date)=> {

        for(var i = 0; i < 3; i++){

            const current = new Date()

            const beforeDay = new Date((current.getTime() - i * (24 * 60 * 60 * 1000)))

            if(beforeDay.getFullYear() == date.getFullYear() && beforeDay.getMonth() == date.getMonth() && beforeDay.getDate() == date.getDate())
                return i
        }
        return -1        
    }


    const timestampToString = (timestamp) => {

        const date = new Date(timestamp)

        const dayBefore = calcDayBefore(date)

        if(dayBefore == 0)
            return '오늘'        
        else if(dayBefore == 1)
            return '어제'
        else if(dayBefore == 2)
            return '그제'
        

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        const formattedDate = `${year}.${month}.${day}`;

        return formattedDate
    }

    const onClickNavigateArticle = async() =>{

        if(article.posted == 1)
            navigate('article/' + article.id)
        else{
            
            if(validAuth(auth)){

                if(auth.blog_id != article.blog_id)
                    return

                const res = await ArticleAPI.getArticle(auth.jwt, article.id)

                if(res == null){
                    window.showToast('작성 중인 글을 가져 올 수 없습니다', 'error')
                    return
                }
                navigate('/write', {state:res})
            }
        }
    }
    
    return (
        <div onClick={onClickNavigateArticle} style={{display: 'flex', flexDirection: 'row', flex:'1', padding:'10px', cursor:'pointer', borderRadius:'3px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', backgroundColor:'#F5F5F5'}}>
            <div style={{display: 'flex', flexDirection: 'column', flex:'1', marginLeft:'5px', marginRight:'5px'}}>
                <div className={'clamped-text underline-text'} style={{'--line-count':2, fontSize:'18px', fontWeight:'600', marginBottom:'10px', color:'#1A1A1A'}}>{article.title != '' ? article.title : '...'}</div>
                <div className={'clamped-text underline-text'} style={{'--line-count':3, marginBottom:'10px', color:'#222222'}}>{article.head.length >= 255 ? article.head + '...' : (article.head != '' ? article.head : '......')}</div>
                <div style={{flex:'1'}}></div>
                <div style={{display: 'flex', flexDirection: 'row',  alignItems:'center', color:'#888888'}}>
                    <div style={{display: 'flex', flexDirection: 'row', marginRight:'20px'}}>
                        <TiEye size={22}/>
                        <div style={{width:'48px', marginLeft:'5px'}}>{numberUnit(article.showed)}</div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', marginRight:'20px'}}>
                        <MdThumbUpAlt size={22}/>
                        <div style={{width:'48px', marginLeft:'5px'}}>{numberUnit(article.great_count)}</div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', marginRight:'30px'}}>
                        <BiSolidComment size={22}/>
                        <div style={{width:'48px', marginLeft:'5px'}}>{numberUnit(article.comment_count)}</div>
                    </div>
                    <div style={{whiteSpace: 'nowrap'}} >{timestampToString(article.create_at)}</div>
                </div>                
            </div>
            <LoadingImage src={article.thumbnail + '?size=170x170'} width={170} height={170} borderWidth={0}/>
        </div>
    )
}

