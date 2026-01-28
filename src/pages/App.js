import logo from '../resource/logo.svg';
import '../css/App.css';

import Header from './Header'
import React, {useContext, useEffect, useState} from 'react';

import Home from './Home';
import Login from './Login';
import Error from './Error';
import Profile from './Profile';
import Regist from './Regist';
import ChangePassword from './changePassword'
import Withdraw from './Withdraw'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AuthProvider from '../util/AuthProvider';

import AuthContext from "../util/AuthContext";

import ToastContainer from './ToastContainer';

function App() {


  const navigate = useNavigate();

  const handleButtonClick = () => {
    
      console.log('clicl search')
            
      //console.log(a)
    };


  return (
    <div>
      <AuthProvider>
        <ToastContainer />
        <Header onClickSearch={handleButtonClick} />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/regist" element={<Regist/>}></Route>
            <Route path="/profile" element={<Profile/>}></Route>
            <Route path="/widthdraw" element={<Withdraw/>}></Route>
            <Route path="/error" element={<Error/>}></Route>
            <Route path="/changePassword" element={<ChangePassword/>}></Route>
        </Routes>
      </AuthProvider>
      
    </div>
  );
}


//{isLoggedIn === true && <Example />}
        //{isLoggedIn === true && <Example2 />}
export default App;


