
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

export default function() {

  const { id } = useParams()


  const navigate = useNavigate()
      
  const location = useLocation()
  const state = location.state
  const editMode = state == null ? false : state.editMode

  const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
  const [categories, setCategories] = useState(null)  
  const [articles, setArticles] = useState(null)
  const [blog, setBlog] = useState(null)

  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false)
  

  useEffect(()=> {

    if(!Number.isInteger(parseInt(id))){
      navigate('/pageNotFound')
      return
    }
    
    if(editMode) {

      if(!validAuth(auth) && auth.blog_id == parseInt(id)){
        navigate('/')
        return
      }
    }

    BlogAPI.getBlog(id).then((res)=>{

      if(res == null){
        window.showToast('블로그 정보를 가져 올 수 없습니다', 'error')
        navigate('/pageNotFound')
        return
      }

      setBlog(res)

      loadCategory(res.user_id)

    })

  }, [auth, id])
  

  useEffect(() =>{

    if(categories != null && categories.length > 0)
      onClickCategory(categories[0].id)

  }, [categories])


  const loadCategory = async(user_id) => {

    const category = await getCategory(user_id)      

    if(category == null){
      window.showToast('카테고리를 가져 올 수 없습니다', 'error')
      navigate('/pageNotFound')
      return
    }
    
    setCategories(category)    
  }


  const getCategory = async(user_id) => {

      const res = await ArticleAPI.getCategories(user_id)
      
      if(res == null)
          return null

      if(res.length == 0)
          return null
  
      res.sort((a, b)=> {

          if(a.is_default != b.is_default)
              return b.is_default - a.is_default
          else
              return a.id - b.id
      })      

      return res
  }



  const onClickCategory = async(id) => {    

    const index = categories.findIndex(categorie => categorie.id === id)

    if(index == -1)
      return
    
    const query = 'offset=0&limit=3&order=1&posted=1&category_id=' + id + (auth.user_id != blog.user_id ? '&open=1' : '')
            
    const res = await ArticleAPI.getUserArticles(auth.jwt, blog.user_id, query)
    
    if(res == null)
      return

    setArticles(res)
  }

  const onClickWrittingCategory = async() => {
    
    if(categories == null){
      return
    }

    const query = 'offset=0&limit=3&order=1&posted=0'
            
    const res = await ArticleAPI.getUserArticles(auth.jwt, blog.user_id, query)
    
    if(res == null)
      return

    setArticles(res)    
  }


  const onClickModifyCategory = async()=> {

    if(!isEditable())
      return

    if(categories == null)
      return

    setIsOpenCategoryModal(true)
  }


  const isEditable = ()=> {

    return (editMode && validAuth(auth) && auth.blog_id == parseInt(id))

  }


  const deleteCategories = async(categories) => {

    let applyCount = 0

    for(const category of categories) {

      const res = await ArticleAPI.deleteCategory(auth.jwt, category.id)

      if(res != null){
        window.showToast(category.name + ' 이 삭제 되었습니다', 'info')
        applyCount++
      }
      else
        window.showToast(category.name + ' 삭제에 실패하였습니다.', 'error')
    }

    return applyCount
  }


  const addCategories = async(categories) => {

    let applyCount = 0

    for(const category of categories) {

      const payload = {
        name:category.name,
        user_id:auth.user_id
      }

      const res = await ArticleAPI.postCategory(auth.jwt, payload)

      if(res != null){
        window.showToast(category.name + ' 이 추가 되었습니다', 'info')
        applyCount++
      }
      else
        window.showToast(category.name + ' 추가에 실패하였습니다.', 'error')
    }

    return applyCount
  }


  const modifyCategories = async(categories) => {

    let applyCount = 0

    for(const category of categories) {

      const payload = {
        name:category.name
      }
      
      const res = await ArticleAPI.patchCategory(auth.jwt, category.id, payload)

      if(res != null){
        window.showToast(category.name + ' 로 이름이 변경 되었습니다', 'info')
        applyCount++
      }
      else
        window.showToast(category.name + ' 로 이름 변경에 실패하였습니다.', 'error')
    }
    return applyCount
  }


  const onClickApplyCategory = async(newCategories) => {

    if(!isEditable())
      return
  
    const deletList = categories.filter(item => newCategories.findIndex(newItem => item.id == newItem.id) == -1)
    const addList = newCategories.filter(newItem => categories.findIndex(item => item.id == newItem.id) == -1)
    const modifyList = newCategories.filter(newItem => {
      
      const findItem = categories.find(item => item.id === newItem.id)
          
      if(findItem != null && (findItem.name != newItem.name))
        return true
      else
        return false
    })

    
    let applyCount = await deleteCategories(deletList)
    applyCount += await addCategories(addList)
    applyCount += await modifyCategories(modifyList)

    setIsOpenCategoryModal(false)
      
    if(applyCount > 0)
      await loadCategory(blog.user_id)
    else
      window.showToast('카테고리가 변경되지 않았습니다', 'info')
  }
  
  return (    
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row', alignSelf:'center', width:'100%'}}>
          <div style={{width:'200px'}}/>
          <div style={{display: 'flex', flexDirection: 'column', flex:'1'}}>
            {articles && articles.map((data, index) =>
              <ArticleItem key={data.id} article={data}/>)
            }
          </div>
          <div style={{backgroundColor:'gray', width:'2px', height:'100%', marginLeft:'10px', marginRight:'10px'}}></div>
          <div style={{backgroundColor:'red', width:'200px', alignItems:'center'}}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'left'}}>
              {categories && categories.map((data, index) => <label key={data.id} style={{color:'black', cursor:'pointer', marginTop:'10px', marginBottom:'10px'}} onClick={()=> onClickCategory(data.id)}>{data.name}</label>)}
              {isEditable() && <label key={Number.MAX_SAFE_INTEGER} style={{color:'black', cursor:'pointer', marginTop:'10px', marginBottom:'10px'}} onClick={()=> onClickWrittingCategory()}>작성 중</label>}
              {isEditable() &&  <label title='카테고리 수정' style={{color:'black', cursor:'pointer', marginTop:'10px'}} onClick={onClickModifyCategory}><MdEdit size={30}/></label>}
              {categories && isOpenCategoryModal && <CategoryModal isOpen={isOpenCategoryModal} onClose={()=>setIsOpenCategoryModal(false)} onClickApply={onClickApplyCategory} categories={categories}></CategoryModal>}
            </div>            
          </div>          
          <div style={{width:'200px'}}/>
        </div>
        
        

        
        
      </div>






    
  );
}
