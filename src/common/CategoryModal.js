import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react'
import { useLocation } from 'react-router-dom'
import './CategoryModal.css'
import './RotateLoading.css'
import Modal from './Modal.js'

import ImageCropper from './ImageCropper.js'
import BeautyButton from "./BeautyButton.js"
import ReactDOM from 'react-dom';
import { MdEdit } from "react-icons/md";
import { VscTrash } from "react-icons/vsc";

export default function({ref, isOpen, onClose, onClickApply, categories}) {
      
  const refDialog = useRef(null)
  const refListDiv = useRef(null)

  const [isApplyLoading, setIsApplyLoading] = useState(false)
  const [items, setItems] = useState(structuredClone(categories))

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


  useEffect(()=>{

    if(!refListDiv.current)
      return
  
    const upperDivNodes = refListDiv.current.childNodes;

    if(upperDivNodes.length == 0)
      return

    const lowerNodes = upperDivNodes[upperDivNodes.length - 1].childNodes
    
    if(lowerNodes.length != 2)
      return

    const inputNode = lowerNodes[0]
    
    inputNode.focus()    

  }, [items])
  


  const onCliCkAdd = async() => {
    
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomId = random(0, 100000) // avoid warning Duplicate form field id in the same form

    const radomNames = ['일상', '여행', '요리', '건강', '맛집']

    const categorie = {id:randomId, name:radomNames[random(0, radomNames.length - 1)], is_default:0, article_count:0}

    setItems(prevList => [...prevList, categorie])
  }


  const onClickDelete = async(id) => {
    
     setItems(items.filter(item => {
      
      if(item.id === id){

        if(item.is_default == 1){
          
          window.showToast('기본 카테고리는 삭제 할 수 없습니다', 'error')
          return true
        }
        else{

          if(item.article_count > 0) {
            window.showToast('글이 있는 카테고리는 삭제 할 수 없습니다', 'error')
            return true
          }
          return false
        }
      }
      else
        return true
    }));

  }



  return ReactDOM.createPortal(
          <dialog id='CategoryDialog' ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
                <div ref={refListDiv} style={{ display: 'flex', flexDirection: 'column'}}>
                  {items && items.map((data, index) => 
                    <div key={data.id} style={{ display: 'flex', flexDirection: 'row'}}>
                      <input key={data.id} style={{color:'black', width:'100px'}} defaultValue={data.name}/>
                      <BeautyButton type='transparent' style={{color:'black'}} onClick={() => onClickDelete(data.id)}><VscTrash size={15}/></BeautyButton>
                    </div>

                  
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <BeautyButton type='confirm' onClick={onCliCkAdd}>추가</BeautyButton>
                  <BeautyButton type='success' onClick={onClickApplyCore} isLoading={isApplyLoading}>적용</BeautyButton>
                  <BeautyButton type='cancel' onClick={onClose}>취소</BeautyButton>
                </div>
              </div>
          </dialog>,
          document.getElementById('modal-root')
        )
}
