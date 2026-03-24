import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react'
import { useLocation } from 'react-router-dom'
import './ImageCropModal.css'
import './RotateLoading.css'
import Modal from '../common/Modal.js'

import ImageCropper from './ImageCropper.js'
import BeautyButton from "../common/BeautyButton.js"

export default function({ref, isOpen, onClose, file, onSelectImage, onClickApply}) {  
  
  const modal_config = {type: 'custom', isCloseOutsideClick: false}

  const refCropper = useRef(null)

  useImperativeHandle(ref, () => {
      
    return {
      image() {
        return refCropper.current.image()
      }
    }
  }, [refCropper]);
  

  return (
          <Modal config={modal_config} isOpen={isOpen} onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width:'600px', height:'600px'}}>
              <ImageCropper ref={refCropper} file={file} onSelectImage={onSelectImage} containerWidth={512} containerHeight={512}/>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <BeautyButton type='confirm' onClick={onClickApply}>확인</BeautyButton>
                <BeautyButton type='cancel' onClick={onClose}>취소</BeautyButton>
              </div>
            </div>
          </Modal>
          )
}
