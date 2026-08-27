import {useState, useContext, useEffect, useRef} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as BlobAPI from '@rest/BlobAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import * as UserAPI from '@rest/UserAPI.js'
import * as SubscribeAPI from '@rest/SubscribeAPI.js'
import AuthContext from "@util/AuthContext.js";
import ProfileImage from "@gui/ProfileImage.js";
import PrettyButton from "@gui/PrettyButton.js";
import CountWithUnit from "@util/CountWithUnit.js";
import Integer from "@util/Integer.js";
import ImagePicker from "@util/ImagePicker.js";
import {blobFromCanvas} from "@util/ImageUtil.js";
import ImageCropModal from '@gui/ImageCropModal.js'
import {Vertical, Horizental} from "@gui/Flex.js";
import Modal from '@gui/Modal.js'
import {HPad} from "@gui/Pad.js";

import { MdEdit } from "react-icons/md";
import { RiImageAiFill } from "react-icons/ri";


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
    const {auth, validAuth} = useContext(AuthContext)
    const [isSubscribe, setIsSubscribe] = useState(null)
    const [isSubscribeLoading, setIsSubscribeLoading] = useState(false)
    const [nickname, setNickname] = useState(null)
    const [subscribeCount, setSubscribeCount] = useState(null)

    useEffect(()=>{

        if(!blog_id){
            navigate('/notFound')
            return
        }


        BlogAPI.getBlog(blog_id).then((resBlog)=> {

            if(resBlog.success == false){
                navigate('/notFound')
                return
            }

            setBlog(resBlog.payload)

            UserAPI.getUser(resBlog.payload.user_id).then((resUser)=>{

                if(resUser.success == false)
                    return

                setNickname(resUser.payload.nickname)
            })
            
            const query = 'blog_id=' + blog_id

            SubscribeAPI.getSubscribe(query).then(res => {

                if(res.success == false)
                    return

                setSubscribeCount(res.payload.length)

                if(!validAuth(auth)){
                    setIsSubscribe(false)
                    return
                }

                setIsSubscribe(res.payload.findIndex(s => s.user_id === auth.user_id) != -1)
            })
        })

    }, [blog_id])


    const onClickNavigateBlog = (event) => {
    
        //event.stopPropagation()

        if(!blog)
            return
        
        navigate('/blog/' + blog.id)
    }


    const onClickEditTitle = async(event) => {

        //event.stopPropagation()

        if(!isEditable())
            return
 
        setIsBlogTitleModalOpen(true)
    }


    const isEditable = ()=> {

        return (validAuth(auth) && auth.blog_id == blog_id)
    }
    

    const onClickEditImage = async(event) =>{

        //event.stopPropagation()

        const imageFile = await ImagePicker()

        if(imageFile == null)
            return
        
        if(imageFile.format == 'unknown'){
            window.showToast('파일을 사용할 수 없습니다', 'user-error')
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

        if(resImage.success == false){
            setIsModalImageCrop(false)
            window.showToast('블로그 이미지 설정에 실패하였습니다', 'system-error')
            return
        }

        const url = process.env.API_TARGET + '/api/blob/blog/image/' + resImage.payload.id

        const res = await BlogAPI.patchBlog(auth.jwt, auth.blog_id, {image:url})
        
        if(res.success == false){
            window.showToast('블로그 이미지 설정에 실패하였습니다', 'system-error')
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
            window.showToast('제목이 없습니다', 'user-error')
            return
        }
                            
        const res = await BlogAPI.patchBlog(auth.jwt, auth.blog_id, {title:title})
        
        if(res.success == false){
            window.showToast('블로그 제목 수정에 실패하였습니다', 'system-error')
            return
        }

        const blogClone = Object.assign({}, blog)
        blogClone.title = title
        setBlog(blogClone)
        window.showToast('블로그 제목 수정에 성공하였습니다', 'info')
    }


    const onClickNavigateHome = (event) =>{

        //event.stopPropagation()

        navigate('/')
    }


    const onClickSubscribe = async(event)=> {

        //event.stopPropagation()

        if(!validAuth(auth)){
            window.showToast('로그인 해주세요', 'info')
            navigate('/', {state:{comback:true}})
            return
        }

        const query = 'user_id=' + auth.user_id + '&blog_id=' + blog_id

        setIsSubscribeLoading(true)

        const res = await SubscribeAPI.getSubscribe(query)

        if(res.success == false){
            setIsSubscribeLoading(false)
            window.showToast('구독 정보를 가져 올 수 없습니다', 'system-error')
            return
        }

        if(res.payload.length > 0){

            const resDelete = await SubscribeAPI.deleteSubscribe(auth.jwt, res.payload[0].id)

            setIsSubscribeLoading(false)

            if(resDelete.success == true){
                setIsSubscribe(false)
                setSubscribeCount(count => count - 1)
                window.showToast('구독을 취소하였습니다', 'info')
            }
            else
                window.showToast('구독 취소에 실패하였습니다', 'system-error')
        }
        else{

            const payload = {
                user_id:auth.user_id,
                blog_id:blog_id
            }

            const resPost = await SubscribeAPI.postSubscribe(auth.jwt, payload)

            setIsSubscribeLoading(false)

            if(resPost.success == true){
                setIsSubscribe(true)
                setSubscribeCount(count => count + 1)
                window.showToast('구독에 성공하였습니다', 'info')
            }
            else{
                window.showToast('구독에 실패하였습니다', 'system-error')
            }
        }
    }

    return blog ? (
            <div style={{backgroundColor:' #24262F', height:'168px', minHeight:'168px', backgroundImage: blog.image != '' && ('url(' + blog.image + '?size=1920x168)'), backgroundSize:'cover', backgroundPosition:'center',  boxShadow: '0 4px 2px -2px black',  position: 'relative'}}>
                <div style={{backgroundColor:'rgba(0, 0, 0, 0.5)', width:'100%', height:'100%', top:'0', left:'0', zIndex:'10'}}>
                <Horizental style={{alignItems: 'center', height:'100%', padding:'0px 8px 0px 32px'}}>
                    <ProfileImage size={96} shape={'circle'} userId={blog.user_id} onClick={onClickNavigateBlog}/>
                    <Vertical style={{marginLeft:'32px', marginRight:'32px'}}>
                        <Horizental style={{alignItems: 'center'}}>
                            <label style={{color:'lightgray', whiteSpace:'pre-wrap'}}>{nickname != null ? '@' + nickname: ' ' }</label>
                            <label style={{color:'lightgray', whiteSpace:'pre-wrap'}}>{'  •  '}</label>
                            <label style={{color:'lightgray', whiteSpace:'pre-wrap'}}>{'구독자 ' + (subscribeCount != null ? CountWithUnit(subscribeCount) : '')}</label>
                            <HPad size={8}/>
                            {!isEditable() && isSubscribe != null && <PrettyButton tooltip='구독' type='default' isLoading={isSubscribeLoading} onClick={onClickSubscribe} style={{minWidth:'64px'}}>{isSubscribe ? '구독중' : '블로그 구독'}</PrettyButton>}
                        </Horizental>
                        <Horizental style={{alignItems: 'center'}}>
                            <div className={'clamped-text'} ref={refLabelTitle} style={{'--line-count':1, color:'white', fontSize:'24px', borderColor:'white'}}>{blog.title}</div>
                            {isEditable() && <Horizental>
                                <HPad size={8}/>
                                <PrettyButton tooltip='제목 수정' type='transparent' onClick={onClickEditTitle}><MdEdit size={30}/></PrettyButton>
                                <Modal title= {'블로그 제목을 입력하세요'} type={'input'} defaultValue={blog.title} isCloseOutsideClick={false} isOpen={isBlogTitleModalOpen} maxLength={256} onInput={onInputBlogTitle} onClose={()=>setIsBlogTitleModalOpen(false)}></Modal>
                                <HPad size={8}/>
                                <PrettyButton tooltip='배경 수정' type='transparent' onClick={onClickEditImage}><RiImageAiFill size={30}/></PrettyButton>
                                {imageFile && isModalImageCrop && <ImageCropModal ref={refImageCrop} isOpen={isModalImageCrop} onClose={()=>setIsModalImageCrop(false)} file={imageFile} onClickApply={onClickImageApply} keepRatio={1.7}></ImageCropModal>}
                            </Horizental>}
                        </Horizental>
                    </Vertical>
                    <div style={{flex:1}}/>
                    <img src='/logo/logo.svg' alt='logo' style={{height:'64px', width:'64px'}} onClick={onClickNavigateHome}/>
                </Horizental>
                </div>
            </div>
    ) : <div style={{backgroundColor:' #24262F', height:'168px', minHeight:'168px', boxShadow: '0 4px 3px -3px black', display:'block'}}></div>
}
