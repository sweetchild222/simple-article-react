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
import Library from '../user/Library.js'

import Editor from '../markdown/Editor.js'
import Posting from '../markdown/Posting.js'
import PageNotFound from './PageNotFound.js'


import AuthProvider from '../../util/AuthProvider.js'
import ProfileContext from '../../util/ProfileProvider.js'
import ToastContainer from '../../common/ToastContainer.js'



export default function() {

  const RootLayout = () => (
    <div style={{width:'100%', height:'100%', display:'flex', flexDirection: 'column'}}>
      <Header/>
      <Outlet/>
    </div>
  )


  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home/>},
        { path: 'editor', children: [
          { index: true, element: <Editor/>},
          { path: 'posting', element: <Posting/>}
        ]},

        { path: 'login', children: [
          { index: true, element: <Login/>},
          { path: 'regist', element: <Regist/>}]
        },

        { path: 'user/:id', children: [
          { index: true, element: <User/>},
          { path: 'widthdraw', element: <Withdraw/>},
          { path: 'change_password', element: <ChangePassword/>},
          { path: 'library', element: <Library/>},
          { path: '*', element: <PageNotFound />}],
        },
        { path: 'notfound', element: <PageNotFound/>}        
      ],
      errorElement: <PageNotFound />
    }
  ])

  return (
      <ErrorBoundary>
        <AuthProvider>
          <ProfileContext>
          <ToastContainer />
            <RouterProvider router={router}/>
          </ProfileContext>
        </AuthProvider>
      </ErrorBoundary>    
  )
}
