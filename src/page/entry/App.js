import React, { useContext, useEffect, useState} from 'react';

import './App.css'
import ErrorBoundary from './ErrorBoundary.js'

import {Routes, Route, useNavigate, BrowserRouter, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import Header from './Header.js'
import Home from './Home.js'




import Blog from '../user/Blog.js'
import User from '../user/User.js'
import Profile from '../user/Profile.js'
import Regist from '../user/Regist.js'
import Login from '../user/Login.js'
import Withdraw from '../user/Withdraw.js'
import ChangePassword from '../user/Password.js'
import Library from '../user/Blog.js'

import Writer from '../markdown/Writer.js'
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
        { path: 'write', children: [
          { index: true, element: <Writer/>},
          { path: 'posting', element: <Posting/>}
        ]},

        { path: 'login', children: [
          { index: true, element: <Login/>},
          { path: 'regist', element: <Regist/>}]
        },

        { path: 'user', children: [
          { index: true, element: <User/>},
          { path: 'profile', element: <Profile/>},
          { path: 'blog', element: <Blog/>}]
        }
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
