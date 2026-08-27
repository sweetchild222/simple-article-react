import {useState, useEffect, useContext} from "react";

import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'
import AuthContext from "@util/AuthContext.js";
import SmoothScroll from "@util/SmoothScroll.js";
import {isMobile, isNotMobile} from "@util/DeviceType.js";
import * as UserRepository from "@util/UserRepository.js";
import PrettyButton from "@gui/PrettyButton.js";
import Spinner from "@gui/Spinner.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import Modal from "@gui/Modal.js";
import {VPad, HPad} from "@gui/Pad.js";

import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";

import './Home.css'
import ArticleItem from "./ArticleItem.js";


export default function() {      
  
  const {auth, validAuth} = useContext(AuthContext)
  const [articles, setArticles] = useState(null)
  const [isSpinner, setIsSpinner] = useState(false)  
  const [offset, setOffset] = useState(0)
  const [blogIds, setBlogIds] = useState(null)
  const [currentType, setCurrentType] = useState(0) //0:최신순, 1:인기순, 2:댓글 많은 순, 3:구독한 글, 4:검색
  const [keyword, setKeyword] = useState(null)

  const [isSearchModal, setIsSearchModal] = useState(null)
  
  const countPerPage = 6

  useEffect(() => {
        
    const query = getQueryByType(currentType, offset, keyword)

    if(query == null)
      return

    setIsSpinner(true)

      loadArticles(query).then((articles) => {

        setIsSpinner(false)
        
        if(articles == null){
          window.showToast('글을 가져오는데 실패하였습니다', 'system-error')
          return
        }
        
        setArticles(articles)
    })

  }, [currentType, offset, keyword])
  

  useEffect(()=>{

    if(!validAuth(auth)){
      setBlogIds(null)
      return
    }
    
    SubscribeAPI.getSubscribe('user_id=' + auth.user_id).then(res=>{

      if(res.success == false)
        return
      
      const blog_ids = res.payload.map(item => item.blog_id)

      setBlogIds(blog_ids)
    })

  }, [auth])


  const loadArticles = async(query) => {

    const resArticles = await ArticleAPI.getArticles(query)
        
    if(resArticles.success == false)
      return null

    const articles = resArticles.payload
      
    const userIDList = articles.map(article => article.user_id)

    const resUsers = await UserRepository.getByIDList([...new Set(userIDList)])
                          
    if(resUsers == null)
      return null

    articles.forEach((item, index) => {
      item.user = resUsers.find(user => (user.id == item.user_id))
    })

    return articles
  }


  const getQueryByType = (currentType, offset, keyword) => {

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
    else if(currentType == 4)
      return 'offset=' + offset + '&limit=' + countPerPage + '&order_type=post_at&order=1&keyword=' + keyword
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

    if(isMobile())
      SmoothScroll(0)
  }


  const onClickNext = async() => {

    setOffset(offset => offset + countPerPage)

    if(isMobile())
      SmoothScroll(0)
  }


  const onKeyDown = (e) => {

      if(e.key === 'Enter'){

        if(search.value.length > 0){
          const keyword = search.value
          search.value = ''
          setKeyword(keyword)
          setCurrentType(4)
          
        }
      }
  }

  
  const onClickSearch = (e) => {

    if(search.value.length > 0){
      const keyword = search.value
      search.value = ''
      setKeyword(keyword)
      setCurrentType(4)
    }
  }


  const onInputSearchText = async(keyword) => {

    if(keyword.length > 0){
        setKeyword(keyword)
        setCurrentType(4)
    }
  }

  
  
  return (
    <Vertical style={{width:'100%', paddingLeft:'8px', paddingRight:'8px', marginTop:(isMobile() ? '64px' : '0px')}}>
      <VPad size={8}/>
        <Horizental>
          <PrettyButton onClick={onClickNewest} style={{width:'fit-content'}}>{'최신순'}</PrettyButton>
          <HPad size={8}/>
          <PrettyButton onClick={onClickFavorite} style={{width:'fit-content'}}>{'인기순'}</PrettyButton>
          <HPad size={8}/>
          <PrettyButton onClick={onClickManyComment} style={{width:'fit-content'}}>{'댓글순'}</PrettyButton>
          {blogIds && <HPad size={8}/>}
          {blogIds && <PrettyButton onClick={onClickSubscribe} style={{width:'fit-content'}}>{'구독한 블로그 글'}</PrettyButton>}
          <HPad size={8}/>
          <div style={{flex:'1'}}/>
          {isMobile() && <PrettyButton type='success' onClick={()=>setIsSearchModal(true)} style={{width:'fit-content'}}>{'검색'}</PrettyButton>}
          {isMobile() && <Modal title= {'검색할 글을 입력하세요'} type={'input'} isCloseOutsideClick={false} isOpen={isSearchModal} maxLength={256} onInput={onInputSearchText} onClose={()=>setIsSearchModal(false)}></Modal>}
          {isNotMobile() && <input id="search" placeholder="검색" maxLength="256" style={{width:'100%', minWidth:'64px', maxWidth:'256px'}} onKeyDown={onKeyDown}></input>}
          {isNotMobile() && <HPad size={8}/>}
          {isNotMobile() && <PrettyButton  type='success' onClick={onClickSearch} style={{width:'fit-content'}}>검색</PrettyButton>}
        </Horizental>
      <VPad size={8}/>
      <div style={{flex:'1', position:'relative'}}>
        {articles && (
          articles.length > 0 ? 
          (<Vertical style={{width:'100%'}}>
            <div className={'dynamicColumnContainer'} style={{width:'100%', marginTop:'0px', marginBottom:'16px'}}>
              {articles.map((data, index) => <ArticleItem key={data.id} article={data} style={{marginBottom:'16px'}}/>)}
            </div>
          </Vertical>) : 
          (<Vertical style={{alignItems:'center', width:'100%', justifyContent:'center', height:'100%'}}>
            {<img src={'/image/empty.png'} style={{width:'128px', height: '128px'}}/>}
            {<div style={{fontSize:'18px', marginTop:'32px', marginBottom:'32px'}}>{'글이 없습니다.'}</div>}
          </Vertical>)
        )}
        {isSpinner && <Spinner type={'absolute'}/>}
      </div>
      {articles && <Horizental style={{alignSelf:'center', alignItems:'center'}}>
        <PrettyButton disabled={offset == 0} onClick={onClickPrev} style={{width:'64px'}}> {<GrPrevious size={16}/>}</PrettyButton>
        <HPad size={64}/>
        <PrettyButton disabled={articles.length == 0} onClick={onClickNext} style={{width:'64px'}}> {<GrNext size={16}/>}</PrettyButton>
      </Horizental>}
      <VPad size={32}/>
    </Vertical>
  )
}
