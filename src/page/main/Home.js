import {useState, useEffect, useContext, useRef } from "react";
import {useNavigate, useLocation, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'


import AuthContext from "@util/AuthContext.js";
import * as UserRepository from "@util/UserRepository.js";
import PrettyButton from "@gui/PrettyButton.js";
import ArticleItem from "./ArticleItem.js";

import OverlayProgress from "@gui/OverlayProgress.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import ToInteger from "@util/Integer.js";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";
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
  
  const countPerPage = 12

  useEffect(() => {
    
    const query = getQueryByType(currentType, offset)

    if(query == null)
      return

    setIsOverlayProgress(true)

      ArticleAPI.getArticles(query).then((resArtices) => {
        
        if(resArtices.success == false){
          setIsOverlayProgress(false)
          window.showToast('글을 가져오는데 실패 했습니다', 'error')
          return 
        }

        const userIDList = resArtices.payload.map(article => article.user_id);
        
        UserRepository.getByIDList([...new Set(userIDList)]).then((resUsers)=>{
                          
            if(resUsers == null) {
              setIsOverlayProgress(false)
                window.showToast('사용자 목록을 가져 올 수 없습니다', 'error')
                return
            }

            resArtices.payload.forEach((item, index) =>{

              const user = resUsers.find(user => (user.id == item.user_id))

                if(user != null)
                    item.user = user
            })

            setIsOverlayProgress(false)
      
            setArticles(resArtices.payload)
        })
    })

  }, [currentType, offset])


  const getQueryByType = (currentType, offset) => {

    
    if(currentType == 0)
      return 'offset=' + offset + '&limit=' + countPerPage + '&order_type=post_at&order=1'
    else if(currentType == 1)
      return 'offset=' + offset + '&limit=' + countPerPage + '&order_type=like_count&order=1'
    else if(currentType == 2)
      return 'offset=' + offset + '&limit=' + countPerPage + '&order_type=comment_count&order=1'
    else if(currentType == 3){

      if(blogIds == null || blogIds.length == 0)
          return null
        
      return 'offset=' + offset + '&limit=' + countPerPage + '&order_type=post_at&order=1&blog_id=' + blogIds
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

    if(offset - countPerPage < 0)
      return

    setOffset(offset => offset - countPerPage)
  }

  const onClickNext = async() => {

    setOffset(offset => offset + countPerPage)
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
        <PrettyButton disabled={offset == 0} onClick={onClickPrev}> {<GrPrevious size={16}/>}</PrettyButton>
        <div style={{width:'64px'}}></div>
        <PrettyButton disabled={articles.length == 0} onClick={onClickNext}> {<GrNext size={16}/>}</PrettyButton>
      </Horizental>}
      </Vertical>
  )
}
