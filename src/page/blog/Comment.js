
import React, {useState, useContext, useEffect, useRef, useImperativeHandle } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'
import * as CommentGreatAPI from '../../api/CommentGreatAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import Modal from "../../common/Modal.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import CountWithUnit from "../../util/CountWithUnit.js";



import ArticleItem from "./ArticleItem.js";
import CommentGreat from "./CommentGreat.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import * as CommentAPI from '../../api/CommentAPI.js'
import UserImage from "../../common/UserImage.js";

import './Comments.css'
import './Comment.css'
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'
import TimestampToString from '../../util/TimestampToString.js'

import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { MdThumbDownAlt } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RiArrowDownWideLine } from "react-icons/ri";
import { HiDotsVertical } from "react-icons/hi";



export default function({ref, comment, editable}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isModifyLoading, setIsModifyLoading] = useState(false)
    
    const [isModify, setIsModify] = useState(false)
    const [isClamped, setIsClamped] = useState(false)
    const [isExpand, setIsExpand] = useState(false)
    
    const refComment = useRef(null)    

    useImperativeHandle(ref, () => ({

            getText: () =>{

                if(!refComment.current)
                    return null

                return refComment.current.value()
            }
        }
    ));
        
    
    useEffect(() =>{

        if(refComment.current){
            
            const element = refComment.current
            
            setIsClamped(element.scrollHeight >  element.clientHeight)
        }

    }, [refComment])


    useEffect(()=>{

        if(editable)

            if(refComment.current)
                refComment.current.focus()            

    }, [editable])



    const onClickModifyConfirm = async()=>{

        if(!(validAuth(auth) && auth.user_id == comment.user_id))
            return

        if(!refText.current)
            return

        const modifiedComment = refText.current.value

        if(modifiedComment.length == 0) {
            window.showToast('입력된 글이 없습니다', 'error')
            return
        }    

        if(modifiedComment == comment.comment){
            window.showToast('수정된 내용이 없습니다', 'error')
            return
        }

        const payload = {
            comment:modifiedComment
        }

        setIsModifyLoading(true)

        const res = await CommentAPI.putComment(auth.jwt, comment.id, payload)

        setIsModifyLoading(false)

        if(res == null){
            window.showToast('댓글 수정에 실패하였습니다', 'error')
            return
        }

        window.showToast('댓글 수정에 성공하였습니다', 'info')

        comment.comment = modifiedComment
        comment.update_at = Date.now()
        setIsModify(false)
    }    


    return comment ? (
            <div style={{display:'flex', flexDirection: 'column', justifyContent:'end', backgroundColor:'orange', alignItems:'start', width:editable ? '100%' : 'auto'}}>
                <div ref={refComment} className={editable ? 'edit-text' : (isExpand ? 'none-clamped-text' : 'clamped-text')} contentEditable={editable} suppressContentEditableWarning={true} style={{boxSizing: 'border-box', '--line-count':5, whiteSpace: 'pre-line', backgroundColor:'lightblue', width:editable ? '100%' : 'auto', padding:'5px'}}>
                    {comment.comment + "sdafasdflisdajf\nklsdfjkls\njdfsi\nfwoie\njfwoiejf\nwoiejfiwoejf\noiwejf\noiwejfoiwejf\noiwejf\noiwjfwoiejfoiwjwoi\nejfo\niwjoijwofijwoeijwojwoijwfoijo"}
                    {/* {comment.comment} */}
                </div>
                {!editable && isClamped && !isExpand && <div style={{position: 'absolute', alignSelf:'end'}}>
                    <BeautyButton type={'transparent'} style={{color:'black'}} onClick={() => setIsExpand(true)}><RiArrowDownWideLine size={12}/></BeautyButton>
                </div>}
            </div>
        ) : null        
}


