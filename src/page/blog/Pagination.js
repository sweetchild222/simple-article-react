import { useState } from "react";

import PrettyButton from '@gui/PrettyButton.js';
import {Vertical, Horizental} from "@gui/Flex.js";
import './Pagination.css'
import { FaForward } from "react-icons/fa";
import { FaBackward } from "react-icons/fa6";

export default function({totalPageCount, displayPageCount, onClickPage}) {
        
    const [curStartPage, setStartPage] = useState(0)    
        
    const totalPageList = Array.from({ length: totalPageCount }, (_, i) => i)

    const [animationKey, setAnimationKey] = useState(0)
    const [movingbarPos, setMovingbarPos] = useState({curIndex:0, start:0, end:0})

    const pageNumWidth = 64    
    const movingBarMarginLeft = 4
    const movingBarMarginRight = 4
    const height = 32
    
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
        <Horizental style={{justifyContent:'center', alignItems:'start'}}>
            <PrettyButton type={'transparent'} style={{color:'black', height:height + 'px', visibility:(curStartPage > 0 ? 'visible' : 'hidden')}} onClick={onClickForward}><FaBackward size={16}/></PrettyButton>
            <Vertical>
                <div style={{display:'flex', flexDirection:'row', justifyContent:'start', width:((displayPageCount * pageNumWidth) + 'px')}}>
                    {getCurPageList().map((data, index) => <PrettyButton key={index} type={'transparent'} style={{height:height + 'px', color:'black', width: pageNumWidth + 'px', fontSize:'16px'}} onClick={()=> onClickPageInner(index, data)}>{data}</PrettyButton>)}
                </div>
                <div key={animationKey} className={'movingbar'} style={{marginLeft:(movingBarMarginLeft + 'px'), width:(pageNumWidth - movingBarMarginLeft - movingBarMarginRight + 'px'), height:'4px', borderRadius:'2px', backgroundColor:'gray', '--start--':movingbarPos.start + 'px', '--end--':movingbarPos.end + 'px', marginTop:'3px', marginRight:(movingBarMarginRight + 'px')}}></div>
            </Vertical>
            <PrettyButton type={'transparent'} style={{color:'black', height:height + 'px', visibility:((curStartPage + displayPageCount < totalPageCount) ? 'visible' : 'hidden')}} onClick={onClickBackward}><FaForward size={16}/></PrettyButton>
        </Horizental> )
}
