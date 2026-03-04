import './Modal.css'
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import BeautyButton from './BeautyButton';



export default ({config, isOpen, onResult, onClose, onInput, children}) => {

    if(config == null)
        config = {text: '완료되었습니다', type: 'confirm', isCloseOutsideClick: false}
    else{

        if(config.type == null)
            config.type = 'confirm'

        if(config.text == null)
            config.text = (config.type == 'confirm' ? '완료되었습니다' : '선택하세요')
                
        if(config.isCloseOutsideClick == null)
            config.isCloseOutsideClick = false
    }
    
    const dialogRef = useRef(null)
    const inputRef = useRef(null)


    

    useEffect(() => {

        if(isOpen){
            dialogRef.current.showModal()
            
            if(inputRef.current)
                inputRef.current.value=''
        }
        else
            dialogRef.current.close()

    }, [isOpen]);


    const onClickDialog = (event) => {

        if(event.target === dialogRef.current){

            if(config.isCloseOutsideClick){

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
            onInput(inputRef.current.value)

        if(onClose != null)
            onClose()
    }


  
    return ReactDOM.createPortal(
        <dialog ref={dialogRef} onClick={onClickDialog}>
            {config.text != null && <p>{config.text}</p>}
            {children}

            {config.type == 'input' && <input id='input_123' ref={inputRef}/>}
            {config.type == 'input' && <BeautyButton onClick={onClickInputYes} type='success'>확인</BeautyButton>}
            
            {config.type == 'confirm' && <BeautyButton onClick={onClickConfirm} type='confirm'>확인</BeautyButton>}
            {config.type == 'yesno' && < BeautyButton onClick={onClickYes} type='success'>예</BeautyButton>}
            {config.type == 'yesno' && < BeautyButton onClick={onClickNo} type='warning'>아니오</BeautyButton>}
        </dialog>,
        document.getElementById('modal-root')
    )
}
