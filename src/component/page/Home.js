import React from "react";
import axios from 'axios';
//import './Home.css'
import BeautyButton from '../common/BeautyButton'
import {useContext, useState, useRef, useEffect, useCallback} from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';




export default function Home() {

  let inputEmail = null
  let inputPassword = null
  let verifyCode = null

  const selectRef = useRef(null)

  const navigate = useNavigate();
  const [isDisable, setIsDisable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const goEditor = async() => {

    navigate('/editor')
    
  };

  const test2 = async() => {

    window.showToast('login 완료', 'error')
    //selectRef.current.classList.remove('loading2')
  };

  

  const test3 = async() => {

    //selectRef.current.classList.add()

    selectRef.current.classList.add('loading2')
    

    //console.log()


    

    //window.showToast('login 완료', 'error')
    
  };


  const selectFile = async() => {

    try{
        
        const options = {
            types: [{
                description: 'Images',
                accept: {'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'], 'image/gif': ['.gif']}}
            ],
            excludeAcceptAllOption: false,
            multiple: false
        }

        const [fileHandle] = await window.showOpenFilePicker(options)
        return await fileHandle.getFile()
    }
    catch(error) {
        return null
    }
  }


  const test5 = async() => {

    //const file = await selectFile()

    //const path = '/image/test1.jpg'
    //const path = '/image/h_long.png'
    //const path = '/image/4.1M.jpg'
    const path = '/image/2.4M.jpg'

    const resizedBlob = await resizeImage(path, 512, 512, 64, 64);
  }


  const calcScaled = (imageWidth, imageHeight, maxWidth, maxHeight, minWidth, minHeight) => {

    const ratioMaxWidth = maxWidth / imageWidth;
    const ratioMaxHeight = maxHeight / imageHeight;

    const ratioMax = ratioMaxWidth < ratioMaxHeight ? ratioMaxWidth : ratioMaxHeight

    const newWidth = Math.round(imageWidth * ratioMax);
    const newHeight = Math.round(imageHeight * ratioMax);
    
    if(newWidth < minWidth){

      const ratioMin = minWidth / imageWidth;
      const scaledWidth = Math.round(imageWidth * ratioMin);

      const sHeight = Math.round(maxHeight * (1 / ratioMin))
      const sy = Math.round((imageHeight - sHeight) / 2)

      return {sx:0, sy:sy, sWidth:imageWidth, sHeight:sHeight, dx:0, dy:0, dWidth:scaledWidth, dHeight:maxHeight}
    }
    else if(newHeight < minHeight){

      const ratioMin = minHeight / imageHeight;
      const scaledHeight = Math.round(imageHeight * ratioMin);

      const sWidth = Math.round(maxWidth * (1 / ratioMin))
      const sx = Math.round((imageWidth - sWidth) / 2)

      return {sx:sx, sy:0, sWidth:sWidth, sHeight:imageHeight, dx:0, dy:0, dWidth:maxWidth, dHeight:scaledHeight}    
    }
    else{
      return {sx:0, sy:0, sWidth:imageWidth, sHeight:imageHeight, dx:0, dy:0, dWidth:newWidth, dHeight:newHeight}
    }
  }
  

  const resizeImage = (path, maxWidth, maxHeight, minWidth, minHeight) => {

    const img = new Image();
    img.src = path;

    img.onload = () => {

      const scaled = calcScaled(img.width, img.height, maxWidth, maxHeight, minWidth, minHeight)
          
      const canvas = document.createElement('canvas');
      canvas.width = scaled.dWidth;
      canvas.height = scaled.dHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, scaled.sx, scaled.sy, scaled.sWidth, scaled.sHeight, scaled.dx, scaled.dy, scaled.dWidth, scaled.dHeight);

      const dataURL = canvas.toDataURL("image/png");
      const newTab = window.open('about:blank','image from canvas');
      newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");

      // canvas.toBlob((blob) => {

      //   resolve(blob);

      // }, file.type, 0.8);


    }  
  }






  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height:'100%'}}>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='default' onClick={goEditor}>에디터</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='default' onClick={test5}>이미지</BeautyButton>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='warning' onClick={test5}>안녕하세요. 저는 최인국입니다</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='warning' onClick={test5}>warning</BeautyButton>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='danger' onClick={test5}>danger</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='danger' onClick={test5}>danger</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='confirm' onClick={test5}>confirm</BeautyButton>
      <BeautyButton disabled={false} isLoading={isLoading} type='confirm' onClick={test5}>confirm</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='cancel' onClick={test5}>cancel</BeautyButton>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='cancel' onClick={test5}>cancel</BeautyButton>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='success' onClick={test5}>success</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='success' onClick={test5}>success</BeautyButton>
      {/* <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>      
      <button ref={selectRef} onClick={test3} className="loadingbutton">
        <span className="btn_text">Save</span></button> */}
    </div>
  );  
}


