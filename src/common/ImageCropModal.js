import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react'
import { useLocation } from 'react-router-dom'
import './ImageCropModal.css'
import './RotateLoading.css'
import Modal from '../common/Modal.js'

import ImageCropper from './ImageCropper.js'
import BeautyButton from "../common/BeautyButton.js"
import ReactDOM from 'react-dom';

export default function({ref, isOpen, onClose, file, onClickApply, containerWidth=512, containerHeight=512, keepRatio}) {
    
  const refCropper = useRef(null)
  const refDialog = useRef(null)
  const refDiv = useRef(null)

  const [isApplyLoading, setIsApplyLoading] = useState(false)  
  
  useEffect(() => {
      
    if(isOpen)
        refDialog.current.showModal()
    else
        refDialog.current.close()

  }, [isOpen]);

  
  const onKeyDownDialog=(event)=>{

      if(event.nativeEvent.key == 'Escape'){
          event.preventDefault()
      }
  }

  
  const onClickApplyCore = async() =>{
    
    if(onClickApply != null){
      setIsApplyLoading(true)
      await onClickApply()    
      setIsApplyLoading(false)
    }
  }
  
  
  useImperativeHandle(ref, () => {
      
    return {
      image() {
        return refCropper.current.image()
      },
      rect(){
        return refCropper.current.rect()
      }
    }
  }, [refCropper])

  return ReactDOM.createPortal(
          <dialog id='imgCropDialog' ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <div ref={refDiv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#CECECE'}}>
                <ImageCropper ref={refCropper} file={file} containerWidth={containerWidth} containerHeight={containerHeight} keepRatio={keepRatio}/>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <BeautyButton type='success' onClick={onClickApplyCore} isLoading={isApplyLoading}>적용</BeautyButton>
                  <BeautyButton type='cancel' onClick={onClose}>취소</BeautyButton>
                </div>
              </div>
          </dialog>,
          document.getElementById('modal-root')
        )
}
