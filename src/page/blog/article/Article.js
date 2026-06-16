
import {useState, useContext, useEffect} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'
import * as ArticleGreatAPI from '@rest/ArticleGreatAPI.js'

import AuthContext from "@util/AuthContext.js";
import Integer from "@util/Integer.js";
import ElapsedTime from "@util/ElapsedTime.js";
import CountWithUnit from "@util/CountWithUnit.js";
import MarkdownToHtml from '@util/MarkdownToHtml.js'


import Modal from "@gui/Modal.js";
import StateProgsImage from "@gui/StateProgsImage.js";
import PrettyButton from "@gui/PrettyButton.js";
import {Horizental, Vertical} from "@gui/Flex.js";
import OverlayProgress from "@gui/OverlayProgress.js";


import Great from "./Great.js"
import CommentList from "./comment/CommentList.js"


import { TiEye } from "react-icons/ti";


export default function() {

    const { b_id, a_id } = useParams()

    const blog_id = Integer(b_id)
    const article_id = Integer(a_id)

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [article, setArticle] = useState(null)    
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    const [isEditLoading, setIsEditLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const [category, setCategory] = useState(null)
    
    const navigate = useNavigate()

    useEffect(()=>{

        ArticleAPI.getArticle(validAuth(auth) ? auth.jwt : null, article_id).then((article) => {

            if(article == null){
                navigate('/notFound')
                return
            }

            if(article.posted == 0){
                navigate('/notFound')
                return
            }

            if(blog_id != article.blog_id){
                navigate('/notFound')
                return
            }

            CategoryAPI.getCategory(article.category_id).then(category => {

                if(!category){
                    navigate('/notFound')
                    return
                }

                setArticle(article)
                setCategory(category)                

                ArticleAPI.postArticleShowed(article_id).then(showed => {
                    
                    if(showed != null){
                        article.showed += 1
                        setArticle(structuredClone(article))
                    }
                })
            })
        })

    }, [auth, blog_id, article_id])

    const isEditable = ()=> {
    
        return (validAuth(auth) && auth.blog_id == blog_id)
    }


    const onClickEdit = async() => {
        
        if(!isEditable())
            return

        setIsEditLoading(true)
        
        const res = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, 'source_id=' + article.id + '&posted=0')

        if(res == null) {
            setIsEditLoading(false)
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
                setIsEditLoading(false)
                window.showToast('수정 본 생성에 실패 했습니다', 'error')
                return
            }

            setIsEditLoading(false)
            window.showToast('수정 본 생성에 성공하였습니다', 'info')
            const state = {id:resPost.id, ...payload}

            navigate('/blog/' + auth.blog_id + '/write', {state:state})
        }
        else{
            setIsEditLoading(false)
            window.showToast('이미 수정 중인 글로 이동합니다', 'info')
            const state = {id:copiedArticle.id, ...payload}
            navigate('/blog/' + auth.blog_id + '/write', {state:state})
        }    
    }

    const onClickDelete = async() => {

        setIsConfirmDeleteModalOpen(true)
    }


    const onResultConfirmDelete = async(result) =>{

        if(!isEditable())
            return

        if(result == true){

            setIsDeleteLoading(true)
            
            const res = await ArticleAPI.deleteArticle(auth.jwt, article_id)

            setIsDeleteLoading(false)
            
            if(res == null){                
                window.showToast('삭제가 실패 하였습니다', 'error')
                return
            }

            window.showToast('삭제 되었습니다', 'info')
            navigate(-1)
        }
    }


    const onClickNavigateCategory = async() =>{

        navigate('/blog/' + b_id, {state:{category_id:category.id}})
    }


    return article ? (<Vertical style={{justifyContent:'center', marginTop:'20px'}}>
        <div style={{width:'2px', marginRight:'20px'}}/>
            <Horizental style={{alignItems:'center', width:'100%', minWidth:'960px', maxWidth:'960px'}}>
                <div className={'clamped-text'} style={{'--line-count':3, fontSize:'26px'}}>{article.title}</div>
                <Vertical style={{height:'30px', width:'100%', alignItems:'center'}}>
                    {isEditable() && <PrettyButton isLoading={isEditLoading} onClick={onClickEdit}>{'수정'}</PrettyButton>}
                    {isEditable() && <PrettyButton isLoading={isDeleteLoading} onClick={onClickDelete}>{'삭제'}</PrettyButton>}
                    {isEditable() && <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>}
                    <div style={{whiteSpace: 'nowrap'}} >{article.post_at ? ElapsedTime(article.post_at) : ''}</div>
                    <Vertical style={{marginRight:'20px'}}>
                        <TiEye size={22}/>
                        <div>{CountWithUnit(article.showed)}</div>
                    </Vertical>
                    <Great article_id={article.id} like_count={article.like_count} dislike_count={article.dislike_count}/>
                    {category && <PrettyButton type={'transparent'} style={{color:'black'}} onClick={onClickNavigateCategory}>{category.name}</PrettyButton>}
                </Vertical>
                <div style={{height:'1px', backgroundColor:'lightgray', width:'100%'}}></div>
                {/* <div style={{height:'30px'}}></div> */}
                {/* {article.thumbnail != '' && <StateProgsImage src={article.thumbnail + '?size=960x540'} width={960} height={540} borderWidth={0}/>} */}
                <div style={{height:'30px'}}></div>
                <div dangerouslySetInnerHTML={{__html: MarkdownToHtml(article.content)}} style={{wordBreak:'break-all', width:'100%'}}/>
                <CommentList article_id={article_id}/>
            </Horizental>
        <div style={{width:'2px', marginLeft:'20px'}}/>
        </Vertical>) : <OverlayProgress/>
}
