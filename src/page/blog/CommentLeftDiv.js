
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
        
        if (!ref.current)
            return
        
        const observer = new ResizeObserver((entries) => {

            for (let entry of entries) {
                setSize({width: entry.contentRect.width, height: entry.contentRect.height})
            }
        })

        observer.observe(ref.current)

        return () => observer.disconnect()

    }, [ref])

    return size
}


export default function(props) {
        
    const refDiv = useRef(null)
    const {width, height} = useResize(refDiv)

    const [containerCanvasUrl, setContainerCanvasUrl] = useState(null)

    useEffect(() =>{
                
        if(!(width > 0 && height > 0))
            return

        if(!refDiv.current)
            return

        const childNodes = refDiv.current.parentNode.nextElementSibling.childNodes

        if(!childNodes)
            return
        
        const canvas = document.createElement('canvas')

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        const margin = 5
        const color = 'darkgray'
        const lineWidth = 2

        ctx.strokeStyle= color
        ctx.lineWidth = lineWidth

        const circleWidth = width - (margin + margin)

        let lastY = 0
        
        for(const child of childNodes) {

            let div = null

            if(child.id == 'replyButton' && !props.isShowReplies)
                div = child
            else if(child.id == 'replyDiv' && props.isShowReplies)
                div = child.childNodes[0].childNodes[0]

            if(div){
                const position = relativePosition(refDiv.current, div)
                const cx = width / 2 + (circleWidth / 2)
                const cy = position.y - (circleWidth / 2 - div.offsetHeight / 2)
                lastY = cy
                const radius = (circleWidth / 2)

                ctx.beginPath()
                ctx.arc(cx, cy, radius, Math.PI / 2, Math.PI)
                ctx.stroke()
            }
        }

        if(lastY > 0){
            ctx.fillStyle = color
            ctx.fillRect(width / 2 - (lineWidth / 2), margin, lineWidth, lastY)
        }

        setContainerCanvasUrl(canvas.toDataURL())
        
    }, [width, height, props.editableId])



    const relativePosition = (elementA, elementB) =>{

        const positionA = elementGlobalPosition(elementA)
        const positionB = elementGlobalPosition(elementB)

        const x = positionB.x - positionA.x
        const y = positionB.y - positionA.y

        return {x:x, y:y}
    }


    const elementGlobalPosition = (element) => {

        const rect = element.getBoundingClientRect()

        const x = rect.left
        const y = rect.top

        return {x:x, y:y}
    }


    
    return (
            <div ref={refDiv} style={{backgroundColor:'yellow', flex:'1', backgroundImage: `url(${containerCanvasUrl})`}} onChange={()=>{console.log('change')}}></div>
        )
}
