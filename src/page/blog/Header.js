import React, {useState, useContext, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';
import axios from 'axios';

import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import UserImage from "../../common/UserImage.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import Modal from "../../common/Modal.js"
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

    const { b_id } = useParams()
    
    const blog_id = ToInteger(b_id)    

    const navigate = useNavigate()
            
    const refLabelTitle = useRef(null)
    const refImageCrop  = useRef(null)

    const [blog, setBlog] = useState(null)
    const [isBlogTitleModalOpen, setIsBlogTitleModalOpen] = useState(false)
    const [isModalImageCrop, setIsModalImageCrop] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    
    const blogImageWidth = 1920
    const blogImageHeight = 168

    useEffect(()=>{

        if(!blog_id){
            navigate('/pageNotFound')
            return
        }


        BlogAPI.getBlog(blog_id).then((blog)=> {

            if(blog == null){
                navigate('/pageNotFound')
                return
            }

            setBlog(blog)
        })

    }, [blog_id])


    const onClickNavigateUser = () => {

        if(!blog)
            return
        
        navigate('/user/' + blog.user_id)
    }


    const onClickEditTitle = async(e) => {

        if(!isEditable())
            return
 
        setIsBlogTitleModalOpen(true)
    }


    const isEditable = ()=> {

        return (validAuth(auth) && auth.blog_id == blog_id)
    }
    

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

        const canvas = await refImageCrop.current.export(blogImageWidth, blogImageHeight)
        
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
        
        setIsModalImageCrop(false)

        const blogClone = Object.assign({}, blog)
        blogClone.image = url
        setBlog(blogClone)        
    }


    const onInputBlogTitle = async(title) => {

        if(!isEditable())
            return
                        
        if(title == null || title == ''){
            window.showToast('제목이 없습니다', 'error')
            return
        }
                            
        const res = await BlogAPI.patchBlog(auth.jwt, auth.blog_id, {title:title})        
        
        if(res == null){
            window.showToast('블로그 제목 수정에 실패하였습니다', 'error')
            return
        }

        const blogClone = Object.assign({}, blog)
        blogClone.title = title
        setBlog(blogClone)
        window.showToast('블로그 제목 수정에 성공하였습니다', 'info')
    }


    const onClickNavigateHome = () =>{

        navigate('/')
    }

    return blog ? (
            <div style={{backgroundColor:' #494D5F', height:'168px', minHeight:'168px', backgroundImage:`url(` + blog.image + '?size=' + blogImageWidth + 'x' + blogImageHeight + `)`, backgroundSize:'cover', backgroundPosition:'center',  boxShadow: '0 4px 3px -3px black', display:'block'}}>
                <div style={{backgroundColor:'#00000080', display: 'flex', alignItems: 'center', height:'100%', padding:'0px 10px 0px 32px'}}>
                    <UserImage size={96} userId={blog.user_id} onClick={onClickNavigateUser}/>
                    <div style={{display: 'flex', alignItems: 'center', marginLeft:'32px', marginRight:'32px'}}>
                        <label className={'clamped-text'} ref={refLabelTitle} style={{'--line-count':2,  backgroundColor:'#00000000', color:'white', fontSize:'36px', paddingLeft:'9px', paddingRight:'9px', borderColor:'white', alignItems:'center', textOverflow:'ellipsis'}}>{blog.title}</label>
                        {isEditable() && <BeautyButton tooltip='제목 수정' type='transparent' onClick={onClickEditTitle}><MdEdit size={30}/></BeautyButton>}
                        <Modal title= {'블로그 제목을 입력하세요'} type={'input'} defaultValue={blog.title} isCloseOutsideClick={false} isOpen={isBlogTitleModalOpen} maxLength={256} onInput={onInputBlogTitle} onClose={()=>setIsBlogTitleModalOpen(false)}></Modal>
                        {isEditable() && <BeautyButton tooltip='배경 수정' type='transparent' onClick={onClickEditImage}> <RiImageAiFill size={30}/></BeautyButton>}
                        {imageFile && isModalImageCrop && <ImageCropModal ref={refImageCrop} isOpen={isModalImageCrop} onClose={()=>setIsModalImageCrop(false)} file={imageFile} onClickApply={onClickImageApply} keepRatio={blogImageWidth / blogImageHeight} selectMinWidth={blogImageHeight * 3}></ImageCropModal>}                        
                    </div>
                    <div style={{flex:1}}/>
                    <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickNavigateHome}/>
                </div>
            </div>
    ) : null
}

