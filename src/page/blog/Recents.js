
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


    const isEditable = ()=> {

        return (validAuth(auth) && isEdit)
    }


    const getDefaultCategory = async()=> {
        
        const res = await ArticleAPI.getCategories(blogId, 'is_default=1')        
    
        if(res == null)
            return -1
    
        if(res.length == 0)
            return -1
    
        return res[0].id
    }

    
    const onClickNewArticle = async() =>{

        if(!isEditable())
            return

        const query = 'posted=0'

        const res = await ArticleAPI.getBlogArticles(auth.jwt, blogId, query)

        if(res == null){
            window.showToast('작성 중인 글을 가져 올 수 없습니다', 'error')
            return
        }

        const maxWritingCount = 10

        if(res.length > maxWritingCount){

            window.showToast('작성 중인 글이 너무 많습니다 (' + maxWritingCount + ' 이하)', 'error')
            return
        }

        const category_id = await getDefaultCategory()

        if(category_id == -1){
            window.showToast('카테고리를 가져 올 수 없습니다', 'error')
            return
        }

        const payload = {
            title:'',
            content:'',
            head:'',
            posted:0,
            thumbnail:'',
            category_id:category_id
        }
                
        const resArticle = await ArticleAPI.postArticle(auth.jwt, payload)
                        
        if(resArticle == null) {
            window.showToast('새 글 생성에 실패 했습니다', 'error')
            return
        }

        const state = {id:resArticle.id, ...payload}
            
        navigate('/write', {state:state})
    }


    const onClickArticle = (id) =>{

        navigate('article/' + id)        
    }


    return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'left'}}>                
                {articles && articles.map((data, index) => <label className={'clamped-text'} key={data.id} style={{'--line-count':2, color:'black', cursor:'pointer', marginTop:'10px', marginBottom:'10px', whiteSpace: 'nowrap'}} onClick={()=> onClickArticle(data.id)}>{data.title}</label>)}
                {isEditable() && <label title='새글 작성' style={{color:'black', cursor:'pointer', marginTop:'10px',  whiteSpace: 'nowrap'}} onClick={onClickNewArticle}><FaPen size={30}/></label>}
            </div>
    )    
}