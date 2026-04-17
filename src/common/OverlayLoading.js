

import {useContext, useState, useRef, useEffect, useCallback, useImperativeHandle} from 'react'
import { useLocation } from 'react-router-dom'
import './ImageCropModal.css'
import './RotateLoading.css'
import Modal from '../common/Modal.js'

import ImageCropper from './ImageCropper.js'
import BeautyButton from "../common/BeautyButton.js"
import ReactDOM from 'react-dom';

export default function() {
          
    return (
          <div className={`rotateLoading`} style={{position: 'fixed', top:'0', left:0, width:'100vw', height:'100vh', zIndex:'1000', backgroundColor:'rgba(0, 0, 0, 0.5)' }}/>
        )
}