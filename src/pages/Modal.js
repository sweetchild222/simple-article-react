import '../css/Modal.css'
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

export const Type = {
    confirm: "confirm",
    yesno: "yesno",    
}

export default ({config, isOpen, onYesNo, onClose, children}) => {

    if(config == null)
        config = {text: '완료되었습니다',type: Type.confirm, isCloseOutsideClick: false}
    else{

        if(config.type == null)
            config.type = Type.confirm

        if(config.text == null)
            config.text = (config.type == Type.confirm ? '완료되었습니다' : '선택하세요')
        
        if(config.isCloseOutsideClick == null)
            config.isCloseOutsideClick = false
    }
    
    const dialogRef = useRef(null)

    useEffect(() => {

        if(isOpen)
            dialogRef.current.showModal()
        else
            dialogRef.current.close()

    }, [isOpen]);


    const onClickDialog = (event) => {

        if(event.target === dialogRef.current){

            if(config.isCloseOutsideClick)
                onClose()
        }        
    }


    const onClickConfirm=() =>{

        onClose()
    }


    const onClickYes=() =>{

        onYesNo(true)
        onClose()
    }


    const onClickNo=() =>{

        onYesNo(false)
        onClose()
    }

  
    return ReactDOM.createPortal(
        <dialog ref={dialogRef} onClick={onClickDialog}>
            {config.text != null && <p>{config.text}</p>}
            {children}
            {config.type == Type.confirm && < button onClick={onClickConfirm}>확인</button>}
            {config.type == Type.yesno && < button onClick={onClickYes}>예</button>}
            {config.type == Type.yesno && < button onClick={onClickNo}>아니오</button>}
        </dialog>,
        document.getElementById('modal-root')
    )
}
