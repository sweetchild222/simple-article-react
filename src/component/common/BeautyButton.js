import React, {useContext, useEffect, useRef, useCallback} from "react";
import axios from 'axios';

import * as api from '../tool/Api.js'
import { useState } from 'react';

import { BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AuthContext from "../tool/AuthContext.js";
import ProfileContext from "../tool/ProfileContext.js";

import '../css/BeautyButton.css';

export default function(props) {
    
    //const buttonRef = useRef(null)

    // const removeToast = useCallback(() => {

    //     //buttonRef.current.classList.add('loading')

    // })
    
    return (
        <button id='beauty-button' className={`${props.type} ${props.isLoading ? 'circle': ''}`} disabled={props.isLoading || props.disabled} onClick={props.onClick}>
            <span id='btn_text' className="btn_text">{props.children}</span>            
        </button>
    );
}

