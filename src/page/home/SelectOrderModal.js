import { useState, useRef, useEffect } from 'react'
import PrettyButton from "@gui/PrettyButton.js"
import {Vertical} from "@gui/Flex.js";
import {VPad} from "@gui/Pad.js";
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';



export default function({isOpen, onClose, onSelect, isSubscribedBlog}) {
  
  const { t } = useTranslation()

  const refDialog = useRef(null)
  const refListDiv = useRef(null)
  
  const [orderType, setOrderType] = useState(null)  

  useEffect(() => {

    if(isOpen)
        refDialog.current.showModal()
    else
        refDialog.current.close()

  }, [isOpen]);


  useEffect(()=>{

    const list = [{ index:0, name:t('page.main.newestFirst')}, { index:1, name:t('page.main.popularityFirst')}, { index:2, name:t('page.main.commentFirst')}]

    if(isSubscribedBlog == true)
      list.push({ index:3, name:t('page.main.subscribedArticle')})

    setOrderType(list)

  }, [isSubscribedBlog])

  
  const onKeyDownDialog=(event)=>{

      if(event.nativeEvent.key == 'Escape'){
          event.preventDefault()
      }
  }


  const onSelectInner = (order) => {

      if(onSelect != null)
        onSelect(order)
      
      if(onClose != null)
        onClose()
  }

  
  return ReactDOM.createPortal(
          <dialog ref={refDialog} onKeyDown={onKeyDownDialog} style={{padding:'2px', width:'90%', maxWidth:'256px'}}>
              <Vertical ref={refListDiv} style={{alignItems: 'center', marginLeft:'16px', marginRight:'16px', marginTop:'8px', marginBottom:'8px', alignItems:'start'}}>
                  {orderType && orderType.map((data, index) => 
                    <PrettyButton type={'success'} key={data.index} style={{color:'black', marginTop:'4px', marginBottom:'4px', fontSize:'16px', width:'100%'}} onClick={()=>onSelectInner(data)}>{data.name}</PrettyButton>
                  )}
                <VPad size={8}></VPad>
                <PrettyButton type='cancel' onClick={onClose} style={{width:'64px', alignSelf:'end'}}>{t('system.close')}</PrettyButton>
              </Vertical>
          </dialog>,
          document.getElementById('modal-root')
        )
}
