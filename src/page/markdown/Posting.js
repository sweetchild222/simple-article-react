
import { useContext, useState, useRef, useEffect} from 'react'

import BeautyButton from '@gui/BeautyButton.js'
import * as BlobAPI from '@rest/BlobAPI.js'
import AuthContext from "@util/AuthContext.js";
import ExtractHead from "@util/ExtractHead.js";
import GoLogin from "@gui/GoLogin.js";
import Modal from "@gui/Modal.js";
import {pickImageFile} from "@util/ImagePicker.js";
import {useNavigate, useLocation} from 'react-router-dom';
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'

import ImageCropModal from '@gui/ImageCropModal.js'
import LoadingImage from "@gui/LoadingImage.js";
import OverlayLoading from "@gui/OverlayLoading.js";

import {blobFromCanvas} from "@util/ImageUtil.js";
import MarkdownToHtml from '@util/MarkdownToHtml.js'


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
    
    const [thumbnail, setThumbnail] = useState(state.thumbnail != '' ? state.thumbnail : '')
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

        const res = await CategoryAPI.getCategories(auth.blog_id)
        
        if(res == null)
            return null

        if(res.length == 0)
            return null
    
        res.sort((a, b)=> {

            return b.is_default - a.is_default
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

        const formData = new FormData()
        formData.append('image', blob)

        const res = await BlobAPI.postArticleThumbnail(auth.jwt, formData)

        if(res == null){
            window.showToast('대표 이미지 설정에 실패했습니다', 'error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/article/thumbnail/' + res.id

        setThumbnail(url)
        setIsImageCropModalOpen(false)
    }


    const onClickPost = async() => {
        
        if(refTitle.current == null)
            return null

        if(categories == null) {
            window.showToast('카테고리가 설정되지 않았습니다', 'error')
            return
        }

        if(refTitle.current.value.trim().length === 0){
            window.showToast('제목을 입력하세요', 'error')
            return
        }        

        const article_id = state.source_id != null ? state.source_id : state.id
        const title = refTitle.current.value
        const head = ExtractHead(MarkdownToHtml(state.content), 256)
        const content = state.content
        const category_id = categories[selectedCategoryIndex].id
        const posted = 1
            
        const res = await putArticle(article_id, title, head, content, thumbnail, posted, category_id)

        if(res == null){
            window.showToast(state.source_id != null ?  '글 수정에 실패 하였습니다' : '글 등록에 실패 하였습니다', 'error')
            return
        }

        window.showToast(state.source_id != null ? '글이 수정 되었습니다' : '글이 등록 되었습니다', 'info')

        if(state.source_id != null)
            await deleteArticle(state.id)
        
        navigate(-2)
    }


    const deleteArticle = async(id) => {

        await ArticleAPI.deleteArticle(auth.jwt, id)
    }


    const onClickDelete = async() => {

        setIsConfirmDeleteModalOpen(true)
    }


    const putArticle = async(article_id, title, head, content, thumbnail, posted, category_id) => {
        
        const payload = {
            title:title,
            head:head,
            content:content,            
            posted:posted,
            thumbnail:thumbnail,
            category_id:category_id
        }

        setIsOverlayLoading(true)
        
        const res = await ArticleAPI.putArticle(auth.jwt, article_id, payload)

        setIsOverlayLoading(false)

        return res

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


    const onClickSave = async() =>{

        if(refTitle.current == null)
            return null

        if(categories == null) {
            window.showToast('카테고리가 설정되지 않았습니다', 'error')
            return
        }

        const article_id = state.id
        const title = refTitle.current.value
        const head = ExtractHead(MarkdownToHtml(state.content), 256)
        const content = state.content
        const category_id = categories[selectedCategoryIndex].id
        const posted = 0
            
        const res = await putArticle(article_id, title, head, content, thumbnail, posted, category_id)

        if(res == null){
            window.showToast('글의 임시 저장에 실패 하였습니다 ', 'error')
            return
        }

        window.showToast('글이 임시 저장 되었습니다 ', 'info')
    }


    return validAuth(auth) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {isOverlayLoading && <OverlayLoading/>}
            <label htmlFor='input_title'>제목</label>
            <input ref={refTitle} id='input_title' placeholder="제목을 입력하세요" type='text' defaultValue={title}/>

            <select style={{width:'100px'}} value={categories ? categories[selectedCategoryIndex].name : ''} onChange={onChangeCategory}>
                {categories && categories.map((data, index) => <option key={data.id}>{data.name}</option>)}
            </select>

            <LoadingImage src={thumbnail} onClick={onClickThumbnail} width={512} height={512}/>
            {imageFile && isImageCropModalOpen && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickThumbnailApply} keepRatio={1}></ImageCropModal>}    
            <BeautyButton type='success' onClick={onClickPost}>{state.source_id != null ? '수정하기': '올리기'}</BeautyButton>
            <BeautyButton type='danger' onClick={onClickDelete}>삭제하기</BeautyButton>
            <BeautyButton type='success' onClick={onClickSave}>임시 저장</BeautyButton>
            <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>
            <BeautyButton type='danger' onClick={onClickLeave}>뒤로가기</BeautyButton>
        </div>
        ) : (<GoLogin/>)
}

