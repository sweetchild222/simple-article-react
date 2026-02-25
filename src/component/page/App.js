
import './App.css'
import {Routes, Route, useNavigate } from 'react-router-dom'

import Header from './Header.js'
import Home from './Home.js'
import Login from './Login.js'
import PageNotFound from './PageNotFound.js'
import Profile from './Profile.js'
import Regist from './Regist.js'
import Password from './Password.js'
import Withdraw from './Withdraw.js'
import ProfileRegion from './ProfileRegion.js'
import ImageRegion from './ImageRegion.js'
import AuthProvider from '../util/AuthProvider'
import ProfileContext from '../util/ProfileProvider'
import ToastContainer from '../common/ToastContainer'


export default function() {

  const navigate = useNavigate();

  return (
    <div>
      <AuthProvider>
        <ProfileContext>
        <ToastContainer />
        <Header/>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/regist" element={<Regist/>}></Route>
            <Route path="/profile" element={<Profile/>}></Route>            
            <Route path="/image_region" element={<ImageRegion/>}></Route>
            <Route path="/widthdraw" element={<Withdraw/>}></Route>
            <Route path="/password" element={<Password/>}></Route>
            <Route path="/profile_region" element={<ProfileRegion/>}></Route>
            <Route path="/*" element={<PageNotFound/>}></Route>
        </Routes>
        </ProfileContext>
      </AuthProvider>
      
    </div>
  )
}



