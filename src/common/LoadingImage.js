import React, { useEffect, useState } from 'react';
import './RotateLoading.css';
import { CiImageOff } from "react-icons/ci";

export default function({src, onClick, onLoad, onError, border='1px solid gray', borderRadius='3px', width=64, height=64}) {
    
    if(src == null)
        return (<div onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: border, borderRadius:borderRadius, display: 'flex', justifyContent: 'center', alignItems:'center'}}></div>)    

    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    
    
    useEffect(()=>{

        if(src != null) {
            
            setIsLoading(true)
            setIsError(false)
        }

    }, [src])
        
    const onLoadInner = (e) =>{

        if(src != null)
            setIsLoading(false)
        
        if(onLoad != null)
            onLoad(e)
    }

    const onErrorInner = (e) =>{
        
        
        setIsLoading(false)
        setIsError(true)

        if(onError != null)
            onError(e)
    }    

    return (
            <div className={`${isLoading ? 'rotateLoading': ''}`}  onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: border, borderRadius:borderRadius, display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                {(isError == false) && <img alt='image' src={src} onLoad={onLoadInner} onError={onErrorInner} style={{borderRadius:'2px', width: width + 'px', height: height + 'px', objectFit: 'cover'}}/>}
                {(isError == true) && <CiImageOff size={(width > height ? height : width)}/>}
            </div>
    )
}

