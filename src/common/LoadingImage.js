import React, { useEffect, useState } from 'react';
import './RotateLoading.css';


export default function({src, onClick, onLoad, onError, width=64, height=64}) {

    const [isLoading, setIsLoading] = useState(false)
    
    useEffect(()=>{
        
        if(src != null)
            setIsLoading(true)

    }, [src])
        
    const onLoadInner = (e) =>{

        if(src != null)
            setIsLoading(false)
        
        if(onLoad != null)
            onLoad(e)
    }

    const onErrorInner = (e) =>{
        
        setIsLoading(false)

        if(onError != null)
            onError(e)
    }

    return (
            <div className={`${isLoading ? 'rotateLoading': ''}`}  onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: '1px solid gray', borderRadius:'3px', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                {src != null && <img alt='image' src={src} onLoad={onLoadInner} onError={onErrorInner} style={{borderRadius:'2px', width: width + 'px', height: height + 'px', objectFit: 'cover'}}/>}
            </div>
    )
}

