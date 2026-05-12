
import React, {useState, useContext, useEffect, useRef, useImperativeHandle} from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import { TfiWrite } from "react-icons/tfi";
import { FaPen } from "react-icons/fa6"

export default function({ref, blogId, isEdit}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [articles, setArticles] = useState(null)
    const navigate = useNavigate()
    
    useEffect(()=> {
        
        loadArticles()

    }, [blogId])


    const loadArticles = async() => {

        const query = 'offset=0&limit=5&order=1'

        const articles = await ArticleAPI.getBlogArticles(null, blogId, query)

        if(articles == null){
            window.showToast('최근 작성한 글을 가져 올 수 없습니다', 'error')
            return
        }

        setArticles(articles)        
    }


    const onClickArticle = (id) =>{

        navigate('article/' + id)        
    }


    return (
        <div style={{display:'flex', flexDirection:'column'}}>
            <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'10px'}}>최근 글</label>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'left', padding:'10px', borderRadius:'3px', backgroundColor:'#EDEFF4', border:'1px solid #E4E6EA'}}>
                {articles && articles.map((data, index) => <div className={'clamped-text'} key={data.id} style={{color:'black', cursor:'pointer', marginTop:'10px', marginBottom:'10px', whiteSpace: 'nowrap', fontWeight:'600'}} onClick={()=> onClickArticle(data.id)}>{data.title}</div>)}                
            </div>
        </div>
    )
}