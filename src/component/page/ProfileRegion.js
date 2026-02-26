import ProfileContext from "../util/ProfileContext.js"
import {useContext, useState, useRef, useEffect, useCallback} from 'react'
import { useLocation } from 'react-router-dom'
import './ProfileRegion.css'
import './RotateLoading.css'
import * as blobToBase64 from '../util/BlobToBase64.js'

import { useNavigate} from 'react-router-dom'
import * as api from '../util/Api.js'
import AuthContext from "../util/AuthContext.js"
import ImageRegion from './ImageRegion.js'

import BeautyButton from "../common/BeautyButton.js"


export default function() {
  
  const {auth, validAuth} = useContext(AuthContext)
  const {profile, updateProfile, removeProfile} = useContext(ProfileContext)

  const [isLoading, setIsLoading] = useState(true)
  const [isPostLoading, setIsPostLoading] = useState(false)

  const previewRef = useRef(null)
  const imageRegionRef = useRef(null)  

  const previewWidth = 256
  const previewHeight = 256
  const containerWidth = 512
  const containerHeight = 512

  const navigate = useNavigate()

  const location = useLocation()

  const imageFile = location.state

  if(imageFile == null)
    return (<div>잘못된 방식으로 접근하였습니다</div>)

  useEffect(()=> {

    if(!validAuth(auth)){
        navigate('/login', {replace:true})
        return
    }

  }, [auth])



  const onSelectImage = useCallback((rect) => {    

    const imageRegion = imageRegionRef.current

    const image = imageRegion.image()

    const canvasPreview = document.createElement('canvas')
    canvasPreview.width = previewWidth
    canvasPreview.height = previewHeight
    
    const ctxPreview = canvasPreview.getContext('2d')

    ctxPreview.imageSmoothingEnabled = false;

    ctxPreview.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, previewWidth, previewHeight)

    previewRef.current.style.backgroundImage = `url(${canvasPreview.toDataURL()})`

    setIsLoading(false)

  }, [])


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


  const onClickApply = async() => {

    const imageUrl = previewRef.current.style.backgroundImage
    
    const match = imageUrl.match(/url\(['"]?(.*?)['"]?\)/)
  
    if(match == null)
      return

    const base64 = match[1]

    const blob = uriDataToBlob(base64)

    const formData = new FormData()
    formData.append('image', blob)

    setIsPostLoading(true)    

    const resProfile = await api.postProfile(auth.jwt, formData)

    if(resProfile == null){
      setIsPostLoading(false)      
      window.showToast('프로필 변경이 실패하였습니다', 'error')      
      return
    }

    const payload = {profile: resProfile.id}
    const resUser = await api.patchUser(auth.jwt, auth.user_id, payload)

    if(resUser == null){
      setIsPostLoading(false)
      window.showToast('프로필 변경이 실패하였습니다', 'error')      
      return
    }

    const profileId = resProfile.id + '?size=64x64'
    const profile = await api.getProfile(auth.jwt, profileId)

    if(profile == null) {
      setIsPostLoading(false)
      window.showToast('프로필 가져오기가 실패하였습니다', 'error')      
      return
    }
    
    const base64Profile = await blobToBase64.convert(profile)
    updateProfile(base64Profile)

    setIsPostLoading(false)
    window.showToast('프로필 변경이 성공하였습니다', 'success')
    navigate(-1)
  }


  const onClickCancel = () => {

    navigate(-1)
  }


  return validAuth(auth) ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ImageRegion ref={imageRegionRef} file={imageFile} onSelectImage={onSelectImage} containerWidth={containerWidth} containerHeight={containerHeight}/>
      <div id='preview' className={`${isLoading ? 'rotateLoading': ''}`} ref={previewRef}  style={{width: `${previewWidth}px`, height: `${previewHeight}px`}}/>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <BeautyButton onClick={onClickApply} type='confirm' isLoading={isPostLoading}>적용</BeautyButton>
      <BeautyButton onClick={onClickCancel} type='cancel'>취소</BeautyButton>
      </div>
    </div>
    ) : null
}
