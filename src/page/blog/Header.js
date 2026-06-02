import {useState, useContext, useEffect, useRef} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as BlobAPI from '@rest/BlobAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'

import AuthContext from "@util/AuthContext.js";
import ProfileImage from "@gui/ProfileImage.js";
import PrettyButton from "@gui/PrettyButton.js";
import Integer from "@util/Integer.js";


import { MdEdit } from "react-icons/md";
import { RiImageAiFill } from "react-icons/ri";
import ImagePicker from "@util/ImagePicker.js";
import {blobFromCanvas} from "@util/ImageUtil.js";
import ImageCropModal from '@gui/ImageCropModal.js'
import Modal from '@gui/Modal.js'


export default function() {

    const { b_id } = useParams()
    
    const blog_id = Integer(b_id)

    const navigate = useNavigate()

    const refLabelTitle = useRef(null)
    const refImageCrop  = useRef(null)

    const [blog, setBlog] = useState(null)
    const [isBlogTitleModalOpen, setIsBlogTitleModalOpen] = useState(false)
    const [isModalImageCrop, setIsModalImageCrop] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)    

    useEffect(()=>{

        if(!blog_id){
            navigate('/notFound')
            return
        }


        BlogAPI.getBlog(blog_id).then((blog)=> {

            if(blog == null){
                navigate('/notFound')
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

        const imageFile = await ImagePicker()

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

        const imageWidth = 1920
        const imageHeight = 1080

        const canvas = await refImageCrop.current.export(imageWidth, imageHeight)
        
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
            <div style={{backgroundColor:' #494D5F', height:'168px', minHeight:'168px', backgroundImage:`url(` + blog.image + '?size=1920x168', backgroundSize:'cover', backgroundPosition:'center',  boxShadow: '0 4px 3px -3px black', display:'block'}}>
                <div style={{backgroundColor:'#00000080', display: 'flex', alignItems: 'center', height:'100%', padding:'0px 10px 0px 32px'}}>
                    <ProfileImage size={96} shape={'circle'} userId={blog.user_id} onClick={onClickNavigateUser}/>
                    <div style={{display: 'flex', alignItems: 'center', marginLeft:'32px', marginRight:'32px'}}>
                        <label className={'clamped-text'} ref={refLabelTitle} style={{'--line-count':2,  backgroundColor:'#00000000', color:'white', fontSize:'36px', paddingLeft:'9px', paddingRight:'9px', borderColor:'white', alignItems:'center', textOverflow:'ellipsis'}}>{blog.title}</label>
                        {isEditable() && <PrettyButton tooltip='제목 수정' type='transparent' onClick={onClickEditTitle}><MdEdit size={30}/></PrettyButton>}
                        <Modal title= {'블로그 제목을 입력하세요'} type={'input'} defaultValue={blog.title} isCloseOutsideClick={false} isOpen={isBlogTitleModalOpen} maxLength={256} onInput={onInputBlogTitle} onClose={()=>setIsBlogTitleModalOpen(false)}></Modal>
                        {isEditable() && <PrettyButton tooltip='배경 수정' type='transparent' onClick={onClickEditImage}> <RiImageAiFill size={30}/></PrettyButton>}
                        {imageFile && isModalImageCrop && <ImageCropModal ref={refImageCrop} isOpen={isModalImageCrop} onClose={()=>setIsModalImageCrop(false)} file={imageFile} onClickApply={onClickImageApply} keepRatio={1.7}></ImageCropModal>}
                    </div>
                    <div style={{flex:1}}/>
                    <img src='/logo/logo.svg' alt='logo' height='64px' width='64px' onClick={onClickNavigateHome}/>
                </div>
            </div>
    ) : null
}

