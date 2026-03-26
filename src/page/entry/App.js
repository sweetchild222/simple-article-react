import React, { useContext, useEffect, useState} from 'react';

import './App.css'
import ErrorBoundary from './ErrorBoundary.js'

import {Routes, Route, useNavigate, BrowserRouter, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import Header from './Header.js'
import Home from './Home.js'




import User from '../user/User.js'
import Regist from '../user/Regist.js'
import Login from '../user/Login.js'
import Withdraw from '../user/Withdraw.js'
import ChangePassword from '../user/ChangePassword.js'

import Editor from '../markdown/Editor.js'
import PageNotFound from './PageNotFound.js'


import AuthProvider from '../../util/AuthProvider.js'
import ProfileContext from '../../util/ProfileProvider.js'
import ToastContainer from '../../common/ToastContainer.js'



export default function() {  

  const RootLayout = () => (    
    <div style={{height:'auto', flex: 1}}>
      <Header/>
      <Outlet />
    </div>    
  )


  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home/>},
        { path: 'editor', element: <Editor/>},

        { path: 'login', children: [
          { index: true, element: <Login/>},
          { path: 'regist', element: <Regist/>}
        ]},


        { path: 'user', children: [
          { index: true, element: <User/>},
          { path: 'widthdraw', element: <Withdraw/>},
          { path: 'change_password', element: <ChangePassword/>}          
        ]},              
      ],
      errorElement: <PageNotFound />
    }
  ])

  return (
    <div style={{height:'100%', display: 'flex', flexDirection: 'column'}}>
      <ErrorBoundary>
        <AuthProvider>
          <ProfileContext>
          <ToastContainer />
            <RouterProvider router={router}/>
          </ProfileContext>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  )
}
