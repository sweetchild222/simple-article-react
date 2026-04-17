
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

import ImageScale, {blobFromCanvas, drawImage} from "../../util/ImageScale.js";
import LoadingImage from "../../common/LoadingImage.js";
import '../../common/RotateLoading.css'

import MarkdownToHtml from '../../util/MarkdownToHtml.js'

import Split from '@uiw/react-split';

export default function() {
    
    const location = useLocation()

    const state = location.state

    if(state == null)
        return (<div>잘못된 방식으로 접근하였습니다</div>)
    
    const refMDX = useRef(null)
    const refPreview = useRef(null)
    const refLength = useRef(null)
    
    const [isTempSaveLoading, setIsTempSaveLoading] = useState(false)
    const [isTouched, setIsTouched] = useState(false)
    const [isPreview, setIsPreview] = useState(false)
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)

    const leave_modal_config = {text: '나가기 전에 임시 저장 하시겠습니까?', type: 'yesno', isCloseOutsideClick: true}

    const navigate = useNavigate()
    
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        
        if(nextLocation.pathname == '/editor/posting')
            return false

        if (isTouched && currentLocation.pathname !== nextLocation.pathname){            
            return true
        }
        else
            return false
    })


    useEffect(() => {
    
        if (blocker.state === "blocked") {

            if(!validAuth(auth)){
                blocker.proceed()
                return
            }

            const proceed = window.confirm("저장하지 않고 나가시겠습니까?")

            if (proceed)
                blocker.proceed()
            else
                blocker.reset()
        }

    }, [blocker]);


    const beforeUnload = useCallback((e) => {

        if(isTouched){
            e.preventDefault()
            e.returnValue = ''
        }
    })

    useEffect(() => {
        
        window.addEventListener('beforeunload', beforeUnload)
    
        return () => {

            window.removeEventListener('beforeunload', beforeUnload)
        }

    }, [beforeUnload])


    const onClickNext = async() => {

        if(refMDX.current == null)
            return

        const markdown = refMDX.current.getMarkdown()

        if(!markdown || markdown.trim().length === 0){

            window.showToast('글이 입력되지 않았습니다', 'error')
            return 
        }


        if(isTouched == true){

            const success = await tempSave(markdown)

            if(success == false)
                return
        }

        state.content = markdown
                
        navigate(location.pathname, {
            replace: true,
            state: state
        });

        navigate('posting', {state:state})
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


    const onParsingError = (payload) =>{

        console.log('error: ', payload.error)
        console.log('sourece:', payload.source)
    }


    const onUserError = (error) =>{
    
        window.showToast(error, 'error')
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

    const onClickSave = async() => {

        if(refMDX.current == null)
            return

        const markdown = refMDX.current.getMarkdown()
        
        await tempSave(markdown)
    }


    const tempSave = async(markdown) =>{

        setIsTempSaveLoading(true)
    
        const res = await tempSaveCore(markdown)

        setIsTempSaveLoading(false)

        if(res != null)
            window.showToast('임시 저장됨', 'info')
        else
            window.showToast('임시 저장 실패', 'error')
        
        setIsTouched(res != null ? false : true)

        return res != null ? true : false
    }


    const tempSaveCore = async(markdown) => {
                
        

        const article_id = state.id
        const title = state.title
        const content = markdown
        const open = state.open
        const posted = 0
        const category_id = state.category_id
        const thumbnail = state.thumbnail

        const res = await putArticle(article_id, title, content, thumbnail, open, posted, category_id)

        if(res == null)
            return null

        return res
    }

    const onChangeContent = (content, isInternalChange) => {

        if(!isInternalChange){

            setIsTouched(true)
            
            if(refPreview.current && refMDX.current){

                const html = MarkdownToHtml(refMDX.current.getMarkdown())
                refPreview.current.innerHTML = html
            }

            if(refLength.current)
                refLength.current.textContent = content.length + '/65535'
        }
    };


    const onClickLeave=()=> {

        if(isTouched)
            setIsConfirmSaveModalOpen(true)
        else
            navigate(-1)
    }


    const onResultConfirmSave = async(result) => {

        setIsTouched(false)
        
        if(result == true){
            
            const res = await saveCore()

            if(res != null)
                window.showToast('임시 저장 됨', 'info')
            else
                window.showToast('임시 저장 실패', 'error')
        }

        navigate(-1)
    }


    const onClickPreview = () =>{

        setIsPreview(set => !set)
    }


    useEffect(()=>{

        if(isPreview){

            if(refPreview.current && refMDX.current){

                const html = MarkdownToHtml(refMDX.current.getMarkdown())
                refPreview.current.innerHTML = html
            }
        }

    }, [isPreview])


    const memoMDXEditor = useMemo(() => {

        return <MDXEditor ref={refMDX} placeHolder={"글을 작성해보세요"} postImage={postImage} initMarkdown={state.content} markdown={state.content}
                    onChange={onChangeContent} onUserError={onUserError} readOnly={false} onParsingError={onParsingError}/>
                            
    }, [])
    

    return validAuth(auth) ? (
        <div style={{flex:1, position: 'relative', margin:'20px 20px 20px 20px'}}>
            <div style={{position: 'absolute', width:'100%', height:'100%', display: 'flex', flexDirection: 'column'}}>
                <Split visible={true} style={{maxHeight:'calc(100vh - 192px)', width:'100%'}}>
                    <div style={{overflowY:'auto', minWidth:'10%', width: isPreview ? '50%' : '100%', border:'1px solid lightgray', borderRadius:'6px'}}>
                        {memoMDXEditor}
                    </div>
                
                    {isPreview && <div style={{overflowY:'auto', minWidth:'10%', width: '50%', flex: 1, border:'1px solid lightgray', borderRadius:'6px'}}>
                        <div ref={refPreview} style={{margin:'10px', wordBreak:'break-all'}}/>
                    </div>
                    }
                </Split>
                <label ref={refLength} style={{marginLeft:'auto', fontSize:'12px', color:'gray'}}>{state.content.length + '/65535'}</label>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flex: 0, alignItems: 'center', marginTop:'10px'}}>
                    <BeautyButton type='danger' style={{marginRight:'10px'}} onClick={onClickLeave}>나가기</BeautyButton>
                    <BeautyButton type='confirm' style={{marginRight:'10px'}} isLoading={isTempSaveLoading} onClick={onClickNext}>다음</BeautyButton>
                    <BeautyButton type='success' style={{marginRight:'10px'}} disabled={!isTouched} isLoading={isTempSaveLoading} onClick={onClickSave}>임시 저장</BeautyButton>
                    <Modal config={leave_modal_config} isOpen={isConfirmSaveModalOpen} onResult={onResultConfirmSave} onClose={()=>setIsConfirmSaveModalOpen(false)}></Modal>
                    <div style={{flex:'1', backgroundColor:'red'}}></div>
                    <BeautyButton type='success' onClick={onClickPreview}>미리보기</BeautyButton>
                </div>
            </div>
        </div>
    ) : (<GoLogin/>)
}

