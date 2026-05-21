
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as UserAPI from '../../api/UserAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import Modal from "../../common/Modal.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import CountWithUnit from "../../util/CountWithUnit.js";


import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import * as CommentAPI from '../../api/CommentAPI.js'
import UserImage from "../../common/UserImage.js";

import './Comments.css'
import Categories  from "./Categories.js";
import Comment  from "./Comment.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'
import TimestampToString from '../../util/TimestampToString.js'

import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";

export default function(props) {

    const combinedStyle = { ...props.style }

    const [isPostLoading, setIsPostLoading] = useState(false)
    const [inputLength, setInputLength] = useState('0/1000')

    const refCommentText = useRef(null)

    const onClickPost = async()=> {

        if(!refCommentText.current)
            return

        const comment = refCommentText.current.value

        if(comment.length == 0)
            return

        if(props.onPostText){
            setIsPostLoading(true)
            props.onPostText(comment)
            setIsPostLoading(false)
        }
    }

    const onInput = async(e) =>{

        setInputLength(e.nativeEvent.target.value.length + '/1000')
    }


    const onClickCancel = async() => {
        
        if(props.onCancel)
            props.onCancel()
    }


    return  (<div style={{display:'flex', flexDirection: 'column', width:'100%', backgroundColor:'lightgreen'}}>
                <textarea ref={refCommentText} className={'commentEdit'}  placeholder={'댓글을 입력하세요'} suppressContentEditableWarning={true} maxLength={1000} style={{width:'100%',  minHeight: '3lh', resize:'none', maxHeight:'6lh', border:'1px solid lightgray', fieldSizing: 'content', overflowY:'auto'}} onInput={onInput}/>
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
