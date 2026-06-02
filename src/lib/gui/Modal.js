import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PrettyButton from './PrettyButton';


export default ({type, title, description, isCloseOutsideClick=true, defaultValue, maxLength, isOpen, onResult, onClose, onInput, children}) => {
    
    const refDialog = useRef(null)
    const refInput = useRef(null)
    const refDiv = useRef(null)

    useEffect(() => {
                        
        if(isOpen){

            refDialog.current.showModal()
            
            if(refInput.current) {
                refInput.current.value = defaultValue != null ? defaultValue : ''
                refInput.current.focus()
                refInput.current.setSelectionRange(refInput.current.value.length, refInput.current.value.length)
            }            
        }
        else{            
            refDialog.current.close()
        }

    }, [isOpen]);


    const onClickDialog = (event) => {

        if(event.target === refDialog.current){

            if(isCloseOutsideClick){

                if(onClose != null)
                    onClose()
            }
        }
    }


    const onClickConfirm=() =>{

        if(onClose != null)
            onClose()
    }


    const onClickYes=() =>{

        if(onResult != null)
            onResult(true)

        if(onClose != null)
            onClose()
    }


    const onClickNo=() =>{

        if(onResult != null)
            onResult(false)

        if(onClose != null)
            onClose()
    }


    const onClickInputYes=() =>{

        if(onInput != null)
            onInput(refInput.current.value)

        if(onClose != null){
            onClose()
        }
    }

    const onKeyDownInput=(event) =>{        
            
        if (event.key === 'Enter'){

            event.preventDefault()

            if(onInput != null){
                onInput(refInput.current.value)
            }

            if(onClose != null){                                
                onClose()
            }
        }
    }


    const onKeyDownDialog=(event)=>{
        
        if(event.nativeEvent.key == 'Escape'){

            if(isCloseOutsideClick){
                if(onClose != null)
                    onClose()
            }
            else{
                event.preventDefault()
            }
        }
    }
    
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomId = random(0, 100000) // avoid warning Duplicate form field id in the same form 
          
    return ReactDOM.createPortal(
        <dialog className={'modal'} ref={refDialog} onClick={onClickDialog} onKeyDown={onKeyDownDialog} style={{padding:'5px'}}>
            <div ref={refDiv}>
            {title != null && <p style={{fontWeight:'bold', fontSize:'18px'}}>{title}</p>}
            {description != null && <p style={{whiteSpace: 'pre', fontStyle:'italic', color:'darkgrey'}}>{description}</p>}
            {type == 'custom' && children}
            {type == 'input' && <input id={randomId} ref={refInput} onKeyDown={onKeyDownInput} maxLength={maxLength}/>}
            {type == 'input' && <PrettyButton onClick={onClickInputYes} type='success'>확인</PrettyButton>}
            {type == 'input' && < PrettyButton onClick={onClickNo} type='warning'>아니오</PrettyButton>}
            {type == 'confirm' && <PrettyButton onClick={onClickConfirm} type='confirm'>확인</PrettyButton>}
            {type == 'yesno' && < PrettyButton onClick={onClickYes} type='success'>예</PrettyButton>}
            {type == 'yesno' && < PrettyButton onClick={onClickNo} type='warning'>아니오</PrettyButton>}
            </div>
        </dialog>,
        document.getElementById('modal-root')
    )
}
