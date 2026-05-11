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
import './Pagination.css'
import { FaForward } from "react-icons/fa";
import { FaBackward } from "react-icons/fa6";

export default function({totalPageCount, displayPageCount, onClickPage}) {
        
    const [curStartPage, setStartPage] = useState(0)    
        
    const totalPageList = Array.from({ length: totalPageCount }, (_, i) => i)

    const [animationKey, setAnimationKey] = useState(0)
    const [movingbarPos, setMovingbarPos] = useState({curIndex:0, start:0, end:0})

    const pageNumWidth = 100

    const movingBarMarginLeft = 10
    const movingBarMarginRight = 10
    
    const getCurPageList = () => {

        const subList = totalPageList.slice(curStartPage, curStartPage + displayPageCount)

        return subList
    }

    const onClickForward = () => {

        const calcPage = (curStartPage - displayPageCount) > 0 ? (curStartPage - displayPageCount) : 0

        onClickPage(calcPage)
        setStartPage(calcPage)

        moveBar(displayPageCount - 1)
    }


    const onClickBackward = () => {

        const calcPage = (curStartPage + displayPageCount) > totalPageCount ? totalPageCount : (curStartPage + displayPageCount)

        onClickPage(calcPage)
        setStartPage(calcPage)

        moveBar(0)
    }    


    const onClickPageInner = (index, page) => {

        if(onClickPage != null)
            onClickPage(page)

        moveBar(index)
    }


    const moveBar = (index) =>{

        if(movingbarPos.curIndex == index)
            return
        
        const margin = movingBarMarginLeft + movingBarMarginRight
        const width = pageNumWidth - margin
    
        const startPos = movingbarPos.curIndex * (width + margin)
        const endPos = index * (width + margin)

        setMovingbarPos({curIndex: index, start:startPos, end:endPos})
        setAnimationKey(prev => prev + 1)
    }

    return (
        <div style={{display:'flex', flexDirection:'row', justifyContent:'center', marginTop:'30px'}}>
            <BeautyButton type={'transparent'} style={{color:'black', visibility:(curStartPage > 0 ? 'visible' : 'hidden')}} onClick={onClickForward}><FaBackward size={20}/></BeautyButton>
            <div style={{display:'flex', flexDirection:'column'}} >
                <div style={{display:'flex', flexDirection:'row', justifyContent:'left', width:((displayPageCount * pageNumWidth) + 'px')}}>
                    {getCurPageList().map((data, index) => <BeautyButton key={index} type={'transparent'} style={{color:'black', width: pageNumWidth + 'px', fontSize:'20px'}} onClick={()=> onClickPageInner(index, data)}>{data}</BeautyButton>)}
                </div>
                <div key={animationKey} className={'movingbar'} style={{marginLeft:(movingBarMarginLeft + 'px'), width:(pageNumWidth - movingBarMarginLeft - movingBarMarginRight + 'px'), height:'4px', borderRadius:'2px', backgroundColor:'gray', '--start--':movingbarPos.start + 'px', '--end--':movingbarPos.end + 'px', marginTop:'3px', marginRight:(movingBarMarginRight + 'px')}}></div>
            </div>
            <BeautyButton type={'transparent'} style={{color:'black', visibility:((curStartPage + displayPageCount < totalPageCount) ? 'visible' : 'hidden')}} onClick={onClickBackward}><FaForward size={20}/></BeautyButton>
        </div> )
}
