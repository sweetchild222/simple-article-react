import React from "react";
import axios from 'axios';
import '../css/Home.css'
import {useContext, useState, useRef, useEffect, useCallback} from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';



export default function Home() {

  let inputEmail = null
  let inputPassword = null
  let verifyCode = null

  const selectRef = useRef(null)

  const navigate = useNavigate();

  const test = async() => {


    navigate('/image_region')
    
  };

  const test2 = async() => {

    window.showToast('login 완료', 'error')
    selectRef.current.classList.remove('loading')
  };

  

  const test3 = async() => {

    //selectRef.current.classList.add()

    selectRef.current.classList.add('loading')
    

    //console.log()


    

    //window.showToast('login 완료', 'error')
    
  };




  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <button onClick={test}>imageRegion</button>
      <button onClick={test2}/>
      <button ref={selectRef} onClick={test3} className="button">
        <span className="btn_text">Save</span></button>
    </div>
  );  
}

