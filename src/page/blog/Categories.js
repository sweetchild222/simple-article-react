
import {useState, useContext, useEffect, useImperativeHandle} from "react";

import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'
import AuthContext from "@util/AuthContext.js";
import {isMobile, isNotMobile} from "@util/DeviceType.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import {HPad} from "@gui/Pad.js";
import PrettyButton from "@gui/PrettyButton.js";
import { MdCategory } from "react-icons/md";
import { useTranslation } from 'react-i18next';

import ConfigurationCategoryModal from './ConfigurationCategoryModal.js'
import SelectCategoryModal from './SelectCategoryModal.js'



export default function({ref, blogId, onClickCategory, initCategoryId, isEdit}) {
    
    const {auth, validAuth} = useContext(AuthContext)
    const [categories, setCategories] = useState(null)
    const [selectIndex, setSelectIndex] = useState(-1)
    const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false)
    const [isOpenSelectCategoryModal, setIsOpenSelectCategoryModal] = useState(false)
    const { t } = useTranslation()
    

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
            window.showToast(t('toast.categories.failedGettingCategory'), 'system-error')
            return
        }

        if(categories.length == 0) {
            setSelectIndex(-1)
            setCategories([])
            onClickCategory(null)
            window.showToast(t('toast.categories.noCategory'), 'user-error')
            return
        }

        const total = categories.reduce((acc, item) => acc + item.article_count, 0)

        categories.unshift({blog_id:blogId, article_count:total, name:'전체', id:'ALL', static:true})

        if(isEditable() && isNotMobile()){

            const count = await loadWrtingCount(blogId)

            categories.push({blog_id:blogId, article_count:count, name:'작성 중인 글', id:'WRITING', static:true})
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

        res.payload.forEach(item => item.static = false)

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
                window.showToast(t('toast.categories.successDeletingCategory', {name:category.name}), 'info')
                applyCount++
            }
            else
                window.showToast(t('toast.categories.failedDeletingCategory', {name:category.name}), 'system-error')
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
                window.showToast(t('toast.categories.successAddingCategory', {name:category.name}), 'info')
                applyCount++
            }
            else
                window.showToast(t('toast.categories.failedAddingCategory', {name:category.name}), 'system-error')
        }

        return applyCount
    }


    const modifyCategories = async(categories) => {

        let applyCount = 0

        for(const category of categories) {

            const payload = { name:category.name }
            
            const res = await CategoryAPI.patchCategory(auth.jwt, category.id, payload)

            if(res.success == true){
                window.showToast(t('toast.categories.successChangingName', {name:category.name}), 'info')
                applyCount++
            }
            else
                window.showToast(t('toast.categories.failedChangingName', {name:category.name}), 'system-error')
        }

        return applyCount
    }


    const onClickApplyCategory = async(newCategories) => {

        if(!isEditable())
            return

        const curCategories = categories.filter(item => item.static == false)
        
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
            window.showToast(t('toast.categories.noChanged'), 'user-error')
    }


    const onClickModifyCategory = async()=> {

        if(!isEditable())
            return

        if(categories == null)
            return

        setIsOpenCategoryModal(true)
    }

    const onSelectCategory = async (category) =>{

        const index = categories.findIndex(item => item.id == category.id)

        if(index == -1)
            return

        setSelectIndex(index)
        
        if(onClickCategory != null)
            onClickCategory(category)
    }


    if(isMobile()) {
        return categories ?  
            (<Horizental>
                <HPad size={8}/>
                {categories.length > 0 && selectIndex != -1 && <PrettyButton style={{fontSize:'16px', backgroundColor:'#faebd7', color:'black'}} onClick={()=>setIsOpenSelectCategoryModal(true)}>{categories[selectIndex].name + ' (' + categories[selectIndex].article_count + ')'}</PrettyButton>}
                {categories.length > 0 && selectIndex == -1 && <PrettyButton style={{fontSize:'16px', backgroundColor:'#faebd7', color:'black'}}>{t('page.blog.loading')}</PrettyButton>}
                {categories.length > 0 && <SelectCategoryModal isOpen={isOpenSelectCategoryModal} onClose={()=>setIsOpenSelectCategoryModal(false)} categories={categories.filter(item => (item.id != 'WRITING'))} onSelect={onSelectCategory}></SelectCategoryModal>}
                {categories.length == 0 && <div className={'clamped-text'} style={{'--line-count':1, marginTop:'8px', marginBottom:'8px'}}>{t('page.blog.noCategory')}</div>}
            </Horizental>)  : null
    }
    else{
        return categories ? (
            <Vertical>
                <label style={{fontWeight:'bold', fontStyle:'italic', marginBottom:'8px'}}>{t('page.blog.category')}</label>
                <Vertical style={{alignItems:'start', padding:'4px 8px 4px 8px', borderRadius:'3px', backgroundColor:'`#EDEFF4', border:'1px solid #E4E6EA'}}>
                    {categories.length > 0 && categories.map((data, index) => <div key={data.id} className={'clamped-text'} style={{'--line-count':1, cursor:'pointer', marginTop:'8px', marginBottom:'8px', whiteSpace: 'nowrap', textDecoration:(index == selectIndex ? 'underline' : 'none')}} onClick={()=> onClickCategoryInner(data.id)}>{data.name + ' (' + data.article_count + ')'}</div>)}
                    {categories.length == 0 && <div className={'clamped-text'} style={{'--line-count':1, marginTop:'8px', marginBottom:'8px'}}>{t('page.blog.noCategory')}</div>}
                    {isEditable() && <div title={t('page.blog.modifyCategory')} style={{color:'black', cursor:'pointer', marginTop:'16px',  whiteSpace: 'nowrap'}} onClick={onClickModifyCategory}><MdCategory size={26}/></div>}
                    {isEditable() && isOpenCategoryModal && <ConfigurationCategoryModal isOpen={isOpenCategoryModal} onClose={()=>setIsOpenCategoryModal(false)} onClickApply={onClickApplyCategory} categories={categories.filter(item => (item.static == false))}></ConfigurationCategoryModal>}
                </Vertical>
            </Vertical>
        ) : null
    }
}