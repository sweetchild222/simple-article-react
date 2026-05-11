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
import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import './ArticleItem.css'

export default function(props) {
    
    const article = props.article    

    // if(article.id == 162)
    //     article.head = 'asdfasdfaskldfjsadklfjsdlkfjsdklfjwoiefweojfiwejfoiwejfoiwjfoiwejfoiwejfoiwejfoiwejfoiwejfoiwejfoiwejfoiwejfiosdjlkdsjsdflkasdjlksadjlkasdjlaksdjalksdfjlk;ldsfakjlsadkfjlaskdfjslakdfjsalkdfjasldkfjsalkdfjasldkfjsalkdfjaslsdfsdfsdfsdkfjsalkdfjasldsdfsdfkfjf'
    
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

    const onClickNavigateArticle = () =>{

        console.log(article.id)
    }
    
    return (
        <div onClick={onClickNavigateArticle} style={{display: 'flex', flexDirection: 'row', flex:'1', marginTop:'10px', marginBottom:'10px'}}>
            <div style={{display: 'flex', flexDirection: 'column', flex:'1', marginLeft:'5px', marginRight:'5px'}}>
                <div className={'clamped-text'} style={{'--line-count':2, fontSize:'18px', fontWeight:'600', marginBottom:'10px', color:'#1A1A1A'}}>{article.title}</div>
                <div className={'clamped-text'} style={{'--line-count':3, marginBottom:'10px', color:'#222222'}}>{article.head.length >= 255 ? article.head + '...' : article.head}</div>
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
                <div style={{backgroundColor:'lightgray', height:'1px'}}></div>
            </div>
            <LoadingImage src={article.thumbnail} width={170} height={170}/>
        </div>
    )
}

