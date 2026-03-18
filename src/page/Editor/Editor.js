
import { useContext, useState, useRef, useEffect } from 'react'
import Modal from '../../common/Modal'
import MDXEditor from './MDXEditor.js'
import BeautyButton from '../../common/BeautyButton'
import * as BlobAPI from '../../api/BlobAPI.js'
import AuthContext from "../../util/AuthContext.js";
import {pickImage, getImageFormat} from "../../util/ImagePicker.js";
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import ImageScale from "../../util/ImageScale.js";
import { BsTrash } from "react-icons/bs";
import { PiTrash } from "react-icons/pi";


export default function() {

    const {auth, updateAuth, validAuth, removeAuth} = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(()=> {

      if(!validAuth(auth)){
          navigate('/login', {replace:true})
          return
      }

    }, [auth])


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


    return validAuth(auth) ? (
        <div style={{height:'100%', width:'100%', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', flexDirection: 'row-reverse', margin:'5px'}}>
                <BeautyButton type='danger'>취소</BeautyButton>
                <BeautyButton type='confirm' onClick={postMarkDown}>완료</BeautyButton>
                <BeautyButton type='success'>임시저장</BeautyButton>
                <input style={{flexGrow:'1'}} placeholder="제목을 입력하세요"></input>

                <select id="cars" name="category">
                    <option value="volvo">Volvo</option>
                    <option value="saab">Saab</option>
                    <option value="fiat">Fiat</option>
                    <option value="audi">Audi</option>
                </select>
                <BeautyButton type='success'>미리보기</BeautyButton>
            </div>
            <div style={{border:'2px solid lightgray', borderRadius:'4px', overflowY:'auto', margin:'5px', flex: 1}}>
                <MDXEditor placeHolder={"글을 작성해보세요"} postImage={postImage} initValue={'sdf'} onChange={console.log}
                        onUserError={onUserError} onParsingError={onParsingError}
                />
            </div>
        </div>
    ) : null
}

