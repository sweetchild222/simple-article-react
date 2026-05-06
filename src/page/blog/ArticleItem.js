import {useContext, useEffect, useRef } from "react";
import * as UserAPI from '../../api/UserAPI.js'
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import * as validator from '../../util/Validator.js'
import AuthContext from "../../util/AuthContext.js";
import BeautyButton from '../../common/BeautyButton.js';
import GoLogin from "../../common/GoLogin.js";
import OverlayLoading from "../../common/OverlayLoading.js";

export default function(props) {

    console.log(props.article)

    const article = props.article

    const combinedStyle = {
        ...props.style
    }

    return (
        <div style={{width:'100%', backgroundColor:'lightgray', marginTop:'5px', marginBottom:'5px', border:'1px solid rgba(255, 0, 0, 0.5)', display: 'flex', flexDirection: 'row', ...combinedStyle}}>

            <img style={{width:'192px', height:'128px', borderRadius:'3px', objectFit:'cover'}} src='http://13.124.193.201:8080/api/blob/article/20260414021819-ee806f8a-e545-4861-9fc9-fc1e34bd19d5.webp'/>

            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div>{'showed: ' + article.showed}</div>
                <div>{'great_count: ' + article.great_count}</div>
                <label>{'title: ' + article.title}</label>
                <label>{'head: ' + article.head}</label>
            </div>
        </div>
    )
}

