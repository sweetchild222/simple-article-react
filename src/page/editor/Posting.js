
import {useNavigate, useLocation} from 'react-router-dom';
import { useContext, useState, useRef, useEffect} from 'react'

import PrettyButton from '@gui/PrettyButton.js'
import Modal from "@gui/Modal.js";
import ImageCropModal from '@gui/ImageCropModal.js'
import StateProgsImage from "@gui/StateProgsImage.js";
import Spinner from "@gui/Spinner.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";
import AuthContext from "@util/AuthContext.js";
import ImagePicker from "@util/ImagePicker.js";
import {blobFromCanvas} from "@util/ImageUtil.js";
import MarkdownToHtml from '@util/MarkdownToHtml.js'
import GoLogin from "@page/common/GoLogin.js";
import * as BlobAPI from '@rest/BlobAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'

import ExtractHead from "./ExtractHead.js";

export default function() {
    
    const location = useLocation()

    const state = location.state

    if(state == null)
        return (<div>접근 할 수 없습니다</div>)
    
    const refTitle = useRef(null)    
    const refImageCrop = useRef(null)

    const [isSpinner, setIsSpinner] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    
    const [thumbnail, setThumbnail] = useState(state.thumbnail != '' ? state.thumbnail : '')
    const [title, setTitle] = useState(state.title)
    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)
    const [categories, setCategories] = useState(null)
    const {auth, validAuth} = useContext(AuthContext)
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)



    const onChangeCategory = (e) => {

        setSelectedCategoryIndex(e.target.options.selectedIndex)
    }


    
    const navigate = useNavigate()

    useEffect(() => {

        getCategory().then((categories)=> {
            
            if(categories == null || categories.length == 0){
                window.showToast('카테고리 가져오기에 실패하였습니다', 'system-error')
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
        
        if(res.success == false)
            return null

        if(res.payload.length == 0)
            return null
    
        res.payload.sort((a, b)=> {

            return b.is_default - a.is_default
        })

        return res.payload
    }


    const postImage = async(blob) => {
            
        const formData = new FormData()
        formData.append('image', blob)

        const resArticleImage = await BlobAPI.postArticleImage(auth.jwt, formData)

        if(resArticleImage.success == false)
            return null
        
        const url = process.env.API_TARGET + '/api/blob/article/' + resArticleImage.payload.id

        return url
    }


    const onClickThumbnail = async() => {

        const imageFile = await ImagePicker()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'user-error')
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

        if(res.success == false){
            window.showToast('썸네일 설정에 실패하였습니다', 'system-error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/article/thumbnail/' + res.payload.id

        setThumbnail(url)
        setIsImageCropModalOpen(false)
    }


    const onClickPost = async() => {
        
        if(refTitle.current == null)
            return null

        if(categories == null) {
            window.showToast('카테고리가 설정되지 않았습니다', 'user-error')
            return
        }

        if(refTitle.current.value.trim().length === 0){
            window.showToast('제목을 입력하세요', 'user-error')
            return
        }        

        const article_id = state.source_id != null ? state.source_id : state.id
        const title = refTitle.current.value
        const head = ExtractHead(MarkdownToHtml(state.content), 256)
        const content = state.content
        const category_id = categories[selectedCategoryIndex].id
        const posted = 1
            
        const res = await putArticle(article_id, title, head, content, thumbnail, posted, category_id)

        if(res.success == false){
            window.showToast(state.source_id != null ?  '글 수정에 실패하였습니다' : '글 등록에 실패하였습니다', 'system-error')
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

        setIsSpinner(true)
        
        const res = await ArticleAPI.putArticle(auth.jwt, article_id, payload)

        setIsSpinner(false)

        return res
    }


    const onResultConfirmDelete = async(result) =>{

        if(result == true){

            const res = await ArticleAPI.deleteArticle(auth.jwt, state.id)
            
            if(res.success == false){
                window.showToast('삭제가 실패하였습니다', 'system-error')
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
            window.showToast('카테고리가 설정되지 않았습니다', 'user-error')
            return
        }

        const article_id = state.id
        const title = refTitle.current.value
        const head = ExtractHead(MarkdownToHtml(state.content), 256)
        const content = state.content
        const category_id = categories[selectedCategoryIndex].id
        const posted = 0
        
        const res = await putArticle(article_id, title, head, content, thumbnail, posted, category_id)

        if(res.success == false){
            window.showToast('글의 임시 저장에 실패하였습니다 ', 'system-error')
            return
        }

        window.showToast('글이 임시 저장 되었습니다 ', 'info')
    }


    return validAuth(auth) ? (
        <Vertical style={{margin:'auto', height:'100%', alignItems:'start', position:'relative'}}>
            {isSpinner && <Spinner type={'absolute'}/>}
            <label htmlFor='input_title'>제목</label>
            <VPad size={4}/>
            <input ref={refTitle} id='input_title' placeholder="제목을 입력하세요" type='text' defaultValue={title} style={{width:'100%', boxSizing:'border-box'}}/>
            <VPad size={16}/>
            <label htmlFor='input_category'>카테고리</label>
            <VPad size={4}/>
            <select style={{width:'100%'}} id='input_category' value={categories ? categories[selectedCategoryIndex].name : ''} onChange={onChangeCategory}>
                {categories && categories.map((data, index) => <option key={data.id}>{data.name}</option>)}
            </select>
            <VPad size={16}/>
            <label onClick={onClickThumbnail}>썸네일</label>
            <VPad size={4}/>
            <StateProgsImage src={thumbnail} onClick={onClickThumbnail} width={384} height={384} style={{alignSelf:'center'}}/>
            {imageFile && isImageCropModalOpen && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickThumbnailApply} keepRatio={1}></ImageCropModal>}
            <VPad size={16}/>
            <Horizental style={{width:'100%'}}>
                <PrettyButton type='danger' onClick={onClickDelete} style={{width:'64px'}}>삭제</PrettyButton>
                <HPad size={64}/>
                <PrettyButton type='success' onClick={onClickSave} style={{flex:'1'}}>임시 저장</PrettyButton>
                <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>
                <HPad size={16}/>
                <PrettyButton type='success' onClick={onClickPost} style={{flex:'1'}}>{state.source_id != null ? '수정 완료': '작성 완료'}</PrettyButton>
            </Horizental>
        </Vertical>
        ) : (<GoLogin/>)
}

