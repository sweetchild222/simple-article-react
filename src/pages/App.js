import logo from '../resource/logo.svg';
import '../css/App.css';

import Header from './Header'
import React, {useContext, useEffect, useState} from 'react';

import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Error from './Error';
import Regist from './Regist';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AuthProvider from '../util/AuthProvider';

import AuthContext from "../util/AuthContext";



function App() {


  const navigate = useNavigate();

  const handleButtonClick = () => {
    
      console.log('clicl search')
            
      //console.log(a)
    };


    const onLogIn = () =>{

      navigate('/home');

    }

    const onLogout = () => {navigate('/logout')}

  return (
    <div>
      <AuthProvider>
        <Header onClickSearch={handleButtonClick} />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/regist" element={<Regist/>}></Route>
            <Route path="/error" element={<Error/>}></Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}


//{isLoggedIn === true && <Example />}
        //{isLoggedIn === true && <Example2 />}
export default App;

