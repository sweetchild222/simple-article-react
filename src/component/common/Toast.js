import React, { useEffect, useState } from 'react';
import '../css/Toast.css';


export default function({message, type, onClose}){
    
    const [isSlideIn, setIsSlideIn] = useState(true)    

    useEffect(() => {

        const timer = setTimeout(() => {

            if(isSlideIn == true)
                setIsSlideIn(false)

        }, 3000);

        return () => { clearTimeout(timer) }

    }, [onClose])


    const onAnimationEnd = () => {

        if(isSlideIn == false)
            onClose();
    }

    const onClickRemove = () => {

        setIsSlideIn(false)
    }
    
    return (
        <div className={`toast toast-${type} ` + (isSlideIn ? 'toast-in' : 'toast-out')} onAnimationEnd={onAnimationEnd}>
            <div style={{backgroundColor: 'lightblue'}}>{message}</div>
            <button onClick={onClickRemove} className="close-btn">&times;</button>
        </div>
    )
}

