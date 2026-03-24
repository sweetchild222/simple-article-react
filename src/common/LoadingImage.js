import React, { useEffect, useState } from 'react';
import './RotateLoading.css';


export default function({src, onClick, onLoad, onError, width=64, height=64}){

    const no_image = '/image/no_image.png'
    
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

    return (
            <div className={`${isLoading ? 'rotateLoading': ''}`}  onClick={onClick} style={{width: width + 'px', height: height + 'px', position: 'relative', border: '1px solid gray', borderRadius:'3px', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                <img alt='image' src={(src != null && src != '') ? src : no_image} onLoad={onLoadInner} onError={onErrorInner} style={{borderRadius:'2px'}}/>
            </div>
    )
}

