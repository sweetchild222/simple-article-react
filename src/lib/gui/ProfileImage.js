
import {useState, useEffect} from "react";
import StateProgsImage from "./StateProgsImage.js";
import './RotateProgress.css';
import * as UserAPI from '@rest/UserAPI.js'
import { MdError } from "react-icons/md";

export default function(props) {
        
    const shape = props.shape == null ? 'rect' : props.shape
    const width = props.size == null ? 64 : props.size
    const height = width
    const borderRadius = shape == 'circle' ? parseInt(width / 2) : 3
    
    const [user, setUser] = useState(props.user)
    const [isError, setIsError] = useState(false)


    const combinedStyle = {
        ...props.style
    }

    useEffect(()=>{

        if(props.userId == null)
            return

        UserAPI.getUser(props.userId).then((res)=>{
            
            if(res.success == false){
                setIsError(true)
                return
            }

            if(res.payload.image == '')
                res.payload.image = '/image/user.png'
            else
                res.payload.image + '?size=' + width + 'x' + height

            setUser(res.payload)
        })
        
    },  [props.userId])

    return user ? 
        (<StateProgsImage src={user.image} tooltip={user.nickname} width={width} height={height}  borderWidth={0} borderRadius={borderRadius} onClick={props.onClick} style={{...combinedStyle}}/>)
        : (isError ? 
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', wdith:width, height:height, maxHeight:height, minHeight:height, maxWidth:width, minWidth:width}} onClick={props.onClickAtError}><MdError size={45}></MdError></div>
            :
            <div className={`${isError ? 'rotateProgress': 'rotateProgress'}`} style={{position: 'relative', wdith:width, height:height, maxHeight:height, minHeight:height, maxWidth:width, minWidth:width}}></div>
        )
}

