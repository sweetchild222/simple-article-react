import React, { useEffect, useState } from 'react';
import './RotateLoading.css';
import { CiImageOff } from "react-icons/ci";

export default function({src, onClick, onLoad, onError, borderWidth=1, borderRadius=3, width=64, height=64}) {

    if(src == null)
        return (<div onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: '1px solid gray', borderRadius:(borderRadius + 1) + 'px', borderWidth:borderWidth + 'px', display: 'flex', justifyContent: 'center', alignItems:'center'}}></div>)

    
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

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
            <div className={`${isLoading ? 'rotateLoading': ''}`}  onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: '1px solid gray', borderRadius:(borderRadius + 1) + 'px', borderWidth:borderWidth + 'px', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                {(src != null && isError == false) && <img alt='image' src={src} onLoad={onLoadInner} onError={onErrorInner} style={{borderRadius:(borderRadius) + 'px', width: width + 'px', height: height + 'px', objectFit: 'cover'}}/>}
                {(src != null && isError == true) && <CiImageOff size={(width > height ? height : width)}/>}
            </div>
    )
}

