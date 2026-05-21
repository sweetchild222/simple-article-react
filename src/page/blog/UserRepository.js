


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
import CommentEdit from "./CommentEdit.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'
import TimestampToString from '../../util/TimestampToString.js'

import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";


const repository = []

export const getByIDList = async(userIDList) => {

    const filterIDList = userIDList.filter(id => (repository.find(item => item.id == id) == null))
    
    if(filterIDList.length > 0) {
        
        const newUserList = await UserAPI.getUsers('id=' + filterIDList)

        newUserList.forEach(item=>repository.push(item))
    }

    return repository.filter(item => userIDList.find(id => item.id == id))
}


export const getByID = async(userId) => {

    const findUser = repository.find(item => item.id == userId)
    
    if(findUser == null) {
        
        const newUserList = await UserAPI.getUsers('id=' + [userId])

        newUserList.forEach(item=>repository.push(item))
    }

    return repository.find(item => item.id == userId)
}


