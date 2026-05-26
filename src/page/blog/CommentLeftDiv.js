
import React, {useState, useContext, useLayoutEffect, useEffect, useRef } from "react";

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
import CommentGreat from "./CommentGreat.js";
import { HiDotsVertical } from "react-icons/hi";
import { FaCommentMedical } from "react-icons/fa6";


import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import * as CommentAPI from '../../api/CommentAPI.js'
import UserImage from "../../common/UserImage.js";
import * as UserRepository from "./UserRepository.js";

import './Comments.css'
import Categories  from "./Categories.js";
import Comment  from "./Comment.js";
import CommentEdit from "./CommentEdit.js";
import CommentMenu from "./CommentMenu.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'
import TimestampToString from '../../util/TimestampToString.js'


import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { SlArrowDown } from "react-icons/sl";
import { SlArrowUp } from "react-icons/sl";
import { MdDownloadDone } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdOutlineDoneOutline } from "react-icons/md";


const useResize = (ref) => {

    const [size, setSize] = useState({ width: 0, height: 0 })

    useLayoutEffect(() => {
        
        if (!ref.current){
            console.log('sddccc')
            return
        }
        
        const observer = new ResizeObserver((entries) => {

            //console.log('xx')

            for (let entry of entries) {

                console.log(entry)
                setSize({width: entry.contentRect.width, height: entry.contentRect.height})
            }
        })

        observer.observe(ref.current)

        return () => observer.disconnect()

    }, [ref])

    return size
}


export default function() {
    
    const refDiv = useRef(null)
    const { width, height } = useResize(refDiv)


    
    return (
            <div ref={refDiv} style={{backgroundColor:'yellow', flex:'1'}}>{height}</div>
        )
}
