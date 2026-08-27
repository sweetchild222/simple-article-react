import {useState, useContext, useRef } from "react";
import {useNavigate, useLocation, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import AuthContext from "@util/AuthContext.js";
import SmoothScroll from "@util/SmoothScroll.js";
import ToInteger from "@util/Integer.js";
import {isMobile} from "@util/DeviceType.js";

import Spinner from "@gui/Spinner.js";
import {VPad, HPad} from "@gui/Pad.js";
import {Vertical, Horizental} from "@gui/Flex.js";

import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import CreateArticle  from "./CreateArticle.js";
import ArticleItem from "./ArticleItem.js";
import Pagination from "./Pagination.js";


export default function() {

  const { b_id } = useParams()
  
  const blog_id = ToInteger(b_id)

  const navigate = useNavigate()
  
  const location = useLocation()

  const initCategoryId = location.state != null ? location.state.category_id : null

  const refCategories = useRef(null)  
  const {auth, validAuth} = useContext(AuthContext)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [articles, setArticles] = useState(null)
  const [isSpinner, setIsSpinner] = useState(true)
  const [isSuccess, setIsSuccess] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const countPerPage = isMobile() ? 10 : 6

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
      
    setIsSpinner(true)

    setSelectedCategory(category)
    
    const category_id = (category.static == true) ? null : category.id
    const posted = category.id == 'WRITING' ? 0 : null
    
    const articles = await getBlogArticles(0, category_id, posted)

    if(articles.success == true){
      setArticles(articles.payload)
      setIsSuccess(true)
    }
    else
      setIsSuccess(false)
      
    setIsSpinner(false)
    
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
    
    if(isMobile())
      SmoothScroll(0)

    setIsSpinner(true)

    const category_id = (selectedCategory.static == true) ? null : selectedCategory.id
    const posted = selectedCategory.id == 'WRITING' ? 0 : null

    const articles = await getBlogArticles(page, category_id, posted)

    if(articles.success == true){
      setArticles(articles.payload)
      setIsSuccess(true)
    }
    else
      setIsSuccess(false)

    setIsSpinner(false)
  }


  const findCategoryId = (category) =>{
    
    if(category.static == true){      

      if(refCategories.current == null)
        return null

      const categories = refCategories.current.categories()
            
      const newCategories = categories.filter(item => item.static == false)

      if(newCategories.length == 0)
        return null

      return newCategories[0].id
    }
    
    return category.id;
  }



  if(isMobile()){
      return blog_id ? (
        <Vertical style={{marginTop:'64px'}}>
          <Categories ref={refCategories} blogId={blog_id} initCategoryId={initCategoryId} onClickCategory={onClickCategory} isEdit={isEditable()}></Categories>
          <div style={{flex:'1', position:'relative'}}>
          <Vertical>
              {isSuccess && selectedCategory && articles && (
                articles.length > 0 ? 
                (<Vertical style={{width:'100%'}}>
                  <div style={{width:'100%', marginTop:'8px', marginBottom:'8px'}}>
                    {articles.map((data, index) => <ArticleItem key={data.id} article={data} categoryName={getCategoryName(data.category_id)} style={{margin:'8px'}}/>)}
                  </div>
                  <Horizental style={{width:'100%', justifyContent:'center'}}>
                    {selectedCategory.article_count > countPerPage && <Pagination key={reloadKey} totalPageCount={Math.ceil(selectedCategory.article_count / countPerPage)} displayPageCount={3} onClickPage={onClickPage}/>}                    
                  </Horizental>
                </Vertical>) : 
                (<Vertical style={{alignItems:'center', width:'100%', justifyContent:'center'}}>
                  {<img src={'/image/empty.png'} style={{width:'128px', height: '128px', height: '128px', marginTop:'64px', marginBottom:'16px'}}/>}
                  {<div style={{fontSize:'18px'}}>{'카테고리에 글이 없습니다'}</div>}
                </Vertical>)
              )}
              {!isSuccess && <Horizental style={{justifyContent:'center', alignItems:'center',  marginTop:'32px'}}>{'불러오기 실패'}</Horizental>}
          </Vertical>
          {isSpinner && <Spinner type={'absolute'}/>}
          </div>
        </Vertical>
    ) : null

  }
  else{
  
    return blog_id ? (
        <Horizental style={{width:'100%'}}>
          <HPad size={128}/>
          <div style={{flex:'1', position:'relative'}}>
            <Vertical>
                {isSuccess && selectedCategory && articles && (
                  articles.length > 0 ? 
                  (<Vertical style={{width:'100%'}}>
                    <div style={{width:'100%', marginTop:'8px', marginBottom:'8px'}}>
                      {articles.map((data, index) => <ArticleItem key={data.id} article={data} categoryName={getCategoryName(data.category_id)} style={{marginTop:'16px', marginBottom:'16px'}}/>)}
                    </div>
                    <Horizental style={{width:'100%', marginRight:'16px'}}>
                      <Horizental style={{flex:'1'}}>
                        {isEditable() && <CreateArticle blogId={blog_id} categoryId={findCategoryId(selectedCategory)}/>}
                      </Horizental>
                      {selectedCategory.article_count > countPerPage && <Pagination key={reloadKey} totalPageCount={Math.ceil(selectedCategory.article_count / countPerPage)} displayPageCount={3} onClickPage={onClickPage}/>}
                      <div style={{flex:'1'}}></div>
                    </Horizental>
                  </Vertical>) : 
                  (<Vertical style={{alignItems:'center', width:'100%', justifyContent:'center', height:'100%'}}>
                    {<img src={'/image/empty.png'} style={{width:'128px', height: '128px', marginTop:'64px', marginBottom:'16px'}}/>}
                    {<div style={{fontSize:'18px', marginBottom:'16px'}}>{'카테고리에 글이 없습니다'}</div>}
                    {isEditable() && <CreateArticle blogId={blog_id} categoryId={findCategoryId(selectedCategory)}/>}
                  </Vertical>)                              
                )}
                {!isSuccess && <Horizental style={{justifyContent:'center', alignItems:'center',  marginTop:'32px'}}>{'불러오기 실패'}</Horizental>}
            </Vertical>
            {isSpinner && <Spinner type={'absolute'}/>}
          </div>
          <div style={{backgroundColor:'lightgray', width:'2px', height:'100%', marginLeft:'32px', marginRight:'32px'}}/>
          <div style={{minWidth:'256px', width:'256px',maxWidth:'256px', display: 'block'}}>
            <Categories ref={refCategories} blogId={blog_id} initCategoryId={initCategoryId} onClickCategory={onClickCategory} isEdit={isEditable()}></Categories>
            <VPad size={48}/>
            <Recents blogId={blog_id} isEdit={isEditable()}></Recents>
          </div>
          <HPad size={128}/>
        </Horizental>
    ) : null
  }
}
