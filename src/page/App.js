import React, { useContext, useEffect, useState} from 'react';

import './App.css'
import ErrorBoundary from './ErrorBoundary.js'

import {Routes, Route, useNavigate } from 'react-router-dom'

import Header from './Header.js'
import Home from './Home.js'
// import Editor from './Editor.js'

import MDXEditor from './MDXEditor.js'
import Editor from './Editor.js'
import Login from './Login.js'
import PageNotFound from './PageNotFound.js'
import Profile from './Profile.js'
import Regist from './Regist.js'
import ChangePassword from './ChangePassword.js'
import Withdraw from './Withdraw.js'
import ProfileRegion from './ProfileRegion.js'
import ImageRegion from './ImageRegion.js'
import AuthProvider from '../util/AuthProvider'
import ProfileContext from '../util/ProfileProvider'
import ToastContainer from '../common/ToastContainer'


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
              <Route path="/" element={<Home />}></Route>
              <Route path="/home" element={<Home />}></Route>
              <Route path="/editor" element={<Editor />}></Route>
              <Route path="/login" element={<Login/>}></Route>
              <Route path="/regist" element={<Regist/>}></Route>
              <Route path="/profile" element={<Profile/>}></Route>
              <Route path="/image_region" element={<ImageRegion/>}></Route>
              <Route path="/widthdraw" element={<Withdraw/>}></Route>
              <Route path="/changePassword" element={<ChangePassword/>}></Route>
              <Route path="/profile_region" element={<ProfileRegion/>}></Route>
              <Route path="/*" element={<PageNotFound/>}></Route>
            </Routes>
          </div>
          </ProfileContext>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  )
}



