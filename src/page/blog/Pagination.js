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


export default function({totalPageCount, displayPageCount, onClickPage}) {
        
    const [curStartPage, setStartPage] = useState(0)
        
    const list = Array.from({ length: totalPageCount }, (_, i) => i)
    
    const getCurPageList = () => {

        const subList = list.slice(curStartPage, curStartPage + displayPageCount)

        return subList
    }

    const onClickForward = () => {

        const calcPage = (curStartPage - displayPageCount) > 0 ? (curStartPage - displayPageCount) : 0

        onClickPage(calcPage)
        setStartPage(calcPage)

        //
    }


    const onClickBackward = () => {

        const calcPage = (curStartPage + displayPageCount) > totalPageCount ? totalPageCount : (curStartPage + displayPageCount)

        onClickPage(calcPage)
        setStartPage(calcPage)        
    }
    

    return (
        <div style={{display:'flex', flexDirection:'row', justifyContent:'center', backgroundColor:'orange'}}>

            <BeautyButton type={'transparent'} style={{color:'black', visibility:(curStartPage > 0 ? 'visible' : 'hidden')}} onClick={onClickForward}>{'<<'}</BeautyButton>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'center', backgroundColor:'lightblue', width:((displayPageCount * 30) + 'px')}}>
                {getCurPageList().map((data, index) => <BeautyButton key={index} type={'transparent'} style={{color:'black'}} onClick={()=> onClickPage(data)}>{data}</BeautyButton>)}
            </div>
            <BeautyButton type={'transparent'} style={{color:'black', visibility:((curStartPage + displayPageCount < totalPageCount) ? 'visible' : 'hidden')}} onClick={onClickBackward}>{'>>'}</BeautyButton>


            {/* //{articles.map((data, index) => <ArticleItem key={data.id} article={data}/>)}

            <BeautyButton type={'transparent'} style={{color:'black'}}>{'1'}</BeautyButton>
            <BeautyButton type={'transparent'} style={{color:'black'}}>{'2'}</BeautyButton>
            <BeautyButton type={'transparent'} style={{color:'black'}}>{'3'}</BeautyButton>
            <BeautyButton type={'transparent'} style={{color:'black'}}>{'4'}</BeautyButton>
            <BeautyButton type={'transparent'} style={{color:'black'}}>{'5'}</BeautyButton>
            <BeautyButton type={'transparent'} style={{color:'black'}}>{'6'}</BeautyButton> */}
    </div>)
}

