
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

    const [user, setUser] = useState(null)
    const [isError, setIsError] = useState(false)


    useEffect(()=>{

        if(props.userId == null)
            return

        UserAPI.getUser(props.userId).then((res)=>{

            if(res.success == false){
                setIsError(true)
                return
            }

            setUser(res.payload)
        })
        
    },  [props.userId])


    useEffect(()=>{

        setUser(props.user)

    }, [props.user])


    const urlWithSize = (image, width, height) => {

        if(image == '')
            return '/image/user.png'
        else{
            return (image + '?size=' + width + 'x' + height)
        }
    }

    return user ? 
        (<StateProgsImage src={urlWithSize(user.image, width, height)} gray={props.gray} tooltip={user.nickname} width={width} height={height}  borderWidth={0} borderRadius={borderRadius} onClick={props.onClick} style={{cursor:'pointer', ...props.style}}/>)
        : (isError ? 
            <div style={{position: 'relative', wdith:width, height:height, maxHeight:height, minHeight:height, maxWidth:width, minWidth:width, backgroundImage:'url(/image/error-user.png)', backgroundSize:'contain', backgroundPosition:'center'}} onClick={props.onClickAtError}></div>
            : ( props.userId ? 
                <div className={'rotateProgress'} style={{position: 'relative', wdith:width, height:height, maxHeight:height, minHeight:height, maxWidth:width, minWidth:width}}/>
                :
                <div style={{position: 'relative', wdith:width, height:height, maxHeight:height, minHeight:height, maxWidth:width, minWidth:width, backgroundImage:'url(/image/no-user.png)', backgroundSize:'contain', backgroundPosition:'center'}}/>
            )
        )
}

