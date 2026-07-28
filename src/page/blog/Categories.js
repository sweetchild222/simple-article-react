
import {useState, useContext, useEffect, useImperativeHandle} from "react";

import * as BlobAPI from '@rest/BlobAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'


import AuthContext from "@util/AuthContext.js";
import CategoryModal from './CategoryModal.js'
import {Vertical, Horizental} from "@gui/Flex.js";
import { MdCategory } from "react-icons/md";


export default function({ref, blogId, onClickCategory, initCategoryId, isEdit}) {
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [categories, setCategories] = useState(null)
    const [selectIndex, setSelectIndex] = useState(-1)
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

        const categories = await getCategories(blogId)
                
        if(categories == null) {
            window.showToast('카테고리 가져오기가 실패하였습니다', 'system-error')
            return
        }

        if(categories.length == 0) {
            window.showToast('카테고리가 없습니다', 'user-error')
            return
        }
        

        if(isEditable()){

            const count = await loadWrtingCount(blogId)

            const category = categories[0]

            categories.push({blog_id:blogId, article_count:count, name:'작성 중인 글', id:0})
        }

        setCategories(categories)

        if(onClickCategory != null){
            
            const findIndex = categories.findIndex(categorie => categorie.id === initCategoryId)
            
            if(findIndex == -1 && categories.length == 0)
                return

            const selectIndex = findIndex == -1 ? 0 : findIndex
                            
            setSelectIndex(selectIndex)
            onClickCategory(categories[selectIndex])
        }
    }


    const loadWrtingCount = async(blogId) => {
        
        const query = 'posted=0'
        
        const res = await ArticleAPI.getBlogArticles(auth.jwt, blogId, query)
        
        if(res.success == false)
            return 0

        return res.payload.length
    }


    const getCategories = async(blogId) => {
    
        const res = await CategoryAPI.getCategories(blogId)
        
        if(res.success == false)
            return null
    
        res.payload.sort((a, b)=> {

            return a.id - b.id
        })

        return res.payload
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

            const res = await CategoryAPI.deleteCategory(auth.jwt, category.id)            

            if(res.success == true){
                window.showToast(category.name + ' 이 삭제 되었습니다', 'info')
                applyCount++
            }
            else
                window.showToast(category.name + ' 삭제가 실패하였습니다', 'system-error')
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

            const res = await CategoryAPI.postCategory(auth.jwt, payload)

            if(res.success == true){
                window.showToast(category.name + ' 이 추가 되었습니다', 'info')
                applyCount++
            }
            else
                window.showToast(category.name + ' 추가가 실패하였습니다', 'system-error')
        }

        return applyCount
    }


    const modifyCategories = async(categories) => {

        let applyCount = 0

        for(const category of categories) {

            const payload = { name:category.name }
            
            const res = await CategoryAPI.patchCategory(auth.jwt, category.id, payload)

            if(res.success == true){
                window.showToast(category.name + ' 로 이름이 변경 되었습니다', 'info')
                applyCount++
            }
            else
                window.showToast(category.name + ' 로 이름 변경이 실패하였습니다', 'system-error')
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
            window.showToast('카테고리가 변경되지 않았습니다', 'user-error')
    }


    const onClickModifyCategory = async()=> {

        if(!isEditable())
            return

        if(categories == null)
            return

        setIsOpenCategoryModal(true)
    }
    
    return categories ? (
        <Vertical>
            <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'8px'}}>카테고리</label>
            <Vertical style={{alignItems:'start', padding:'4px 8px 4px 8px', borderRadius:'3px', backgroundColor:'`#EDEFF4', border:'1px solid #E4E6EA'}}>
                {categories.map((data, index) => <div key={data.id} className={'clamped-text'} style={{'--line-count':1, cursor:'pointer', marginTop:'4px', marginBottom:'4px', whiteSpace: 'nowrap', textDecoration:(index == selectIndex ? 'underline' : 'none')}} onClick={()=> onClickCategoryInner(data.id)}>{data.name + ' (' + data.article_count + ')'}</div>)}
                {isEditable() && <div title='카테고리 수정' style={{color:'black', cursor:'pointer', marginTop:'8px',  whiteSpace: 'nowrap'}} onClick={onClickModifyCategory}><MdCategory size={26}/></div>}
                {isEditable() && isOpenCategoryModal && <CategoryModal isOpen={isOpenCategoryModal} onClose={()=>setIsOpenCategoryModal(false)} onClickApply={onClickApplyCategory} categories={categories.filter(item => item.id != 0)}></CategoryModal>}
            </Vertical>
        </Vertical>
    ) : null
}