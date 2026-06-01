
import {useState, useEffect} from "react";
import LoadingImage from "./LoadingImage.js";
import * as UserAPI from '@rest/UserAPI.js'


export default function(props) {
        
    const width = props.size == null ? 64 : props.size
    const height = width
    const borderRadius = parseInt(width / 2)
        
    const [user, setUser] = useState(props.user)

    const combinedStyle = {
        ...props.style
    }

    useEffect(()=>{

        if(props.userId == null)
            return

        UserAPI.getUser(props.userId).then((res)=>{
            
            if(res == null)
                return            

            if(res.image == '')
                res.image = '/image/user.png'
            else
                res.image + '?size=' + width + 'x' + height

            setUser(res)
        })
        
    },  [props.userId])

    return user ? 
        (<LoadingImage src={user.image} tooltip={user.nickname} width={width} height={height}  borderWidth={0} borderRadius={borderRadius} onClick={props.onClick} style={{...combinedStyle}}/>)
        : null
}

