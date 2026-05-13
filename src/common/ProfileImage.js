
import React, {useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';

import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import LoadingImage from "./LoadingImage.js";
import * as UserAPI from '../api/UserAPI.js'


export default function(props) {
        
    const width = props.size == null ? 64 : props.size
    const height = width
    const borderRadius = parseInt(width / 2)
        
    const [user, setUser] = useState(null)

    const combinedStyle = {
        ...props.style
    }

    useEffect(()=>{

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

