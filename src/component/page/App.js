
import '../css/App.css';

import Header from '../common/Header.js'
import React, {useContext, useEffect, useState} from 'react';

import Home from './Home.js';
import Login from './Login.js';
import PageNotFound from './PageNotFound.js';
import Profile from './Profile.js';
import Regist from './Regist.js';
import Password from './Password.js'
import Withdraw from './Withdraw.js'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AuthProvider from '../tool/AuthProvider';
import AuthContext from "../tool/AuthContext";

import ToastContainer from '../common/ToastContainer';

function App() {

  const navigate = useNavigate();


  return (
    <div>
      <AuthProvider>
        <ToastContainer />
        <Header/>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/regist" element={<Regist/>}></Route>
            <Route path="/profile" element={<Profile/>}></Route>
            <Route path="/widthdraw" element={<Withdraw/>}></Route>      
            <Route path="/password" element={<Password/>}></Route>
            <Route path="/*" element={<PageNotFound/>}></Route>
        </Routes>
      </AuthProvider>
      
    </div>
  );
}


//{isLoggedIn === true && <Example />}
        //{isLoggedIn === true && <Example2 />}
export default App;


