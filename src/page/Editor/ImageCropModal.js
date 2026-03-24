import ProfileContext from "../../util/ProfileContext.js"
import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react'
import { useLocation } from 'react-router-dom'
import './ImageCropModal.css'
import '../../common/RotateLoading.css'
import Modal from '../../common/Modal.js'
import * as blobToBase64 from '../../util/BlobToBase64.js'

import { useNavigate} from 'react-router-dom'
import * as BlobAPI from '../../api/BlobAPI.js'
import * as UserAPI from '../../api/UserAPI.js'
import AuthContext from "../../util/AuthContext.js"
import ImageCropper from '../../util/ImageCropper.js'
import BeautyButton from "../../common/BeautyButton.js"

export default function({ref, isOpen, onClose, file, onSelectImage, onClickApply}) {  
  
  const modal_config = {type: 'custom', isCloseOutsideClick: false}

  const refImageRegion = useRef(null)

  useImperativeHandle(ref, () => {
      
    return {
      image() {
        return refImageRegion.current.image()
      }
    }
  }, [refImageRegion]);
  

  return (
          <Modal config={modal_config} isOpen={isOpen} onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width:'600px', height:'600px'}}>
              <ImageCropper ref={refImageRegion} file={file} onSelectImage={onSelectImage} containerWidth={512} containerHeight={512}/>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <BeautyButton type='confirm' onClick={onClickApply}>확인</BeautyButton>
                <BeautyButton type='cancel' onClick={onClose}>취소</BeautyButton>
              </div>
            </div>
          </Modal>
          )
}
