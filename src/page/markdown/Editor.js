
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

import OverlayLoading from '../../common/OverlayLoading.js'

import ImageScale, {getBlob} from "../../util/ImageScale.js";
import LoadingImage from "../../common/LoadingImage.js";
import '../../common/RotateLoading.css'
import { BsTrash } from "react-icons/bs";
import { PiTrash } from "react-icons/pi";

import * as blobToBase64 from '../../util/BlobToBase64.js'

export default function() {
    
    const location = useLocation()

    const refTitle = useRef(null)
    const refMDX = useRef(null)
    const refLength = useRef(null)
    const refImageCrop = useRef(null)

    const [isSaveTempLoading, setIsSaveTempLoading] = useState(false)
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [saveTempTimerId, setSaveTempTimerId] = useState(null)
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
    
        if (blocker.state === "blocked") {

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

        setIsOverlayLoading(true)

        console.log('asdf')
        
        // const res = await ArticleAPI.getUserCategories(auth.jwt, auth.user_id)
        
        // if(res == null)
        //     return -1

        // if(res.length == 0)
        //     return -1

        // setCategories(res)

        // setIsPostModalOpen(true)
    }


    const postImage = async(blob) => {
            
        const formData = new FormData()
        formData.append('image', blob)

        const resArticleImage = await BlobAPI.postArticleImage(auth.jwt, formData)

        if(resArticleImage == null)
            return
        
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
    

    const setTimerAutoSave = ()=>{

        if(saveTempTimerId != null)
            return

        const timeout = 1000 * 60
    
        const timerId = setTimeout(async() => {

            setIsSaveTempLoading(true)

            //stopTimer()
            
            const res = await saveTempSaveCore()
            
            if(res != null)
                window.showToast('임시 저장됨', 'info')
            else
                window.showToast('임시 저장 실패', 'error')

            setIsSaveTempLoading(false)
            setIsDisableSaveTemp(true)

        }, timeout)

        setSaveTempTimerId(timerId)
    }


    const stopTimer = () =>{

        if(saveTempTimerId != null)
            clearTimeout(saveTempTimerId)

        setSaveTempTimerId(null)
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
        
        //stopTimer()

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
            //setTimerAutoSave()
        }
    }


    const onChangeTitle = (event) => {

        setIsTouched(true)
        //setTimerAutoSave()
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


    const toggleViewer = () => {
        
        setIsReadOnly(isReadOnly => !isReadOnly)
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

            const blob = await ImageScale(imageFile.file, 4096, 4096, 512, 512)

            setImageFile(blob)
            
            setIsImageCropModalOpen(true)
        }
        else{

            setImageFile(imageFile.file)

            setIsImageCropModalOpen(true)
        }
    }


    const canvasToFormData = async(canvas) =>{

        const blob = await getBlob(canvas)

        const formData = new FormData()
        formData.append('image', blob)

        return formData
    }


    const onClickApply = async(rect) => {

        if(rect == null)
            return

        if(refImageCrop.current == null)
            return

        const image = refImageCrop.current.image()

        const canvasWidth = 256
        const canvasHeight = 256

        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        const ctx = canvas.getContext('2d')

        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, canvasWidth, canvasHeight)

        const formData = await canvasToFormData(canvas)

        const resArticleThumbnail = await BlobAPI.postArticleThumbnail(auth.jwt, formData)

        if(resArticleThumbnail == null)
            return

        const url = process.env.API_TARGET + '/api/blob/article/thumbnail/' + resArticleThumbnail.id

        setThumbnailUrl(url)
        setIsImageCropModalOpen(false)
        setIsTouched(true)

        return
    }

    const onPost = async(category_id, open_type) => {

        const payloadSource = location.state

        if(refTitle.current == null || refMDX.current == null)
            return null
        
        const article_id = payloadSource.id
        const title = refTitle.current.value
        const content = refMDX.current.getMarkdown()
        const posted = 1
        

        const res = await putArticle(article_id, title, content, thumbnailUrl, open_type, posted, category_id)

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
        
        <div style={{flex:1}}>
            <div style={{height:'100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', flexDirection: 'row', margin:'5px'}}>
                    <LoadingImage src={thumbnailUrl != '' ? (thumbnailUrl + '?size=64x64') : null} onClick={onClickThumbnail} width={64} height={64}/>
                    {imageFile && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickApply}></ImageCropModal>}
                    <input ref={refTitle} readOnly={isReadOnly} maxLength="256" style={{flex:'1', fontSize: '25px'}}  placeholder="제목을 입력하세요" defaultValue={location.state.title} onChange={onChangeTitle}></input>
                    <BeautyButton type='success' onClick={toggleViewer}>{isReadOnly ? '수정하기' : '미리보기'}</BeautyButton>
                </div>
                <div style={{border:'1px solid lightgray', borderRadius:'4px', overflowY:'auto', maxHeight:'calc(100vh - 192px)', flex: 1, backgroundColor:'white', margin:'0px 5px 5px 5px'}}>
                    <MDXEditor ref={refMDX} placeHolder={"글을 작성해보세요"} postImage={postImage} initMarkdown={location.state.content}
                    onChange={onChangeContent} onUserError={onUserError} readOnly={isReadOnly} onParsingError={onParsingError}/>
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

