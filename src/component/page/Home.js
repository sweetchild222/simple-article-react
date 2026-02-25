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

  const test = async() => {


    navigate('/image_region')
    
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

    const test5 = async() => {

      console.log('asdfa')

      setIsLoading(true)

      setTimeout(()=>{

        setIsLoading(false)
        //setIsDisable(false)


      },2000)

      //setIsDisable(true)
    }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <BeautyButton disabled={isDisable} isLoading={isLoading} type='default' onClick={test2}>검색</BeautyButton>
      <BeautyButton disabled={true} isLoading={isLoading} type='default' onClick={test5}>안녕하세요. 저는 최인국입니다</BeautyButton>
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


