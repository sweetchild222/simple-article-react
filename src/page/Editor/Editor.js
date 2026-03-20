
import { useContext, useState, useRef, useEffect } from 'react'
import Modal from '../../common/Modal.js'
import MDXEditor from './MDXEditor.js'
import BeautyButton from '../../common/BeautyButton.js'
import * as BlobAPI from '../../api/BlobAPI.js'
import AuthContext from "../../util/AuthContext.js";
import {pickImage, getImageFormat} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';


import ImageScale from "../../util/ImageScale.js";
import { BsTrash } from "react-icons/bs";
import { PiTrash } from "react-icons/pi";


export default function() {

    const location = useLocation()

    if(location.state == null)
        return (<div>잘못된 접근입니다</div>)

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const navigate = useNavigate()
    const [title, setTitle] = useState(location.state.title)
    const [content, setContent] = useState(location.state.content)
    const [timerId, setTimerId] = useState(null)

    useEffect(()=> {
    
      if(!validAuth(auth)){
          navigate('/login', {replace:true})
          return
      }

    }, [auth])



    // useEffect(()=>{

    //     setTitle('sdfsdf')
    //     setContent('dfgdgdfd')
    //     console.log('init')

    // }, [])

    console.log('asdf')



    const postMarkDown = () =>{

        

    }


    const postImage = (canvas) => {

        return new Promise((resolve) => {

            canvas.toBlob(async(blob) => {

                const formData = new FormData()
                formData.append('image', blob)

                const resArticleImage = await BlobAPI.postArticleImage(auth.jwt, formData)

                if(resArticleImage == null){
                    resolve(null)
                    return
                }

                resolve('http://13.124.193.201:8080/api/blob/article/' + resArticleImage.id)
            })
        })
    }


    const onParsingError = (payload) =>{

        console.log('error: ', payload.error)
        console.log('sourece:', payload.source)
    }


    const onUserError = (error) =>{
    
        window.showToast(error, 'error')
    }


    const setTimerAutoSaving = ()=>{

        if(timerId != null)
            return

        const timeout = 2000
    
        const id = setTimeout(() => {
            console.log('timeout')
            setTimerId(null)
        }, timeout);

        setTimerId(id)    
    }


    const onChangeContent = (content, isInternalChange) =>{
        
        if(!isInternalChange){

            //setContent(content)
            setTimerAutoSaving()
        }
    }


    const onChangeTitle = (event) => {

        //setTitle(event.target.value)
        setTimerAutoSaving()
    }


    const onClickCancel=()=> {

        setIsModalOpen(true)
    }

    const [isModalOpen, setIsModalOpen] = useState(false)

    const modal_config = {text: '글 작성을 취소 하시겠습니까?', type: 'yesno', isCloseOutsideClick: true}

    const onResultCancel = (result) => {

      if(result == true)
        navigate(-1)
    }



    return validAuth(auth) ? (
        <div style={{height:'100%', width:'100%', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', flexDirection: 'row-reverse', margin:'5px'}}>
                <BeautyButton type='danger' onClick={onClickCancel}>취소</BeautyButton>
                <Modal config={modal_config} isOpen={isModalOpen} onResult={onResultCancel} onClose={()=>setIsModalOpen(false)}></Modal>
                <BeautyButton type='confirm' onClick={postMarkDown}>완료</BeautyButton>
                <BeautyButton type='success'>임시저장</BeautyButton>
                <input style={{flexGrow:'1'}} placeholder="제목을 입력하세요" defaultValue={title} onChange={onChangeTitle}></input>

                {/* <select>
                    <option value="" style={{color:'gray'}} >카테고리 선택</option>
                    <option value="saab">Saab</option>
                    <option value="fiat">Fiat</option>
                    <option value="audi">Audi</option>
                </select> */}
                <BeautyButton type='success'>미리보기</BeautyButton>
            </div>
            <div style={{border:'2px solid lightgray', borderRadius:'4px', overflowY:'auto', margin:'5px', flex: 1}}>
                <MDXEditor placeHolder={"글을 작성해보세요"} postImage={postImage} defaultValue={content}
                    onChange={onChangeContent} onUserError={onUserError} onParsingError={onParsingError}
                />
            </div>
        </div>
    ) : null
}

