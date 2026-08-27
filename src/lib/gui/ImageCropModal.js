import {useState, useRef, useEffect, useImperativeHandle} from 'react'
import ReactDOM from 'react-dom';
import PrettyButton from "@gui/PrettyButton.js"
import ImageCropper from './ImageCropper.js'

import './ImageCropModal.css'


export default function({ref, isOpen, onClose, file, onClickApply, containerWidth=768, containerHeight=768, selectMinWidth, keepRatio}) {
    
  const refCropper = useRef(null)
  const refDialog = useRef(null)
  const refDiv = useRef(null)

  const [isApplyLoading, setIsApplyLoading] = useState(false)
    
  useEffect(() => {
      
    if(isOpen && file)
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


  const drawImage = async(image, x, y, width, height, dx, dy, dWidth, dHeight) => {
    
    const canvas = document.createElement('canvas')
    canvas.width = dWidth
    canvas.height = dHeight
    const ctx = canvas.getContext('2d')

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(image, x, y, width, height, dx, dy, dWidth, dHeight)

    return canvas
  }
    
  useImperativeHandle(ref, () => {
      
    return {
      image() {
        return refCropper.current.image()
      },
      rect(){
        return refCropper.current.rect()
      },
      async export(dWidth, dHeight){

        const rect = refCropper.current.rect()
        const image = refCropper.current.image()
                        
        const canvas = await drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, dWidth, dHeight)

        return canvas
      }
    }
  }, [refCropper])

  return ReactDOM.createPortal(
          <dialog ref={refDialog} className={'imgCropDialog'} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <div ref={refDiv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#CECECE'}}>
                {isOpen && file && <ImageCropper ref={refCropper} file={file} containerWidth={containerWidth} containerHeight={containerHeight} selectMinWidth={selectMinWidth} keepRatio={keepRatio}/>}
                <div style={{height:'16px'}}/>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <PrettyButton type='confirm' onClick={onClickApplyCore} isLoading={isApplyLoading} style={{width:'64px'}}>선택</PrettyButton>
                  <div style={{width:'16px'}}/>
                  <PrettyButton type='cancel' onClick={onClose} style={{width:'64px'}}>취소</PrettyButton>
                </div>
                <div style={{height:'16px'}}/>
              </div>
          </dialog>,
          document.getElementById('modal-root')
        )
}
