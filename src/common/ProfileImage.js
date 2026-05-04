
import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import LoadingImage from "./LoadingImage.js";
import * as UserAPI from '../api/UserAPI.js'


export default function(props) {
    
    const width = props.size == null ? 64 : props.size
    const height = width
    const borderRadius = parseInt(width / 2)

    const [image, setImage] = useState(null)
    const [nickname, setNickname] = useState(null)

    const combinedStyle = {
        ...props.style
    }

    useEffect(()=>{

        if(props.userId == null)
            return

        UserAPI.getUser(props.userId).then((res)=>{

            if(res == null) {
                setImage('/image/user.png')
                return
            }

            if(res.image == null){
                setImage('/image/user.png')
                return
            }

            setImage(res.image + '?size=64x64')
            setNickname(res.nickname != null ? res.nickname : res.username)
        })

    },  [props.userId])

    return (<LoadingImage src={image} tooltip={nickname} width={width} height={height}  borderWidth={0} borderRadius={borderRadius} onClick={props.onClick} style={{...combinedStyle}}/>)
}

