
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import './Home.css'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'

export default function() {

  const { id } = useParams()


  const navigate = useNavigate()
      
  const location = useLocation()
  const state = location.state
  const editMode = state == null ? false : state.editMode

  const {auth, updateAuth, validAuth, reloadAuth, removeAuth} = useContext(AuthContext)
  const [categories, setCategories] = useState(null)
  const [movingbarPos, setMovingbarPos] = useState({curIndex:0, start:0, end:0})
  const [animationKey, setAnimationKey] = useState(0)

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

    loadCategory(id).then(categories => {

      if(categories == null){
        window.showToast('카테고리를 가져 올 수 없습니다', 'error')
        navigate('/pageNotFound')
        return null
      }

      setCategories(categories)
    })
  
  }, [auth, id])



  const loadCategory = async(id) => {

    const resBlog = await BlogAPI.getBlog(id)

    if(resBlog == null)
      return null  

    return await getCategory(resBlog.user_id)
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
    
    const width = 150
    const margin = 10
    
    const endPos = index * (width + margin)
      
    setMovingbarPos({curIndex: index, start:movingbarPos.end, end:endPos})
    setAnimationKey(prev => prev + 1)
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
      
    if(applyCount > 0){

      loadCategory(id).then(categories => {

        if(categories == null){
          window.showToast('카테고리를 가져 올 수 없습니다', 'error')
          navigate('/pageNotFound')
          return null
        }

        setCategories(categories)
        setMovingbarPos({curIndex:0, start:0, end:0})
      })      
    }
      
    else
      window.showToast('카테고리가 변경되지 않았습니다', 'info')
    
    
  }

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%'}}>
      <div style={{ display: 'flex', flexDirection: 'column'}}>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          {categories && categories.map((data, index) => <BeautyButton type='transparent'  key={data.id} style={{color:'black', width:'150px', marginRight:'10px'}} onClick={()=> onClickCategory(data.id)}>{data.name}</BeautyButton>)}
          {isEditable() &&  <BeautyButton type='transparent' tooltip='카테고리 수정' style={{color:'black', width:'50px', marginRight:'10px'}} onClick={onClickModifyCategory}><MdEdit size={30}/></BeautyButton>}
          {categories && isOpenCategoryModal && <CategoryModal isOpen={isOpenCategoryModal} onClose={()=>setIsOpenCategoryModal(false)} onClickApply={onClickApplyCategory} categories={categories}></CategoryModal>}
        </div>
        {categories && <div key={animationKey} className={'movingbar'} style={{width:'150px', height:'3px', borderRadius:'2px', backgroundColor:'gray', '--start--':movingbarPos.start + 'px', '--end--':movingbarPos.end + 'px', marginTop:'3px'}}></div>}
      </div>
    </div>
  );
}
