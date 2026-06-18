import {useState, useContext, useRef } from "react";
import {useNavigate, useLocation, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'

import AuthContext from "@util/AuthContext.js";
import ArticleItem from "./ArticleItem.js";

import OverlayProgress from "@gui/OverlayProgress.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import ToInteger from "@util/Integer.js";
import './Home.css'
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import CreateArticle  from "./CreateArticle.js";
import Pagination from "./Pagination.js";

export default function() {

  const { b_id } = useParams()
  
  const blog_id = ToInteger(b_id)

  const navigate = useNavigate()
  
  const location = useLocation()

  const initCategoryId = location.state != null ? location.state.category_id : null

  const refCategories = useRef(null)  
  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
  const [selectedCategory, setSelectedCategory] = useState(null)  
  const [articles, setArticles] = useState(null)
  const [isOverlayProgress, setIsOverlayProgress] = useState(false)
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

    setIsOverlayProgress(true)

    setSelectedCategory(category)

    const category_id = category.id != 0 ? category.id : null
    const posted = category.id != 0 ? null : 0
    
    const articles = await getBlogArticles(0, category_id, posted)

    if(articles.success == true)
      setArticles(articles.payload)

    setIsOverlayProgress(false)
    
    setReloadKey(prev => prev + 1)

    navigate(location.pathname, {replace: true, state: {category_id:category.id}})
  }


  const getCategoryName = (id) =>{

    if(refCategories.current == null)
      return ''

    const categories = refCategories.current.categories()

    const found = categories.find((item) => item.id == id)

    if(found == null)
      return ''

    return found.name
  }
  

  const onClickPage = async(page) => {

    setIsOverlayProgress(true)    

    const category_id = selectedCategory.id != 0 ? selectedCategory.id : null
    const posted = selectedCategory.id != 0 ? null : 0
        
    const articles = await getBlogArticles(page, category_id, posted)

    if(articles.success == true)
      setArticles(articles.payload)

    setIsOverlayProgress(false)
  }

  
  return blog_id ? (
      <Horizental style={{alignSelf:'center', width:'100%'}}>
        {isOverlayProgress && <OverlayProgress/>}
        <div style={{width:'100px'}}/>
          <Vertical style={{flex:'1'}}>
              {selectedCategory && articles && (
                articles.length > 0 ? 
                (<Vertical style={{width:'100%'}}>
                  <div className={'dynamicColumnContainer'} style={{width:'100%', marginTop:'10px', marginBottom:'20px'}}>
                    {articles.map((data, index) => <ArticleItem key={data.id} article={data} categoryName={getCategoryName(data.category_id)}/>)}
                  </div>
                  <Horizental style={{width:'100%'}}>
                    <Horizental style={{flex:'1'}}>
                      {isEditable() && <CreateArticle blogId={blog_id} categoryId={selectedCategory.id}/>}
                    </Horizental>
                    {selectedCategory.article_count > countPerPage && <Pagination key={reloadKey} totalPageCount={Math.ceil(selectedCategory.article_count / countPerPage)} displayPageCount={3} onClickPage={onClickPage}/>}
                    <div style={{flex:'1'}}></div>
                  </Horizental>
                </Vertical>) :
                (<Vertical style={{alignItems:'center', width:'100%', justifyContent:'center', height:'100%', marginTop:'20px'}}>
                  <img src={'/image/empty.png'} style={{width:'128px', height: '128px'}}/>
                  <div style={{fontSize:'18px', marginTop:'20px'}}>{'카테고리에 글이 없습니다.'}</div>
                  {isEditable() && <div style={{fontSize:'18px', marginTop:'20px'}}>{'글을 작성해 보세요'}</div>}
                  {isEditable() && <CreateArticle blogId={blog_id} categoryId={selectedCategory.id}/>}
                </Vertical>)
              )}
          </Vertical>
        <div style={{backgroundColor:'gray', width:'2px', height:'100%', marginLeft:'20px', marginRight:'20px'}}/>
        <div style={{maxWidth:'230px', alignItems:'center', display: 'block'}}>
          <Categories ref={refCategories} blogId={blog_id} initCategoryId={initCategoryId} onClickCategory={onClickCategory} isEdit={isEditable()}></Categories>
          <div style={{height:'30px'}}></div>
          <Recents blogId={blog_id} isEdit={isEditable()}></Recents>
        </div>
        <div style={{width:'100px'}}/>
      </Horizental>
  ) : null
}
