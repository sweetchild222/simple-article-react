import React, {useState, useContext, useEffect, useRef, useCallback } from "react";
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';
import AuthContext from "../../util/AuthContext.js";

import LoadingImage from "../../common/LoadingImage.js";
import ProfileImage from "../../common/ProfileImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import * as UserAPI from '../../api/UserAPI.js'
import { PiTrash } from "react-icons/pi";
import { CiYoutube } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { RiImageAiFill } from "react-icons/ri";
import { CgImage } from "react-icons/cg";
import { FiUpload } from "react-icons/fi";

import {pickImageFile, getImageFormat} from "../../util/ImagePicker.js";
import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import ImageCropModal from '../../common/ImageCropModal.js'

export default function() {

    const { id } = useParams()

    const navigate = useNavigate()
    
    const location = useLocation()
    const state = location.state
    const editMode = state == null ? false : state.editMode
    
    const refInputTitle = useRef(null)
    const refLabelTitle = useRef(null)
    const refImageCrop  = useRef(null)

    const [title, setTitle] = useState(null)
    const [isLoadingTitle, setIsLoadingTitle] = useState(null)
    const [titleEditMode, setTitleEditMode] = useState(false)
    
    const [otherId, setOtherId] = useState(null)
    const [userId, setUserId] = useState(null)
    const [blogImage, setBlogImage] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [isModalImageCrop, setIsModalImageCrop] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const [reloadKey, setReloadKey] = useState(0)

    useEffect(()=>{

        if(!Number.isInteger(parseInt(id))){
            navigate('/pageNotFound')
            return
        }

        if(validAuth(auth)){
            setIsLoggedIn(true)
            setUserId(auth.user_id)
            setReloadKey(prev => prev + 1)
        }
        else{
            setIsLoggedIn(false)
        }

        if(editMode){

            if(!(validAuth(auth) && auth.blog_id == parseInt(id))){
                navigate('/')
                return
            }
        }

        BlogAPI.getBlog(id).then((blog)=> {
                        
            if(blog == null){
                navigate('/pageNotFound')
                return
            }

            if(editMode){

                if((auth.user_id != blog.user_id)){

                    navigate('/')
                    return
                }
            }

            setTitle(blog.title)
            setBlogImage(blog.image + '?size=1920x320')
            setOtherId(blog.user_id)            
        })

    }, [auth, id])


    const onClickNavigateBlog = () => {

        navigate('/blog/' + id)    
    }


    const onClickNavigateUser = () =>{

        if(validAuth(auth))
            navigate('/user')
        else
            navigate('/login')
    }


    const onClickNavigateLogin = () =>{

        navigate('/login')

    }


    useEffect(()=>{

        if(titleEditMode){
            if(refInputTitle.current)
                refInputTitle.current.focus()
        }

    }, [titleEditMode])



    const getTitle = () =>{

        if(refInputTitle.current == null)
            return null
        
        const title = refInputTitle.current.value
    
        if(title == '')
            return null

        return title
    }



    const onClickEditTitle = async(e) => {

        if(!isEditable())
            return

        e.stopPropagation()
        
        if(titleEditMode){

            const title = getTitle()
            
            if(title == null){
                window.showToast('제목이 없습니다', 'error')
                return
            }
        
            if(!validAuth(auth))
                return

            setIsLoadingTitle(true)
            
            const res = await BlogAPI.patchBlog(auth.jwt, auth.blog_id, {title:title})

            setIsLoadingTitle(false)
        
            if(res == null){
                window.showToast('제목 수정에 실패하였습니다', 'error')
                return
            }
            
            setTitle(title)

            setTitleEditMode(false)
        }
        else{
            setTitleEditMode(true)
        }
    }

    const isEditable = ()=> {

        return (editMode && validAuth(auth) && auth.blog_id == parseInt(id))
    }
    

    const onClickOutside = useCallback((e) => {

        if(!isEditable())
            return

        if(refInputTitle.current == null)
            return

        if(!refInputTitle.current.contains(e.target))
            setTitleEditMode(false)
    })
    

    useEffect(() => {
        
        window.addEventListener('click', onClickOutside)
        
        return () => {

            window.removeEventListener('click', onClickOutside)
        }
    
    }, [onClickOutside])



    const onClickEditImage = async() =>{

        const imageFile = await pickImageFile()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'error')
            return
        }
        
        setImageFile(imageFile.file)

        setIsModalImageCrop(true)        
    }


    const onClickImageApply = async() => {

        if(!isEditable())
            return

        if(refImageCrop.current == null)
            return

        const dWidth = 1920
        const dHeight = 320

        const canvas = await refImageCrop.current.export(dWidth, dHeight)
        
        const blob = await blobFromCanvas(canvas)

        const formData = new FormData()
        formData.append('image', blob)
        
        const resImage = await BlobAPI.postBlogImage(auth.jwt, formData)

        if(resImage == null){
            setIsModalImageCrop(false)
            window.showToast('블로그 이미지 설정에 실패했습니다', 'error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/blog/image/' + resImage.id

        const res = await BlogAPI.patchBlog(auth.jwt, auth.blog_id, {image:url})
        
        if(res == null){
            window.showToast('블로그 이미지 설정에 실패했습니다', 'error')
            return
        }

        setBlogImage(url + '?size=1920x320')
        setIsModalImageCrop(false)
    }


    return (
            <div style={{backgroundColor:' #494D5F', height:'320px', backgroundImage:`url(` + blogImage + `)`, backgroundSize:'cover', backgroundPosition:'center'}}>
                <div style={{backgroundColor:'#00000080', display: 'flex', alignItems: 'center', height:'100%', padding:'0px 10px 0px 32px'}}>
                    <ProfileImage userId={otherId} onClick={onClickNavigateBlog}/>
                    <div style={{display: 'flex', alignItems: 'center', marginLeft:'32px'}}>
                        {titleEditMode && <input ref={refInputTitle} style={{backgroundColor:'#00000080', color:'white', fontSize:'48px', borderColor:'white', fieldSizing:'content', minWidth:'512px', maxWidth:'1024px'}} placeholder="제목" maxLength="40" defaultValue={title}></input>}
                        {!titleEditMode && <label ref={refLabelTitle} style={{backgroundColor:'#00000000', color:'white', fontSize:'48px', paddingLeft:'9px', paddingRight:'9px', borderColor:'white', alignItems:'center', textOverflow:'ellipsis', overflow:'hidden', minWidth:'512px', maxWidth:'1024px'}}>{title}</label>}
                        {isEditable() && <BeautyButton tooltip='제목 수정' type='transparent' isLoading={isLoadingTitle} onClick={onClickEditTitle}>{titleEditMode ? <FaCheck size={30}/> : <MdEdit size={30}/>}</BeautyButton>}
                    </div>
                    <div style={{flex:1}}/>
                    <div style={{display: 'flex', flexDirection:'column', height:'100%', justifyContent:'center'}}>
                        {!isLoggedIn && <BeautyButton type='confirm' onClick={onClickNavigateLogin} style={{alignSelf:"flex-start", marginBottom:'auto', marginTop:'32px'}}>로그인</BeautyButton>}
                        {isLoggedIn && <ProfileImage key={reloadKey} userId={userId} height={64} width={64} borderWidth={0} borderRadius={32} onClick={onClickNavigateUser} style={{alignSelf:"flex-start", marginBottom:'auto', marginTop:'10px'}}/>}
                        {isEditable() && <BeautyButton tooltip='배경 수정' type='transparent' onClick={onClickEditImage} style={{position: 'absolute', alignSelf:"center"}}> <RiImageAiFill size={30}/></BeautyButton>}
                        {imageFile && isModalImageCrop && <ImageCropModal ref={refImageCrop} isOpen={isModalImageCrop} onClose={()=>setIsModalImageCrop(false)} file={imageFile} onClickApply={onClickImageApply} keepRatio={7.5} selectMinWidth={320}></ImageCropModal>}
                    </div>
                </div>
            </div>
    )
}

