
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
import './Home.css'
import Categories  from "./Categories.js";

export default function() {

  const { id } = useParams()

  const blog_id = parseInt(id)

  const navigate = useNavigate()

  const refCategory = useRef(null)
      
  const location = useLocation()
  const state = location.state
  const editMode = state == null ? false : state.editMode

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)  
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [articles, setArticles] = useState(null)
  const [blog, setBlog] = useState(null)

  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false)
  

  useEffect(()=> {

    if(!Number.isInteger(blog_id)){
      navigate('/pageNotFound')
      return
    }
    
    if(editMode) {

      if(!validAuth(auth) && auth.blog_id == blog_id){
        navigate('/')
        return
      }
    }


  }, [auth, blog_id])



  const isEditable = ()=> {

    return (editMode && validAuth(auth) && auth.blog_id == blog_id)    
  }


  const onClickCategory = async(category) =>{

    const category_id = category.id

    const query = 'offset=0&limit=100&order=1&category_id=' + category_id

    const jwt = validAuth(auth.jwt) ? auth.jwt : null
    
    const res = await ArticleAPI.getBlogArticles(jwt, blog_id, query)
    
    if(res == null)
      return

    setArticles(res)

    setSelectedCategory(category.name)
  }
  
  
  const onClickWriting = async() =>{

    const query = 'offset=0&limit=10&order=1&posted=0'

    const jwt = validAuth(auth.jwt) ? auth.jwt : null

    const res = await ArticleAPI.getBlogArticles(jwt, blog_id, query)
    
    if(res == null)
      return

    setArticles(res)

    setSelectedCategory('작성 중인 글')
  }

  const onLoadCategoryies = (categoryies) =>{
    
    if(categoryies != null)
      onClickCategory(categoryies[0])
    else
      navigate('/pageNotFound')
  }


  
  return (
      <div style={{display: 'flex', flexDirection: 'row', alignSelf:'center', width:'100%', marginTop:'20px'}}>
        <div style={{width:'100px'}}/>

        <div style={{display: 'flex', flexDirection: 'column', flex:'1'}}>
          <label style={{color:'gray'}}>{selectedCategory}</label>
          <div style={{backgroundColor:'lightgray', width:'200px', height:'2px'}}></div>
          <div className={'dynamicColumnContainer'} style={{width:'100%', marginTop:'10px'}}>
            {articles && articles.map((data, index) =>
              <ArticleItem key={data.id} article={data}/>)
            }
          </div>
        </div>
        
        <div style={{backgroundColor:'gray', width:'2px', height:'100%', marginLeft:'10px', marginRight:'10px'}}/>
        <div style={{width:'200px', maxWidth:'200px', minWidth:'200px', alignItems:'center', display: 'block'}}>          
          <Categories ref={refCategory} blogId={blog_id} onLoadCategoryies={onLoadCategoryies} onClickCategory={onClickCategory} onClickWriting={onClickWriting} isEditable={isEditable()}></Categories>          
        </div>
        <div style={{width:'100px'}}/>
      </div>
    
  )
}
