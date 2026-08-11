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
        
        <dialog ref={refDialog} onClick={onClickDialog} onKeyDown={onKeyDownDialog} style={{padding:'16px'}}>
            <div ref={refDiv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {title != null && <p style={{fontWeight:'500', fontSize:'18px', margin:'0px'}}>{title}</p>}
            {(title != null && description != null) && <div style={{height:'8px'}}/>}
            {description != null && <p style={{whiteSpace:'pre', padding:'0px', color:'darkgrey', margin:'0px'}}>{description}</p>}
            {(title != null || description != null) && <div style={{height:'16px'}}/>}
            {type == 'custom' && children}

            {type == 'input' && <div style={{display: 'flex', flexDirection: 'column', justifyContent:'center', alignItems:'center', width:'100%'}}>
                <input id={randomId} ref={refInput} onKeyDown={onKeyDownInput} maxLength={maxLength} style={{width:'100%', minWidth:'256px', boxSizing:'border-box'}}/>
                <div style={{height:'16px'}}/>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent:'center', alignItems:'center'}}>
                    <PrettyButton onClick={onClickInputYes} type='confirm' style={{width:'64px'}}>확인</PrettyButton>
                    <div style={{width:'16px'}}/>
                    <PrettyButton onClick={onClickNo} type='cancel' style={{width:'64px'}}>아니오</PrettyButton>
                </div>
            </div>}
            {type == 'confirm' && <PrettyButton onClick={onClickConfirm} style={{width:'64px'}} type='confirm'>확인</PrettyButton>}
            {type == 'yesno' && <div style={{display: 'flex', flexDirection: 'row', justifyContent:'center', alignItems:'center'}}>
                <PrettyButton onClick={onClickYes} type='success' style={{width:'64px'}}>예</PrettyButton>
                <div style={{width:'16px'}}/>
                <PrettyButton onClick={onClickNo} type='cancel' style={{width:'64px'}}>아니오</PrettyButton>
            </div>}
            </div>
        </dialog>,
        document.getElementById('modal-root')
    )
}
