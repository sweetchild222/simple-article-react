
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';



import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

import CommentArea from "./CommentArea.js";
import BeautyButton from "../../../common/BeautyButton.js";


import './Comment.css'
import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";

export default function(props) {    

    const combinedStyle = { ...props.style }

    const [isPostLoading, setIsPostLoading] = useState(false)
    const [inputLength, setInputLength] = useState('0/1000')
    
    const refArea = useRef(null)

    const maxCharLength = 1000

    const onClickPost = async()=> {

        if(!refArea.current)
            return

        const comment = refArea.current.value()

        if(comment.length == 0)
            return

        if(props.onPostText){
            setIsPostLoading(true)
            props.onPostText(comment)
            setIsPostLoading(false)
        }
    }

    const onInput = async(value) =>{

        setInputLength(value.length + '/' + maxCharLength)
    }

    
    const onClickCancel = async() => {
        
        if(props.onCancel)
            props.onCancel()
    }

    return  (<div style={{position:'relative', display:'flex', flexDirection: 'column', justifyContent:'end', width:'100%', backgroundColor:'lightgreen'}}>
                <CommentArea ref={refArea} atCandidates={props.atCandidates} onInput={onInput} maxCharLength={maxCharLength}></CommentArea>
                <div style={{display:'flex', flexDirection: 'row', width:'100%', justifyContent:'end', alignItems:'center'}}>
                    <label>{inputLength}</label>
                    <div style={{width:'10px'}}/>
                    <BeautyButton isLoading={isPostLoading} onClick={()=>onClickPost()}>{'올리기'}</BeautyButton>
                    <div style={{width:'10px'}}/>
                    <BeautyButton disabled={isPostLoading ? true : false} onClick={()=>onClickCancel()}>{'취소'}</BeautyButton>
                </div>
            </div>
        )
}
