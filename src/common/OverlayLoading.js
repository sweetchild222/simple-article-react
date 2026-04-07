import './Modal.css'
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import BeautyButton from './BeautyButton';


export default ({isOpen, onClose, isLoading=true}) => {
    
    const refDialog = useRef(null)    
    const refDiv = useRef(null)


    useEffect(() => {
        
        if(isOpen)
            refDialog.current.showModal()
        else
            refDialog.current.close()

    }, [isOpen]);


    const onClickDialog = (event) => {

        // if(event.target === refDialog.current){

        //     if(config.isCloseOutsideClick){

        //         if(onClose != null)
        //             onClose()
        //     }
        // }
    }



    const onKeyDownDialog=(event)=>{

        // if(event.nativeEvent.key == 'Escape'){

        //     if(config.isCloseOutsideClick){
        //         if(onClose != null)
        //             onClose()
        //     }
        //     else{
        //         event.preventDefault();
        //     }
        // }
    }

          
    return ReactDOM.createPortal(
        <dialog ref={refDialog} onClick={onClickDialog} onKeyDown={onKeyDownDialog} style={{width:'100px', height:'100px', backgroundColor:'transparent'}}>
            <div ref={refDiv} className={`${isLoading ? 'rotateLoading': ''}`}/>
        </dialog>,
        document.getElementById('modal-root')
    )
}
