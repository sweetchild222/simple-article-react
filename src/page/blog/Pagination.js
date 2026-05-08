import {useContext, useEffect, useRef } from "react";
import * as UserAPI from '../../api/UserAPI.js'
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import * as validator from '../../util/Validator.js'
import AuthContext from "../../util/AuthContext.js";
import BeautyButton from '../../common/BeautyButton.js';
import GoLogin from "../../common/GoLogin.js";
import OverlayLoading from "../../common/OverlayLoading.js";
import LoadingImage from "../../common/LoadingImage.js";
import { FaEye } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { MdThumbUpAlt } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import './ArticleItem.css'

export default function({totalCount, displayCount, onClickPage}) {



    console.log(totalCount)

    

    return (
    <div style={{display:'flex', flexDirection:'row', justifyContent:'center', backgroundColor:'orange'}}>

        <BeautyButton type={'transparent'} style={{color:'black'}}>{'1'}</BeautyButton>
        <BeautyButton type={'transparent'} style={{color:'black'}}>{'2'}</BeautyButton>
        <BeautyButton type={'transparent'} style={{color:'black'}}>{'3'}</BeautyButton>
        <BeautyButton type={'transparent'} style={{color:'black'}}>{'4'}</BeautyButton>
        <BeautyButton type={'transparent'} style={{color:'black'}}>{'5'}</BeautyButton>
        <BeautyButton type={'transparent'} style={{color:'black'}}>{'6'}</BeautyButton>        

    </div>)
}

