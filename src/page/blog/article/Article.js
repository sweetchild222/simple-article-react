
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
import {Vertical, Horizental} from "@gui/Flex.js";
import OverlayProgress from "@gui/OverlayProgress.js";


import Great from "./Great.js"
import Series from "./Series.js"
import CommentList from "./comment/CommentList.js"
import ControlMenu from "./comment/ControlMenu.js";


import { TiEye } from "react-icons/ti";


export default function() {

    const { b_id, a_id } = useParams()

    const blog_id = Integer(b_id)
    const article_id = Integer(a_id)

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const [article, setArticle] = useState(null)    
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    const [isControlLoading, setIsControlLoading] = useState(false)
    
    const [category, setCategory] = useState(null)
    
    const navigate = useNavigate()

    useEffect(()=>{

        ArticleAPI.getArticle(validAuth(auth) ? auth.jwt : null, article_id).then((article) => {

            if(article.success == false){
                navigate('/notFound')
                return
            }

            if(article.payload.posted == 0){
                navigate('/notFound')
                return
            }

            if(blog_id != article.payload.blog_id){
                navigate('/notFound')
                return
            }

            CategoryAPI.getCategory(article.payload.category_id).then(category => {

                if(category.success == false){
                    navigate('/notFound')
                    return
                }

                setArticle(article.payload)
                setCategory(category.payload)                

                ArticleAPI.postArticleShowed(article_id).then(showed => {
                    
                    if(showed.success == true){
                        article.payload.showed += 1
                        setArticle(structuredClone(article.payload))
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

        setIsControlLoading(true)
        
        const res = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, 'source_id=' + article.id + '&posted=0')
        
        if(res.success == false) {
            setIsControlLoading(false)
            window.showToast('수정 본을 찾는데 실패했습니다', 'error')
            return
        }

        const copiedArticle = res.payload.length > 0 ? res.payload[0] : null
        
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

            setIsControlLoading(false)

            if(resPost.success == false){
                window.showToast('수정 본 생성에 실패 했습니다', 'error')
                return
            }
            
            window.showToast('수정 본 생성에 성공하였습니다', 'info')
            const state = {id:resPost.payload.id, ...payload}

            navigate('/blog/' + auth.blog_id + '/write', {state:state})
        }
        else{
            setIsControlLoading(false)
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

            setIsControlLoading(true)
            
            const res = await ArticleAPI.deleteArticle(auth.jwt, article_id)

            setIsControlLoading(false)
            
            if(res.success == false){
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


    return article ? (
        <Horizental style={{justifyContent:'center', marginTop:'20px'}}>
            <Vertical style={{alignItems:'center', width:'100%', minWidth:'960px', maxWidth:'960px'}}>
                <div className={'clamped-text'} style={{'--line-count':3, fontSize:'26px'}}>{article.title}</div>
                <Horizental style={{height:'30px', width:'100%', alignItems:'center'}}>
                    {category &&
                        <div className={'clamped-text'} style={{'--line-count':1, cursor:'pointer', whiteSpace: 'nowrap'}} onClick={onClickNavigateCategory}>{category.name}</div>
                    }
                    <div style={{width:'20px'}}/>
                    <TiEye size={22}/>
                    <div style={{width:'5px'}}/>
                    <div>{CountWithUnit(article.showed)}</div>
                    <Horizental style={{whiteSpace: 'nowrap', color:'gray', fontStyle: 'italic', flex:'1', justifyContent:'end', marginRight:'10px'}}>
                        {article.post_at ? ElapsedTime(article.post_at) + '': ''}
                    </Horizental>

                    {isEditable() && 
                        <Horizental>
                            <ControlMenu isLoading={isControlLoading} onRemove={onClickDelete} onModify={onClickEdit}></ControlMenu>
                            <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>
                        </Horizental>
                    }

                </Horizental>
                <div style={{height:'1px', backgroundColor:'lightgray', width:'100%'}}></div>
                {/* <div style={{height:'30px'}}></div>
                {article.thumbnail != '' && <StateProgsImage src={article.thumbnail + '?size=170x170'} width={170} height={170} borderWidth={0}/>}
                <div style={{height:'30px'}}></div> */}
                <div dangerouslySetInnerHTML={{__html: MarkdownToHtml(article.content)}} style={{wordBreak:'break-all', width:'100%'}}/>                
                <Horizental style={{alignSelf:'end', marginTop:'20px'}}>
                    <Great article_id={article.id} like_count={article.like_count} dislike_count={article.dislike_count}/>
                </Horizental>
                <div style={{height:'1px', backgroundColor:'lightgray', width:'100%'}}></div>
                <CommentList article_id={article.id}/>
                <div style={{height:'20px'}}/>
                <Series blog_id={article.blog_id} article_id={article.id} category_id={article.category_id}/>                                
            </Vertical>
        </Horizental>) : <OverlayProgress/>
}
