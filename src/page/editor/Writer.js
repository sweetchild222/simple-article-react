import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'
import { useNavigate, useLocation, useBlocker} from 'react-router-dom';

import Split from '@uiw/react-split';
import Spinner from '@gui/Spinner.js'
import PrettyButton from '@gui/PrettyButton.js'
import {Horizental} from "@gui/Flex.js";
import Modal from '@gui/Modal.js'
import * as BlobAPI from '@rest/BlobAPI.js'
import * as BlogAPI from '@rest/BlogAPI.js'
import * as ArticleAPI from '@rest/ArticleAPI.js'
import AuthContext from "@util/AuthContext.js";
import MarkdownToHtml from '@util/MarkdownToHtml.js'
import GoLogin from "@page/common/GoLogin.js";
import { useTranslation } from 'react-i18next';

import MDXEditor from './MDXEditor.js'
import ExtractHead from "./ExtractHead.js";


export default function() {

    const { t } = useTranslation()
    
    const location = useLocation()

    const state = location.state

    if(state == null)
        return (<div>{t('page.editor.notAccess')}</div>)
    
    const refMDX = useRef(null)
    const refPreview = useRef(null)
    const refLength = useRef(null)
    
    const [isTempSaveLoading, setIsTempSaveLoading] = useState(false)
    const [isTouched, setIsTouched] = useState(false)
    const [isPreview, setIsPreview] = useState(false)
    const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
    const {auth, validAuth} = useContext(AuthContext)
    const [isSpinner, setIsSpinner] = useState(false)
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)

    const navigate = useNavigate()
    
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        
        if(nextLocation.pathname == '/blog/' + auth.blog_id + '/write/posting')
            return false

        if (isTouched && currentLocation.pathname !== nextLocation.pathname)
            return true
        else
            return false
    })


    useEffect(()=>{

        BlogAPI.getBlog(auth.blog_id).then((resBlog)=> {

            if(resBlog.success == true)
                document.title = resBlog.payload.title
        })
    
    }, [])


    useEffect(() => {
    
        if (blocker.state === "blocked") {

            if(!validAuth(auth)){
                blocker.proceed()
                return
            }

            const proceed = window.confirm(t('page.editor.wantLeavWithoutSave'))

            if (proceed)
                blocker.proceed()
            else
                blocker.reset()
        }

    }, [blocker]);


    const beforeUnload = useCallback((e) => {   // prevent when F5(reload)

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


    const onClickPost = async() => {

        if(refMDX.current == null)
            return

        const markdown = refMDX.current.getMarkdown()

        if(!markdown || markdown.trim().length === 0){
            window.showToast(t('toast.writer.noText'), 'user-error')
            return 
        }

        if(isTouched == true){
        
            setIsSpinner(true)
            setIsTempSaveLoading(true)

            const res = await tempSave()

            setIsSpinner(false)
            setIsTempSaveLoading(false)
            
            if(res != null)
                window.showToast(t('toast.writer.successSavingDraft'), 'info')
            else{
                window.showToast(t('toast.writer.failedSavingDraft'), 'system-error')
                return
            }
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

        if(resArticleImage.success == false)
            return null
        
        const url = process.env.API_TARGET + '/api/blob/article/' + resArticleImage.payload.id

        return url
    }


    const onParsingError = (payload) =>{

        console.log('error: ', payload.error)
        console.log('sourece:', payload.source)
    }


    const onUserError = (error) =>{
    
        window.showToast(error, 'user-error')
    }
    

    const putArticle = async(article_id, title, content, thumbUrl, posted, category_id) => {
        
        const payload = {
            title:title,
            head:ExtractHead(MarkdownToHtml(content), 256),
            content:content,
            posted:posted,
            thumbnail:thumbUrl,
            category_id:category_id
        }        
        
        return await ArticleAPI.putArticle(auth.jwt, article_id, payload)
    }


    const tempSave = async() => {

        if(refMDX.current == null)
            return null

        const markdown = refMDX.current.getMarkdown()

        const article_id = state.id
        const title = state.title
        const content = markdown
        const posted = 0
        const category_id = state.category_id
        const thumbnail = state.thumbnail

        const res = await putArticle(article_id, title, content, thumbnail, posted, category_id)

        return res.success
    }

    const onClickSave = async() => {

        if(refMDX.current == null)
            return

        setIsTempSaveLoading(true)
        
        const success = await tempSave()

        setIsTempSaveLoading(false)

        if(success == true)
            window.showToast(t('toast.writer.successSavingDraft'), 'info')
        else
            window.showToast(t('toast.writer.failedSavingDraft'), 'system-error')

        setIsTouched(success == true ? false : true)
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

            setIsTempSaveLoading(true)
            
            const success = await tempSave()

            setIsTempSaveLoading(false)

            if(success == true)
                window.showToast(t('toast.writer.successSavingDraft'), 'info')
            else
                window.showToast(t('toast.writer.failedSavingDraft'), 'system-error')
        }

        navigate(-1)
    }


    const onClickPreview = () =>{

        setIsPreview(set => !set)
    }


    const onClickDelete = async() => {

        setIsConfirmDeleteModalOpen(true)
    }


    const onResultConfirmDelete = async(result) =>{

        if(result == true){

            setIsTouched(false)
            
            const res = await ArticleAPI.deleteArticle(auth.jwt, state.id)
            
            if(res.success == false){
                window.showToast(t('toast.writer.failedDeleting'), 'system-error')
                return
            }

            window.showToast(t('toast.writer.successDeleting'), 'info')

            navigate(-1)
        }        
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

        return <MDXEditor ref={refMDX} placeHolder={t('page.editor.writeArticle')} postImage={postImage} markdown={state.content}
                    onChange={onChangeContent} onUserError={onUserError} readOnly={false} onParsingError={onParsingError}/>
                            
    }, [])

    return validAuth(auth) ? (
        <div style={{flex:1, position: 'relative', marginLeft:'16px', marginRight:'16px'}}>
            {isSpinner && <Spinner type={'absolute'} />}
            <div style={{position: 'absolute', width:'100%', height:'100%', display: 'flex', flexDirection: 'column'}}>
                <Split visible={true} style={{maxHeight:'calc(100vh - 292px)', width:'100%'}}>
                    <div style={{overflowY:'auto', minWidth:'10%', width: isPreview ? '50%' : '100%', border:'1px solid lightgray', borderRadius:'8px'}}>
                        {memoMDXEditor}
                    </div>

                    {isPreview && <div style={{overflowY:'auto', minWidth:'10%', width: '50%', flex: 1, border:'1px solid lightgray', borderRadius:'8px'}}>
                        <div ref={refPreview} style={{margin:'8px', wordBreak:'break-all'}}/>
                    </div>
                    }
                </Split>
                <label ref={refLength} style={{marginLeft:'auto', fontSize:'16px', color:'gray'}}>{state.content.length + '/65535'}</label>
                <Horizental style={{flex: 0, alignItems: 'center', marginTop:'16px'}}>
                    <PrettyButton type='cancel' style={{marginRight:'8px'}} onClick={onClickLeave}>{t('system.leave')}</PrettyButton>
                    <PrettyButton type='danger' style={{marginRight:'8px'}} onClick={onClickDelete}>{t('system.delete')}</PrettyButton>
                    <Modal title={t('page.editor.wantDelete')} type={'yesno'} isOpen={isConfirmDeleteModalOpen} onResult={onResultConfirmDelete} onClose={()=>setIsConfirmDeleteModalOpen(false)}></Modal>
                    <div style={{flex:'1'}}/>
                    <PrettyButton type='success' style={{marginRight:'8px'}} disabled={!isTouched} isLoading={isTempSaveLoading} onClick={onClickSave}>{t('page.editor.temporarySave')}</PrettyButton>
                    <Modal title={t('page.editor.temporarySavebeforeLeave')} type={'yesno'} isOpen={isConfirmSaveModalOpen} onResult={onResultConfirmSave} onClose={()=>setIsConfirmSaveModalOpen(false)}></Modal>
                    <PrettyButton type='confirm' style={{marginRight:'8px'}} onClick={onClickPreview}>{t('page.editor.preview')}</PrettyButton>
                    <PrettyButton type='default' onClick={onClickPost}>{t('system.next')}</PrettyButton>
                </Horizental>
            </div>
        </div>
    ) : (<GoLogin/>)
}

