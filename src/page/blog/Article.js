
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import './Home.css'
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'

export default function() {

    const { b_id, a_id } = useParams()

    const blog_id = ToInteger(b_id)
    const article_id = ToInteger(a_id)
    

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [article, setArticle] = useState(null)

    useEffect(()=>{

        ArticleAPI.getArticle(validAuth(auth) ? auth.jwt : null, a_id).then((article) =>{

            if(article == null){
                navigate('/pageNotFound')
                return
            }
                        
            if(blog_id != article.blog_id){
                navigate('/pageNotFound')
                return
            }


            //const html = MarkdownToHtml(refMDX.current.getMarkdown())

            setArticle(article)
        })

    }, [auth, b_id, a_id])









    const navigate = useNavigate()

    return (<div style={{width:'100%', backgroundColor:'red'}}>
        {article && <div dangerouslySetInnerHTML={{__html: MarkdownToHtml(article.content)}} style={{margin:'10px', wordBreak:'break-all'}}/>}
    </div>)
}
