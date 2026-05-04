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

    const combinedStyle = {
        ...props.style
    }

    return (
        <div style={{...combinedStyle}}>
            <label htmlFor='input_current_password'>기존 비밀번호</label>
        </div>
    )
}

