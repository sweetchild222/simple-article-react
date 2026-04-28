import React, { useEffect, useState } from 'react';
import './RotateLoading.css';
import { CiImageOff } from "react-icons/ci";

export default function({src, onClick, onLoad, onError, borderWidth=1, borderRadius=3, width=64, height=64}) {


    const [isLoading, setIsLoading] = useState(true)
        
    const onLoadInner = (e) =>{

        setIsLoading(false)
        
        if(onLoad != null)
            onLoad(e)
    }

    const onErrorInner = (e) =>{
        
        setIsLoading(false)

        if(onError != null)
            onError(e)
    }

    return src != null  ? (
            <div className={`${isLoading ? 'rotateLoading': ''}`}  onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: '1px solid gray', borderRadius:(borderRadius + 1) + 'px', borderWidth:borderWidth + 'px', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                <img src={src} onLoad={onLoadInner} onError={onErrorInner} style={{borderRadius:(borderRadius) + 'px', width: width + 'px', height: height + 'px', objectFit: 'cover'}}/>
            </div>
        ) : (<div onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: '1px solid gray', borderRadius:(borderRadius + 1) + 'px', borderWidth:borderWidth + 'px', display: 'flex', justifyContent: 'center', alignItems:'center'}}></div>)
}

