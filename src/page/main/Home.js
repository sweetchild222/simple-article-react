import {useState, useEffect, useContext, useRef } from "react";
import {useNavigate, useLocation, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'

import AuthContext from "@util/AuthContext.js";
import ArticleItem from "./ArticleItem.js";

import OverlayProgress from "@gui/OverlayProgress.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import ToInteger from "@util/Integer.js";
import './Home.css'

export default function() {

  
  
  const navigate = useNavigate()
  
  const location = useLocation()
  
  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
  const [articles, setArticles] = useState(null)
  const [isOverlayProgress, setIsOverlayProgress] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const countPerPage = 8

  
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

    if(articles.success == true){      
      setArticles(articles.payload)
    }

    setIsOverlayProgress(false)
  }

  
  return (
      <Horizental style={{width:'100%'}}>
        <div style={{width:'128px'}}/>
        <div style={{flex:'1', position:'relative'}}>
          <Vertical>
              {articles && (
                articles.length > 0 ? 
                (<Vertical style={{width:'100%'}}>
                  <div className={'dynamicColumnContainer'} style={{width:'100%', marginTop:'8px', marginBottom:'16px'}}>
                    {articles.map((data, index) => <ArticleItem key={data.id} article={data} categoryName={getCategoryName(data.category_id)}/>)}
                  </div>
                  <Horizental style={{width:'100%'}}>
                    {/* {selectedCategory.article_count > countPerPage && <Pagination key={reloadKey} totalPageCount={Math.ceil(selectedCategory.article_count / countPerPage)} displayPageCount={3} onClickPage={onClickPage}/>} */}
                    <div style={{flex:'1'}}></div>
                  </Horizental>
                </Vertical>) : 
                (<Vertical style={{alignItems:'center', width:'100%', justifyContent:'center', height:'100%', marginTop:'128px'}}>
                  {<img src={'/image/empty.png'} style={{width:'128px', height: '128px'}}/>}
                  {<div style={{fontSize:'18px', marginTop:'32px', marginBottom:'32px'}}>{'글이 없습니다.'}</div>}                  
                </Vertical>)
              )}
          </Vertical>
          {isOverlayProgress && <OverlayProgress type={'absolute'}/>}
        </div>        
        <div style={{width:'128px'}}/>
      </Horizental>
  )
}
