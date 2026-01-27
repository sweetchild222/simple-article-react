import React, { useEffect, useState } from 'react';
import './Toast.css';


const Toast = ({message, type, onClose}) => {
    
    const [isSlideIn, setIsSlideIn] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => {

            setIsSlideIn(false)

        }, 3000);

        return () => { clearTimeout(timer) }

    }, [onClose])


    const onAnimationEnd = () =>{

        if(isSlideIn == false)
            onClose();
    }
    
    return (
        <div className={'toast toast-success ' + (isSlideIn ? 'toast-in' : 'toast-out')} onAnimationEnd={onAnimationEnd}>
            <div style={{backgroundColor: 'lightblue'}}>{message}</div>
            <button onClick={onClose} className="close-btn">&times;</button>
        </div>
    )
}

export default Toast;