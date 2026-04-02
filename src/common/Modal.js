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

        // if(config.text == null)
        //     config.text = (config.type == 'confirm' ? '완료되었습니다' : '선택하세요')

        if(config.isCloseOutsideClick == null)
            config.isCloseOutsideClick = false
    }
    
    const refDialog = useRef(null)
    const refInput = useRef(null)
    const refDiv = useRef(null)


    useEffect(() => {
        
        if(isOpen){
            refDialog.current.showModal()
            
            if(refInput.current)
                refInput.current.value=''
        }
        else
            refDialog.current.close()

    }, [isOpen]);


    const onClickDialog = (event) => {

        if(event.target === refDialog.current){

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
            onInput(refInput.current.value)

        if(onClose != null)
            onClose()
    }

    const onKeyDownInput=(event) =>{

        if (event.key === 'Enter'){

            if(onInput != null)
                onInput(refInput.current.value)

            if(onClose != null)
                onClose()
        }
    }


    const onKeyDownDialog=(event)=>{

        if(event.nativeEvent.key == 'Escape'){

            if(config.isCloseOutsideClick){
                if(onClose != null)
                    onClose()
            }
            else{
                event.preventDefault();
            }
        }
    }

    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomId = random(0, 100000) // avoid warning Duplicate form field id in the same form 
          
    return ReactDOM.createPortal(
        <dialog ref={refDialog} onClick={onClickDialog} onKeyDown={onKeyDownDialog}>
            <div ref={refDiv}>
            {config.text != null && <p>{config.text}</p>}
            {config.type == 'custom' && children}
            {config.type == 'input' && <input id={randomId} ref={refInput} onKeyDown={onKeyDownInput}/>}
            {config.type == 'input' && <BeautyButton onClick={onClickInputYes} type='success'>확인</BeautyButton>}
            
            {config.type == 'confirm' && <BeautyButton onClick={onClickConfirm} type='confirm'>확인</BeautyButton>}
            {config.type == 'yesno' && < BeautyButton onClick={onClickYes} type='success'>예</BeautyButton>}
            {config.type == 'yesno' && < BeautyButton onClick={onClickNo} type='warning'>아니오</BeautyButton>}
            </div>
        </dialog>,
        document.getElementById('modal-root')
    )
}
