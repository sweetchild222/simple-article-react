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

  const countPerPage = 8


  useEffect(() =>{

    const query = 'offset=0&limit=10&order_type=post_at&order=1'

    ArticleAPI.getArticles(query).then((resArtices) => {

      if(resArtices.success == false)
        return 

      setArticles(resArtices.payload)
      setIsOverlayProgress(false)
    })


  }, [])
  
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


  const loadArticles = async(query) => {

    setIsOverlayProgress(true)

      ArticleAPI.getArticles(query).then((resArtices) => {

      if(resArtices.success == false){
        window.showToast('글을 가져오는데 실패 했습니다', 'error')        
        return 
      }

      setArticles(resArtices.payload)
      setIsOverlayProgress(false)
    })
  }

  const onClickNewest = async()=>{

    const query = 'offset=0&limit=10&order_type=post_at&order=1'

    await loadArticles(query)
  }

  const onClickFavorite = async()=>{

    const query = 'offset=0&limit=10&order_type=like_count&order=1'

    await loadArticles(query)

  }

  const onClickManyComment = async()=>{

    const query = 'offset=0&limit=10&order_type=comment_count&order=1'

    await loadArticles(query)
  }


  const onClickSubscribe = async()=> {

    if(!validAuth(auth)){
      window.showToast('로그인 해주세요', 'info')
      navigate('/', {state:{comback:true}})
      return
    }
    
    const res = await SubscribeAPI.getSubscribe('user_id=' + auth.user_id)

    if(res.success == false)
      return
    
    const blog_ids = res.payload.map(item => item.blog_id)

    const query = 'offset=0&limit=10&order_type=post_at&order=1&blog_id=' + blog_ids

    await loadArticles(query)
  }

  
  return (
    <Vertical>
      <Horizental>
        <PrettyButton onClick={onClickNewest}>{'최신글'}</PrettyButton>
        <PrettyButton onClick={onClickFavorite}>{'인기글'}</PrettyButton>
        <PrettyButton onClick={onClickManyComment}>{'댓글 많은 글'}</PrettyButton>
        <PrettyButton onClick={onClickSubscribe}>{'구독한 글'}</PrettyButton>
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
      </Vertical>
  )
}
