
import { useState, useRef, useEffect } from 'react'

import PrettyButton from "@gui/PrettyButton.js"
import ReactDOM from 'react-dom';
import { VscTrash } from "react-icons/vsc";
import {Vertical, Horizental} from "@gui/Flex.js";
import { CiSquarePlus } from "react-icons/ci";

export default function({ref, isOpen, onClose, onClickApply, categories}) {
      
  const refDialog = useRef(null)
  const refListDiv = useRef(null)

  const [isApplyLoading, setIsApplyLoading] = useState(false)
  const [newCategories, setNewCategories] = useState(structuredClone(categories))

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



  const getInputList = () => {

    if(refListDiv.current == null)
      return null

    const list = []

    const upperDivNodes = refListDiv.current.childNodes

    if(upperDivNodes.length == 0)
      return []
    
    for(const divNodes of upperDivNodes) {

      if(divNodes.childNodes.length != 2)
        continue
      
      const inputNode = divNodes.childNodes[0]

      list.push(inputNode)
    }

    return list
  }


  const setFocusInvalidName = () => {

    const inputList = getInputList()

    for(const input of inputList) {

      const value = input.value
                  
      if(value == ''){
        window.showToast('카테고리 이름을 입력하지 않았습니다', 'error')
        input.focus()
        return true     
      }

      const maxLength = 16

      if(value.length > maxLength) {
        window.showToast('카테고리 이름은 최대 '+ maxLength + ' 자 입니다', 'error')
        input.focus()
        return true
      }      
    }

    return false
  }

  const onClickApplyCore = async() =>{
    
    if(onClickApply != null){

      if(setFocusInvalidName())
        return

      setIsApplyLoading(true)
      await onClickApply(newCategories)
      setIsApplyLoading(false)
    }
  }


  useEffect(()=>{

    const inputList = getInputList()

    if(inputList != null && inputList.length > 0)
      inputList[inputList.length - 1].focus()

  }, [newCategories])
  


  const onCliCkAdd = async() => {

    const maxCount = 10

    if(newCategories.length == maxCount) {

      window.showToast('카테고리는 최대 '+ maxCount + '개 까지만 만들 수 있습니다', 'error')
      return
    }
    
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomId = random(0, 100000) // avoid warning Duplicate form field id in the same form

    const radomNames = ['일상', '여행', '요리', '건강', '맛집']

    const categorie = {id:randomId, name:radomNames[random(0, radomNames.length - 1)], is_default:0, article_count:0}

    setNewCategories(prevList => [...prevList, categorie])
  }


  const onClickDelete = async(id) => {
    
     setNewCategories(newCategories.filter(categorie => {
      
      if(categorie.id === id) {

          if(categorie.article_count > 0) {
            window.showToast('글이 있는 카테고리는 삭제 할 수 없습니다', 'error')
            return true
          }
          return false
      }
      else
        return true
    }));
  }

  const onChange = (e, id) => {

    setNewCategories(newCategories => {

      const category = newCategories.find(category => (category.id == id))

      if(category == null)
        return newCategories
    
      category.name = e.nativeEvent.target.value

      return newCategories
    })
  }

  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px'}}>
              <Vertical ref={refListDiv} style={{alignItems: 'center', marginLeft:'16px', marginRight:'16px', marginTop:'8px', marginBottom:'8px'}}>  
                  {newCategories && newCategories.map((data, index) => 
                    <Horizental key={data.id} style={{ display: 'flex', flexDirection: 'row', marginTop:'8px', marginBottom:'8px'}}>
                      <input key={data.id} style={{color:'black', width:'256px'}} maxLength={16} defaultValue={data.name} onChange={(e)=> onChange(e, data.id)}/>
                      <div style={{width:'8px'}}></div>
                      <PrettyButton type='transparent' style={{color:'black'}} onClick={() => onClickDelete(data.id)}><VscTrash style={{color: ((data.article_count > 0) ? 'gray' : 'black')}} size={25}/></PrettyButton>
                    </Horizental>
                  )}
                <Horizental style={{alignItems: 'center', alignSelf:'center', marginBottom:'8px', marginTop:'8px', width:'100%'}}>
                  <PrettyButton type='transparent' style={{color:'black'}} onClick={onCliCkAdd}><CiSquarePlus size={25}></CiSquarePlus></PrettyButton>
                  <div style={{flex:'1'}}></div>
                  <PrettyButton type='success' onClick={onClickApplyCore} isLoading={isApplyLoading}>적용</PrettyButton>
                  <div style={{width:'8px'}}></div>
                  <PrettyButton type='cancel' onClick={onClose}>취소</PrettyButton>
                </Horizental>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}
