
import {useState, useContext, useEffect, useRef} from "react";

import {useNavigate, useParams} from 'react-router-dom';

import * as ArticleAPI from '../../../api/ArticleAPI.js'
import * as ArticleGreatAPI from '../../../api/ArticleGreatAPI.js'

import AuthContext from "../../../util/AuthContext.js";
import LoadingImage from "../../../common/LoadingImage.js";
import Modal from "../../../common/Modal.js";
import BeautyButton from "../../../common/BeautyButton.js";
import ToInteger from "../../../util/ToInteger.js";
import TimestampToString from "../../../util/TimestampToString.js";
import CountWithUnit from "../../../util/CountWithUnit.js";

import CommentList from "./comment/CommentList.js"
import OverlayLoading from "../../../common/OverlayLoading.js";
import MarkdownToHtml from '../../../util/MarkdownToHtml.js'

import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { MdThumbDownAlt } from "react-icons/md";
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
        
            article.showed += 1
            setArticle(article)

            ArticleAPI.postArticleShowed(article_id).then((showed) => {

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


    const postGreat = async(jwt, user_id, article_id, like) =>{

        const payload = {
            user_id:auth.user_id,
            article_id:article_id,
            great:like
        }

        setIsGreatLoading(true)

        const res = await ArticleGreatAPI.postArticleGreat(auth.jwt, payload)

        setIsGreatLoading(false)

        if(res == null)
            return null

        return res
    }


    const getGreat = async(user_id, article_id) =>{

        setIsGreatLoading(true)

        const query = 'user_id=' + user_id + '&article_id=' + article_id

        const resGreat = await ArticleGreatAPI.getArticleGreat(query)

        setIsGreatLoading(false)

        if(resGreat == null)
            return null

        return resGreat
    }


    const deleteGreat = async(jwt, id) =>{

        setIsGreatLoading(true)

        const res = await ArticleGreatAPI.deleteArticleGreat(auth.jwt, id)

        setIsGreatLoading(false)

        return res
    }


    const patchGreat = async(jwt, id, great) =>{

        const payload = {
            great:great
        }

        setIsGreatLoading(true)

        const res = await ArticleGreatAPI.patchArticleGreat(auth.jwt, id, payload)

        setIsGreatLoading(false)

        return res

    }


    const updateGreat = async(great) =>{

        if(!validAuth(auth))
            return false
        
        const resGreat = await getGreat(auth.user_id, article_id)

        if(resGreat == null)
            return false        

        if(resGreat.length > 0){            

            if(resGreat[0].great != great) {
                
                const res = await patchGreat(auth.jwt, resGreat[0].id, great)

                if(res == null){
                    window.showToast((great == 1 ? '좋아요 에서 싫어요로' : '싫어요 에서 좋아요로') + '로 변경에 실패 하였습니다', 'error')
                    return false
                }

                if(great == 1){
                    article.like_count += 1
                    article.dislike_count -= 1
                }
                else if(great == -1){
                    article.like_count -= 1
                    article.dislike_count += 1
                }
                else 
                    return false

                window.showToast((great == 1 ? '좋아요 에서 싫어요로' : '싫어요 에서 좋아요로') + '로 변경 하였습니다', 'info')
                setArticle(structuredClone(article))

                return true

            }else {

                const res = await deleteGreat(auth.jwt, resGreat[0].id)

                if(res == null){
                    window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 실패 하였습니다', 'error')
                    return false
                }

                if(great == 1)
                    article.like_count -= 1
                else if(great == -1)
                    article.dislike_count -= 1
                else 
                    return false

                window.showToast((great == 1 ? '좋아요' : '싫어요') + '취소를 성공 하였습니다', 'info')
                setArticle(structuredClone(article))

                return true
            }
        }
        else{
            
            const res = await postGreat(auth.jwt, auth.user_id, article_id, great)

            if(!res){
                window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 실패 하였습니다', 'error')
                return false
            }
            
            if(great == 1)
                article.like_count += 1
            else if(great == -1)
                article.dislike_count += 1
            else
                return false

            setArticle(structuredClone(article))
            window.showToast((great == 1 ? '좋아요' : '싫어요') + '에 성공 하였습니다', 'info')
            
            return true
        }
    }



    const onClickLike = async() =>{

        const success = await updateGreat(1)

        console.log(success)
        
    }


    const onClickDislike = async() =>{

        const success = await updateGreat(-1)

        console.log(success)
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
                        <div>{CountWithUnit(article.showed)}</div>
                    </div>
                    <BeautyButton isLoading={isGreatLoading} type={'transparent'} title={'좋아요'} style={{color:'black', display: 'flex', flexDirection: 'row', marginRight:'20px'}} onClick={onClickLike}>
                        <MdThumbUpAlt size={22}/>
                        <div>{CountWithUnit(article.like_count)}</div>
                    </BeautyButton>

                    <BeautyButton isLoading={isGreatLoading} type={'transparent'} title={'싫어요'} style={{color:'black', display: 'flex', flexDirection: 'row', marginRight:'20px'}} onClick={onClickDislike}>
                        <MdThumbDownAlt size={22}/>
                        <div>{CountWithUnit(article.dislike_count)}</div>
                    </BeautyButton>
                </div>
                <div style={{height:'1px', backgroundColor:'lightgray', width:'100%'}}></div>
                <div style={{height:'30px'}}></div>
                {article.thumbnail != '' && <LoadingImage src={article.thumbnail + '?size=960x540'} width={960} height={540} borderWidth={0}/>}
                <div style={{height:'30px'}}></div>
                <div dangerouslySetInnerHTML={{__html: MarkdownToHtml(article.content)}} style={{wordBreak:'break-all', width:'100%', backgroundColor:'lightpink'}}/>
                <CommentList article_id={article_id}/>
            </div>
        <div style={{width:'2px', marginLeft:'20px'}}/>
        </div>) : <OverlayLoading/>
}
