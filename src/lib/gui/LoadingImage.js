import { useState } from 'react';
import './RotateProgress.css';


export default function(props) {

    const defaultValue = {borderWidth: 1, borderRadius: 3, width: 64, height: 64}

    const keys = Object.keys(defaultValue)
    
    keys.forEach((key) => {
        if(!Object.keys(props).includes(key))
            props = { ...props, [key]: defaultValue[key]}
    })

    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)    

    const combinedStyle = {
        ...props.style
    }

    const onLoadInner = (e) => {
            
        setIsLoading(false)
        
        if(props.onLoad != null)
            props.onLoad(e)
    }


    const onErrorInner = (e) => {
                
        setIsLoading(false)

        setIsError(true)

        if(props.onError != null)
            props.onError(e)
    }

    return props.src != null  ? (
            <div className={`${isLoading ? 'rotateProgress': ''}`} title={props.tooltip} onClick={props.onClick} style={{width: props.width + 'px', height: props.height + 'px', position: 'relative', border: '1px solid gray', borderRadius:(props.borderRadius + 1) + 'px', borderWidth:props.borderWidth + 'px', display: 'flex', justifyContent: 'center', alignItems:'center', ...combinedStyle}}>
                {!isError && <img src={!(props.src == null || props.src == '') ? props.src : '/image/no-photo.png'} onLoad={onLoadInner} onError={onErrorInner} style={{borderRadius:(props.borderRadius) + 'px', width: props.width + 'px', height: props.height + 'px', objectFit: 'cover'}}/>}
                {isError && <img src={'/image/broken-photo.png'} style={{borderRadius:(props.borderRadius) + 'px', width: props.width + 'px', height: props.height + 'px', objectFit: 'contain'}}/>}
            </div>
        ) : (<div onClick={props.onClick} style={{width: props.width + 'px', height: props.height + 'px', position: 'relative', border: '1px solid gray', borderRadius:(props.borderRadius + 1) + 'px', borderWidth:props.borderWidth + 'px', display: 'flex', justifyContent: 'center', alignItems:'center'}}></div>)
}
