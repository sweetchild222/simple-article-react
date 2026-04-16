
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
import '../../common/RotateLoading.css'

import MarkdownToHtml from '../../util/MarkdownToHtml.js'

export default function() {
    
    const location = useLocation()

    if(location.state == null)
        return (<div>잘못된 방식으로 접근하였습니다</div>)



    console.log(location.state)

    const refTitle = useRef(null)
    const refPreview = useRef(null)
    const refImageCrop = useRef(null)    

    const [isOverlayLoading, setIsOverlayLoading] = useState(false)    
    const [imageFile, setImageFile] = useState(null)
    
    const [thumbnailUrl, setThumbnailUrl] = useState(location.state.thumbnail)
    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)    
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
    const [categories, setCategories] = useState(null)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    
    const navigate = useNavigate()
    
    useEffect(()=> {

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'error')
            navigate(-2)
            return
        }

    }, [auth])
    


    const onClickPost = async() => {

        const res = await ArticleAPI.getUserCategories(auth.jwt, auth.user_id)
        
        if(res == null)
            return -1

        if(res.length == 0)
            return -1

        setCategories(res)        
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



    const putArticle = async(article_id, title, content, thumbUrl, open, posted, category_id) => {

        const payload = {
            title:title,
            content:content,
            open:open,
            posted:posted,
            thumbnail:thumbUrl,
            category_id:category_id
        }        
        
        return await ArticleAPI.putArticle(auth.jwt, article_id, payload)
    }




    const saveCore = async() => {
                
        const payloadSource = location.state
        
        const article_id = payloadSource.id
        const title = 'test title'
        const content = 'test cotent'
        const open = payloadSource.open
        const posted = 0
        const category_id = payloadSource.category_id

        const res = await putArticle(article_id, title, content, thumbnailUrl, open, posted, category_id)

        if(res == null)
            return null

        return res
    }



    const onClickLeave=()=> {

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
                
        navigate(-1)
    }


    const onClickGoLogin = () => {

        setTimeout(()=> {
            navigate('/login')
        })
    }


    return validAuth(auth) ? (
        <div style={{flex:1, position: 'relative', margin:'0px 20px 0px 20px'}}>
            {isOverlayLoading && <div style={{width:'100%', height:'100%', position: 'absolute', zIndex: 10, backgroundColor:'rgba(0, 0, 0, 0.5)'}} className={`rotateLoading`}/>}
            <div style={{position: 'absolute', width:'100%', height:'100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{overflowY:'auto', minWidth:'10%', width: '100%', flex: 1, border:'1px solid lightgray', borderRadius:'4px', margin:'0px 5px 5px 5px'}}>
                    <div ref={refPreview}  style={{margin:'10px'}}/>
                </div>                    
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flex: 0, margin:'20px 5px 20px 5px',  alignItems: 'center'}}>
                    <BeautyButton type='danger' style={{marginRight:'10px'}} onClick={onClickLeave}>뒤로 가기</BeautyButton>
                    <BeautyButton type='confirm' style={{marginRight:'10px'}} onClick={onClickPost}>올리기</BeautyButton>                                        
                    {/* {categories != null && <PostModal categories={categories} isOpen={isPostModalOpen} onClose={()=>setIsPostModalOpen(false)} onPost={onPost}/>} */}
                </div>
            </div>
        </div>

    ) : (<GoLogin onClickGoLoginCustom={onClickGoLogin} />)
}

