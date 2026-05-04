

import React, { useContext, useEffect, useState} from 'react';
import {Routes, Route, useNavigate, BrowserRouter, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import './App.css'


import BlogHeader from '../blog/Header.js'
import BlogHome  from '../blog/Home.js'
import MainHeader from '../main/Header.js'
import MainHome from '../main/Home.js'

import Profile from '../user/Profile.js'
import User from '../user/User.js'
import Regist from '../user/Regist.js'
import Login from '../user/Login.js'

import Writer from '../markdown/Writer.js'
import Posting from '../markdown/Posting.js'


import ErrorBoundary from './ErrorBoundary.js'
import PageNotFound from './PageNotFound.js'

import AuthProvider from '../../util/AuthProvider.js'
import ToastContainer from '../../common/ToastContainer.js'


export default function() {

  const RootLayout = () => (

    <div style={{width:'100%', height:'100%', display:'flex', flexDirection: 'column'}}>
      <MainHeader/>
      <Outlet/>
    </div>
  )


  const BlogLayout = () => (
    
    <div style={{width:'100%', height:'100%', display:'flex', flexDirection: 'column'}}>
      <BlogHeader/>
      <Outlet/>
    </div>
  )


  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <MainHome/>},
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
          { path: 'profile', element: <Profile/>}]
        },
        { path: 'pageNotFound', element: <PageNotFound/>}
      ],
      errorElement: <PageNotFound />
    },
    {
      path: "/blog/:id",
      element: <BlogLayout />,
      children: [
        { index: true, element: <BlogHome/>},
      ]
    }
  ])

  return (
      <ErrorBoundary>
        <AuthProvider>
          <ToastContainer />
            <RouterProvider router={router}/>
        </AuthProvider>
      </ErrorBoundary>
  )
}
