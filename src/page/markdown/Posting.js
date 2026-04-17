
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
import LoadingImage from "../../common/LoadingImage.js";

import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import '../../common/RotateLoading.css'

import MarkdownToHtml from '../../util/MarkdownToHtml.js'


export default function() {
    
    const location = useLocation()
    const smapleData = ["1번", "2번", "3번", "4번"];

    if(location.state == null)
        return (<div>잘못된 방식으로 접근하였습니다</div>)
    
    const refTitle = useRef(null)
    const refPreview = useRef(null)
    const refImageCrop = useRef(null)    

    const [isOverlayLoading, setIsOverlayLoading] = useState(false)    
    const [imageFile, setImageFile] = useState(null)
    
    const [thumbnail, setThumbnail] = useState(location.state.thumbnail)
    const [title, setTitle] = useState(location.state.title)
    const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false)
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
    const [categories, setCategories] = useState(null)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const [openType, setOpenType] = useState(location.state.open)
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)

    const onChangeRadio = (e) => {        

        setOpenType(e.target.value == 'open' ? 1 : 0)
    }


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

            const index = categories.findIndex(categorie => categorie.id === location.state.category_id)

            if(index != -1)
                setSelectedCategoryIndex(index)
        })

    }, [])

    

    const getCategory = async() => {

        const res = await ArticleAPI.getUserCategories(auth.jwt, auth.user_id)
        
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

        if(!refImageCrop.current)
            return
    
        const rect = refImageCrop.current.rect()
        const image = refImageCrop.current.image()

        const dWidth = 192
        const dHeight = 128

        const canvas = await drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, dWidth, dHeight)
        
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

        const payloadSource = location.state

        console.log(payloadSource)

        if(refTitle.current == null)
            return null
                
        const article_id = payloadSource.id
        const title = refTitle.current.value
        const content = payloadSource.content

        if(!title || title.trim().length === 0){
            window.showToast('제목을 입력하세요', 'error')
            return
        }

        if(thumbnail == '') {
            window.showToast('대표 이미지를 설정하세요', 'error')
            return
        }
        
        const thumbnailUrl = await postThumbnail(thumbnail)

        if(thumbnailUrl == null) {
            window.showToast('대표 이미지 설정에 실패하였습니다', 'error')
            return 
        }
        
        const posted = 1

        if(!categories) {
            window.showToast('카테고리가 설정되지 않았습니다', 'error')
            return 
        }

        const category_id = categories[selectedCategoryIndex].id
                        
        setIsOverlayLoading(true)

        const res = await putArticle(article_id, title, content, thumbnailUrl, openType, posted, category_id)

        setIsOverlayLoading(false)

        if(res == null){
            window.showToast('글 게시에 실패하였습니다', 'error')
            return null
        }

        // navigate(-1)
    }

    

    return validAuth(auth) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {/* {!isOverlayLoading && <div style={{width:'100%', height:'100%', position: 'absolute', zIndex: 10, backgroundColor:'rgba(0, 0, 0, 0.5)'}} className={`rotateLoading`}/>} */}
            <label htmlFor='input_title'>제목</label>
            <input ref={refTitle} id='input_title' type='text' defaultValue={title}></input>

            <select style={{width:'100px'}} value={categories ? categories[selectedCategoryIndex].name : ''} onChange={onChangeCategory}>
                {categories && categories.map((data, index) => <option key={data.id}>{data.name}</option>)}                
            </select>


            <input type='radio' id='open' name='is_open' value='open' onChange={onChangeRadio} checked={openType == true}/>
            <label htmlFor='open'>공개</label>
            <input type='radio' id='private' name='is_open' value='private' onChange={onChangeRadio} checked={openType == false}/>
            <label htmlFor='private'>비공개</label>

            <LoadingImage src={thumbnail} onClick={onClickThumbnail} width={192} height={128}/>
            {imageFile && <ImageCropModal ref={refImageCrop} isOpen={isImageCropModalOpen} onClose={()=>setIsImageCropModalOpen(false)} file={imageFile} onClickApply={onClickApply} keepRatio={1.5}></ImageCropModal>}
    
            <BeautyButton type='success' onClick={onClickPost}>다음</BeautyButton>
            <BeautyButton type='success'>뒤로가기</BeautyButton>
        </div>
        ) : (<GoLogin/>)


    // return validAuth(auth) ? (
    //     <div style={{flex:1, position: 'relative', margin:'0px 20px 0px 20px'}}>
    //         {isOverlayLoading && <div style={{width:'100%', height:'100%', position: 'absolute', zIndex: 10, backgroundColor:'rgba(0, 0, 0, 0.5)'}} className={`rotateLoading`}/>}
    //         <div style={{position: 'absolute', width:'100%', height:'100%', display: 'flex', flexDirection: 'column'}}>
    //             <div style={{overflowY:'auto', minWidth:'10%', width: '100%', flex: 1, border:'1px solid lightgray', borderRadius:'4px', margin:'0px 5px 5px 5px'}}>
    //                 <div ref={refPreview}  style={{margin:'10px'}}/>
    //             </div>                    
    //             <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flex: 0, margin:'20px 5px 20px 5px',  alignItems: 'center'}}>
    //                 <BeautyButton type='danger' style={{marginRight:'10px'}} onClick={onClickLeave}>뒤로 가기</BeautyButton>
    //                 <BeautyButton type='confirm' style={{marginRight:'10px'}} onClick={onClickPost}>올리기</BeautyButton>                                        
    //                 {/* {categories != null && <PostModal categories={categories} isOpen={isPostModalOpen} onClose={()=>setIsPostModalOpen(false)} onPost={onPost}/>} */}
    //             </div>
    //         </div>
    //     </div>

    // ) : (<GoLogin onClickGoLoginCustom={onClickGoLogin} />)
}

