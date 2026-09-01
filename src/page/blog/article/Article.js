
import {useState, useContext, useEffect} from "react";
import {useNavigate, useParams} from 'react-router-dom';

import * as ArticleAPI from '@rest/ArticleAPI.js'
import * as CategoryAPI from '@rest/CategoryAPI.js'
import AuthContext from "@util/AuthContext.js";
import Integer from "@util/Integer.js";
import ElapsedTime from "@util/ElapsedTime.js";
import CountWithUnit from "@util/CountWithUnit.js";
import MarkdownToHtml from '@util/MarkdownToHtml.js'
import {isMobile, isNotMobile} from "@util/DeviceType.js";
import Modal from "@gui/Modal.js";
import StateProgsImage from "@gui/StateProgsImage.js";
import PrettyButton from "@gui/PrettyButton.js";
import {Vertical, Horizental} from "@gui/Flex.js";
import Spinner from "@gui/Spinner.js";
import {VPad, HPad} from "@gui/Pad.js";

import { TiEye } from "react-icons/ti";
import { FaAlignLeft } from "react-icons/fa6";
import { FaAlignCenter } from "react-icons/fa6";
import { FaAlignRight } from "react-icons/fa6";

import Great from "./Great.js"
import Series from "./Series.js"
import Bookmark from "./Bookmark.js"
import CommentList from "./comment/CommentList.js"
import ControlMenu from "./comment/ControlMenu.js";


export default function() {

    const { b_id, a_id } = useParams()

    const blog_id = Integer(b_id)
    const article_id = Integer(a_id)
    
    const {auth, validAuth} = useContext(AuthContext)
    const [article, setArticle] = useState(null)    
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
    const [isControlLoading, setIsControlLoading] = useState(false)    
    const [category, setCategory] = useState(null)
    const [textAlign, setTextAlign] = useState('left')
    //const [thumbnailSize, setThumbnailSize] = useState(null)

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
                //setThumbnailSize(calcThumbnailSize())

                ArticleAPI.postArticleShowed(article_id).then(showed => {
                    
                    if(showed.success == true) {
                        article.payload.showed += 1
                        setArticle(structuredClone(article.payload))
                    }
                })
            })
        })

    }, [auth, blog_id, article_id])


    const isEditable = ()=> {
    
        return ((validAuth(auth) && auth.blog_id == blog_id) && isNotMobile())
    }


    const onClickEdit = async() => {
        
        if(!isEditable())
            return

        setIsControlLoading(true)
        
        const res = await ArticleAPI.getBlogArticles(auth.jwt, auth.blog_id, 'source_id=' + article.id + '&posted=0')
        
        if(res.success == false) {
            setIsControlLoading(false)
            window.showToast('수정 본을 찾는데 실패하였습니다', 'system-error')
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
                window.showToast('수정 본 생성에 실패하였습니다', 'system-error')
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
                window.showToast('삭제가 실패하였습니다', 'system-error')
                return
            }

            window.showToast('삭제 되었습니다', 'info')
            navigate(-1)
        }
    }


    const onClickNavigateCategory = async() =>{

        navigate('/blog/' + b_id, {state:{category_id:category.id}})
    }

    
    const calcThumbnailSize = () => {

        const deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        
        // const isLandscape = window.matchMedia("(orientation: landscape)").matches;

        const sizeList = [[96, 96], [160, 128], [320, 256], [512, 320], [960, 540]]
        const width = deviceWidth                
        
        for(const i in sizeList){

            const s = sizeList[i]

            if(width < (s[0] + 8 + 8)){

                if(i == 0)
                    return sizeList[0]

                return sizeList[i - 1] 
            }
        }

        return sizeList.at(-1)
    }

    
    return article ? (
        <Vertical style={{alignItems:'center', margin:'0 auto', width:'100%', justifyContent:'center', maxWidth:'960px', marginTop:(isMobile() ? '64px' : '0px'), paddingLeft:'8px', paddingRight:'8px'}}>
            {/* {thumbnailSize && article.thumbnail != '' && <VPad size={16}/>}
            {thumbnailSize && article.thumbnail != '' && <StateProgsImage src={article.thumbnail + '?size=' + thumbnailSize[0] + 'x' + thumbnailSize[1]} width={thumbnailSize[0]} height={thumbnailSize[1]} borderWidth={0} style={{boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)'}}/>}
            {thumbnailSize && article.thumbnail != '' && <VPad size={16}/>} */}
            <div className={'clamped-text'} style={{'--line-count':3, fontSize:'26px'}}>{article.title}</div>
            <VPad size={16}/>
            <Horizental style={{width:'100%', alignItems:'center'}}>
                <TiEye size={22}/>
                <HPad size={isMobile() ? 4 : 8}/>
                <div>{CountWithUnit(article.showed)}</div>
                <HPad size={isMobile() ? 8 : 16}/>
                <PrettyButton type={'transparent'} style={{color:'black'}} onClick={()=> setTextAlign('left')}><FaAlignLeft size={22}/></PrettyButton>
                <HPad size={isMobile() ? 4 : 8}/>
                <PrettyButton type={'transparent'} style={{color:'black'}} onClick={()=> setTextAlign('center')}><FaAlignCenter size={22}/></PrettyButton>
                <HPad size={isMobile() ? 4 : 8}/>
                <PrettyButton type={'transparent'} style={{color:'black'}} onClick={()=> setTextAlign('right')}><FaAlignRight size={22}/></PrettyButton>
                <HPad size={isMobile() ? 8 : 16}/>                
                <Horizental style={{whiteSpace: 'nowrap', color:'gray', flex:'1', justifyContent:'end', alignItems:'center', marginRight:'0px'}}>
                    {category && <div className={'clamped-text'} style={{backgroundColor:'#faebd7', borderRadius:'4px', padding:'4px', '--line-count':1, cursor:'pointer', width:'auto', whiteSpace:'pre-line', color:'black'}} onClick={onClickNavigateCategory}>{category.name}</div>}
                    <HPad size={isMobile() ? 8 : 16}/>
                    {article.post_at ? ElapsedTime(article.post_at): ''}
                    {isEditable() && <HPad size={8}/>}
                    {isEditable() && <ControlMenu isLoading={isControlLoading} onRemove={onClickDelete} onModify={onClickEdit}></ControlMenu>}
                    {isEditable() && <Modal title={'정말 삭제 하시겠습니까?'} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>}
                </Horizental>

            </Horizental>
            <div style={{height:'1px', backgroundColor:'lightgray', width:'100%', borderRadius:'1px', marginTop:'4px'}}></div>
            <VPad size={16}/>
            <div dangerouslySetInnerHTML={{__html: MarkdownToHtml(article.content)}} style={{wordBreak:'break-all', textAlign:textAlign, width:'100%'}}/>
            <VPad size={16}/>
            <Horizental style={{justifyContent:'space-between', alignItems:'center', marginBottom:'4px', width:'100%'}}>
                <Bookmark article_id={article.id} count={article.bookmark_count}/>
                <Great style={{marginLeft: 'auto'}} article_id={article.id} like_count={article.like_count} dislike_count={article.dislike_count}/>
            </Horizental>
            <div style={{height:'1px', backgroundColor:'lightgray', width:'100%'}}></div>
            <CommentList article_id={article.id} article_user_id={article.user_id}/>
            <VPad size={16}/>
            {category && <Series blog_id={article.blog_id} article_id={article.id} category_id={category.id} category_name={category.name}/>}
        </Vertical>
    ) : <Spinner/>
}
