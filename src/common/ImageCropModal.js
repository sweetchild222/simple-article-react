import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react'
import { useLocation } from 'react-router-dom'
import './ImageCropModal.css'
import './RotateLoading.css'
import Modal from '../common/Modal.js'

import ImageCropper from './ImageCropper.js'
import BeautyButton from "../common/BeautyButton.js"
import ReactDOM from 'react-dom';

export default function({ref, isOpen, onClose, file, onSelectImage, onClickApply, containerWidth=512, containerHeight=512}) {
    
  const refCropper = useRef(null)
  const refDialog = useRef(null)
  const refDiv = useRef(null)
  
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
  
  
  useImperativeHandle(ref, () => {
      
    return {
      image() {
        return refCropper.current.image()
      }
    }
  }, [refCropper]);


  return ReactDOM.createPortal(
          <dialog id='imgCropDialog' ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <div ref={refDiv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#CECECE'}}>
                <ImageCropper ref={refCropper} file={file} onSelectImage={onSelectImage} containerWidth={containerWidth} containerHeight={containerHeight}/>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <BeautyButton type='success' onClick={onClickApply}>적용</BeautyButton>
                  <BeautyButton type='cancel' onClick={onClose}>취소</BeautyButton>
                </div>
              </div>
          </dialog>,
          document.getElementById('modal-root')
        )
}
