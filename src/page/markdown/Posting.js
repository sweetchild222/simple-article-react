
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

import Modal from '../../common/Modal.js'
import MDXEditor from './MDXEditor.js'
import BeautyButton from '../../common/BeautyButton.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import AuthContext from "../../util/AuthContext.js";
import ExtractHead from "../../util/ExtractHead.js";
import GoLogin from "../../common/GoLogin.js";
import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useBlocker} from 'react-router-dom';
import * as ArticleAPI from '../../api/ArticleAPI.js'
import { Prompt, useFetcher } from 'react-router'

import ImageCropModal from '../../common/ImageCropModal.js'
import LoadingImage from "../../common/LoadingImage.js";
import OverlayLoading from "../../common/OverlayLoading.js";

import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import '../../common/RotateLoading.css'

import MarkdownToHtml from '../../util/MarkdownToHtml.js'


export default function() {
    
    const location = useLocation()

    const state = location.state

    if(state == null)
        return (<div>접근 할 수 없습니다</div>)
    
    const refTitle = useRef(null)
    const refPreview = useRef(null)
    const refImageCrop = useRef(null)

    const [isOverlayLoading, setIsOverlayLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    
    const [thumbnail, setThumbnail] = useState(state.thumbnail != '' ? state.thumbnail : null)
    const [title, setTitle] = useState(state.title)
    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
    const [categories, setCategories] = useState(null)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)

    const onChangeCategory = (e) => {

        setSelectedCategoryIndex(e.target.options.selectedIndex)
    }

    
    const navigate = useNavigate()

    useEffect(() => {

        getCategory().then((categories)=> {
            
            if(categories == null || categories.length == 0){
                window.showToast('카테고리를 가져 올 수 없습니다', 'error')
                return
            }
        
            setCategories(categories)

            const index = categories.findIndex(categorie => categorie.id === state.category_id)

            if(index != -1)
                setSelectedCategoryIndex(index)
        })

    }, [])

    useEffect(()=>{

        if(refTitle.current)
            refTitle.current.focus()


    },[refTitle])

    

    const getCategory = async() => {

        const res = await ArticleAPI.getCategories(auth.blog_id)
        
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


    const postImage = async(blob) => {
            
        const formData = new FormData()
        formData.append('image', blob)

        const resArticleImage = await BlobAPI.postArticleImage(auth.jwt, formData)

        if(resArticleImage == null)
            return null
        
        const url = process.env.API_TARGET + '/api/blob/article/' + resArticleImage.id

        return url
    }


    const putArticle = async(article_id, title, head, content, thumbUrl, posted, category_id) => {

        const payload = {
            title:title,
            content:content,
            head:head,
            posted:posted,
            thumbnail:thumbUrl,
            category_id:category_id
        }
        
        return await ArticleAPI.putArticle(auth.jwt, article_id, payload)
    }


    const saveCore = async() => {
        
        const article_id = state.id
        const title = 'test title'
        const head = 'head'
        const content = 'test cotent'
        
        const posted = 0
        const category_id = state.category_id

        return await putArticle(article_id, title, head, content, thumbnailUrl, posted, category_id)
    }


    const onClickLeave=()=> {
        
        navigate(-1)
    }



    const onClickThumbnail = async() => {

        const imageFile = await pickImageFile()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }

        setImageFile(imageFile.file)

        setIsImageCropModalOpen(true)        
    }


    const onClickThumbnailApply = async() => {

        if(!refImageCrop.current)
            return
        
        const dWidth = 960
        const dHeight = 960

        const canvas = await refImageCrop.current.export(dWidth, dHeight)
        
        const blob = await blobFromCanvas(canvas)
        setThumbnail(URL.createObjectURL(blob))
        setIsImageCropModalOpen(false)
    }


    const postThumbnail = async(url) =>{

        if(url.startsWith('blob:')){
        
            const response = await fetch(url)
            
            const blob = await response.blob()

            const formData = new FormData()
            formData.append('image', blob)

            const res = await BlobAPI.postArticleThumbnail(auth.jwt, formData)

            if(res == null)
                return null

            return process.env.API_TARGET + '/api/blob/article/thumbnail/' + res.id            
        }
        else{

            const isHttpHttps = /^(http|https):\/\//i.test(url)

            if(!isHttpHttps)
                return null

            return url
        }
    }


    const onClickPost = async() => {
        
        if(refTitle.current == null)
            return null
                
        const article_id = state.id
        const title = refTitle.current.value
        const head = ExtractHead(MarkdownToHtml(state.content), 256)
        const content = state.content

        if(!title || title.trim().length === 0){
            window.showToast('제목을 입력하세요', 'error')
            return
        }

        if(thumbnail == null || thumbnail == '') {
            window.showToast('대표 이미지를 설정하세요', 'error')
            return
        }

        setIsOverlayLoading(true)
        
        const thumbnailUrl = await postThumbnail(thumbnail)

        if(thumbnailUrl == null) {
            setIsOverlayLoading(false)
            window.showToast('대표 이미지 설정에 실패하였습니다', 'error')
            return 
        }
        
        
        if(!categories) {
            setIsOverlayLoading(false)
            window.showToast('카테고리가 설정되지 않았습니다', 'error')
            return
        }

        const posted = 1

        const category_id = categories[selectedCategoryIndex].id        
    
        const res = await putArticle(article_id, title, head, content, thumbnailUrl, posted, category_id)

        setIsOverlayLoading(false)

        if(res == null){
            window.showToast('글 등록에 실패하였습니다', 'error')
            return null
        }

        window.showToast('글이 등록 되었습니다 ', 'info')

        navigate(-2)
    }


    const onClickDelete = async() => {

        setIsConfirmDeleteModalOpen(true)

    }


    const onResultConfirmDelete = async(result) =>{

        if(result == true){
                        
            const res = await ArticleAPI.deleteArticle(auth.jwt, state.id)
            
            if(res == null){
                window.showToast('삭제가 실패 하였습니다', 'error')
                return
            }

            window.showToast('삭제 되었습니다', 'info')

            navigate(-2)
        }        
    }


    return validAuth(auth) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {isOverlayLoading && <OverlayLoading/>}
            <label htmlFor='input_title'>제목</label>
            <input ref={refTitle} id='input_title' placeholder="제목을 입력하세요" type='text' defaultValue={title}/>

            <select style={{width:'100px'}} value={categories ? categories[selectedCategoryIndex].name : ''} onChange={onChangeCategory}>
                {categories && categories.map((data, index) => <option key={data.id}>{data.name}</option>)}
            </select>

            <LoadingImage src={thumbnail} onClick={onClickThumbnail} width={170} height={170}/>
            {imageFile && isImageCropModalOpen && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickThumbnailApply} keepRatio={1}></ImageCropModal>}    
            <BeautyButton type='success' onClick={onClickPost}>올리기</BeautyButton>
            <BeautyButton type='danger' onClick={onClickDelete}>삭제하기</BeautyButton>
            <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>
            <BeautyButton type='danger' onClick={onClickLeave}>뒤로가기</BeautyButton>
        </div>
        ) : (<GoLogin/>)
}

