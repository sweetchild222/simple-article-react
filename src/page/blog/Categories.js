
import React, {useState, useContext, useEffect, useRef, useImperativeHandle} from "react";

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
import { MdCategory } from "react-icons/md";

export default function({ref, blogId, onClickCategory, isEdit}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [categories, setCategories] = useState(null)
    const [selectIndex, setSelectIndex] = useState(0)
    const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false)

    useEffect(()=> {
        
        loadCategory(blogId)
    
    }, [blogId])


    useImperativeHandle(ref, () => {

        return {
            categories() {

                return categories
            }
        }

    }, [categories])


    const loadCategory = async() => {

        const categoryies = await getCategories(blogId)
        
        if(categoryies == null || categoryies.length == 0) {

            window.showToast('카테고리를 가져 올 수 없습니다', 'error')
            return
        }


        if(isEditable()){

            const count = await loadWrtingCount(blogId)

            const category = categoryies[0]

            categoryies.push({blog_id:category.blog_id, article_count:count, name:'작성 중인 글', id:0, is_default:1})
        }

        setCategories(categoryies)

        if(onClickCategory != null){
            setSelectIndex(0)
            onClickCategory(categoryies[0])
        }
    }


    const loadWrtingCount = async(blogId) => {
        
        const query = 'posted=0'
        
        const res = await ArticleAPI.getBlogArticles(auth.jwt, blogId, query)
        
        if(res == null)
            return

        return res.length
    }


    const getCategories = async(blogId) => {
    
        const res = await ArticleAPI.getCategories(blogId)
        
        if(res == null)
            return null
    
        res.sort((a, b)=> {

            if(a.is_default != b.is_default)
                return b.is_default - a.is_default
            else
                return a.id - b.id
        })

        return res
    }


    const isEditable = ()=> {
        
        return (validAuth(auth) && isEdit)
    }


    const onClickCategoryInner = async(id) => {

        const index = categories.findIndex(categorie => categorie.id === id)

        if(index == -1)
            return

        if(onClickCategory != null){
            setSelectIndex(index)
            onClickCategory(categories[index])
        }
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
                blog_id:blogId
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

            const payload = { name:category.name }
            
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

        const curCategories = categories.filter(item => item.id != 0)
        
        const deletList = curCategories.filter(item => newCategories.findIndex(newItem => item.id == newItem.id) == -1)
        const addList = newCategories.filter(newItem => curCategories.findIndex(item => item.id == newItem.id) == -1)
        const modifyList = newCategories.filter(newItem => {
            
            const findItem = curCategories.find(item => item.id === newItem.id)
                
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
            await loadCategory(blogId)
        else
            window.showToast('카테고리가 변경되지 않았습니다', 'info')
    }


    const onClickModifyCategory = async()=> {

        if(!isEditable())
            return

        if(categories == null)
            return

        setIsOpenCategoryModal(true)
    }
    
    return (
        <div style={{display:'flex', flexDirection:'column'}}>
            <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'10px'}}>카테고리</label>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'start', padding:'5px 10px 10px 10px', borderRadius:'3px', backgroundColor:'#EDEFF4', border:'1px solid #E4E6EA'}}>
                {categories && categories.map((data, index) => <div key={data.id} className={'clamped-text'} style={{color:'', cursor:'pointer', marginTop:'10px', marginBottom:'10px', whiteSpace: 'nowrap', textDecoration:(index == selectIndex ? 'underline' : 'none')}} onClick={()=> onClickCategoryInner(data.id)}>{data.name + ' (' + data.article_count + ')'}</div>)}
                {isEditable() && <div title='카테고리 수정' style={{color:'black', cursor:'pointer', marginTop:'10px',  whiteSpace: 'nowrap'}} onClick={onClickModifyCategory}><MdCategory size={30}/></div>}
                {isEditable() && categories && isOpenCategoryModal && <CategoryModal isOpen={isOpenCategoryModal} onClose={()=>setIsOpenCategoryModal(false)} onClickApply={onClickApplyCategory} categories={categories.filter(item => item.id != 0)}></CategoryModal>}
            </div>
        </div>
    )    
}