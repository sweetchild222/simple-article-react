import {useState, useEffect, useContext, useRef } from "react";
import {useNavigate, useLocation, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'


import AuthContext from "@util/AuthContext.js";
import PrettyButton from "@gui/PrettyButton.js";
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
  const [isOverlayProgress, setIsOverlayProgress] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [offset, setOffset] = useState(0)
  const [blogIds, setBlogIds] = useState(null)
  const [currentType, setCurrentType] = useState(0)

  const countPerPage = 8

  useEffect(() =>{

    const query = 'offset=0&limit=10&order_type=post_at&order=1'

    ArticleAPI.getArticles(query).then((resArtices) => {

      if(resArtices.success == false)
        return 

      setArticles(resArtices.payload)
      setIsOverlayProgress(false)      
    })

  }, [currentType])


  useEffect(()=>{

    if(!validAuth(auth))
      return
    
    SubscribeAPI.getSubscribe('user_id=' + auth.user_id).then(res=>{

      if(res.success == false)
        return
      
      const blog_ids = res.payload.map(item => item.blog_id)

      setBlogIds(blog_ids)
    })

  }, [auth])



  
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




  const onClickPage = async(page) => {

    // setIsOverlayProgress(true)

    // const category_id = selectedCategory.id != 0 ? selectedCategory.id : null
    // const posted = selectedCategory.id != 0 ? null : 0
        
    // const articles = await getBlogArticles(page, category_id, posted)

    // if(articles.success == true){      
    //   setArticles(articles.payload)
    // }

    // setIsOverlayProgress(false)
  }


  const limit = 10

  const loadArticles = async(query) => {

    setIsOverlayProgress(true)

      ArticleAPI.getArticles(query).then((resArtices) => {

        setIsOverlayProgress(false)

        if(resArtices.success == false){
          window.showToast('글을 가져오는데 실패 했습니다', 'error')        
          return 
        }

        setArticles(resArtices.payload)      
    })
  }

  const onClickNewest = async(offset)=> {

    const query = 'offset=' + offset + '&limit=' + limit + '&order_type=post_at&order=1'

    await loadArticles(query)

    setCurrentType(0)
  }

  const onClickFavorite = async(offset)=>{

    const query = 'offset=' + offset + '&limit=' + limit + '&order_type=like_count&order=1'

    await loadArticles(query)

    setCurrentType(1)

  }

  const onClickManyComment = async(offset)=>{

    const query = 'offset=' + offset + '&limit=' + limit + '&order_type=comment_count&order=1'

    await loadArticles(query)

    setCurrentType(2)
  }


  const onClickSubscribe = async(offset)=> {

    if(blogIds == null || blogIds.length == 0)
      return

    const query = 'offset=' + offset + '&limit=' + limit + '&order_type=post_at&order=1&blog_id=' + blogIds

    await loadArticles(query)

    setCurrentType(3)
  }

  const onClickPrev = async() =>{

    if(offset - 10 < 0)
      return

    setOffset(offset => {

      if(currentType == 0)
        onClickNewest(offset - 10)
      else if(currentType == 1)
        onClickFavorite(offset - 10)
      else if(currentType == 2)
        onClickManyComment(offset - 10)
      else if(currentType == 3)
        onClickSubscribe(offset - 10)
      
      return offset - 10
    })

  }


  const onClickNext = async() => {

    setOffset(offset => {
          
      if(currentType == 0)
        onClickNewest(offset + 10)
      else if(currentType == 1)
        onClickFavorite(offset + 10)
      else if(currentType == 2)
        onClickManyComment(offset + 10)
      else if(currentType == 3)
        onClickSubscribe(offset + 10)
      
      return offset + 10
    })
  }


  return (
    <Vertical>
      <Horizental>
        <PrettyButton onClick={() => onClickNewest(0)}>{'최신글'}</PrettyButton>
        <PrettyButton onClick={() => onClickFavorite(0)}>{'인기글'}</PrettyButton>
        <PrettyButton onClick={() => onClickManyComment(0)}>{'댓글 많은 글'}</PrettyButton>
        <PrettyButton onClick={() => onClickSubscribe(0)}>{'구독한 글'}</PrettyButton>
      </Horizental>
      <Horizental>
        <div style={{width:'32px'}}/>
        <div style={{flex:'1', position:'relative'}}>
          <Vertical>
              {articles && (
                articles.length > 0 ? 
                (<Vertical style={{width:'100%'}}>
                  <div className={'dynamicColumnContainer'} style={{width:'100%', marginTop:'8px', marginBottom:'16px'}}>
                    {articles.map((data, index) => <ArticleItem key={data.id} article={data} />)}
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
        <div style={{width:'32px'}}/>
      </Horizental>
      <Horizental style={{alignSelf:'center', alignItems:'center'}}>
        <PrettyButton onClick={onClickPrev}>{'이전'}</PrettyButton>
        <PrettyButton onClick={onClickNext}>{'다음'}</PrettyButton>
      </Horizental>
      </Vertical>
  )
}
