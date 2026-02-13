import ProfileContext from "../tool/ProfileContext.js";
import {useContext, useState, useRef, useEffect, useCallback} from 'react';
import { useLocation } from 'react-router-dom';
import '../css/ProfileRegion.css'
import * as blobToBase64 from '../tool/BlobToBase64.js'

import { useNavigate} from 'react-router-dom';
import * as api from '../tool/Api.js'
import AuthContext from "../tool/AuthContext.js";
import ImageRegion from './ImageRegion.js';

export default function() {

  const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  const {auth, validAuth} = useContext(AuthContext)
  const {profile, updateProfile, removeProfile} = useContext(ProfileContext)

  const previewRef = useRef(null)
  const imageRegionRef = useRef(null)

  const navigate = useNavigate()

  const location = useLocation()

  const imageFile = location.state

  if(imageFile == null)
    return (<div>wrong access page</div>)

  useEffect(()=> {

    if(!validAuth(auth)){
        navigate('/login', {replace:true})
        return
    }    

  }, [auth])



  const onSelectImage = useCallback((rect) => {


    console.log(rect)

    const imageRegion = imageRegionRef.current

    const image = imageRegion.image()

    const selectImageWidth = 256
    const selectImageHeight = 256

    const canvasPreview = document.createElement('canvas')
    canvasPreview.width = selectImageWidth
    canvasPreview.height = selectImageHeight
    
    const ctxPreview = canvasPreview.getContext('2d')

    ctxPreview.imageSmoothingEnabled = false;

    ctxPreview.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, selectImageWidth, selectImageHeight)

    previewRef.current.style.backgroundImage = `url(${canvasPreview.toDataURL()})`

    removePreviewLoading()

  }, [])


  const removePreviewLoading=()=>{

    if(previewRef.current == null)
      return
    
    if(previewRef.current.classList.length >= 2){
      if(previewRef.current.classList[1] == 'loading')
        previewRef.current.classList.remove('loading')
    }
  }


  const uriDataToBlob = (uri_data) => {
    
    const parts = uri_data.split(',')
    const mimeType = parts[0].match(/:(.*?);/)[1]
    const byteString = atob(parts[1])
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    
    for (let i = 0; i < byteString.length; i++)
        uint8Array[i] = byteString.charCodeAt(i)

    return new Blob([arrayBuffer], {type: mimeType})
  }


  const onClickOK = async() => {

    const imageUrl = previewRef.current.style.backgroundImage
    
    const match = imageUrl.match(/url\(['"]?(.*?)['"]?\)/)
  
    if(match == null)
      return

    const base64 = match[1]

    const blob = uriDataToBlob(base64)

    const formData = new FormData()
    formData.append('image', blob)

    postProfile.disabled = true

    const resProfile = await api.postProfile(auth.jwt, formData)

    if(resProfile == null){
      postProfile.disabled = false
      window.showToast('프로필 변경 실패', 'error')      
      return
    }

    const payload = {profile: resProfile.id}
    const resUser = await api.patchUser(auth.jwt, auth.user_id, payload)

    if(resUser == null){
      postProfile.disabled = false
      window.showToast('프로필 변경 실패', 'error')      
      return
    }

    const profileId = resProfile.id + '?size=64x64'
    const profile = await api.getProfile(auth.jwt, profileId)

    if(profile == null) {
      postProfile.disabled = false
      window.showToast('프로필 가져오기 실패', 'error')      
      return
    }
        
    const base64Profile = await blobToBase64.convert(profile)
    updateProfile(base64Profile)

    postProfile.disabled = false
    window.showToast('프로필 변경 완료', 'success')
  }

  const onClickCancel = () => {

    navigate(-1)
  }

  return validAuth(auth) ? (
    <div>
      <h2>asdfsf</h2>
      <div className='preview loading' ref={previewRef}  style={{backgroundImage: `url(${transparent})`}}/>
      <ImageRegion ref={imageRegionRef} file={imageFile} onSelectImage={onSelectImage} containerWidth={300} containerHeight={600}/>
      <button id='postProfile' onClick={onClickOK}>ok</button>
      <button onClick={onClickCancel}>cancel</button>
    </div>
    ) : null
}
