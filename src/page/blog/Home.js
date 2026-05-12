
import React, {useState, useContext, useEffect, useRef } from "react";

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
import OverlayLoading from "../../common/OverlayLoading.js";
import ToInteger from "../../util/ToInteger.js";
import './Home.css'
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";

export default function() {

  const { b_id } = useParams()
  
  const blog_id = ToInteger(b_id)

  const navigate = useNavigate()
        
  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [articles, setArticles] = useState(null)    
  const [isOverlayLoading, setIsOverlayLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const countPerPage = 8

  const isEditable = ()=> {

    return (validAuth(auth) && auth.blog_id == blog_id)
  }


  const getBlogArticles = async(page, category_id, posted) => {
    
    let query = 'offset=' + (countPerPage * page)

    query +=  '&limit=' + countPerPage

    query += '&order=1'

    query += category_id != null ? ('&category_id=' + category_id) : ''

    query += posted != null ? ('&posted=' + posted) : ''
    
    const jwt = validAuth(auth.jwt) ? auth.jwt : null
    
    const res = await ArticleAPI.getBlogArticles(jwt, blog_id, query)

    return res
  }  


  const onClickCategory = async(category) => {

    setIsOverlayLoading(true)
    
    const articles = await getBlogArticles(0, category.id != 0 ? category.id : null, category.id != 0 ? null : 0)

    if(articles != null)
      setArticles(articles)

    setIsOverlayLoading(false)

    setSelectedCategory(category)
    
    setReloadKey(prev => prev + 1)
  }
  

  const onClickPage = async(page) => {
        
    setIsOverlayLoading(true)
        
    const articles = await getBlogArticles(page, selectedCategory.id != 0 ? selectedCategory.id : null, selectedCategory.id != 0 ? null : 0)

    if(articles != null)
      setArticles(articles)

    setIsOverlayLoading(false)
  }

  
  return blog_id ? (
      <div style={{display: 'flex', flexDirection: 'row', alignSelf:'center', width:'100%'}}>
        {isOverlayLoading && <OverlayLoading/>}
        <div style={{width:'100px'}}/>
          <div style={{display: 'flex', flexDirection: 'column', flex:'1'}}>
              {articles && (
                articles.length > 0 ? 
                (<div style={{display:'flex', flexDirection:'column'}}>
                  <div className={'dynamicColumnContainer'} style={{width:'100%', marginTop:'10px'}}>
                    {articles.map((data, index) => <ArticleItem key={data.id} article={data}/>)}
                  </div>
                  {selectedCategory && <Pagination key={reloadKey} totalPageCount={Math.ceil(selectedCategory.article_count / countPerPage)} displayPageCount={3} onClickPage={onClickPage}/>}
                </div>) : 
                (<div style={{display:'flex', alignItems:'center', flexDirection:'column', width:'100%', justifyContent:'center', height:'100%', marginTop:'20px'}}>
                  <img src={'/image/empty.png'} style={{width:'128px', height: '128px'}}/>
                </div>)
              )}
          </div>
        <div style={{backgroundColor:'gray', width:'2px', height:'100%', marginLeft:'20px', marginRight:'20px'}}/>
        <div style={{maxWidth:'230px', alignItems:'center', display: 'block'}}>
          <Categories blogId={blog_id} onClickCategory={onClickCategory} isEdit={isEditable()}></Categories>
          <div style={{height:'10px'}}></div>
          <Recents blogId={blog_id} isEdit={isEditable()}></Recents>
        </div>
        <div style={{width:'100px'}}/>
      </div>
  ) : null
}
