
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

import Modal from '../../common/Modal.js'
import MDXEditor from './MDXEditor.js'
import BeautyButton from '../../common/BeautyButton.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import AuthContext from "../../util/AuthContext.js";
import GoLogin from "../../common/GoLogin.js";
import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useBlocker} from 'react-router-dom';
import * as ArticleAPI from '../../api/ArticleAPI.js'
import { Prompt } from 'react-router'

import ImageCropModal from '../../common/ImageCropModal.js'
import PostModal from './PostModal.js'

import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import LoadingImage from "../../common/LoadingImage.js";
import '../../common/RotateLoading.css'

export default function() {
    
    const location = useLocation()

    const refTitle = useRef(null)
    const refMDX = useRef(null)
    const refLength = useRef(null)
    const refImageCrop = useRef(null)

    const [isSaveTempLoading, setIsSaveTempLoading] = useState(false)    
    const [isTouched, setIsTouched] = useState(false)
    const [isOverlayLoading, setIsOverlayLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    
    const [thumbnailUrl, setThumbnailUrl] = useState(location.state.thumbnail)
    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
    const [categories, setCategories] = useState(null)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const leave_modal_config = {text: '나가기 전에 임시 저장 하시겠습니까?', type: 'yesno', isCloseOutsideClick: true}

    if(location.state == null)
        return (<div>잘못된 접근입니다</div>)
    
    const navigate = useNavigate()
    
    useEffect(()=> {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'error')
            navigate(-1)
            return
        }

    }, [auth])
    

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        
        if (isTouched && currentLocation.pathname !== nextLocation.pathname)
            return true
        else
            return false
    })

    useEffect(() => {
    
        if (blocker.state === "blocked" && validAuth(auth)) {

            const proceed = window.confirm("저장하지 않고 나가시겠습니까?")

            if (proceed)
                blocker.proceed()
            else
                blocker.reset()
        }

    }, [blocker]);


    const beforeUnload = useCallback((e) => {

        if(isTouched){
            e.preventDefault()
            e.returnValue = ''
        }
    })

    useEffect(() => {
        
        window.addEventListener('beforeunload', beforeUnload)
    
        return () => {

            window.removeEventListener('beforeunload', beforeUnload)
        }

    }, [beforeUnload])


    useEffect(()=>{

        if(refLength.current)
            refLength.current.textContent = location.state.content.length + '/65535'

    },[refLength])

    
    
    const onClickPostModal = async() => {

        const res = await ArticleAPI.getUserCategories(auth.jwt, auth.user_id)
        
        if(res == null)
            return -1

        if(res.length == 0)
            return -1

        setCategories(res)

        setIsPostModalOpen(true)
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


    const onParsingError = (payload) =>{

        console.log('error: ', payload.error)
        console.log('sourece:', payload.source)
    }


    const onUserError = (error) =>{
    
        window.showToast(error, 'error')
    }
    


    const putArticle = async(article_id, title, content, thumbUrl, open, posted, category_id) => {

        const payload = {
            title:title,
            content:content,
            open:open,
            posted:posted,
            thumbnail:thumbUrl,
            category_id:category_id
        }


        console.log(content)
        
        return await ArticleAPI.putArticle(auth.jwt, article_id, payload)
    }

    const onClickSave = async() => {
        
        setIsSaveTempLoading(true)
    
        const res = await saveCore()

        if(res != null)
            window.showToast('임시 저장됨', 'info')
        else
            window.showToast('임시 저장 실패', 'error')

        setIsSaveTempLoading(false)
        setIsTouched(false)
    }


    const saveCore = async() => {
        
        if(refTitle.current == null || refMDX.current == null)
            return null

        const payloadSource = location.state
        
        const article_id = payloadSource.id
        const title = refTitle.current.value
        const content = refMDX.current.getMarkdown()
        const open = payloadSource.open
        const posted = 0
        const category_id = payloadSource.category_id

        const res = await putArticle(article_id, title, content, thumbnailUrl, open, posted, category_id)

        if(res == null)
            return null

        return res
    }


    const onChangeContent = (content, isInternalChange) =>{
        
        if(!isInternalChange){
            setIsTouched(true)

            if(refLength.current)
                refLength.current.textContent = content.length + '/65535'
        }
    }


    const onChangeTitle = (event) => {

        setIsTouched(true)
    }


    const onClickLeave=()=> {

        if(isTouched)
            setIsConfirmSaveModalOpen(true)
        else
            navigate(-1)
    }


    const onResultConfirmSave = async(result) => {

        setIsTouched(false)
        
        if(result == true){
            
            const res = await saveCore()

            if(res != null)
                window.showToast('임시 저장 됨', 'info')
            else
                window.showToast('임시 저장 실패', 'error')
        }

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

        if(imageFile.file.size > 1000 * 1000 * 30) { //downscaling to smooth moving region select on large file

            const canvas = await ImageScale(imageFile.file, 4096, 4096, 512, 512)

            if(canvas == null){
                window.showToast('파일을 사용할 수 없습니다', 'error')
                return
            }

            setImageFile(await blobFromCanvas(canvas))
            
            setIsImageCropModalOpen(true)
        }
        else{

            setImageFile(imageFile.file)

            setIsImageCropModalOpen(true)
        }
    }


    const onClickApply = async() => {
    
        const rect = refImageCrop.current.rect()
        const image = refImageCrop.current.image()

        const dWidth = 1024
        const dHeight = 768

        const canvas = await drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, dWidth, dHeight)
        
        const blob = await blobFromCanvas(canvas)
            
        const formData = new FormData()
        formData.append('image', blob)

        const resArticleThumbnail = await BlobAPI.postArticleThumbnail(auth.jwt, formData)

        if(resArticleThumbnail == null)
            return

        const url = process.env.API_TARGET + '/api/blob/article/thumbnail/' + resArticleThumbnail.id

        setThumbnailUrl(url)
        setIsImageCropModalOpen(false)
        setIsTouched(true)
    }

    const onPost = async(category_id, open_type) => {

        const payloadSource = location.state

        if(refTitle.current == null || refMDX.current == null)
            return null
        
        const article_id = payloadSource.id
        const title = refTitle.current.value
        const content = refMDX.current.getMarkdown()
        const posted = 1
        
        setIsOverlayLoading(true)

        const res = await putArticle(article_id, title, content, thumbnailUrl, open_type, posted, category_id)

        setIsOverlayLoading(false)

        if(res == null){
            window.showToast('글 게시에 실패하였습니다', 'error')
            return null
        }
        
        setIsTouched(false)
        setIsPostModalOpen(false)
        navigate(-1)
    }


    const onClickGoLogin = () => {

        setIsTouched(false)

        setTimeout(()=> {
            navigate('/login')
        })
    }


    return validAuth(auth) ? (
        
        <div style={{flex:1, position: 'relative'}}>
            {isOverlayLoading && <div style={{width:'100%', height:'100%', position: 'absolute', zIndex: 10, backgroundColor:'rgba(0, 0, 0, 0.5)'}} className={`rotateLoading`}/>}
            <div style={{position: 'absolute', width:'100%', height:'100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', flexDirection: 'row', margin:'5px'}}>
                    <LoadingImage src={thumbnailUrl != '' ? (thumbnailUrl + '?size=160x120') : null} onClick={onClickThumbnail} width={160} height={120}/>
                    {imageFile && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickApply} keepRatio={1.333}></ImageCropModal>}
                    <input ref={refTitle} maxLength="256" style={{flex:'1', fontSize: '25px'}}  placeholder="제목을 입력하세요" defaultValue={location.state.title} onChange={onChangeTitle}></input>                    
                </div>
                <div style={{border:'1px solid lightgray', borderRadius:'4px', overflowY:'auto', maxHeight:'calc(100vh - 192px)', flex: 1, margin:'0px 5px 5px 5px'}}>
                    <MDXEditor ref={refMDX} placeHolder={"글을 작성해보세요"} postImage={postImage} initMarkdown={location.state.content}
                    onChange={onChangeContent} onUserError={onUserError} readOnly={false} onParsingError={onParsingError}/>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', flex: 0, margin:'0px 5px 5px 5px'}}>
                    <label ref={refLength}></label>
                    <BeautyButton type='success' disabled={!isTouched} isLoading={isSaveTempLoading} onClick={onClickSave}>임시저장</BeautyButton>
                    <BeautyButton type='confirm' onClick={onClickPostModal}>올리기</BeautyButton>
                    <BeautyButton type='danger' onClick={onClickLeave}>나가기</BeautyButton>
                    <Modal config={leave_modal_config} isOpen={isConfirmSaveModalOpen} onResult={onResultConfirmSave} onClose={()=>setIsConfirmSaveModalOpen(false)}></Modal>
                    {categories != null && <PostModal categories={categories} isOpen={isPostModalOpen} onClose={()=>setIsPostModalOpen(false)} onPost={onPost}/>}
                </div>
            </div>
        </div>
    ) : (<GoLogin onClickGoLoginCustom={onClickGoLogin} />)
}

