
import {useState, useEffect} from "react";
import StateProgsImage from "./StateProgsImage.js";
import * as UserAPI from '@rest/UserAPI.js'


export default function(props) {
        
    const shape = props.shape == null ? 'rect' : props.shape
    const width = props.size == null ? 64 : props.size
    const height = width
    const borderRadius = shape == 'circle' ? parseInt(width / 2) : 3
    
    const [user, setUser] = useState(props.user)

    const combinedStyle = {
        ...props.style
    }

    useEffect(()=>{

        if(props.userId == null)
            return

        UserAPI.getUser(props.userId).then((res)=>{
            
            if(res.success == false)
                return

            if(res.payload.image == '')
                res.payload.image = '/image/user.png'
            else
                res.payload.image + '?size=' + width + 'x' + height

            setUser(res.payload)
        })
        
    },  [props.userId])

    return user ? 
        (<StateProgsImage src={user.image} tooltip={user.nickname} width={width} height={height}  borderWidth={0} borderRadius={borderRadius} onClick={props.onClick} style={{...combinedStyle}}/>)
        : <div style={{backgroundColor:'transparent', wdith:width, height:height, maxHeight:height, minHeight:height, maxWidth:width, minWidth:width}}></div>
}

