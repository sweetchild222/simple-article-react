
import React, {useState, useContext, useEffect, useRef } from "react";

import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams} from 'react-router-dom';


import * as BlobAPI from '../../api/BlobAPI.js'
import * as BlogAPI from '../../api/BlogAPI.js'
import * as ArticleAPI from '../../api/ArticleAPI.js'

import AuthContext from "../../util/AuthContext.js";
import LoadingImage from "../../common/LoadingImage.js";
import Modal from "../../common/Modal.js";
import BeautyButton from "../../common/BeautyButton.js";
import ToInteger from "../../util/ToInteger.js";
import TimestampToString from "../../util/TimestampToString.js";
import CountWithUnit from "../../util/CountWithUnit.js";


import ArticleItem from "./ArticleItem.js";
import { FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CategoryModal from '../../common/CategoryModal.js'
import OverlayLoading from "../../common/OverlayLoading.js";
import './Home.css'
import Categories  from "./Categories.js";
import Recents  from "./Recents.js";
import Pagination from "./Pagination.js";
import MarkdownToHtml from '../../util/MarkdownToHtml.js'

import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";

export default function() {

    const { b_id, a_id } = useParams()

    const blog_id = ToInteger(b_id)
    const article_id = ToInteger(a_id)

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [article, setArticle] = useState(null)
    const [isGreatLoading, setIsGreatLoading] = useState(false)
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    
    const navigate = useNavigate()

    useEffect(()=>{

        ArticleAPI.getArticle(validAuth(auth) ? auth.jwt : null, article_id).then((article) => {

            if(article == null){
                navigate('/pageNotFound')
                return
            }

            if(article.posted == 0){
                navigate('/pageNotFound')
                return
            }

            if(blog_id != article.blog_id){
                navigate('/pageNotFound')
                return
            }
        
            setArticle(article)

            ArticleAPI.postArticleShowed(article_id).then((showed) => {
                
                if(showed != null)
                    article.showed += 1
                
                setArticle(structuredClone(article))
            })            
        })

    }, [auth, blog_id, article_id])


    const isEditable = ()=> {
    
        return (validAuth(auth) && auth.blog_id == blog_id)
    }


    const onCLickEdit = async() => {
        
        if(!isEditable())
            return 
        
        const res = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, 'source_id=' + article.id + '&posted=0')

        if(res == null) {
            window.showToast('수정 본을 찾는데 실패했습니다', 'error')
            return
        }

        const copiedArticle = res.length > 0 ? res[0] : null
        
        const payload = {
            title:article.title,
            content:article.content,
            head:article.head,
            posted:0,
            thumbnail:article.thumbnail,
            category_id:article.category_id,
            source_id:copiedArticle ? copiedArticle.source_id : article.id
        }        

        if(!copiedArticle){
                        
            const resPost = await ArticleAPI.postArticle(auth.jwt, payload)

            if(resPost == null){                
                window.showToast('수정 본 생성에 실패 했습니다', 'error')
                return
            }

            window.showToast('수정 본 생성에 성공하였습니다', 'info')

            const state = {id:resPost.id, ...payload}

            navigate('/blog/' + auth.blog_id + '/write', {state:state})
        }
        else{

            window.showToast('이미 수정 중인 글로 이동합니다', 'info')

            const state = {id:copiedArticle.id, ...payload}            

            navigate('/blog/' + auth.blog_id + '/write', {state:state})
        }    
    }

    const onCLickDelete = async() => {

        setIsConfirmDeleteModalOpen(true)
    }


    const onResultConfirmDelete = async(result) =>{

        if(!isEditable())
            return

        if(result == true){
            
            const res = await ArticleAPI.deleteArticle(auth.jwt, article_id)
            
            if(res == null){
                window.showToast('삭제가 실패 하였습니다', 'error')
                return
            }

            window.showToast('삭제 되었습니다', 'info')

            navigate(-1)
        }
    }



    const onClickGreat = async() =>{

        if(!validAuth(auth)) {
            navigate('/account', {state:{relogin:true}})
            return
        }

        const query = 'user_id=' + auth.user_id + '&article_id=' + article_id

        setIsGreatLoading(true)

        const resGreat = await ArticleAPI.getArticleGreat(auth.jwt, query)

        if(resGreat == null){
            setIsGreatLoading(false)
            window.showToast('좋아요 상태를 가져오기 실패 하였습니다', 'error')
            return
        }

        if(resGreat.length == 0){

            const payload = {
                user_id:auth.user_id,
                article_id:article_id
            }

            const res = await ArticleAPI.postArticleGreat(auth.jwt, payload)            

            if(res == null){
                setIsGreatLoading(false)
                window.showToast('좋아요 실패 하였습니다', 'error')                
                return
            }


            article.great_count += 1
            setArticle(structuredClone(article))
            setIsGreatLoading(false)
            window.showToast('좋아요 성공 하였습니다', 'info')
        }
        else{

            const res = await ArticleAPI.deleteArticleGreat(auth.jwt, resGreat[0].id)

            if(res == null){
                setIsGreatLoading(false)
                window.showToast('좋아요 취소가 실패 하였습니다', 'error')                
                return
            }

            article.great_count -= 1
            setArticle(structuredClone(article))            
            setIsGreatLoading(false)
            window.showToast('좋아요 취소가 성공 하였습니다', 'info')                       
        }
    }

    return article ? (<div style={{display:'flex', flexDirection: 'row', justifyContent:'center', marginTop:'20px'}}>
        <div style={{width:'2px', marginRight:'20px'}}/>
            <div style={{display:'flex', flexDirection: 'column', alignItems:'center', width:'100%', minWidth:'960px', maxWidth:'960px'}}>
                <div className={'clamped-text'} style={{'--line-count':3, fontSize:'26px'}}>{article.title}</div>
                <div style={{height:'30px', display:'flex', flexDirection: 'row', width:'100%'}}>
                    {isEditable() && <BeautyButton onClick={onCLickEdit}>{'수정'}</BeautyButton>}
                    {isEditable() && <BeautyButton onClick={onCLickDelete}>{'삭제'}</BeautyButton>}
                    {isEditable() && <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>}
                    <div style={{whiteSpace: 'nowrap'}} >{article.post_at ? TimestampToString(article.post_at) : ''}</div>
                    <div style={{display: 'flex', flexDirection: 'row', marginRight:'20px'}}>
                        <TiEye size={22}/>
                        <div style={{width:'48px', marginLeft:'5px'}}>{CountWithUnit(article.showed)}</div>
                    </div>

                    <BeautyButton isLoading={isGreatLoading} title={'좋아요'} style={{display: 'flex', flexDirection: 'row', marginRight:'20px'}} onClick={onClickGreat}>
                        <MdThumbUpAlt size={22}/>
                        <div style={{width:'48px', marginLeft:'5px'}}>{CountWithUnit(article.great_count)}</div>
                    </BeautyButton>
                    <div>{'adsfsd'}</div>
                    <div>{'adsfsd'}</div>
                    <div>{'adsfsd'}</div>

                </div>
                <div style={{height:'1px', backgroundColor:'lightgray', width:'100%'}}></div>
                <div style={{height:'30px'}}></div>
                <LoadingImage src={article.thumbnail + '?size=960x540'} width={960} height={540} borderWidth={0}/>
                <div style={{height:'30px'}}></div>
                <div dangerouslySetInnerHTML={{__html: MarkdownToHtml(article.content)}} style={{wordBreak:'break-all', width:'100%'}}/>
            </div>
        <div style={{width:'2px', marginLeft:'20px'}}/>
        </div>) : <OverlayLoading/>
}
