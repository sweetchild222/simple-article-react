
import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'
import Modal from '../../common/Modal.js'
import MDXEditor from './MDXEditor.js'
import BeautyButton from '../../common/BeautyButton.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import AuthContext from "../../util/AuthContext.js";
import {pickImage, getImageFormat} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import * as ArticleAPI from '../../api/ArticleAPI.js'

import ImageCropModal from './ImageCropModal.js'

import ImageScale from "../../util/ImageScale.js";
import { BsTrash } from "react-icons/bs";
import { PiTrash } from "react-icons/pi";

import './Editor.css'
import ImageRegion from '../../util/ImageCropper.js'
import '../../common/RotateLoading.css'
import * as blobToBase64 from '../../util/BlobToBase64.js'

export default function() {

    const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    const location = useLocation()

    const refTitle = useRef(null)
    const refMDX = useRef(null)
    const refLengthChar = useRef(null)
    const refCover = useRef(null)
    const refImageCrop = useRef(null)
    
    const [isSaveTempLoading, setIsSaveTempLoading] = useState(false)
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [saveTempTimerId, setSaveTempTimerId] = useState(null)
    const [isDisableSaveTemp, setIsDisableSaveTemp] = useState(true)
    const [markdown, setMarkdown] = useState(location.state.content)
    const [isLoading, setIsLoading] = useState(true)
    const [imageFile, setImageFile] = useState(null)
    const [thumbnail, setThumbnail] = useState(transparent)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const modal_config = {text: '나가기 전에 임시 저장 하시겠습니까?', type: 'yesno', isCloseOutsideClick: true}
    
    if(location.state == null)
        return (<div>잘못된 접근입니다</div>)

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const navigate = useNavigate()


    useEffect(()=> {
    
      if(!validAuth(auth)){
          navigate('/login', {replace:true})
          return
      }

    }, [auth])


    const beforeUnload = useCallback(() => {

        updateLocationState()

        navigate(location.pathname, { replace: true, state: location.state})
    })


    useEffect(()=>{

        refLengthChar.current.textContent = location.state.content.length + '/65535'

        //console.log(location.state.thumbnail)

    },[])


    useEffect(() => {

        window.addEventListener('beforeunload', beforeUnload)
    
        return () => {
            window.removeEventListener('beforeunload', beforeUnload)
        }

    }, [beforeUnload])


    const postMarkDown = () => {

    }


    const postImage = async(canvas) => {

        const formData = await canvasToFormData(canvas)

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
    

    const setTimerAutoSaving = ()=>{

        if(saveTempTimerId != null)
            return

        const timeout = 1000 * 60
    
        const timerId = setTimeout(async() => {

            setIsSaveTempLoading(true)

            stopTimer()
            
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


    const putArticle = async(article_id, title, content, payloadSource) =>{

        const payload = {
            title:title,
            content:content,
            open:payloadSource.open,
            posted:0,
            thumbnail:payloadSource.thumbnail,
            category_id:payloadSource.category_id
        }
        
        return await ArticleAPI.putArticle(auth.jwt, article_id, payload)
    }

    const saveTempSave = async() => {

        setIsSaveTempLoading(true)
        
        stopTimer()

        const res = await saveTempSaveCore()

        if(res != null)
            window.showToast('임시 저장됨', 'info')
        else
            window.showToast('임시 저장 실패', 'error')

        setIsSaveTempLoading(false)
        setIsDisableSaveTemp(true)
    }

    const saveTempSaveCore = async() => {

        const payloadSource = location.state

        if(refTitle.current == null || refMDX.current == null)
            return null

        const res = await putArticle(payloadSource.id, refTitle.current.value, refMDX.current.getMarkdown(), payloadSource)

        if(res == null)
            return null

        return res
    }


    const onChangeContent = (content, isInternalChange) =>{
        
        if(!isInternalChange){
            setIsDisableSaveTemp(false)
            //setTimerAutoSaving()
            refLengthChar.current.textContent = content.length + '/65535'
        }
    }


    const onChangeTitle = (event) => {

        setIsDisableSaveTemp(false)
        //setTimerAutoSaving()
    }


    const onClickCancel=()=> {

        setIsModalOpen(true)
    }



    const onResultCancel = async(result) => {

      if(result == true){

        const res = await saveTempSaveCore()

        if(res != null)
            window.showToast('임시 저장 됨', 'info')
        else
            window.showToast('임시 저장 실패', 'error')

        navigate(-1)
      }
    }


    const toggle = () => {

        if(!isReadOnly)
            setMarkdown(refMDX.current.getMarkdown())
        
        setIsReadOnly(isReadOnly => !isReadOnly)
    }

    const onClickThumbnail = async() => {

        const file = await pickImage()

        if(file == null)
            return

        try{

            const format = await getImageFormat(file)
            
            if(format == 'unknown') {                
                window.showToast('파일을 사용할 수 없습니다', 'error')
                return
            }
        
            
            if(file.size > 1000 * 1000 * 30) { //downscaling to smooth moving region select on large file

                const canvas = await ImageScale(file, 4096, 4096, 512, 512)

                if(canvas == null)
                    return                
                
                const blob = await getBlob(canvas)

                setImageFile(blob)
                
                setIsImageModalOpen(true)
            }
            else{

                setImageFile(file)

                setIsImageModalOpen(true)
            }
        }
        catch(error) {

            console.log(error)

            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }
    }


    const getBlob = (canvas) => {

        return new Promise((resolve) => {

            canvas.toBlob((blob) => {

                resolve(blob)

            })
        })
    }


    const canvasToFormData = async(canvas) =>{

        const blob = await getBlob(canvas)

        const formData = new FormData()
        formData.append('image', blob)

        return formData
    }


    const updateLocationState = () =>{

        if(refMDX.current)
            location.state.content = refMDX.current.getMarkdown()

        if(refTitle.current)
            location.state.title = refTitle.current.value        
    }

    

    let lastRect = null;
        
    const onSelectImage = (rect) => {

        lastRect = rect
    }


    const onClickApply = async() => {

        if(lastRect == null)
            return

        const image = refImageCrop.current.image()

        const canvasWidth = 256
        const canvasHeight = 256

        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        const ctx = canvas.getContext('2d')

        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(image, lastRect.x, lastRect.y, lastRect.width, lastRect.height, 0, 0, canvasWidth, canvasHeight)

        const formData = await canvasToFormData(canvas)

        const resArticleThumbnail = await BlobAPI.postArticleThumbnail(auth.jwt, formData)

        if(resArticleThumbnail == null)            
            return

        const url = process.env.API_TARGET + '/api/blob/article/thumbnail' + resArticleThumbnail.id

        setIsImageModalOpen(false)
    }


    return validAuth(auth) ? (
        <div style={{height:'100%', width:'100%', display: 'flex', flexDirection: 'column'}}>

            {imageFile && <ImageCropModal ref={refImageCrop} isOpen={isImageModalOpen} onClose={()=>setIsImageModalOpen(false)} file={imageFile} onSelectImage={onSelectImage} onClickApply={onClickApply}></ImageCropModal>}

            <div style={{display: 'flex', flexDirection: 'row-reverse', margin:'5px'}}>
                <BeautyButton type='success' onClick={toggle}>{isReadOnly ? '수정하기' : '미리보기'}</BeautyButton>
                <Modal config={modal_config} isOpen={isModalOpen} onResult={onResultCancel} onClose={()=>setIsModalOpen(false)}></Modal>
                <input ref={refTitle} readOnly={isReadOnly} maxLength="256" style={{flexGrow:'1', fontSize: '25px'}}  placeholder="제목을 입력하세요" defaultValue={location.state.title} onChange={onChangeTitle}></input>
                <div id='cover' ref={refCover} className={`${isLoading ? 'rotateLoading': ''}`}  onClick={onClickThumbnail} style={{width:'64px', height:'64px'}}>
                    <img alt='image' src={thumbnail}  style={{borderRadius:'1px'}}/>
                </div>            
            </div>
            <div style={{border:'1px solid lightgray', borderRadius:'4px', overflowY:'auto', maxHeight:'75vh', margin:'5px', flex: 1, backgroundColor:'#F8F8F8'}}>
                <MDXEditor ref={refMDX} placeHolder={"글을 작성해보세요"} postImage={postImage} initMarkdown={location.state.content} markdown={markdown}
                    onChange={onChangeContent} onUserError={onUserError} readOnly={isReadOnly} onParsingError={onParsingError}
                />
            </div>
            <div style={{display: 'flex', flexDirection: 'row-reverse', margin:'5px'}}>
                <BeautyButton type='danger' onClick={onClickCancel}>나가기</BeautyButton>
                <BeautyButton type='confirm' onClick={postMarkDown}>올리기</BeautyButton>
                <BeautyButton type='success' disabled={isDisableSaveTemp} isLoading={isSaveTempLoading} onClick={saveTempSave}>임시저장</BeautyButton>
                <label ref={refLengthChar} htmlFor='input_username'></label>

            </div>
        </div>
    ) : null
}

