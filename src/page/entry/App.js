import React, { useContext, useEffect, useState} from 'react';

import './App.css'
import ErrorBoundary from './ErrorBoundary.js'

import {Routes, Route, useNavigate, BrowserRouter } from 'react-router-dom'

import Header from './Header.js'
import Home from './Home.js'



import Editor from '../editor/Editor.js'
import Login from '../user/Login.js'
import PageNotFound from './PageNotFound.js'
import User from '../user/User.js'
import Regist from '../user/Regist.js'
import ChangePassword from '../user/ChangePassword.js'
import Withdraw from '../user/Withdraw.js'
import ProfileRegion from '../user/ProfileRegion.js'
import AuthProvider from '../../util/AuthProvider.js'
import ProfileContext from '../../util/ProfileProvider.js'
import ToastContainer from '../../common/ToastContainer.js'


export default function() {

  const navigate = useNavigate();

  return (
    <div style={{height:'100%', display: 'flex', flexDirection: 'column'}}>
      <ErrorBoundary>
        <AuthProvider>
          <ProfileContext>
          <ToastContainer />
          <Header/>
          <div style={{height:'auto', flex: 1}}>            
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/home" element={<Home />}/>                
              <Route path="/editor" element={<Editor/>}/>
              <Route path="/login">
                <Route index element={<Login />} />
                <Route path="regist" element={<Regist/>}/>
              </Route>
              <Route path="/user">
                <Route index element={<User />} />
                <Route path="widthdraw" element={<Withdraw/>}/>
                <Route path="change_password" element={<ChangePassword/>}/>
                <Route path="profile_image" element={<ProfileRegion/>}/>
              </Route>
              <Route path="/*" element={<PageNotFound/>}></Route>
            </Routes>            
          </div>
          </ProfileContext>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  )
}




