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

  useEffect(() => {

    console.log(currentType, offset)

    const query = getQueryByType(currentType, offset)

    if(query == null)
      return
      
    ArticleAPI.getArticles(query).then((resArtices) => {

      if(resArtices.success == false)
        return

      setArticles(resArtices.payload)
      setIsOverlayProgress(false)      
    })

  }, [currentType, offset])



  const getQueryByType = (currentType, offset) => {

    const limit = 10

    if(currentType == 0)
      return 'offset=' + offset + '&limit=' + limit + '&order_type=post_at&order=1'    
    else if(currentType == 1)
      return 'offset=' + offset + '&limit=' + limit + '&order_type=like_count&order=1'
    else if(currentType == 2)
      return 'offset=' + offset + '&limit=' + limit + '&order_type=comment_count&order=1'
    else if(currentType == 3){

      if(blogIds == null || blogIds.length == 0)
          return null
      return 'offset=' + offset + '&limit=' + limit + '&order_type=post_at&order=1&blog_id=' + blogIds
    }
  }


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

  const onClickNewest = async()=> {
        
    setCurrentType(0)
    setOffset(0)
  }

  const onClickFavorite = async()=>{
    
    setCurrentType(1)
    setOffset(0)
  }

  const onClickManyComment = async()=>{
    
    setCurrentType(2)
    setOffset(0)
  }


  const onClickSubscribe = async()=> {

    setCurrentType(3)
    setOffset(0)

  }

  const onClickPrev = async() =>{

    if(offset - 10 < 0)
      return

    setOffset(offset => offset - 10)
  }

  const onClickNext = async() => {

    setOffset(offset => offset + 10)
  }


  return (
    <Vertical>
      <Horizental>
        <PrettyButton onClick={onClickNewest}>{'최신순'}</PrettyButton>
        <PrettyButton onClick={onClickFavorite}>{'인기순'}</PrettyButton>
        <PrettyButton onClick={onClickManyComment}>{'댓글 많은 순'}</PrettyButton>
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
                  {<div style={{fontSize:'18px', marginTop:'32px', marginBottom:'32px'}}>{'글이 더 이상 없습니다.'}</div>}
                </Vertical>)
              )}
          </Vertical>
          {isOverlayProgress && <OverlayProgress type={'absolute'}/>}
        </div>
        <div style={{width:'32px'}}/>
      </Horizental>
      {articles && <Horizental style={{alignSelf:'center', alignItems:'center'}}>
        <PrettyButton disabled={offset == 0}onClick={onClickPrev}>{'이전'}</PrettyButton>
        <PrettyButton disabled={articles.length == 0} onClick={onClickNext}>{'다음'}</PrettyButton>
      </Horizental>}
      </Vertical>
  )
}
